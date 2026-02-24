import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'
import { NextResponse } from 'next/server'

export async function GET() {
  const sheetId = process.env.GOOGLE_SHEET_ID
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const key = process.env.GOOGLE_PRIVATE_KEY

  if (!sheetId || !email || !key) {
    return NextResponse.json({
      error: 'Missing env vars',
      hasSheetId: !!sheetId,
      hasEmail: !!email,
      hasKey: !!key,
    })
  }

  try {
    const auth = new JWT({
      email,
      key: key.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })

    const doc = new GoogleSpreadsheet(sheetId, auth)
    await doc.loadInfo()

    const sheet = doc.sheetsByTitle['Directory']
    if (!sheet) {
      return NextResponse.json({
        error: 'No "Directory" sheet found',
        availableSheets: Object.keys(doc.sheetsByTitle),
      })
    }

    const rows = await sheet.getRows()
    const firstFive = rows.slice(0, 5).map(row => ({
      name: row.get('name'),
      category: row.get('category'),
      year: row.get('year'),
    }))

    return NextResponse.json({
      ok: true,
      totalRows: rows.length,
      firstFive,
    })
  } catch (e: unknown) {
    return NextResponse.json({
      error: String(e),
    })
  }
}
