/**
 * Fix misaligned data in Teacher Memberships sheet.
 *
 * The header initialization script (Mar 12) inserted "Payment Date" as column C
 * in the header row, but existing data rows were not shifted. This caused old
 * rows to have data offset by 1 column (First Name value appears in Payment Date, etc).
 */
import * as fs from 'fs'
import * as path from 'path'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
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

async function main() {
  const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY || ''
  const auth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  const doc = new GoogleSpreadsheet(process.env.GOOGLE_REGISTRATION_SHEET_ID!, auth)
  await doc.loadInfo()

  const sheet = doc.sheetsByTitle['Teacher Memberships']
  if (!sheet) {
    console.error('Sheet "Teacher Memberships" not found')
    process.exit(1)
  }

  await sheet.loadHeaderRow()
  const headers = sheet.headerValues
  console.log('Headers:', headers)

  const rows = await sheet.getRows()
  console.log(`Found ${rows.length} data rows\n`)

  for (const row of rows) {
    const paymentDate = row.get('Payment Date') || ''
    const firstName = row.get('First Name') || ''

    // Misaligned: Payment Date has a non-date string and First Name is empty
    const isDateLike = /^\d{4}/.test(paymentDate) || paymentDate === ''
    if (!isDateLike && !firstName) {
      console.log(`Row ${row.rowNumber}: MISALIGNED — fixing...`)

      // Read all raw values by header order
      const raw = headers.map(h => row.get(h) || '')
      console.log('  Before:', Object.fromEntries(headers.map((h, i) => [h, raw[i]])))

      // Insert empty Payment Date at position 2, shift old data right
      // raw[0]=Timestamp(ok), raw[1]=PaymentStatus(ok), raw[2]=FirstName(shifted), ...
      const corrected = [
        raw[0],  // Timestamp
        raw[1],  // Payment Status
        '',      // Payment Date (was missing)
        ...raw.slice(2, -1), // shift remaining right (drop last empty cell)
      ]

      console.log('  After: ', Object.fromEntries(headers.map((h, i) => [h, corrected[i]])))

      // Write corrected values
      for (let i = 0; i < headers.length && i < corrected.length; i++) {
        row.set(headers[i], corrected[i])
      }
      await row.save()
      console.log(`  Fixed!\n`)
    } else {
      console.log(`Row ${row.rowNumber}: OK (First Name = "${firstName}")`)
    }
  }

  console.log('Done!')
}

main().catch(console.error)
