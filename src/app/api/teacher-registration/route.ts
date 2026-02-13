import { NextRequest, NextResponse } from 'next/server'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'

interface TeacherRegistrationData {
  firstName: string
  middleName?: string
  lastName: string
  streetAddress: string
  streetAddress2?: string
  city: string
  state: string
  zipCode: string
  email: string
  mobileNumber: string
  phoneNumber?: string
  instrument: string
  stringInstrument: string
  helpPreference: string
  subDivisions: string[]
  membershipTier: string
  nonAvailableFee: boolean
  totalAmount: number
}

export async function POST(request: NextRequest) {
  try {
    const data: TeacherRegistrationData = await request.json()

    const requiredFields = [
      'firstName',
      'lastName',
      'streetAddress',
      'city',
      'state',
      'zipCode',
      'email',
      'mobileNumber',
      'instrument',
      'stringInstrument',
      'helpPreference',
      'membershipTier',
    ]

    for (const field of requiredFields) {
      if (!data[field as keyof TeacherRegistrationData]) {
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

    let sheet = doc.sheetsByTitle['Teacher Memberships']
    if (!sheet) {
      sheet = await doc.addSheet({
        title: 'Teacher Memberships',
        headerValues: [
          'Timestamp',
          'Payment Status',
          'First Name',
          'Middle Name',
          'Last Name',
          'Street Address',
          'Street Address 2',
          'City',
          'State',
          'Zip Code',
          'Email',
          'Mobile Number',
          'Phone Number',
          'Instrument',
          'String Instrument',
          'Help Preference',
          'Sub Divisions',
          'Membership Tier',
          'Non-Available Fee',
          'Total Amount',
        ],
      })
    }

    const newRow = await sheet.addRow({
      'Timestamp': new Date().toISOString(),
      'Payment Status': 'Pending',
      'First Name': data.firstName,
      'Middle Name': data.middleName || '',
      'Last Name': data.lastName,
      'Street Address': data.streetAddress,
      'Street Address 2': data.streetAddress2 || '',
      'City': data.city,
      'State': data.state,
      'Zip Code': data.zipCode,
      'Email': data.email,
      'Mobile Number': data.mobileNumber,
      'Phone Number': data.phoneNumber || '',
      'Instrument': data.instrument,
      'String Instrument': data.stringInstrument,
      'Help Preference': data.helpPreference,
      'Sub Divisions': (data.subDivisions || []).join(', '),
      'Membership Tier': data.membershipTier,
      'Non-Available Fee': data.nonAvailableFee ? 'Yes' : 'No',
      'Total Amount': String(data.totalAmount),
    })

    return NextResponse.json({
      success: true,
      registrationId: newRow.rowNumber,
      message: 'Teacher membership submitted successfully',
    })
  } catch (error) {
    console.error('Teacher registration error:', error)
    return NextResponse.json(
      { error: 'Failed to submit registration' },
      { status: 500 }
    )
  }
}
