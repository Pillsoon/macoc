import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockAddRow = vi.fn()
const mockAddSheet = vi.fn()
const mockLoadInfo = vi.fn()

vi.mock('google-spreadsheet', () => ({
  GoogleSpreadsheet: vi.fn().mockImplementation(function () {
    return {
      loadInfo: mockLoadInfo,
      sheetsByTitle: {
        'Teacher Memberships': {
          addRow: mockAddRow,
        },
      },
      addSheet: mockAddSheet,
    }
  }),
}))

vi.mock('google-auth-library', () => ({
  JWT: vi.fn().mockImplementation(function () { return {} }),
}))

process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'test@test.iam.gserviceaccount.com'
process.env.GOOGLE_PRIVATE_KEY = 'test-key'
process.env.GOOGLE_REGISTRATION_SHEET_ID = 'test-sheet-id'

import { POST } from '../route'

function makeValidData() {
  return {
    firstName: 'Jane',
    middleName: '',
    lastName: 'Doe',
    streetAddress: '123 Main St',
    streetAddress2: '',
    city: 'Irvine',
    state: 'CA',
    zipCode: '92620',
    email: 'jane@example.com',
    mobileNumber: '555-0100',
    phoneNumber: '',
    instrument: 'Piano',
    stringInstrument: 'None',
    helpPreference: 'Morning Help',
    subDivisions: ['Strings', 'Vocal'],
    membershipTier: 'Regular Member',
    nonAvailableFee: false,
    totalAmount: 40,
  }
}

function createRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/teacher-registration', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/teacher-registration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAddRow.mockResolvedValue({ rowNumber: 2 })
  })

  it('returns 200 with registrationId on valid data', async () => {
    const res = await POST(createRequest(makeValidData()))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.registrationId).toBe(2)
  })

  it('returns 400 when a required field is missing', async () => {
    const data = makeValidData()
    delete (data as Record<string, unknown>).firstName

    const res = await POST(createRequest(data))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toContain('firstName')
  })

  it('returns 400 when required field is empty string', async () => {
    const data = { ...makeValidData(), email: '' }

    const res = await POST(createRequest(data))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toContain('email')
  })

  it('returns 500 when Google Sheets fails', async () => {
    mockLoadInfo.mockRejectedValueOnce(new Error('Sheets API error'))

    const res = await POST(createRequest(makeValidData()))
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json.error).toBe('Failed to submit registration')
  })
})
