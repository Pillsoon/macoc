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
        'String Solo': {
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

function makeValidData(overrides: Record<string, unknown> = {}) {
  return {
    studentFirstName: 'John',
    studentMiddleName: '',
    studentLastName: 'Kim',
    instrument: 'Violin',
    section: 'Division I: Age 7 and under',
    studentAge: '7',
    dateOfBirth: '2019-01-15',
    proofOfAgeUrl: 'https://res.cloudinary.com/test/image.jpg',
    composer: 'Suzuki',
    pieceTitle: 'Twinkle Twinkle Little Star',
    duration: '3',
    pianistName: 'Sarah Lee',
    pianistPhone: '555-0100',
    pianistEmail: 'sarah@example.com',
    teacherName: 'Dr. Park',
    teacherPhone: '555-0200',
    teacherEmail: 'park@example.com',
    parentName: 'Min Kim',
    parentPhone: '555-0300',
    parentEmail: 'min@example.com',
    parentStreetAddress: '123 Main St',
    parentCity: 'Irvine',
    parentState: 'CA',
    parentZipCode: '92618',
    crossDivision: 'No',
    crossDivisionDetails: '',
    division: 'String Solo',
    ...overrides,
  }
}

function createRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/string-registration', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/string-registration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAddRow.mockResolvedValue({ rowNumber: 3 })
  })

  // --- Success ---

  it('returns 200 with registrationId on valid data', async () => {
    const res = await POST(createRequest(makeValidData()))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.registrationId).toBe(3)
    expect(json.sheetName).toBe('String Solo')
  })

  it('writes all fields to Google Sheets row', async () => {
    await POST(createRequest(makeValidData({
      studentMiddleName: 'James',
      crossDivisionDetails: 'Piano V',
    })))

    expect(mockAddRow).toHaveBeenCalledOnce()
    const rowData = mockAddRow.mock.calls[0][0]
    expect(rowData['Student First Name']).toBe('John')
    expect(rowData['Student Middle Name']).toBe('James')
    expect(rowData['Student Last Name']).toBe('Kim')
    expect(rowData['Instrument']).toBe('Violin')
    expect(rowData['Composer']).toBe('Suzuki')
    expect(rowData['Piece Title']).toBe('Twinkle Twinkle Little Star')
    expect(rowData['Duration']).toBe('3')
    expect(rowData['Proof of Age URL']).toBe('https://res.cloudinary.com/test/image.jpg')
    expect(rowData['Cross-Division']).toBe('No')
    expect(rowData['Cross-Division Details']).toBe('Piano V')
    expect(rowData['Payment Status']).toBe('Pending')
  })

  it('handles empty optional fields gracefully', async () => {
    await POST(createRequest(makeValidData({
      studentMiddleName: '',
      parentStreetAddress2: '',
      crossDivisionDetails: '',
    })))

    const rowData = mockAddRow.mock.calls[0][0]
    expect(rowData['Student Middle Name']).toBe('')
    expect(rowData['Parent Street Address 2']).toBe('')
    expect(rowData['Cross-Division Details']).toBe('')
  })

  // --- Required field validation ---

  const requiredFields = [
    'studentFirstName', 'studentLastName', 'instrument', 'section',
    'studentAge', 'dateOfBirth', 'composer', 'pieceTitle', 'duration',
    'pianistName', 'pianistPhone', 'pianistEmail',
    'teacherName', 'teacherPhone', 'teacherEmail',
    'parentName', 'parentPhone', 'parentEmail',
    'parentStreetAddress', 'parentCity', 'parentState', 'parentZipCode',
    'crossDivision', 'division',
  ]

  for (const field of requiredFields) {
    it(`returns 400 when ${field} is missing`, async () => {
      const data = makeValidData({ [field]: '' })
      const res = await POST(createRequest(data))
      const json = await res.json()

      expect(res.status).toBe(400)
      expect(json.error).toContain(field)
    })
  }

  // --- Sheet creation ---

  it('creates a new sheet when division sheet does not exist', async () => {
    const { GoogleSpreadsheet } = await import('google-spreadsheet')
    mockAddSheet.mockResolvedValue({ addRow: mockAddRow })
    vi.mocked(GoogleSpreadsheet).mockImplementationOnce(function () {
      return {
        loadInfo: mockLoadInfo,
        sheetsByTitle: {},
        addSheet: mockAddSheet,
      } as never
    })

    const res = await POST(createRequest(makeValidData()))
    expect(res.status).toBe(200)
    expect(mockAddSheet).toHaveBeenCalledOnce()

    const sheetConfig = mockAddSheet.mock.calls[0][0]
    expect(sheetConfig.title).toBe('String Solo')
    expect(sheetConfig.headerValues).toContain('Proof of Age URL')
    expect(sheetConfig.headerValues).toContain('Cross-Division Details')
  })

  // --- Error handling ---

  it('returns 500 when Google Sheets fails', async () => {
    mockLoadInfo.mockRejectedValueOnce(new Error('Sheets API error'))

    const res = await POST(createRequest(makeValidData()))
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json.error).toBe('Failed to submit registration')
  })
})
