import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockSave = vi.fn()
const mockGet = vi.fn()
const mockSet = vi.fn()
const mockGetRows = vi.fn()
const mockLoadInfo = vi.fn()

vi.mock('google-spreadsheet', () => ({
  GoogleSpreadsheet: vi.fn().mockImplementation(function () {
    return {
      loadInfo: mockLoadInfo,
      sheetsByTitle: {
        Registrations: {
          getRows: mockGetRows,
        },
      },
    }
  }),
}))

vi.mock('google-auth-library', () => ({
  JWT: vi.fn().mockImplementation(function () { return {} }),
}))

const mockConstructEvent = vi.fn()

vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(function () {
    return {
      webhooks: {
        constructEvent: mockConstructEvent,
      },
    }
  }),
}))

process.env.STRIPE_SECRET_KEY = 'sk_test_123'
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123'
process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'test@test.iam.gserviceaccount.com'
process.env.GOOGLE_PRIVATE_KEY = 'test-key'
process.env.GOOGLE_REGISTRATION_SHEET_ID = 'test-sheet-id'

import { POST } from '../route'

function createRequest(body: string, signature?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (signature) headers['stripe-signature'] = signature
  return new NextRequest('http://localhost:3000/api/webhooks/stripe', {
    method: 'POST',
    body,
    headers,
  })
}

function makeRow(rowNumber: number, paymentStatus: string) {
  return {
    rowNumber,
    get: mockGet.mockImplementation((key: string) => {
      if (key === 'Payment Status') return paymentStatus
      return ''
    }),
    set: mockSet,
    save: mockSave,
  }
}

describe('POST /api/webhooks/stripe', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 when signature is missing', async () => {
    const res = await POST(createRequest('{}'))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toBe('Missing signature')
  })

  it('returns 400 when signature is invalid', async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error('Invalid signature')
    })

    const res = await POST(createRequest('{}', 'invalid_sig'))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toBe('Invalid signature')
  })

  it('updates payment status to "Paid" on checkout.session.completed', async () => {
    const row = makeRow(2, 'Pending')
    mockGetRows.mockResolvedValue([row])
    mockConstructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: { client_reference_id: '2' },
      },
    })

    const res = await POST(createRequest('{}', 'valid_sig'))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.received).toBe(true)
    expect(mockSet).toHaveBeenCalledWith('Payment Status', 'Paid')
    expect(mockSave).toHaveBeenCalled()
  })

  it('skips update when already "Paid" (idempotency)', async () => {
    const row = makeRow(2, 'Paid')
    mockGetRows.mockResolvedValue([row])
    mockConstructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: { client_reference_id: '2' },
      },
    })

    const res = await POST(createRequest('{}', 'valid_sig'))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.received).toBe(true)
    expect(mockSet).not.toHaveBeenCalled()
    expect(mockSave).not.toHaveBeenCalled()
  })

  it('returns 200 with no update when client_reference_id is missing', async () => {
    mockConstructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: { client_reference_id: null },
      },
    })

    const res = await POST(createRequest('{}', 'valid_sig'))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.received).toBe(true)
    expect(mockGetRows).not.toHaveBeenCalled()
  })

  it('ignores non-checkout events', async () => {
    mockConstructEvent.mockReturnValue({
      type: 'payment_intent.succeeded',
      data: { object: {} },
    })

    const res = await POST(createRequest('{}', 'valid_sig'))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.received).toBe(true)
    expect(mockGetRows).not.toHaveBeenCalled()
  })
})
