/**
 * One-off script: add 2026 Guitar winners (Classical Guitar + Guitar Chamber Music)
 * per Nikola Chekardzhikov email 2026-06-03. Adjudicators (Dr. TY Zhang & Sedona Farber)
 * and teachers omitted to match prior-year schema (place + name only).
 * Roman-numeral age sections mapped to "Section N"; chamber lists entrants as provided.
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

type Row = {
  year: string
  division: string
  icon: string
  subsection: string
  section: string
  place: string
  name: string
}

const CLASSICAL_GUITAR = '🎸'
const GUITAR_CHAMBER = '🎵'

const rows: Row[] = []

function add(division: string, icon: string, section: string, entries: [string, string][]) {
  for (const [place, name] of entries) {
    rows.push({ year: '2026', division, icon, subsection: '', section, place, name })
  }
}

// ---- Classical Guitar Division ----
add('Classical Guitar Division', CLASSICAL_GUITAR, 'Section 3', [['1st', 'Ashley Nha Lam Khong'], ['2nd', 'Duke Pak']])
add('Classical Guitar Division', CLASSICAL_GUITAR, 'Section 4', [['1st', 'Kaelyn Lee'], ['2nd', 'Thomas Tsai'], ['3rd', 'Dallas Pak']])
add('Classical Guitar Division', CLASSICAL_GUITAR, 'Section 5', [['1st', 'Finn McCauley'], ['2nd', 'Harlow Levin'], ['3rd', 'Luca DaCastro']])
add('Classical Guitar Division', CLASSICAL_GUITAR, 'Section 6', [['1st', 'Dylan Watanabe'], ['2nd', 'Hea Lee'], ['3rd', 'Jonathan Maximilian'], ['HM', 'Alina Jung']])
add('Classical Guitar Division', CLASSICAL_GUITAR, 'Section 7', [['1st', 'Sacha Masroff'], ['2nd', 'Emily Tinoco']])
add('Classical Guitar Division', CLASSICAL_GUITAR, 'Section 8', [['1st', 'Kai Lonergan'], ['2nd', 'Vincent Tran'], ['3rd', 'Jesus De La Fuente']])

// ---- Guitar Chamber Music Division ----
add('Guitar Chamber Music Division', GUITAR_CHAMBER, 'Section 4', [['1st', 'Duke & Dallas Pak'], ['2nd', 'EG Guitar Octet']])

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

  const existing = await sheet.getRows()
  const guitarDivisions = ['Classical Guitar Division', 'Guitar Chamber Music Division']
  if (existing.some(r => r.get('year') === '2026' && guitarDivisions.includes(r.get('division')))) {
    console.log('⚠️  2026 Guitar rows already exist in Winners sheet — aborting to avoid duplicates.')
    return
  }

  await sheet.addRows(rows.map(r => ({ ...r })))
  console.log(`✅ Added ${rows.length} rows for 2026 Guitar (Classical Guitar + Guitar Chamber Music).`)
}

main().catch(console.error)
