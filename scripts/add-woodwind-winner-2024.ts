/**
 * One-off script: add Adrian Kang to 2024 Winners List (Woodwind Division)
 * per Alice Yu's request (2026-03-15)
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

  // Check if Adrian Kang already exists
  const rows = await sheet.getRows()
  const existing = rows.find(r =>
    r.get('year') === '2024' &&
    r.get('division') === 'Woodwind Division' &&
    r.get('name') === 'Adrian Kang'
  )

  if (existing) {
    console.log('✅ Adrian Kang already exists in 2024 Woodwind Division')
    return
  }

  // Add new row
  await sheet.addRow({
    year: '2024',
    division: 'Woodwind Division',
    icon: '🎺',
    subsection: 'Clarinet',
    section: 'Section 1',
    place: '1st',
    name: 'Adrian Kang',
  })

  console.log('✅ Added Adrian Kang to 2024 Winners (Woodwind Division, Clarinet, Section 1, 1st)')
}

main().catch(console.error)
