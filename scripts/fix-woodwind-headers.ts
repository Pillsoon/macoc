/**
 * Fix missing headers on the "Woodwind Ensemble" sheet in Google Sheets
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
    if (!process.env[key]) {
      process.env[key] = val
    }
  }
}

async function fixHeaders() {
  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  const doc = new GoogleSpreadsheet(
    process.env.GOOGLE_REGISTRATION_SHEET_ID!,
    serviceAccountAuth
  )

  await doc.loadInfo()

  const sheetTitle = 'Woodwind Ensemble'
  const sheet = doc.sheetsByTitle[sheetTitle]

  if (!sheet) {
    console.log(`Sheet "${sheetTitle}" not found. Nothing to fix.`)
    return
  }

  console.log(`Found sheet "${sheetTitle}" (sheetId: ${sheet.sheetId})`)

  try {
    await sheet.loadHeaderRow()
    console.log(`Current headers: [${sheet.headerValues?.join(', ') || 'EMPTY'}]`)

    if (sheet.headerValues && sheet.headerValues.length > 0 && sheet.headerValues.some(h => h !== '')) {
      console.log('Headers already exist. No fix needed.')
      return
    }
  } catch {
    console.log('No header row found. Will set headers.')
  }

  const memberHeaders: string[] = []
  for (let i = 1; i <= 5; i++) {
    memberHeaders.push(
      `Member${i} Name`, `Member${i} Instrument`, `Member${i} Age`, `Member${i} ProofOfAge`
    )
  }

  const expectedHeaders = [
    'Timestamp',
    'Payment Status',
    'Payment Date',
    'Section',
    'Instrumentation',
    'Composer',
    'Piece Title',
    'No Key Movement',
    'Duration',
    ...memberHeaders,
    'Coach Name',
    'Coach Phone',
    'Coach Email',
    'Contact Name',
    'Contact Phone',
    'Contact Email',
  ]

  if (sheet.columnCount < expectedHeaders.length) {
    console.log(`Resizing sheet from ${sheet.columnCount} to ${expectedHeaders.length} columns`)
    await sheet.resize({ rowCount: sheet.rowCount, columnCount: expectedHeaders.length })
  }

  await sheet.setHeaderRow(expectedHeaders)
  console.log(`Headers set successfully! (${expectedHeaders.length} columns)`)
}

fixHeaders().catch(console.error)
