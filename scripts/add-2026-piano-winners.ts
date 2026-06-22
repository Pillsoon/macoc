/**
 * One-off script: add 2026 Piano Division winners.
 * Per the 2026 MACOC Piano Winners list. Teachers, entry #s and repertoire omitted to
 * match prior-year schema (place + name only). Divisions 1-11 map to "Section N".
 * Honorable Mentions in one section combine into a single comma-joined entry; ties at
 * the same place do the same. Empty placements (e.g. Section 1 3rd) are skipped.
 * Full names (incl. middle names) kept as provided, consistent with prior years.
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

const PIANO = '🎹'

const rows: Row[] = []

function add(section: string, entries: [string, string][]) {
  for (const [place, name] of entries) {
    rows.push({ year: '2026', division: 'Piano Division', icon: PIANO, subsection: '', section, place, name })
  }
}

add('Section 1', [['1st', 'Mira Lei, Abigail Chiou'], ['2nd', 'Avery Tang'], ['HM', 'Noel Rona Chen']])
add('Section 2', [['1st', 'Aaron Zhang, Kenneth Qian'], ['3rd', 'Quinn Wu'], ['HM', 'Daniel Tan, Hinata Ocoma, Oliver Ma']])
add('Section 3', [['1st', 'XiaoYun Pang'], ['2nd', 'Elise Yang'], ['3rd', 'Colin Chandrasoma'], ['HM', 'Daniel Brigham']])
add('Section 4', [['1st', 'Hyeyun Park'], ['2nd', 'Kate Shim'], ['3rd', 'Ruben S Jung'], ['HM', 'Samuel Lee, Oliver Li']])
add('Section 5', [['1st', 'David Wong'], ['2nd', 'Jichen Jason Sun'], ['3rd', 'Dylan Li'], ['HM', 'Eunice Tak, Felix Zhou, Lukas Wu']])
add('Section 6', [['1st', 'Amber Wang'], ['2nd', 'Emily Wang'], ['3rd', 'Jessica Wang'], ['HM', 'Caleb Timothy Lee, Grace Zhao']])
add('Section 7', [['1st', 'Lorien Chen'], ['2nd', 'Divyansh Joshi'], ['3rd', 'Hillary Yao'], ['HM', 'Yuan-Lang (Ian) Su, Clara Zhang']])
add('Section 8', [['1st', 'Angelina Nguyen'], ['2nd', 'Tirzah Nguyen'], ['3rd', 'Lyra Shapiro'], ['HM', 'Heeyoul Yang']])
add('Section 9', [['1st', 'Yige Zhou'], ['2nd', 'Clara Chandrasoma'], ['3rd', 'Gavin Ho'], ['HM', 'Oliver Lu, Sophie Liu, Ivanna Yang']])
add('Section 10', [['1st', 'Yihan Hannah Hu'], ['2nd', 'Minhkha Dang Le'], ['3rd', 'Vivian Liu'], ['HM', 'Aidan Chew']])
add('Section 11', [['1st', 'Lindsay Nguyen'], ['2nd', 'Matthew Sakata'], ['3rd', 'Katherine Fan'], ['HM', 'Natalie Chan, Ema Terada']])

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
  if (existing.some(r => r.get('year') === '2026' && r.get('division') === 'Piano Division')) {
    console.log('⚠️  2026 Piano Division rows already exist in Winners sheet — aborting to avoid duplicates.')
    return
  }

  await sheet.addRows(rows.map(r => ({ ...r })))
  console.log(`✅ Added ${rows.length} rows for 2026 Piano Division.`)
}

main().catch(console.error)
