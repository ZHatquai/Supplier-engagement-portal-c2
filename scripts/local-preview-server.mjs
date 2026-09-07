// Local walkthrough harness. Serves the built app and runs the REAL Netlify
// Function handler at /.netlify/functions/submissions, with only the Supabase
// HTTP call stubbed by an in-memory stand-in that mirrors the Postgres status
// rules (those rules are verified for real in the database — see
// docs/supabase-setup.md). Not shipped to Netlify; a dev harness only.
//
// Run: node --import ./scripts/register-loader.mjs scripts/local-preview-server.mjs [port]
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { randomUUID } from 'node:crypto'

process.env.SUPABASE_URL = 'https://stub.local'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'stub-service-role-key'

const rows = []
export const store = rows
const key = (name) => String(name ?? '').trim().toLowerCase()

function checkDuplicate({ p_company_name, p_route }) {
  const active = rows.filter((r) => key(r.company_name) === key(p_company_name) && r.status === 'active')
  if (active.some((r) => r.route === p_route)) return { duplicate: true, kind: 'same_route' }
  if (active.length > 0) return { duplicate: true, kind: 'cross_route' }
  return { duplicate: false, kind: 'none' }
}

function submit(args) {
  const k = key(args.p_company_name)
  const active = rows.filter((r) => key(r.company_name) === k && r.status === 'active')
  const sameRoute = active.filter((r) => r.route === args.p_route)
  const otherRoute = active.filter((r) => r.route !== args.p_route)

  let status
  if (sameRoute.length > 0) {
    status = 'needs_review'
    sameRoute.forEach((r) => {
      r.status = 'needs_review'
    })
  } else if (otherRoute.length > 0) {
    if (args.p_route === 'ecovadis') {
      status = 'active'
      otherRoute.forEach((r) => {
        r.status = 'superseded'
      })
    } else {
      status = 'superseded'
    }
  } else {
    status = 'active'
  }

  const row = {
    id: randomUUID(),
    company_name: String(args.p_company_name).trim(),
    contact_email: args.p_contact_email,
    route: args.p_route,
    ecovadis_link: args.p_ecovadis_link,
    questionnaire_answers: args.p_questionnaire_answers,
    status,
    created_at: new Date().toISOString(),
  }
  rows.push(row)
  return row
}

globalThis.fetch = async (url, options) => {
  const args = JSON.parse(options.body)
  const result = url.endsWith('check_submission_duplicate') ? checkDuplicate(args) : submit(args)
  return { ok: true, status: 200, text: async () => JSON.stringify(result) }
}

const { handler } = await import('../netlify/functions/submissions.js')

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.svg': 'image/svg+xml',
}

const port = Number(process.argv[2] || 4173)

createServer(async (req, res) => {
  if (req.url.startsWith('/.netlify/functions/submissions')) {
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    const response = await handler({ httpMethod: req.method, body: Buffer.concat(chunks).toString() })
    res.writeHead(response.statusCode, response.headers)
    res.end(response.body)
    return
  }
  if (req.url === '/__rows') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(rows))
    return
  }
  if (req.url === '/__reset') {
    rows.length = 0
    res.writeHead(200).end('ok')
    return
  }

  const path = normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[/\\])+/, '')
  let file = join('dist', path)
  try {
    const body = await readFile(file)
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' })
    res.end(body)
  } catch {
    const body = await readFile('dist/index.html')
    res.writeHead(200, { 'Content-Type': TYPES['.html'] })
    res.end(body)
  }
}).listen(port, () => console.log(`preview on http://127.0.0.1:${port}`))
