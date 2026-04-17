/**
 * Final fix for Teacher Memberships sheet:
 * 1. Set Payment Date from PayPal records
 * 2. Fix Total Amount for all rows
 * 3. Add Woodwind Instrument header
 */
import * as fs from 'fs'
import * as path from 'path'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'

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

// PayPal payment records
const PAYPAL_DATA: Record<string, { date: string; amount: string }> = {
  'HAIYANG': { date: '2026-03-11', amount: '40' },
  'Hyunjoo': { date: '2026-03-08', amount: '40' },
  'Sujung': { date: '2026-03-09', amount: '40' },
  'Hsiu-Chen Alice': { date: '2026-03-12', amount: '40' },
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
  console.log('Current headers:', headers)

  // Step 1: Add Woodwind Instrument header if missing
  const hasWoodwindInstrument = headers.includes('Woodwind Instrument')
  if (!hasWoodwindInstrument) {
    console.log('\nAdding "Woodwind Instrument" header...')
    const stringInstrIdx = headers.indexOf('String Instrument')
    const newHeaders = [
      ...headers.slice(0, stringInstrIdx + 1),
      'Woodwind Instrument',
      ...headers.slice(stringInstrIdx + 1),
    ]

    // Read all data BEFORE changing headers
    const rows = await sheet.getRows()
    const allData: Record<string, string>[] = []
    for (const row of rows) {
      const rowData: Record<string, string> = {}
      for (const h of headers) {
        rowData[h] = row.get(h) || ''
      }
      allData.push(rowData)
    }

    // Resize and set new headers
    await sheet.resize({ rowCount: sheet.rowCount, columnCount: newHeaders.length })
    await sheet.setHeaderRow(newHeaders)
    console.log('New headers:', newHeaders)

    // Re-write all data rows with correct column mapping
    // (setHeaderRow shifted header positions, need to realign data)
    await sheet.loadHeaderRow()
    const freshRows = await sheet.getRows()
    for (let i = 0; i < freshRows.length; i++) {
      const row = freshRows[i]
      const data = allData[i]

      // Set all old fields to their saved values (by name, so library maps correctly)
      for (const h of headers) {
        row.set(h, data[h] || '')
      }
      // New column is empty
      row.set('Woodwind Instrument', '')
      await row.save()
    }
    console.log('All rows realigned for new header\n')

    // Reload rows for the next step
    await sheet.loadHeaderRow()
  }

  // Step 2: Fix Payment Date and Total Amount
  const rows = await sheet.getRows()
  console.log(`\nFixing Payment Date and Total Amount for ${rows.length} rows...\n`)

  for (const row of rows) {
    const firstName = row.get('First Name') || ''
    const paypalEntry = Object.entries(PAYPAL_DATA).find(([name]) => firstName.includes(name))

    if (paypalEntry) {
      const [name, { date, amount }] = paypalEntry
      const currentPaymentDate = row.get('Payment Date') || ''
      const currentTotalAmount = row.get('Total Amount') || ''

      console.log(`Row ${row.rowNumber} (${firstName}):`)

      if (!currentPaymentDate || !/^\d{4}/.test(currentPaymentDate)) {
        row.set('Payment Date', date)
        console.log(`  Payment Date: "${currentPaymentDate}" → "${date}"`)
      } else {
        console.log(`  Payment Date: "${currentPaymentDate}" (already set)`)
      }

      if (currentTotalAmount !== amount) {
        row.set('Total Amount', amount)
        console.log(`  Total Amount: "${currentTotalAmount}" → "${amount}"`)
      } else {
        console.log(`  Total Amount: "${currentTotalAmount}" (already correct)`)
      }

      await row.save()
      console.log(`  Saved!\n`)
    } else {
      console.log(`Row ${row.rowNumber} (${firstName}): no PayPal match\n`)
    }
  }

  // Print final state
  console.log('=== Final State ===')
  const finalRows = await sheet.getRows()
  await sheet.loadHeaderRow()
  const finalHeaders = sheet.headerValues
  for (const row of finalRows) {
    const firstName = row.get('First Name') || ''
    const lastName = row.get('Last Name') || ''
    console.log(`\nRow ${row.rowNumber}: ${firstName} ${lastName}`)
    for (const h of finalHeaders) {
      console.log(`  ${h}: "${row.get(h) || ''}"`)
    }
  }

  console.log('\nDone!')
}

main().catch(console.error)
