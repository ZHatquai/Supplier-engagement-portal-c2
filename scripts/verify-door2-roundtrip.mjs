// Round-trips the shipped S1-free workbook through Door 2's parser:
// fill every SUPPLIER RESPONSE cell, re-read it, and confirm each schema field
// comes back. Also checks the two rejection paths. Run: node scripts/verify-door2-roundtrip.mjs
import { readFileSync } from 'node:fs'
import * as XLSX from 'xlsx'
import { SECTIONS, ALL_FIELDS } from '../src/data/questionnaireSchema.js'
import { parseUploadedFile } from '../src/lib/parseUpload.js'

const ASSET = 'public/assets/The_Corporate_Supplier_Questionnaire_2026.xlsx'
const asFile = (buffer, name) => ({ name, arrayBuffer: async () => buffer })

let failures = 0
const check = (label, condition, detail = '') => {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`)
  if (!condition) failures++
}

function loadRows() {
  const workbook = XLSX.read(readFileSync(ASSET), { type: 'buffer' })
  const name = workbook.SheetNames[0]
  return { workbook, name, rows: XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1, raw: false, defval: '' }) }
}

function toBuffer(rows, sheetName) {
  const book = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(rows), sheetName)
  const out = XLSX.write(book, { type: 'array', bookType: 'xlsx' })
  return out
}

// 1. The shipped workbook must carry S2–S7 and no trace of S1.
const { rows, name: sheetName } = loadRows()
const sectionsInFile = [...new Set(rows.map((r) => String(r[0] ?? '').trim()).filter((v) => /^S\d$/.test(v)))]
check('workbook sections are S2–S7 only', sectionsInFile.join(',') === 'S2,S3,S4,S5,S6,S7', sectionsInFile.join(','))
check(
  'no S1 reference anywhere in the workbook text',
  !rows.flat().some((cell) => /\bS1\b/.test(String(cell ?? ''))),
)
check('schema exposes 6 sections', SECTIONS.length === 6, `${SECTIONS.length}`)
check('schema has no s1_ fields', !ALL_FIELDS.some((f) => f.id.startsWith('s1_')))

// 2. Fill every question row's response column, then parse it back.
const filled = rows.map((row) => [...row])
const headerIdx = filled.findIndex((r) => String(r[0] ?? '').trim().toUpperCase() === 'SECTION')
let filledCount = 0
for (let i = headerIdx + 1; i < filled.length; i++) {
  const section = String(filled[i][0] ?? '').trim()
  const question = String(filled[i][3] ?? '').trim()
  if (!/^S\d$/.test(section) || !question) continue
  const field = ALL_FIELDS.find(
    (f) => f.sectionId === section && f.label.slice(0, 40).toLowerCase() === question.slice(0, 40).toLowerCase(),
  )
  if (!field) continue
  filled[i][4] = field.type === 'number' ? '123' : field.type === 'dropdown' ? field.options[0] : `answer-${field.id}`
  filledCount++
}
check('every schema field matched a workbook row', filledCount === ALL_FIELDS.length, `${filledCount}/${ALL_FIELDS.length}`)

const okResult = await parseUploadedFile(asFile(toBuffer(filled, sheetName), 'filled.xlsx'))
check('filled workbook parses', okResult.ok, okResult.reason ?? '')
if (okResult.ok) {
  const missing = ALL_FIELDS.filter((f) => !(f.id in okResult.answers))
  check('all answers returned', missing.length === 0, missing.map((f) => f.id).join(','))
  const wrong = ALL_FIELDS.filter((f) => f.type === 'textarea' && okResult.answers[f.id] !== `answer-${f.id}`)
  check('answer values map to the right fields', wrong.length === 0, wrong.map((f) => f.id).join(','))
}

// 3. A blank-but-structurally-matching file passes (lenient on completeness).
const blank = rows.map((row) => [...row])
const blankResult = await parseUploadedFile(asFile(toBuffer(blank, sheetName), 'blank.xlsx'))
check('blank but matching workbook is accepted', blankResult.ok, blankResult.reason ?? '')
if (blankResult.ok) {
  check('blank answers come through empty', Object.values(blankResult.answers).every((v) => v === ''))
}

// 4. A missing section is rejected, naming the section (strict on structure).
const withoutS4 = rows.filter((row) => String(row[0] ?? '').trim() !== 'S4')
const missingSection = await parseUploadedFile(asFile(toBuffer(withoutS4, sheetName), 'no-s4.xlsx'))
check('missing section is rejected', !missingSection.ok)
check('rejection names the missing section', /S4/.test(missingSection.reason ?? ''), missingSection.reason ?? '')

// 5. A renamed question is rejected, naming the question.
const renamed = rows.map((row) => [...row])
const targetIdx = renamed.findIndex((r) => String(r[3] ?? '').startsWith('Total water withdrawal'))
renamed[targetIdx][3] = 'Water usage, roughly'
const renamedResult = await parseUploadedFile(asFile(toBuffer(renamed, sheetName), 'renamed.xlsx'))
check('renamed question is rejected', !renamedResult.ok)
check('rejection names the question', /Total water withdrawal/.test(renamedResult.reason ?? ''), renamedResult.reason ?? '')

// 6. A file with the wrong header layout is rejected.
const badHeader = rows.map((row) => [...row])
badHeader[headerIdx] = ['SEC', 'REF', 'TYPE', 'Q', 'ANSWER', 'NOTES', 'STATE']
const badHeaderResult = await parseUploadedFile(asFile(toBuffer(badHeader, sheetName), 'bad-header.xlsx'))
check('altered header row is rejected', !badHeaderResult.ok, badHeaderResult.reason ?? '')

console.log(failures === 0 ? '\nAll Door 2 checks passed.' : `\n${failures} check(s) failed.`)
process.exit(failures === 0 ? 0 : 1)
