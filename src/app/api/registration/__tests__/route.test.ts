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
        Registrations: {
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

// Set env vars before importing route
process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'test@test.iam.gserviceaccount.com'
process.env.GOOGLE_PRIVATE_KEY = 'test-key'
process.env.GOOGLE_REGISTRATION_SHEET_ID = 'test-sheet-id'

import { POST } from '../route'

function makeValidData() {
  return {
    teacherFirstName: 'Jane',
    teacherLastName: 'Doe',
    teacherEmail: 'jane@example.com',
    teacherPhone: '555-0100',
    studentFirstName: 'John',
    studentLastName: 'Doe',
    studentEmail: 'john@example.com',
    dateOfBirth: '2015-01-01',
    studentAge: '10',
    proofOfAgeUrl: 'https://res.cloudinary.com/test/image.jpg',
    streetAddress: '123 Main St',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90001',
    division: 'piano',
    section: 'section-4',
    repertoire1Title: 'Sonata No. 1',
    repertoire1Composer: 'Mozart',
    repertoire1TimePeriod: 'classical',
    repertoire2Title: 'Prelude No. 1',
    repertoire2Composer: 'Bach',
    repertoire2TimePeriod: 'baroque',
  }
}

function createRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/registration', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/registration', () => {
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
    expect(json).not.toHaveProperty('paymentUrl')
  })

  it('returns 400 when a required field is missing', async () => {
    const data = makeValidData()
    delete (data as Record<string, unknown>).teacherFirstName

    const res = await POST(createRequest(data))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toContain('teacherFirstName')
  })

  it('returns 400 when required field is empty string', async () => {
    const data = { ...makeValidData(), studentEmail: '' }

    const res = await POST(createRequest(data))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toContain('studentEmail')
  })

  it('returns 500 when Google Sheets fails', async () => {
    mockLoadInfo.mockRejectedValueOnce(new Error('Sheets API error'))

    const res = await POST(createRequest(makeValidData()))
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json.error).toBe('Failed to submit registration')
  })
})
