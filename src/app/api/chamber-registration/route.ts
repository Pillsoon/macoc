import { NextRequest, NextResponse } from 'next/server'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'

interface MemberData {
  name: string
  instrument: string
  age: string
  proofOfAgeUrl: string
}

interface ChamberRegistrationData {
  section: string
  instrumentation: string
  composer: string
  pieceTitle: string
  noKeyMovement: string
  duration: string
  members: MemberData[]
  coachName: string
  coachPhone: string
  coachEmail: string
  contactName: string
  contactPhone: string
  contactEmail: string
  division: string
}

export async function POST(request: NextRequest) {
  try {
    const data: ChamberRegistrationData = await request.json()

    const requiredFields = [
      'section', 'instrumentation', 'composer', 'pieceTitle', 'noKeyMovement', 'duration',
      'coachName', 'coachPhone', 'coachEmail',
      'contactName', 'contactPhone', 'contactEmail',
    ]

    for (const field of requiredFields) {
      if (!data[field as keyof ChamberRegistrationData]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    if (!data.members || data.members.length < 2 || data.members.length > 6) {
      return NextResponse.json(
        { error: 'Group must have 2 to 6 members' },
        { status: 400 }
      )
    }

    // Validate each member has required fields
    for (let i = 0; i < data.members.length; i++) {
      const m = data.members[i]
      if (!m.name || !m.instrument || !m.age || !m.proofOfAgeUrl) {
        return NextResponse.json(
          { error: `Member ${i + 1} is missing required fields` },
          { status: 400 }
        )
      }
    }

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

    const sheetTitle = 'String + Piano Chamber Music'
    const memberHeaders: string[] = []
    for (let i = 1; i <= 6; i++) {
      memberHeaders.push(
        `Member${i} Name`, `Member${i} Instrument`, `Member${i} Age`, `Member${i} ProofOfAge`
      )
    }

    let sheet = doc.sheetsByTitle[sheetTitle]
    if (!sheet) {
      sheet = await doc.addSheet({
        title: sheetTitle,
        headerValues: [
          'Timestamp',
          'Payment Status',
          'Section',
          'Instrumentation',
          'Composer',
          'Piece Title',
          'No Key Movement',
          'Duration',
          ...memberHeaders,
          'Coach Name',
          'Coach Phone',
          'Coach Email',
          'Contact Name',
          'Contact Phone',
          'Contact Email',
        ]
      })
    }

    const rowData: Record<string, string> = {
      'Timestamp': new Date().toISOString(),
      'Payment Status': 'Pending',
      'Section': data.section,
      'Instrumentation': data.instrumentation,
      'Composer': data.composer,
      'Piece Title': data.pieceTitle,
      'No Key Movement': data.noKeyMovement,
      'Duration': data.duration,
      'Coach Name': data.coachName,
      'Coach Phone': data.coachPhone,
      'Coach Email': data.coachEmail,
      'Contact Name': data.contactName,
      'Contact Phone': data.contactPhone,
      'Contact Email': data.contactEmail,
    }

    // Fill member columns (1-6)
    for (let i = 0; i < 6; i++) {
      const m = data.members[i]
      rowData[`Member${i + 1} Name`] = m?.name || ''
      rowData[`Member${i + 1} Instrument`] = m?.instrument || ''
      rowData[`Member${i + 1} Age`] = m?.age || ''
      rowData[`Member${i + 1} ProofOfAge`] = m?.proofOfAgeUrl || ''
    }

    const newRow = await sheet.addRow(rowData)

    return NextResponse.json({
      success: true,
      registrationId: newRow.rowNumber,
      sheetName: sheetTitle,
      message: 'Chamber registration submitted successfully',
    })
  } catch (error) {
    console.error('Chamber registration error:', error)
    return NextResponse.json(
      { error: 'Failed to submit registration' },
      { status: 500 }
    )
  }
}
