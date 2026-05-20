/**
 * One-off script: add 2026 Winners (Strings, Woodwind, Chamber Music)
 * per Alice Yu (Woodwind Chair) email 2026-05-18 + 2026 String Winners List.
 * Teachers omitted to match prior-year schema (place + name only).
 * Roman-numeral age sections mapped to "Section N"; Chamber lists members only.
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

const STRINGS = '🎻'
const WOODWIND = '🎺'
const CHAMBER = '🎼'

const rows: Row[] = []

function add(division: string, icon: string, subsection: string, section: string, entries: [string, string][]) {
  for (const [place, name] of entries) {
    rows.push({ year: '2026', division, icon, subsection, section, place, name })
  }
}

// ---- Strings Division ----
add('Strings Division', STRINGS, 'Violin', 'Section 1', [['1st', 'Emily Peng']])
add('Strings Division', STRINGS, 'Violin', 'Section 2', [['1st', 'Jason Heo'], ['2nd', 'Emily Luo'], ['3rd', 'Caroline Zhang'], ['HM', 'Emma Wei']])
add('Strings Division', STRINGS, 'Violin', 'Section 3', [['1st', 'Linsey Gan'], ['2nd', 'Ethan Wei'], ['3rd', 'Gabriella Lam'], ['HM', 'Stella Wang']])
add('Strings Division', STRINGS, 'Violin', 'Section 4', [['1st', 'Ritaro Iizuka'], ['2nd', 'Kyle Poon'], ['3rd', 'Nanoka Yasue'], ['HM', 'Hugo Ado']])
add('Strings Division', STRINGS, 'Violin', 'Section 5', [['1st', 'Amber Wang'], ['2nd', 'Emily Lee'], ['3rd', 'Zackary Lee'], ['HM', 'Lucas Poon']])
add('Strings Division', STRINGS, 'Violin', 'Section 6', [['1st', 'Yunoo Jang'], ['2nd', 'Stella Chu'], ['3rd', 'Katherine Zhang'], ['HM', 'Serena Fong']])
add('Strings Division', STRINGS, 'Violin', 'Section 7', [['1st', 'Abigail Chung'], ['2nd', 'Cayla Kim'], ['3rd', 'Cayden Gwon'], ['HM', 'Shayden Imaoka']])
add('Strings Division', STRINGS, 'Violin', 'Section 8', [['1st', 'Wesley Tsai'], ['2nd', 'Wayne Wang'], ['3rd', 'Ethan Wang'], ['HM', 'Chloe Bogosh']])
add('Strings Division', STRINGS, 'Violin', 'Section 9', [['1st', 'KariAnne Chien'], ['2nd', 'Dora Li'], ['3rd', 'Eva Yoon']])

add('Strings Division', STRINGS, 'Viola', 'Section 2', [['1st', 'Noel Chen']])
add('Strings Division', STRINGS, 'Viola', 'Section 3', [['1st', 'Won Park'], ['2nd', 'Alissa Wu'], ['3rd', 'Vivian Jiang']])
add('Strings Division', STRINGS, 'Viola', 'Section 5', [['2nd', 'Emerson Tran']])
add('Strings Division', STRINGS, 'Viola', 'Section 6', [['2nd', 'Fiona Kim'], ['3rd', 'Enhe Hu']])
add('Strings Division', STRINGS, 'Viola', 'Section 7', [['1st', 'Luke Lee'], ['2nd', 'Uthara Iyer']])
add('Strings Division', STRINGS, 'Viola', 'Section 8', [['1st', 'Kylie Kim']])
add('Strings Division', STRINGS, 'Viola', 'Section 9', [['1st', 'Rebecca Park'], ['2nd', 'Joanne Chen'], ['3rd', 'Peter Lee'], ['HM', 'Sara Ning']])

add('Strings Division', STRINGS, 'Cello', 'Section 1', [['1st', 'Raymond Zhou']])
add('Strings Division', STRINGS, 'Cello', 'Section 2', [['1st', 'Aaron Zhang'], ['2nd', 'Declan Jin'], ['3rd', 'Wyatt Wang']])
add('Strings Division', STRINGS, 'Cello', 'Section 3', [['1st', 'Elise Lee'], ['2nd', 'Sofia Ahn'], ['3rd', 'Joshua Shin'], ['HM', 'Flora Zhao']])
add('Strings Division', STRINGS, 'Cello', 'Section 4', [['1st', 'Celine Eun'], ['2nd', 'Elsa Vasey'], ['3rd', 'Shuhan Liao']])
add('Strings Division', STRINGS, 'Cello', 'Section 5', [['1st', 'Jamie Chang'], ['2nd', 'Micah Lee'], ['3rd', 'Dain Kim']])
add('Strings Division', STRINGS, 'Cello', 'Section 6', [['1st', 'Kayla Chong'], ['2nd', 'Hannah Yoon'], ['3rd', 'Lioma Quoit Minematsu'], ['HM', 'Jeremiah Ming']])
add('Strings Division', STRINGS, 'Cello', 'Section 7', [['1st', 'Audrey Ma'], ['2nd', 'Kaitlyn Lee'], ['3rd', 'Theodore Kim'], ['HM', 'Jeeho Park']])
add('Strings Division', STRINGS, 'Cello', 'Section 8', [['1st', 'David Han'], ['2nd', 'Annabelle Chantana'], ['3rd', 'Elise Chang'], ['HM', 'Landon Yong']])
add('Strings Division', STRINGS, 'Cello', 'Section 9', [['1st', 'Kathryn Loutzenheiser'], ['2nd', 'Joshua Fong'], ['3rd', 'Aidan Chew'], ['HM', 'Ethan Choi']])

// ---- Woodwind Division ----
add('Woodwind Division', WOODWIND, 'Flute', 'Section 1', [['1st', 'Terry Lee'], ['2nd', 'Evan Zhao'], ['3rd', 'Jasmine Guo'], ['HM', 'Angelina McLarand']])
add('Woodwind Division', WOODWIND, 'Flute', 'Section 2', [['1st', 'Ellie Kim'], ['2nd', 'Jinhyo Jung'], ['3rd', 'Eliane Yang'], ['HM', 'Rita Li, Aryan Saha']])
add('Woodwind Division', WOODWIND, 'Flute', 'Section 3', [['1st', 'Yige Zhou'], ['2nd', 'Sarah Feigenbaum'], ['3rd', 'Grady Gillen']])
add('Woodwind Division', WOODWIND, 'Flute', 'Section 4', [['1st', 'Manas Bhushan'], ['2nd', 'Aidan Zhang'], ['3rd', 'Jacqueline Tseng']])
add('Woodwind Division', WOODWIND, 'Clarinet', 'Section 2', [['1st', 'Adrian Kang'], ['2nd', 'Jameson Lu']])
add('Woodwind Division', WOODWIND, 'Clarinet', 'Section 4', [['1st', 'Miles Liu']])
add('Woodwind Division', WOODWIND, 'Bassoon', 'Section 3', [['1st', 'Landon Moats']])
add('Woodwind Division', WOODWIND, 'Wind Ensemble', 'Section 1', [['1st', 'Daniel Cui, Eason Huang, Carnegie Park']])

// ---- Chamber Music Division (members only) ----
add('Chamber Music Division', CHAMBER, '', 'Section 3', [['1st', 'Angelina Jia, William Wu, Caroline Chen']])
add('Chamber Music Division', CHAMBER, '', 'Section 4', [
  ['1st', 'Andrew Nauli, Cayla Kim, Lucas Lee'],
  ['2nd', 'Skyler Tran, Julian Yoo, Jeeho Park'],
  ['3rd', 'Mary Mason, Cayden Gwon, Katie Hwang, Jinu Kang, Tabitha Tio'],
])
add('Chamber Music Division', CHAMBER, '', 'Section 5', [
  ['1st', 'Vivian Liu, Cadence Park, Zara b’Far'],
  ['2nd', 'Xuanyuan Wang, Jarden Pan, Emily Pan, David Han'],
])

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
  if (existing.some(r => r.get('year') === '2026')) {
    console.log('⚠️  2026 rows already exist in Winners sheet — aborting to avoid duplicates.')
    return
  }

  await sheet.addRows(rows.map(r => ({ ...r })))
  console.log(`✅ Added ${rows.length} rows for 2026 (Strings, Woodwind, Chamber Music).`)
}

main().catch(console.error)
