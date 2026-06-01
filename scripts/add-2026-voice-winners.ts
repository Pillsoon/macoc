/**
 * One-off script: add 2026 Voice Division winners (Musical Theater + Classical Voice).
 * Per the 2026 MACOC Vocal Winners list. Teachers and performance pieces omitted to
 * match prior-year schema (place + name only). Roman-numeral / labeled age sections
 * mapped to "Section N". Names follow the curated final list provided by the chair.
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

const VOICE = '🎤'

const rows: Row[] = []

function add(subsection: string, section: string, entries: [string, string][]) {
  for (const [place, name] of entries) {
    rows.push({ year: '2026', division: 'Voice Division', icon: VOICE, subsection, section, place, name })
  }
}

// ---- Musical Theater ----
add('Musical Theater', 'Section 1', [['1st', 'Isabelle Lin']])
add('Musical Theater', 'Section 2', [['1st', 'Stella Moon'], ['2nd', 'Elisha Kim'], ['3rd', 'Anay Poddar'], ['HM', 'Nikiforos Valaskantjis']])
add('Musical Theater', 'Section 3', [['1st', 'Aiden Baltazar'], ['2nd', 'Irene Su']])
add('Musical Theater', 'Section 4', [['1st', 'Wynona Madison Prawira'], ['2nd', 'Hayeon Ryu'], ['3rd', 'Ishani Bhola'], ['HM', 'Sophia Park']])
add('Musical Theater', 'Section 5', [['1st', 'Anabelle Skye Green'], ['2nd', 'Lily Elizabeth Larson'], ['3rd', 'Yeonhee Choi'], ['HM', 'Evelynn Yang']])
add('Musical Theater', 'Section 6', [['1st', 'Angelina Raskin']])

// ---- Classical Voice ----
add('Classical Voice', 'Section 1', [['1st', 'Jacob Wang']])
add('Classical Voice', 'Section 3', [['1st', 'Aiden Baltazar'], ['2nd', 'Audrey Li']])
add('Classical Voice', 'Section 4', [['1st', 'Ethan Kim'], ['2nd', 'Jace Jaehee Yoo'], ['3rd', 'Chelsea Yang'], ['HM', 'Julianna LV']])
add('Classical Voice', 'Section 5', [['1st', 'Leonardo Lin'], ['2nd', 'Sydney Lyu'], ['3rd', 'Yue Li']])
add('Classical Voice', 'Section 6', [['1st', 'Sean Kang']])
add('Classical Voice', 'Section 8', [['1st', 'Joseph Wonsig Park']])

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
  if (existing.some(r => r.get('year') === '2026' && r.get('division') === 'Voice Division')) {
    console.log('⚠️  2026 Voice Division rows already exist in Winners sheet — aborting to avoid duplicates.')
    return
  }

  await sheet.addRows(rows.map(r => ({ ...r })))
  console.log(`✅ Added ${rows.length} rows for 2026 Voice Division (Musical Theater + Classical Voice).`)
}

main().catch(console.error)
