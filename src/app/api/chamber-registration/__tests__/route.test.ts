import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockAddRow = vi.fn()
const mockAddSheet = vi.fn()
const mockLoadInfo = vi.fn()
const mockLoadHeaderRow = vi.fn()

vi.mock('google-spreadsheet', () => ({
  GoogleSpreadsheet: vi.fn().mockImplementation(function () {
    return {
      loadInfo: mockLoadInfo,
      sheetsByTitle: {
        'String + Piano Chamber Music': {
          addRow: mockAddRow,
          loadHeaderRow: mockLoadHeaderRow.mockResolvedValue(undefined),
          headerValues: ['Timestamp', 'Payment Status'],
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

function makeMember(overrides: Partial<{ name: string; instrument: string; age: string; proofOfAgeUrl: string }> = {}) {
  return {
    name: 'Alice',
    instrument: 'Violin',
    age: '12',
    proofOfAgeUrl: 'https://res.cloudinary.com/test/image.jpg',
    ...overrides,
  }
}

function makeValidData(overrides: Record<string, unknown> = {}) {
  return {
    section: 'Section I: Age 10 and under',
    instrumentation: 'String trio',
    composer: 'Mozart',
    pieceTitle: 'Divertimento',
    noKeyMovement: 'No 1 in D Major 1st Movement',
    duration: '8',
    members: [makeMember({ name: 'Alice' }), makeMember({ name: 'Bob' }), makeMember({ name: 'Charlie' })],
    coachName: 'Dr. Smith',
    coachPhone: '555-0100',
    coachEmail: 'smith@example.com',
    contactName: 'Jane Doe',
    contactPhone: '555-0200',
    contactEmail: 'jane@example.com',
    division: 'String + Piano Chamber Music',
    ...overrides,
  }
}

function createRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/chamber-registration', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/chamber-registration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAddRow.mockResolvedValue({ rowNumber: 5 })
  })

  // --- Success ---

  it('returns 200 with registrationId on valid data', async () => {
    const res = await POST(createRequest(makeValidData()))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.registrationId).toBe(5)
    expect(json.sheetName).toBe('String + Piano Chamber Music')
  })

  it('writes noKeyMovement to Google Sheets row', async () => {
    await POST(createRequest(makeValidData()))

    expect(mockAddRow).toHaveBeenCalledOnce()
    const rowData = mockAddRow.mock.calls[0][0]
    expect(rowData['No Key Movement']).toBe('No 1 in D Major 1st Movement')
  })

  it('writes all member data to Google Sheets row', async () => {
    const data = makeValidData({
      members: [
        makeMember({ name: 'Alice', instrument: 'Violin', age: '10' }),
        makeMember({ name: 'Bob', instrument: 'Cello', age: '11' }),
        makeMember({ name: 'Charlie', instrument: 'Viola', age: '12' }),
      ],
    })
    await POST(createRequest(data))

    const rowData = mockAddRow.mock.calls[0][0]
    expect(rowData['Member1 Name']).toBe('Alice')
    expect(rowData['Member2 Instrument']).toBe('Cello')
    expect(rowData['Member3 Age']).toBe('12')
    // Unfilled member slots should be empty
    expect(rowData['Member4 Name']).toBe('')
    expect(rowData['Member5 Name']).toBe('')
    expect(rowData['Member6 Name']).toBe('')
  })

  it('sets Payment Status to Pending', async () => {
    await POST(createRequest(makeValidData()))
    const rowData = mockAddRow.mock.calls[0][0]
    expect(rowData['Payment Status']).toBe('Pending')
  })

  // --- Required field validation ---

  const requiredFields = [
    'section', 'instrumentation', 'composer', 'pieceTitle', 'noKeyMovement', 'duration',
    'coachName', 'coachPhone', 'coachEmail',
    'contactName', 'contactPhone', 'contactEmail',
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

  // --- Member validation ---

  it('returns 400 when members array is missing', async () => {
    const data = makeValidData()
    delete (data as Record<string, unknown>).members
    const res = await POST(createRequest(data))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toContain('2 to 6')
  })

  it('returns 400 when fewer than 2 members', async () => {
    const data = makeValidData({ members: [makeMember()] })
    const res = await POST(createRequest(data))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toContain('2 to 6')
  })

  it('returns 400 when more than 6 members', async () => {
    const data = makeValidData({
      members: Array.from({ length: 7 }, () => makeMember()),
    })
    const res = await POST(createRequest(data))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toContain('2 to 6')
  })

  it('accepts exactly 2 members (minimum)', async () => {
    const data = makeValidData({
      members: [makeMember({ name: 'Alice' }), makeMember({ name: 'Bob' })],
    })
    const res = await POST(createRequest(data))
    expect(res.status).toBe(200)
  })

  it('accepts exactly 6 members (maximum)', async () => {
    const data = makeValidData({
      members: Array.from({ length: 6 }, (_, i) => makeMember({ name: `Member${i + 1}` })),
    })
    const res = await POST(createRequest(data))
    expect(res.status).toBe(200)
  })

  it('returns 400 when a member is missing name', async () => {
    const data = makeValidData({
      members: [makeMember(), makeMember({ name: '' })],
    })
    const res = await POST(createRequest(data))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toContain('Member 2')
  })

  it('returns 400 when a member is missing proofOfAgeUrl', async () => {
    const data = makeValidData({
      members: [makeMember(), makeMember({ proofOfAgeUrl: '' })],
    })
    const res = await POST(createRequest(data))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toContain('Member 2')
  })

  it('returns 400 when a member is missing instrument', async () => {
    const data = makeValidData({
      members: [makeMember({ instrument: '' }), makeMember()],
    })
    const res = await POST(createRequest(data))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toContain('Member 1')
  })

  it('returns 400 when a member is missing age', async () => {
    const data = makeValidData({
      members: [makeMember(), makeMember({ age: '' })],
    })
    const res = await POST(createRequest(data))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toContain('Member 2')
  })

  // --- Sheet creation fallback ---

  it('creates a new sheet when it does not exist', async () => {
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
    expect(sheetConfig.title).toBe('String + Piano Chamber Music')
    expect(sheetConfig.headerValues).toContain('No Key Movement')
    expect(sheetConfig.headerValues).toContain('Member1 Name')
    expect(sheetConfig.headerValues).toContain('Member6 ProofOfAge')
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
