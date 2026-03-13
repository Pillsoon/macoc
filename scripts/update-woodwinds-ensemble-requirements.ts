/**
 * One-off script: update woodwinds-ensemble requirements in Google Sheets
 * per Alice's feedback (2026-03-12)
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

  const sheet = doc.sheetsByTitle['Divisions']
  if (!sheet) throw new Error('Divisions sheet not found')

  const rows = await sheet.getRows()
  const row = rows.find(r => r.get('id') === 'woodwinds-ensemble')
  if (!row) throw new Error('woodwinds-ensemble row not found')

  const current = row.get('requirements') || ''
  console.log('Current requirements:\n', current)

  const parts = current.split('|').map((s: string) => s.trim()).filter(Boolean)
  // Insert after first item
  parts.splice(1, 0, 'Instrumental Sonatas are allowed but the pianist must be a registered student. Piano is not an accompanist but an equal part.')
  // Insert before last item
  parts.splice(parts.length - 1, 0, 'All members of the group can use an original copy or sheet music from the public domain')

  const updated = parts.join(' | ')
  console.log('\nUpdated requirements:\n', updated)

  row.set('requirements', updated)
  await row.save()
  console.log('\n✅ Saved to Google Sheets')
}

main().catch(console.error)
