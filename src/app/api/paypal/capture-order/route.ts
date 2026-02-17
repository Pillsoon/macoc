import { NextRequest, NextResponse } from 'next/server'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'

const PAYPAL_API = 'https://api-m.paypal.com'

async function getAccessToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
  ).toString('base64')

  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  const data = await res.json()
  return data.access_token
}

export async function POST(request: NextRequest) {
  try {
    const { orderID } = await request.json()

    if (!orderID) {
      return NextResponse.json(
        { error: 'Missing orderID' },
        { status: 400 }
      )
    }

    const accessToken = await getAccessToken()

    const res = await fetch(
      `${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const captureData = await res.json()

    if (!res.ok) {
      console.error('PayPal capture error:', captureData)
      return NextResponse.json(
        { error: 'Failed to capture payment' },
        { status: 500 }
      )
    }

    // Extract custom_id from capture — format: "sheetName:rowNumber" or just "rowNumber"
    const customId =
      captureData.purchase_units?.[0]?.payments?.captures?.[0]?.custom_id

    if (customId) {
      try {
        let sheetName: string
        let rowNumber: number

        if (customId.includes(':')) {
          const colonIdx = customId.lastIndexOf(':')
          sheetName = customId.slice(0, colonIdx)
          rowNumber = parseInt(customId.slice(colonIdx + 1), 10)
        } else {
          sheetName = 'Registrations'
          rowNumber = parseInt(customId, 10)
        }

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

        const sheet = doc.sheetsByTitle[sheetName]
        if (sheet) {
          const rows = await sheet.getRows()
          const row = rows.find((r) => r.rowNumber === rowNumber)

          if (row && row.get('Payment Status') !== 'Paid') {
            row.set('Payment Status', 'Paid')
            await row.save()
          }
        }
      } catch (sheetError) {
        console.error('Failed to update sheet:', sheetError)
      }
    }

    return NextResponse.json({ status: captureData.status })
  } catch (error) {
    console.error('Capture order error:', error)
    return NextResponse.json(
      { error: 'Failed to capture order' },
      { status: 500 }
    )
  }
}
