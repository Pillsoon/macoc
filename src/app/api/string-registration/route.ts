import { NextRequest, NextResponse } from 'next/server'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'

interface StringRegistrationData {
  // Student
  studentFirstName: string
  studentMiddleName?: string
  studentLastName: string
  instrument: string
  section: string
  studentAge: string
  dateOfBirth: string
  proofOfAgeUrl: string
  composer: string
  pieceTitle: string
  duration: string
  // Pianist
  pianistName: string
  pianistPhone: string
  pianistEmail: string
  // Teacher
  teacherName: string
  teacherPhone: string
  teacherEmail: string
  // Parent
  parentName: string
  parentPhone: string
  parentEmail: string
  parentStreetAddress: string
  parentStreetAddress2?: string
  parentCity: string
  parentState: string
  parentZipCode: string
  // Cross-division
  crossDivision: string
  crossDivisionDetails?: string
  // Division
  division: string
}

export async function POST(request: NextRequest) {
  try {
    const data: StringRegistrationData = await request.json()

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
      if (!data[field as keyof StringRegistrationData]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
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

    const sheetTitle = data.division
    let sheet = doc.sheetsByTitle[sheetTitle]
    if (!sheet) {
      sheet = await doc.addSheet({
        title: sheetTitle,
        headerValues: [
          'Timestamp',
          'Payment Status',
          'Student First Name',
          'Student Middle Name',
          'Student Last Name',
          'Instrument',
          'Section',
          'Age',
          'Date of Birth',
          'Proof of Age URL',
          'Composer',
          'Piece Title',
          'Duration',
          'Pianist Name',
          'Pianist Phone',
          'Pianist Email',
          'Teacher Name',
          'Teacher Phone',
          'Teacher Email',
          'Parent Name',
          'Parent Phone',
          'Parent Email',
          'Parent Street Address',
          'Parent Street Address 2',
          'Parent City',
          'Parent State',
          'Parent Zip Code',
          'Cross-Division',
          'Cross-Division Details',
        ]
      })
    }

    const newRow = await sheet.addRow({
      'Timestamp': new Date().toISOString(),
      'Payment Status': 'Pending',
      'Student First Name': data.studentFirstName,
      'Student Middle Name': data.studentMiddleName || '',
      'Student Last Name': data.studentLastName,
      'Instrument': data.instrument,
      'Section': data.section,
      'Age': data.studentAge,
      'Date of Birth': data.dateOfBirth,
      'Proof of Age URL': data.proofOfAgeUrl,
      'Composer': data.composer,
      'Piece Title': data.pieceTitle,
      'Duration': data.duration,
      'Pianist Name': data.pianistName,
      'Pianist Phone': data.pianistPhone,
      'Pianist Email': data.pianistEmail,
      'Teacher Name': data.teacherName,
      'Teacher Phone': data.teacherPhone,
      'Teacher Email': data.teacherEmail,
      'Parent Name': data.parentName,
      'Parent Phone': data.parentPhone,
      'Parent Email': data.parentEmail,
      'Parent Street Address': data.parentStreetAddress,
      'Parent Street Address 2': data.parentStreetAddress2 || '',
      'Parent City': data.parentCity,
      'Parent State': data.parentState,
      'Parent Zip Code': data.parentZipCode,
      'Cross-Division': data.crossDivision,
      'Cross-Division Details': data.crossDivisionDetails || '',
    })

    return NextResponse.json({
      success: true,
      registrationId: newRow.rowNumber,
      sheetName: sheetTitle,
      message: 'Registration submitted successfully',
    })
  } catch (error) {
    console.error('String registration error:', error)
    return NextResponse.json(
      { error: 'Failed to submit registration' },
      { status: 500 }
    )
  }
}
