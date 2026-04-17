/**
 * One-off script: apply late fees (effective 2026-04-16)
 * - fees.solo.amount: 60 -> 70
 * - fees.membership.amount: 40 -> 50
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

const UPDATES: Array<{ key: string; value: string }> = [
  { key: 'fees.solo.amount', value: '70' },
  { key: 'fees.membership.amount', value: '50' },
]

async function main() {
  const auth = new JWT({
    email: SERVICE_EMAIL,
    key: PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  const doc = new GoogleSpreadsheet(SHEET_ID, auth)
  await doc.loadInfo()

  const sheet = doc.sheetsByTitle['Config']
  if (!sheet) throw new Error('Config sheet not found')

  const rows = await sheet.getRows()
  for (const { key, value } of UPDATES) {
    const row = rows.find((r) => r.get('key') === key)
    if (!row) {
      console.error(`❌ Row not found for key: ${key}`)
      continue
    }
    const before = row.get('value')
    if (before === value) {
      console.log(`↩︎  ${key} already ${value}, skipped`)
      continue
    }
    row.set('value', value)
    await row.save()
    console.log(`✅ ${key}: ${before} -> ${value}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
