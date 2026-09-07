// Server-side submission endpoint — the only path in or out of the `submissions`
// table (product-spec v3.0 §6). Holds the Supabase service role key, which bypasses
// RLS; the browser never sees the key, the project URL, or the table.
//
// Both database calls are Postgres functions. `submit_submission` takes an
// advisory lock on the company name, runs the duplicate check, updates any
// superseded/needs_review rows, and inserts the new row inside a single
// transaction — the check and the write are never two round-trips (v3.0 §9 rule 4).

const ROUTES = ['ecovadis', 'questionnaire']

const IDENTITY_FIELDS = [
  'company_name',
  'contact_name',
  'contact_email',
  'contact_phone',
  'job_title',
  'department',
]

const MAX_BODY_BYTES = 200_000
const MAX_FIELD_LENGTH = 500
const MAX_ANSWER_LENGTH = 20_000
const MAX_ANSWER_KEYS = 100
const ANSWER_KEY_PATTERN = /^s[2-7]_[a-z0-9_]{1,60}$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
}

const reply = (statusCode, body) => ({
  statusCode,
  headers: JSON_HEADERS,
  body: JSON.stringify(body),
})

const text = (value) => (typeof value === 'string' ? value.trim() : '')

function readIdentity(payload) {
  const values = {}
  for (const field of IDENTITY_FIELDS) {
    const value = text(payload[field])
    if (!value) return { error: `${field} is required.` }
    if (value.length > MAX_FIELD_LENGTH) return { error: `${field} is too long.` }
    values[field] = value
  }
  if (!EMAIL_PATTERN.test(values.contact_email)) {
    return { error: 'contact_email is not a valid email address.' }
  }
  return { values }
}

function readEcovadisLink(payload) {
  const link = text(payload.ecovadis_link)
  if (!link) return { error: 'ecovadis_link is required on the EcoVadis route.' }
  if (link.length > 2000) return { error: 'ecovadis_link is too long.' }
  let parsed
  try {
    parsed = new URL(link)
  } catch {
    return { error: 'ecovadis_link is not a valid URL.' }
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return { error: 'ecovadis_link must be an http or https URL.' }
  }
  return { value: link }
}

function readAnswers(payload) {
  const answers = payload.questionnaire_answers
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
    return { error: 'questionnaire_answers is required on the Questionnaire route.' }
  }
  const keys = Object.keys(answers)
  if (keys.length === 0) return { error: 'questionnaire_answers is empty.' }
  if (keys.length > MAX_ANSWER_KEYS) return { error: 'questionnaire_answers has too many fields.' }

  const cleaned = {}
  for (const key of keys) {
    if (!ANSWER_KEY_PATTERN.test(key)) {
      return { error: 'questionnaire_answers contains an unrecognised field.' }
    }
    const value = answers[key]
    if (value === null || value === undefined) {
      cleaned[key] = ''
      continue
    }
    if (typeof value !== 'string') {
      return { error: 'questionnaire_answers values must be text.' }
    }
    if (value.length > MAX_ANSWER_LENGTH) {
      return { error: 'A questionnaire answer is too long.' }
    }
    cleaned[key] = value.trim()
  }
  return { value: cleaned }
}

async function callRpc(name, args) {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('missing-configuration')
  }

  const response = await fetch(`${url.replace(/\/+$/, '')}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(args),
  })

  const raw = await response.text()
  if (!response.ok) {
    // Log the detail for the Netlify function log; never return it to the browser.
    console.error(`Supabase rpc ${name} failed: ${response.status} ${raw}`)
    throw new Error('database-error')
  }
  return raw ? JSON.parse(raw) : null
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return reply(405, { error: 'Method not allowed.' })
  }
  if (typeof event.body === 'string' && event.body.length > MAX_BODY_BYTES) {
    return reply(413, { error: 'Submission is too large.' })
  }

  let payload
  try {
    payload = JSON.parse(event.body || '{}')
  } catch {
    return reply(400, { error: 'Request body is not valid JSON.' })
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return reply(400, { error: 'Request body is not valid JSON.' })
  }

  const route = text(payload.route)
  if (!ROUTES.includes(route)) {
    return reply(400, { error: 'Unknown submission route.' })
  }

  try {
    if (payload.action === 'check') {
      const companyName = text(payload.company_name)
      if (!companyName) return reply(400, { error: 'company_name is required.' })
      const result = await callRpc('check_submission_duplicate', {
        p_company_name: companyName.slice(0, MAX_FIELD_LENGTH),
        p_route: route,
      })
      return reply(200, { duplicate: !!result?.duplicate, kind: result?.kind ?? 'none' })
    }

    if (payload.action !== 'submit') {
      return reply(400, { error: 'Unknown action.' })
    }

    const identity = readIdentity(payload)
    if (identity.error) return reply(400, { error: identity.error })

    if (payload.consent !== true) {
      return reply(400, { error: 'Consent is required before a submission can be stored.' })
    }

    const args = {
      p_company_name: identity.values.company_name,
      p_contact_name: identity.values.contact_name,
      p_contact_email: identity.values.contact_email,
      p_contact_phone: identity.values.contact_phone,
      p_job_title: identity.values.job_title,
      p_department: identity.values.department,
      p_route: route,
      p_ecovadis_link: null,
      p_questionnaire_answers: null,
    }

    if (route === 'ecovadis') {
      const link = readEcovadisLink(payload)
      if (link.error) return reply(400, { error: link.error })
      args.p_ecovadis_link = link.value
    } else {
      const answers = readAnswers(payload)
      if (answers.error) return reply(400, { error: answers.error })
      args.p_questionnaire_answers = answers.value
    }

    const row = await callRpc('submit_submission', args)
    if (!row?.id) throw new Error('database-error')

    // Only the reference and the computed status go back to the browser.
    return reply(200, { id: row.id, status: row.status, created_at: row.created_at })
  } catch (error) {
    if (error.message === 'missing-configuration') {
      console.error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set on this deploy.')
      return reply(500, { error: 'The submission service is not configured. Contact The Corporate EHS team.' })
    }
    console.error('Submission failed:', error)
    return reply(500, { error: 'The submission could not be saved. Try again in a moment.' })
  }
}
