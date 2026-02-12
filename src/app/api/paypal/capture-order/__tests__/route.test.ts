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

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

process.env.PAYPAL_CLIENT_ID = 'test-client-id'
process.env.PAYPAL_SECRET = 'test-secret'
process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'test@test.iam.gserviceaccount.com'
process.env.GOOGLE_PRIVATE_KEY = 'test-key'
process.env.GOOGLE_REGISTRATION_SHEET_ID = 'test-sheet-id'

import { POST } from '../route'

function createRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/paypal/capture-order', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
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

describe('POST /api/paypal/capture-order', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('captures payment and updates sheet to Paid', async () => {
    const row = makeRow(2, 'Pending')
    mockGetRows.mockResolvedValue([row])
    mockFetch
      .mockResolvedValueOnce({
        json: async () => ({ access_token: 'test-token' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'COMPLETED',
          purchase_units: [
            { payments: { captures: [{ custom_id: '2' }] } },
          ],
        }),
      })

    const res = await POST(createRequest({ orderID: 'ORDER-123' }))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.status).toBe('COMPLETED')
    expect(mockSet).toHaveBeenCalledWith('Payment Status', 'Paid')
    expect(mockSave).toHaveBeenCalled()
  })

  it('skips sheet update when already Paid (idempotency)', async () => {
    const row = makeRow(2, 'Paid')
    mockGetRows.mockResolvedValue([row])
    mockFetch
      .mockResolvedValueOnce({
        json: async () => ({ access_token: 'test-token' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'COMPLETED',
          purchase_units: [
            { payments: { captures: [{ custom_id: '2' }] } },
          ],
        }),
      })

    const res = await POST(createRequest({ orderID: 'ORDER-123' }))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.status).toBe('COMPLETED')
    expect(mockSet).not.toHaveBeenCalled()
    expect(mockSave).not.toHaveBeenCalled()
  })

  it('returns 400 when orderID is missing', async () => {
    const res = await POST(createRequest({}))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toContain('Missing orderID')
  })

  it('returns 500 when PayPal capture fails', async () => {
    mockFetch
      .mockResolvedValueOnce({
        json: async () => ({ access_token: 'test-token' }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'CAPTURE_FAILED' }),
      })

    const res = await POST(createRequest({ orderID: 'ORDER-123' }))
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json.error).toContain('Failed to capture')
  })
})
