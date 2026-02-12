'use client'

import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'

interface PayPalButtonProps {
  registrationId: number
  amount: number
  description: string
  onSuccess: () => void
}

export default function PayPalButton({
  registrationId,
  amount,
  description,
  onSuccess,
}: PayPalButtonProps) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID

  if (!clientId) {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
        <p className="text-amber-700 font-medium">Payment setup in progress</p>
        <p className="text-amber-600 text-sm mt-1">
          Please check back later or contact us for assistance.
        </p>
      </div>
    )
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        currency: 'USD',
        disableFunding: 'venmo',
      }}
    >
      <PayPalButtons
        style={{ layout: 'vertical', label: 'pay' }}
        createOrder={async () => {
          const res = await fetch('/api/paypal/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ registrationId, amount, description }),
          })
          const data = await res.json()
          return data.id
        }}
        onApprove={async (data) => {
          await fetch('/api/paypal/capture-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderID: data.orderID }),
          })
          onSuccess()
        }}
      />
    </PayPalScriptProvider>
  )
}
