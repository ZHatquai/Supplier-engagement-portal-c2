import * as XLSX from 'xlsx'
import { SECTIONS } from '../data/questionnaireSchema'

// Door 2 parsing: strict on structure, lenient on completeness (CLAUDE.md Business Rules).
// The uploaded file is read entirely client-side. Nothing here makes a network call.

const EXPECTED_HEADERS = [
  'SECTION',
  'ESRS REF',
  'TYPE',
  'QUESTION / METRIC',
  'SUPPLIER RESPONSE',
  'NOTES / EVIDENCE',
  'STATUS',
]

const norm = (v) => String(v ?? '').trim()
const normLoose = (v) =>
  norm(v)
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[.,;:!?'"()]/g, '')

function findHeaderRow(rows) {
  for (let i = 0; i < Math.min(rows.length, 15); i++) {
    const row = rows[i] || []
    const cells = row.slice(0, 7).map(norm)
    const matches = EXPECTED_HEADERS.every((h, idx) => norm(cells[idx]).toUpperCase() === h)
    if (matches) return i
  }
  return -1
}

export async function parseUploadedFile(file) {
  const okType = /\.(xlsx|csv)$/i.test(file.name)
  if (!okType) {
    return { ok: false, reason: 'File type not accepted. Upload a .xlsx or .csv file.' }
  }

  let workbook
  try {
    const buffer = await file.arrayBuffer()
    workbook = XLSX.read(buffer, { type: 'array' })
  } catch (err) {
    return { ok: false, reason: 'The file could not be read. It may be empty or corrupt.' }
  }

  const sheetName = workbook.SheetNames[0]
  if (!sheetName) {
    return { ok: false, reason: 'The file has no readable sheet.' }
  }
  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' })

  if (!rows.length) {
    return { ok: false, reason: 'The file is empty.' }
  }

  const headerRowIdx = findHeaderRow(rows)
  if (headerRowIdx === -1) {
    return {
      ok: false,
      reason:
        `Header row not found. Expected columns ${EXPECTED_HEADERS.join(', ')} were not detected — the sheet layout does not match the 2026 template.`,
    }
  }

  const dataRows = rows.slice(headerRowIdx + 1)

  // Build a lookup of section -> question label -> response, tolerant of blank
  // spacer rows and row-number drift, but requiring every expected question
  // to be present, worded as in the template, under its correct section.
  const bySection = {}
  dataRows.forEach((row) => {
    const section = norm(row[0]).toUpperCase()
    const question = norm(row[3])
    if (!section || !question) return
    if (!bySection[section]) bySection[section] = []
    bySection[section].push({ question, response: norm(row[4]) })
  })

  const missingSections = []
  const missingFields = []
  const answers = {}

  for (const section of SECTIONS) {
    const sectionRows = bySection[section.id]
    if (!sectionRows || sectionRows.length === 0) {
      missingSections.push(`${section.id} (${section.title})`)
      continue
    }
    for (const field of section.fields) {
      const target = normLoose(field.label)
      const match = sectionRows.find((r) => {
        const candidate = normLoose(r.question)
        return candidate === target || candidate.startsWith(target.slice(0, 40))
      })
      if (!match) {
        missingFields.push(`Section ${section.id}: "${field.label.slice(0, 60)}${field.label.length > 60 ? '…' : ''}"`)
      } else {
        answers[field.id] = match.response
      }
    }
  }

  if (missingSections.length > 0) {
    return {
      ok: false,
      reason: `The file does not match the 2026 template. Missing or renamed section(s): ${missingSections.join('; ')}.`,
    }
  }

  if (missingFields.length > 0) {
    return {
      ok: false,
      reason: `The file does not match the 2026 template. The following questions were not found where expected (renamed, moved, or removed): ${missingFields
        .slice(0, 5)
        .join('; ')}${missingFields.length > 5 ? `; and ${missingFields.length - 5} more` : ''}.`,
    }
  }

  // Structure matches. Blank cells pass through to Review as empty — lenient on completeness.
  return { ok: true, answers }
}
