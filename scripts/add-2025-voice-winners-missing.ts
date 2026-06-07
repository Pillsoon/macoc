/**
 * One-off script: backfill the 4 missing 2025 Voice Division section entries.
 *
 * The 2025 Voice Division was published incomplete. Per the full 2025 MACOC Vocal
 * Winners list, the following entries were missing and are added here (place + name
 * only, performance pieces omitted per the established schema):
 *   - Musical Theater / Section 3: 2nd Seojin Kim
 *   - Musical Theater / Section 5: 2nd Chloe Minu Chung, 3rd Leonardo Ilian Lin
 *   - Classical Voice  / Section 5: 2nd Seohyun Kim
 *   - Classical Voice  / Section 8: 2nd Lawrence Seiji Abbott, 3rd Sadeina Achda
 *
 * Rows are inserted at the correct positions in the "Winners" sheet so the
 * generated 2025.json keeps sections in ascending order (fetch-sheets groups by
 * first-seen row order). Existing rows are not modified.
 */

import * as fs from 'fs'
import * as path from 'path'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'

const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath) && !process.env.GOOGLE_SHEET_ID) {
  const content = fs.readFileSync(envPath, 'utf-8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx)
    let val = trimmed.slice(eqIdx + 1)
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = val
  }
}

const SHEET_ID = process.env.GOOGLE_SHEET_ID || ''
const SERVICE_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || ''
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY || ''

const VOICE = '🎤'
const YEAR = '2025'
const DIVISION = 'Voice Division'

type NewRow = { subsection: string; section: string; place: string; name: string }

// Each insertion: anchor identifies the existing row, `after` = insert below it (else above).
type Insertion = {
  anchor: { subsection: string; section: string; place: string }
  after: boolean
  rows: NewRow[]
}

const insertions: Insertion[] = [
  {
    anchor: { subsection: 'Musical Theater', section: 'Section 4', place: '1st' }, // before Erin Choi
    after: false,
    rows: [{ subsection: 'Musical Theater', section: 'Section 3', place: '2nd', name: 'Seojin Kim' }],
  },
  {
    anchor: { subsection: 'Musical Theater', section: 'Section 6', place: '1st' }, // before Maddox Feemster
    after: false,
    rows: [
      { subsection: 'Musical Theater', section: 'Section 5', place: '2nd', name: 'Chloe Minu Chung' },
      { subsection: 'Musical Theater', section: 'Section 5', place: '3rd', name: 'Leonardo Ilian Lin' },
    ],
  },
  {
    anchor: { subsection: 'Classical Voice', section: 'Section 6', place: '1st' }, // before Jaden Jaehyung Yoo
    after: false,
    rows: [{ subsection: 'Classical Voice', section: 'Section 5', place: '2nd', name: 'Seohyun Kim' }],
  },
  {
    anchor: { subsection: 'Classical Voice', section: 'Section 6', place: '2nd' }, // after Yewon Jang
    after: true,
    rows: [
      { subsection: 'Classical Voice', section: 'Section 8', place: '2nd', name: 'Lawrence Seiji Abbott' },
      { subsection: 'Classical Voice', section: 'Section 8', place: '3rd', name: 'Sadeina Achda' },
    ],
  },
]

// year | division | subsection | section | place | name | icon  → column indexes
const COL = { year: 0, division: 1, subsection: 2, section: 3, place: 4, name: 5, icon: 6 }

async function main() {
  const auth = new JWT({
    email: SERVICE_EMAIL,
    key: PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  const doc = new GoogleSpreadsheet(SHEET_ID, auth)
  await doc.loadInfo()

  const sheet = doc.sheetsByTitle['Winners']
  if (!sheet) throw new Error('Winners sheet not found')

  const rows = await sheet.getRows()
  const is2025Voice = (r: (typeof rows)[number]) =>
    r.get('year') === YEAR && r.get('division') === DIVISION

  // Idempotency guard: bail if any of the new entries already exist.
  const newRowsExist = insertions
    .flatMap((ins) => ins.rows)
    .some((nr) =>
      rows.some(
        (r) =>
          is2025Voice(r) &&
          r.get('subsection') === nr.subsection &&
          r.get('section') === nr.section &&
          r.get('place') === nr.place,
      ),
    )
  if (newRowsExist) {
    console.log('⚠️  Some 2025 Voice rows to add already exist — aborting to avoid duplicates.')
    return
  }

  // Resolve each insertion to a 0-based grid start index, then process largest-first
  // so earlier (lower-index) inserts never shift the not-yet-processed anchors.
  const resolved = insertions.map((ins) => {
    const anchorRow = rows.find(
      (r) =>
        is2025Voice(r) &&
        r.get('subsection') === ins.anchor.subsection &&
        r.get('section') === ins.anchor.section &&
        r.get('place') === ins.anchor.place,
    )
    if (!anchorRow) {
      throw new Error(`Anchor not found: ${JSON.stringify(ins.anchor)}`)
    }
    // rowNumber is 1-based (header = row 1) → 0-based grid index = rowNumber - 1.
    const gridIndex = anchorRow.rowNumber - 1
    const startIndex = ins.after ? gridIndex + 1 : gridIndex
    return { ...ins, startIndex }
  })

  resolved.sort((a, b) => b.startIndex - a.startIndex)

  for (const ins of resolved) {
    const count = ins.rows.length
    await sheet.insertDimension('ROWS', { startIndex: ins.startIndex, endIndex: ins.startIndex + count }, true)

    await sheet.loadCells({
      startRowIndex: ins.startIndex,
      endRowIndex: ins.startIndex + count,
      startColumnIndex: 0,
      endColumnIndex: 7,
    })

    ins.rows.forEach((nr, i) => {
      const g = ins.startIndex + i
      sheet.getCell(g, COL.year).value = YEAR
      sheet.getCell(g, COL.division).value = DIVISION
      sheet.getCell(g, COL.subsection).value = nr.subsection
      sheet.getCell(g, COL.section).value = nr.section
      sheet.getCell(g, COL.place).value = nr.place
      sheet.getCell(g, COL.name).value = nr.name
      sheet.getCell(g, COL.icon).value = VOICE
    })

    await sheet.saveUpdatedCells()
    console.log(`✅ Inserted ${count} row(s) at grid index ${ins.startIndex}: ${ins.rows.map((r) => `${r.section} ${r.place} ${r.name}`).join(', ')}`)
  }

  console.log('🎤 Done backfilling 2025 Voice Division missing entries.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
