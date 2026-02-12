import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

process.env.PAYPAL_CLIENT_ID = 'test-client-id'
process.env.PAYPAL_SECRET = 'test-secret'

import { POST } from '../route'

function createRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/paypal/create-order', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/paypal/create-order', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns order id on success', async () => {
    mockFetch
      .mockResolvedValueOnce({
        json: async () => ({ access_token: 'test-token' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'ORDER-123' }),
      })

    const res = await POST(
      createRequest({ registrationId: 2, amount: 60, description: 'Solo Entry' })
    )
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.id).toBe('ORDER-123')
  })

  it('returns 400 when registrationId is missing', async () => {
    const res = await POST(createRequest({ amount: 60 }))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toContain('Missing')
  })

  it('returns 400 when amount is missing', async () => {
    const res = await POST(createRequest({ registrationId: 2 }))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toContain('Missing')
  })

  it('returns 500 when PayPal API fails', async () => {
    mockFetch
      .mockResolvedValueOnce({
        json: async () => ({ access_token: 'test-token' }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'INVALID_REQUEST' }),
      })

    const res = await POST(
      createRequest({ registrationId: 2, amount: 60 })
    )
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json.error).toContain('Failed')
  })
})
