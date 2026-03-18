import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = 'MACOC <noreply@musicalartsoc.org>'

interface RegistrationRow {
  [key: string]: string
}

function getRecipients(sheetName: string, row: RegistrationRow): string[] {
  const emails: string[] = []

  if (sheetName === 'Teacher Memberships') {
    if (row['Email']) emails.push(row['Email'])
  } else if (sheetName === 'String + Piano Chamber Music' || sheetName === 'Woodwind Ensemble') {
    if (row['Coach Email']) emails.push(row['Coach Email'])
    if (row['Contact Email']) emails.push(row['Contact Email'])
  } else {
    // Solo competition divisions
    if (row['Student Email']) emails.push(row['Student Email'])
    if (row['Teacher Email']) emails.push(row['Teacher Email'])
  }

  return Array.from(new Set(emails.filter(Boolean)))
}

function getStudentName(sheetName: string, row: RegistrationRow): string {
  if (sheetName === 'Teacher Memberships') {
    return [row['First Name'], row['Last Name']].filter(Boolean).join(' ')
  }
  if (sheetName === 'String + Piano Chamber Music' || sheetName === 'Woodwind Ensemble') {
    return row['Member 1 Name'] || 'Group'
  }
  const middle = row['Student Middle Name'] ? ` ${row['Student Middle Name']}` : ''
  return `${row['Student First Name'] || ''}${middle} ${row['Student Last Name'] || ''}`.trim()
}

function buildConfirmationHtml(sheetName: string, row: RegistrationRow): string {
  const name = getStudentName(sheetName, row)
  const isTeacher = sheetName === 'Teacher Memberships'
  const isChamber = sheetName === 'String + Piano Chamber Music' || sheetName === 'Woodwind Ensemble'

  let details = ''

  if (isTeacher) {
    details = `
      <tr><td style="padding:8px 12px;color:#666">Name</td><td style="padding:8px 12px">${name}</td></tr>
      ${row['Selected Products'] ? `<tr><td style="padding:8px 12px;color:#666">Membership</td><td style="padding:8px 12px">${row['Selected Products']}</td></tr>` : ''}
      ${row['Total Amount'] ? `<tr><td style="padding:8px 12px;color:#666">Amount</td><td style="padding:8px 12px">$${row['Total Amount']}</td></tr>` : ''}
    `
  } else if (isChamber) {
    const members: string[] = []
    for (let i = 1; i <= 6; i++) {
      const memberName = row[`Member ${i} Name`]
      if (memberName) members.push(memberName)
    }
    details = `
      <tr><td style="padding:8px 12px;color:#666">Division</td><td style="padding:8px 12px">${sheetName}</td></tr>
      ${row['Section'] ? `<tr><td style="padding:8px 12px;color:#666">Section</td><td style="padding:8px 12px">${row['Section']}</td></tr>` : ''}
      <tr><td style="padding:8px 12px;color:#666">Members</td><td style="padding:8px 12px">${members.join(', ')}</td></tr>
      ${row['Piece Title'] ? `<tr><td style="padding:8px 12px;color:#666">Piece</td><td style="padding:8px 12px">${row['Composer'] || ''} - ${row['Piece Title']}</td></tr>` : ''}
    `
  } else {
    // Solo competition
    details = `
      <tr><td style="padding:8px 12px;color:#666">Student</td><td style="padding:8px 12px">${name}</td></tr>
      <tr><td style="padding:8px 12px;color:#666">Division</td><td style="padding:8px 12px">${row['Division'] || sheetName}</td></tr>
      ${row['Section'] ? `<tr><td style="padding:8px 12px;color:#666">Section</td><td style="padding:8px 12px">${row['Section']}</td></tr>` : ''}
      ${row['Instrument'] ? `<tr><td style="padding:8px 12px;color:#666">Instrument</td><td style="padding:8px 12px">${row['Instrument']}</td></tr>` : ''}
      ${row['Repertoire 1 Title'] ? `<tr><td style="padding:8px 12px;color:#666">Repertoire 1</td><td style="padding:8px 12px">${row['Repertoire 1 Composer'] || ''} - ${row['Repertoire 1 Title']}</td></tr>` : ''}
      ${row['Repertoire 2 Title'] ? `<tr><td style="padding:8px 12px;color:#666">Repertoire 2</td><td style="padding:8px 12px">${row['Repertoire 2 Composer'] || ''} - ${row['Repertoire 2 Title']}</td></tr>` : ''}
    `
  }

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#1a365d;color:white;padding:24px;text-align:center">
        <h1 style="margin:0;font-size:22px">Registration Confirmed</h1>
        <p style="margin:8px 0 0;opacity:0.9">Musical Arts Society of Orange County</p>
      </div>
      <div style="padding:24px;background:#f9fafb">
        <p>Thank you${name ? `, <strong>${name}</strong>` : ''}! Your payment has been received and your registration is confirmed.</p>
        <table style="width:100%;border-collapse:collapse;background:white;border-radius:8px;overflow:hidden;margin:16px 0">
          ${details}
          <tr><td style="padding:8px 12px;color:#666">Payment Date</td><td style="padding:8px 12px">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
        </table>
        <p style="color:#666;font-size:14px">If you have any questions, please contact us at <a href="mailto:info@musicalartsoc.org">info@musicalartsoc.org</a>.</p>
      </div>
      <div style="padding:16px;text-align:center;color:#999;font-size:12px">
        &copy; ${new Date().getFullYear()} Musical Arts Society of Orange County
      </div>
    </div>
  `
}

export async function sendConfirmationEmail(sheetName: string, row: RegistrationRow): Promise<void> {
  const recipients = getRecipients(sheetName, row)
  if (recipients.length === 0) {
    console.error('No email recipients found for sheet:', sheetName)
    return
  }

  const isTeacher = sheetName === 'Teacher Memberships'
  const subject = isTeacher
    ? 'MACOC Teacher Membership - Payment Confirmed'
    : 'MACOC Registration - Payment Confirmed'

  const html = buildConfirmationHtml(sheetName, row)

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: recipients,
    subject,
    html,
  })

  if (error) {
    console.error('Failed to send confirmation email:', error)
    throw error
  }
}
