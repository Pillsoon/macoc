import { NextRequest, NextResponse } from 'next/server'

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
    const { registrationId, amount, description } = await request.json()

    if (!registrationId || !amount) {
      return NextResponse.json(
        { error: 'Missing registrationId or amount' },
        { status: 400 }
      )
    }

    const accessToken = await getAccessToken()

    const res = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            custom_id: String(registrationId),
            description: description || 'MACOC Registration',
            amount: {
              currency_code: 'USD',
              value: String(amount),
            },
          },
        ],
      }),
    })

    const order = await res.json()

    if (!res.ok) {
      console.error('PayPal create order error:', order)
      return NextResponse.json(
        { error: 'Failed to create PayPal order' },
        { status: 500 }
      )
    }

    return NextResponse.json({ id: order.id })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
