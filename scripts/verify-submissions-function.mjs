// Exercises the submission Netlify Function against a stubbed Supabase, covering
// validation, the RPC contract, and what the browser is allowed to see back.
// The database logic itself is verified separately in Supabase (docs/supabase-setup.md).
// Run: node --import ./scripts/register-loader.mjs scripts/verify-submissions-function.mjs
import { handler } from '../netlify/functions/submissions.js'

process.env.SUPABASE_URL = 'https://project.supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key-for-test'

let failures = 0
const check = (label, condition, detail = '') => {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`)
  if (!condition) failures++
}

let calls = []
let respond = () => ({ ok: true, status: 200, text: async () => JSON.stringify({ id: 'row-1', status: 'active', created_at: 'now' }) })
globalThis.fetch = async (url, options) => {
  calls.push({ url, options, body: JSON.parse(options.body) })
  return respond()
}

const IDENTITY = {
  company_name: '  Acme Widgets GmbH  ',
  contact_name: 'Ana Ruiz',
  contact_email: 'ana@acme.test',
  contact_phone: '+49 69 000000',
  job_title: 'Head of EHS',
  department: 'Sustainability',
}

const call = async (body, method = 'POST') => {
  calls = []
  const response = await handler({ httpMethod: method, body: JSON.stringify(body) })
  return { ...response, json: JSON.parse(response.body) }
}

// --- method and payload guards ---
check('GET is rejected', (await call({}, 'GET')).statusCode === 405)
check('unknown route is rejected', (await call({ action: 'submit', route: 'email' })).statusCode === 400)
check('unknown action is rejected', (await call({ action: 'delete', route: 'ecovadis' })).statusCode === 400)

// --- identity validation ---
const missingField = await call({ action: 'submit', route: 'questionnaire', consent: true, ...IDENTITY, department: '  ' })
check('blank identity field is rejected', missingField.statusCode === 400, missingField.json.error)
const badEmail = await call({
  action: 'submit', route: 'questionnaire', consent: true, ...IDENTITY,
  contact_email: 'ana(at)acme', questionnaire_answers: { s2_scope1: '1' },
})
check('malformed email is rejected', badEmail.statusCode === 400, badEmail.json.error)
const noPhoneFormat = await call({
  action: 'submit', route: 'questionnaire', consent: true, ...IDENTITY,
  contact_phone: 'ring the front desk', questionnaire_answers: { s2_scope1: '1' },
})
check('phone is not format-checked', noPhoneFormat.statusCode === 200, noPhoneFormat.json.error ?? '')

// --- consent gate ---
const noConsent = await call({
  action: 'submit', route: 'questionnaire', ...IDENTITY, questionnaire_answers: { s2_scope1: '1' },
})
check('submit without consent is rejected', noConsent.statusCode === 400, noConsent.json.error)

// --- route-specific payloads ---
const badLink = await call({ action: 'submit', route: 'ecovadis', consent: true, ...IDENTITY, ecovadis_link: 'ecovadis dot com' })
check('malformed scorecard link is rejected', badLink.statusCode === 400, badLink.json.error)
const noLink = await call({ action: 'submit', route: 'ecovadis', consent: true, ...IDENTITY })
check('missing scorecard link is rejected', noLink.statusCode === 400, noLink.json.error)
const badAnswers = await call({
  action: 'submit', route: 'questionnaire', consent: true, ...IDENTITY,
  questionnaire_answers: { s1_ecovadis_bypass: 'Yes' },
})
check('retired s1_ answer key is rejected', badAnswers.statusCode === 400, badAnswers.json.error)
const nonTextAnswer = await call({
  action: 'submit', route: 'questionnaire', consent: true, ...IDENTITY,
  questionnaire_answers: { s2_scope1: { nested: true } },
})
check('non-text answer value is rejected', nonTextAnswer.statusCode === 400, nonTextAnswer.json.error)

// --- RPC contract on a good EcoVadis submit ---
const ecovadis = await call({
  action: 'submit', route: 'ecovadis', consent: true, ...IDENTITY,
  ecovadis_link: 'https://ecovadis.com/scorecard/123',
})
check('EcoVadis submit succeeds', ecovadis.statusCode === 200, ecovadis.json.error ?? '')
const [rpc] = calls
check('calls submit_submission once, atomically', calls.length === 1 && rpc.url.endsWith('/rest/v1/rpc/submit_submission'), rpc?.url)
check('sends the service role key', rpc.options.headers.apikey === 'service-role-key-for-test' && rpc.options.headers.Authorization === 'Bearer service-role-key-for-test')
check('trims the company name', rpc.body.p_company_name === 'Acme Widgets GmbH', rpc.body.p_company_name)
check('sends the scorecard link', rpc.body.p_ecovadis_link === 'https://ecovadis.com/scorecard/123')
check('sends no questionnaire answers on the EcoVadis route', rpc.body.p_questionnaire_answers === null)
check('returns only reference and status', Object.keys(ecovadis.json).sort().join(',') === 'created_at,id,status', Object.keys(ecovadis.json).join(','))

// --- RPC contract on a good Questionnaire submit ---
const questionnaire = await call({
  action: 'submit', route: 'questionnaire', consent: true, ...IDENTITY,
  questionnaire_answers: { s2_scope1: ' 1200 ', s7_code_of_conduct: 'Audited annually.' },
})
check('Questionnaire submit succeeds', questionnaire.statusCode === 200, questionnaire.json.error ?? '')
check('sends answers as an object', calls[0].body.p_questionnaire_answers.s2_scope1 === '1200')
check('sends no scorecard link on the Questionnaire route', calls[0].body.p_ecovadis_link === null)

// --- duplicate check ---
respond = () => ({ ok: true, status: 200, text: async () => JSON.stringify({ duplicate: true, kind: 'cross_route' }) })
const dup = await call({ action: 'check', route: 'questionnaire', company_name: 'Acme Widgets GmbH' })
check('check calls check_submission_duplicate', calls[0].url.endsWith('/rest/v1/rpc/check_submission_duplicate'))
check('check returns the warning kind', dup.json.duplicate === true && dup.json.kind === 'cross_route')
check('check needs no consent', dup.statusCode === 200)

// --- failures never leak database detail ---
respond = () => ({ ok: false, status: 400, text: async () => 'permission denied for relation submissions' })
const dbError = await call({
  action: 'submit', route: 'questionnaire', consent: true, ...IDENTITY,
  questionnaire_answers: { s2_scope1: '1' },
})
check('database error returns 500', dbError.statusCode === 500)
check('database detail is not returned to the browser', !/permission denied|relation/i.test(dbError.body), dbError.body)

delete process.env.SUPABASE_SERVICE_ROLE_KEY
const unconfigured = await call({
  action: 'submit', route: 'questionnaire', consent: true, ...IDENTITY,
  questionnaire_answers: { s2_scope1: '1' },
})
check('missing configuration is reported without detail', unconfigured.statusCode === 500 && !/SUPABASE/i.test(unconfigured.body))

console.log(failures === 0 ? '\nAll function checks passed.' : `\n${failures} check(s) failed.`)
process.exit(failures === 0 ? 0 : 1)
