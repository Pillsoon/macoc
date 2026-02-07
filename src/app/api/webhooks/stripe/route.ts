import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}

export async function POST(request: NextRequest) {
  const stripe = getStripe()
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const rowNumber = session.client_reference_id

    if (!rowNumber) {
      console.error('No client_reference_id in checkout session')
      return NextResponse.json({ received: true })
    }

    try {
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

      const sheet = doc.sheetsByTitle['Registrations']
      if (!sheet) {
        console.error('Registrations sheet not found')
        return NextResponse.json({ received: true })
      }

      const rows = await sheet.getRows()
      const row = rows.find((r) => r.rowNumber === parseInt(rowNumber, 10))

      if (!row) {
        console.error(`Row ${rowNumber} not found`)
        return NextResponse.json({ received: true })
      }

      if (row.get('Payment Status') === 'Paid') {
        return NextResponse.json({ received: true })
      }

      row.set('Payment Status', 'Paid')
      await row.save()
    } catch (err) {
      console.error('Failed to update payment status:', err)
      return NextResponse.json({ error: 'Failed to update sheet' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
