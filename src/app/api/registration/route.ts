import { NextRequest, NextResponse } from 'next/server'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'

// Types
interface RegistrationData {
  // Teacher info
  teacherFirstName: string
  teacherLastName: string
  teacherEmail: string
  teacherPhone: string

  // Student info
  studentFirstName: string
  studentMiddleName?: string
  studentLastName: string
  studentEmail: string
  dateOfBirth: string
  studentAge: string
  proofOfAgeUrl: string // Cloudinary URL

  // Address
  streetAddress: string
  streetAddress2?: string
  city: string
  state: string
  zipCode: string

  // Competition info
  division: string
  section: string

  // Repertoire
  repertoire1Title: string
  repertoire1Composer: string
  repertoire1TimePeriod: string
  repertoire2Title: string
  repertoire2Composer: string
  repertoire2TimePeriod: string
}

export async function POST(request: NextRequest) {
  try {
    const data: RegistrationData = await request.json()

    // Validate required fields
    const requiredFields = [
      'teacherFirstName', 'teacherLastName', 'teacherEmail', 'teacherPhone',
      'studentFirstName', 'studentLastName', 'studentEmail', 'dateOfBirth',
      'studentAge', 'division', 'section',
      'repertoire1Title', 'repertoire1Composer', 'repertoire1TimePeriod',
      'repertoire2Title', 'repertoire2Composer', 'repertoire2TimePeriod'
    ]

    for (const field of requiredFields) {
      if (!data[field as keyof RegistrationData]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Initialize Google Sheets
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

    // Get or create the registrations sheet
    let sheet = doc.sheetsByTitle['Registrations']
    if (!sheet) {
      sheet = await doc.addSheet({
        title: 'Registrations',
        headerValues: [
          'Timestamp',
          'Payment Status',
          'Teacher First Name',
          'Teacher Last Name',
          'Teacher Email',
          'Teacher Phone',
          'Student First Name',
          'Student Middle Name',
          'Student Last Name',
          'Student Email',
          'Date of Birth',
          'Student Age',
          'Proof of Age URL',
          'Street Address',
          'Street Address 2',
          'City',
          'State',
          'Zip Code',
          'Division',
          'Section',
          'Repertoire 1 Title',
          'Repertoire 1 Composer',
          'Repertoire 1 Time Period',
          'Repertoire 2 Title',
          'Repertoire 2 Composer',
          'Repertoire 2 Time Period',
        ]
      })
    }

    // Add new row
    const newRow = await sheet.addRow({
      'Timestamp': new Date().toISOString(),
      'Payment Status': 'Pending',
      'Teacher First Name': data.teacherFirstName,
      'Teacher Last Name': data.teacherLastName,
      'Teacher Email': data.teacherEmail,
      'Teacher Phone': data.teacherPhone,
      'Student First Name': data.studentFirstName,
      'Student Middle Name': data.studentMiddleName || '',
      'Student Last Name': data.studentLastName,
      'Student Email': data.studentEmail,
      'Date of Birth': data.dateOfBirth,
      'Student Age': data.studentAge,
      'Proof of Age URL': data.proofOfAgeUrl,
      'Street Address': data.streetAddress,
      'Street Address 2': data.streetAddress2 || '',
      'City': data.city,
      'State': data.state,
      'Zip Code': data.zipCode,
      'Division': data.division,
      'Section': data.section,
      'Repertoire 1 Title': data.repertoire1Title,
      'Repertoire 1 Composer': data.repertoire1Composer,
      'Repertoire 1 Time Period': data.repertoire1TimePeriod,
      'Repertoire 2 Title': data.repertoire2Title,
      'Repertoire 2 Composer': data.repertoire2Composer,
      'Repertoire 2 Time Period': data.repertoire2TimePeriod,
    })

    // Return success with row number for payment tracking
    return NextResponse.json({
      success: true,
      registrationId: newRow.rowNumber,
      message: 'Registration submitted successfully',
      paymentUrl: `${process.env.STRIPE_PAYMENT_LINK}?client_reference_id=${newRow.rowNumber}&prefilled_email=${encodeURIComponent(data.studentEmail)}`
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to submit registration' },
      { status: 500 }
    )
  }
}
