/**
 * One-off script: rename "Woodwinds" → "Woodwind" and "Woodwinds Ensemble" → "Woodwind Ensemble"
 * in Google Sheets (Divisions sheet + Winners sheet) to match the corrected naming.
 */

import * as fs from 'fs'
import * as path from 'path'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'

const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath) && !process.env.GOOGLE_SHEET_ID) {
  const content = fs.readFileSync(envPath, 'utf-8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx)
    let val = trimmed.slice(eqIdx + 1)
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = val
  }
}

async function main() {
  const auth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, auth)
  await doc.loadInfo()
  console.log(`Connected to: ${doc.title}`)

  // 1. Update Divisions sheet
  const divisionsSheet = doc.sheetsByTitle['Divisions']
  if (divisionsSheet) {
    const rows = await divisionsSheet.getRows()
    let updated = 0
    for (const row of rows) {
      const name = row.get('name')
      if (name === 'Woodwinds') {
        row.set('name', 'Woodwind')
        await row.save()
        console.log(`✅ Divisions: "Woodwinds" → "Woodwind"`)
        updated++
      } else if (name === 'Woodwinds Ensemble') {
        row.set('name', 'Woodwind Ensemble')
        await row.save()
        console.log(`✅ Divisions: "Woodwinds Ensemble" → "Woodwind Ensemble"`)
        updated++
      }
    }
    console.log(`   Updated ${updated} rows in Divisions sheet\n`)
  } else {
    console.log('⚠️  Divisions sheet not found\n')
  }

  // 2. Update Winners sheet (with rate limit handling)
  const winnersSheet = doc.sheetsByTitle['Winners']
  if (winnersSheet) {
    const rows = await winnersSheet.getRows()
    let updated = 0
    for (const row of rows) {
      const division = row.get('division')
      if (division === 'Woodwinds Division') {
        row.set('division', 'Woodwind Division')
        // Add delay to avoid rate limiting (max ~60 writes/min)
        await new Promise(r => setTimeout(r, 1500))
        try {
          await row.save()
        } catch (e: unknown) {
          if (e && typeof e === 'object' && 'response' in e) {
            const resp = (e as { response: { status: number } }).response
            if (resp.status === 429) {
              console.log('   ⏳ Rate limited, waiting 60s...')
              await new Promise(r => setTimeout(r, 60000))
              await row.save()
            } else { throw e }
          } else { throw e }
        }
        updated++
        if (updated % 10 === 0) console.log(`   ... updated ${updated} rows`)
      }
    }
    console.log(`✅ Winners: updated ${updated} rows ("Woodwinds Division" → "Woodwind Division")\n`)
  } else {
    console.log('⚠️  Winners sheet not found\n')
  }

  console.log('✨ Done!')
}

main().catch(console.error)
