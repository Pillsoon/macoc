/**
 * Fetch data from Google Sheets and save to JSON files
 * Uses Google Sheets API v4 via google-spreadsheet package
 */

import * as fs from 'fs'
import * as path from 'path'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'

const SHEET_ID = process.env.GOOGLE_SHEET_ID || ''
const SERVICE_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || ''
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY || ''

let doc: GoogleSpreadsheet | null = null

interface SheetConfig {
  name: string
  output: string
  transform: (rows: Record<string, string>[]) => unknown
}

async function getDoc(): Promise<GoogleSpreadsheet | null> {
  if (doc) return doc
  if (!SHEET_ID || !SERVICE_EMAIL || !PRIVATE_KEY) {
    console.log('⚠️  Missing env vars (GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY)')
    return null
  }

  const auth = new JWT({
    email: SERVICE_EMAIL,
    key: PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  })

  doc = new GoogleSpreadsheet(SHEET_ID, auth)
  await doc.loadInfo()
  return doc
}

async function fetchSheet(sheetName: string): Promise<Record<string, string>[]> {
  const d = await getDoc()
  if (!d) {
    console.log(`⚠️  No connection, skipping ${sheetName}`)
    return []
  }

  try {
    const sheet = d.sheetsByTitle[sheetName]
    if (!sheet) {
      console.log(`⚠️  Sheet "${sheetName}" not found`)
      return []
    }

    const rows = await sheet.getRows()
    const headers = sheet.headerValues

    return rows.map(row => {
      const record: Record<string, string> = {}
      headers.forEach(h => {
        record[h] = row.get(h) ?? ''
      })
      return record
    })
  } catch (error) {
    console.error(`❌ Failed to fetch ${sheetName}:`, error)
    return []
  }
}

// Divisions + Sections는 별도 처리 (merge 필요)
async function fetchDivisionsAndSections(contentDir: string) {
  console.log('📄 Processing Divisions + Sections...')

  const divisionRows = await fetchSheet('Divisions')
  const sectionRows = await fetchSheet('Sections')

  if (divisionRows.length === 0) {
    console.log('   ⏭️  No Divisions data, skipping\n')
    return
  }

  // Transform division rows
  const divisions = divisionRows.map(row => ({
    id: row.id || '',
    name: row.name || '',
    icon: row.icon || '',
    description: row.description || '',
    available: row.available === 'TRUE' || row.available === 'true',
    sections: [] as { value: string; label: string }[],
    timePeriods: (row.timePeriods || '').split('|').filter(Boolean).map(pair => {
      const [value, label] = pair.split(':')
      return { value: value?.trim() || '', label: label?.trim() || '' }
    }),
    requirements: (row.requirements || '').split('|').filter(Boolean).map(r => r.trim()),
    feeType: row.feeType || 'solo',
    memorization: row.memorization === 'TRUE' || row.memorization === 'true',
  }))

  // Group sections by divisionId and merge into divisions
  const sectionsByDivision: Record<string, { value: string; label: string }[]> = {}
  sectionRows.forEach(row => {
    const divId = row.divisionId || ''
    if (!divId) return
    if (!sectionsByDivision[divId]) sectionsByDivision[divId] = []
    sectionsByDivision[divId].push({
      value: row.value || '',
      label: row.label || '',
    })
  })

  divisions.forEach(div => {
    if (sectionsByDivision[div.id]) {
      div.sections = sectionsByDivision[div.id]
    }
  })

  const filePath = path.join(contentDir, 'divisions.json')
  fs.writeFileSync(filePath, JSON.stringify(divisions, null, 2))
  console.log('   ✅ Saved divisions.json\n')
}

// Sheet 변환 함수들
const sheets: SheetConfig[] = [
  {
    name: 'Config',
    output: 'config.json',
    transform: (rows) => {
      // Key-Value 형식의 시트
      const config: Record<string, unknown> = {}
      rows.forEach(row => {
        if (row.key && row.value) {
          // 중첩 키 지원 (예: "fees.membership.amount")
          const keys = row.key.split('.')
          let current: Record<string, unknown> = config

          for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
              current[keys[i]] = {}
            }
            current = current[keys[i]] as Record<string, unknown>
          }

          // 숫자 변환
          const value = row.value
          current[keys[keys.length - 1]] = isNaN(Number(value)) ? value : Number(value)
        }
      })
      // divisionContacts: 객체 → 배열 변환
      if (config.divisionContacts && typeof config.divisionContacts === 'object' && !Array.isArray(config.divisionContacts)) {
        const contacts = config.divisionContacts as Record<string, Record<string, string>>
        config.divisionContacts = Object.entries(contacts).map(([division, data]) => ({
          division,
          ...data
        }))
      }

      // socialLinks: 빈 값이면 기본값 보장
      if (!config.socialLinks) {
        config.socialLinks = { facebook: '', instagram: '' }
      }

      return config
    }
  },
  {
    name: 'KeyDates',
    output: 'key-dates.json',
    transform: (rows) => rows.map(row => ({
      date: row.date || '',
      title: row.title || '',
      description: row.description || '',
      type: row.type || 'event', // deadline, event, etc.
      highlight: row.highlight === 'true' || row.highlight === 'TRUE'
    }))
  },
  {
    name: 'FAQs',
    output: 'faqs.json',
    transform: (rows) => rows
      .filter(row => row.question && row.answer)
      .map(row => ({
        question: row.question,
        answer: row.answer
      }))
  },
  {
    name: 'History',
    output: 'history.json',
    transform: (rows) => rows.map(row => ({
      year: row.year || '',
      title: row.title || '',
      description: row.description || ''
    }))
  },
  {
    name: 'Directory',
    output: 'directory.json',
    transform: (rows) => {
      // 카테고리별로 그룹화
      const categories: Record<string, string[]> = {}

      rows.forEach(row => {
        const category = row.category || 'Other'
        const teacher = row.name || row.teacher || ''

        if (teacher) {
          if (!categories[category]) {
            categories[category] = []
          }
          categories[category].push(teacher)
        }
      })

      // 정렬된 형식으로 변환
      const year = rows[0]?.year || new Date().getFullYear().toString()

      return {
        title: "Teachers Membership",
        year: parseInt(year),
        categories: Object.entries(categories).map(([name, teachers]) => ({
          name,
          teachers: teachers.sort()
        }))
      }
    }
  },
  {
    name: 'Winners',
    output: 'winners/',  // 연도별 파일로 저장
    transform: (rows) => {
      // 연도별로 그룹화
      const byYear: Record<string, typeof rows> = {}

      rows.forEach(row => {
        const year = row.year || ''
        if (year) {
          if (!byYear[year]) {
            byYear[year] = []
          }
          byYear[year].push(row)
        }
      })

      // 각 연도를 division > subsection > section 구조로 변환
      const result: Record<string, unknown> = {}

      Object.entries(byYear).forEach(([year, yearRows]) => {
        const divisions: Record<string, {
          icon: string
          subsections?: Record<string, Record<string, { place: string; name: string }[]>>
          sections?: Record<string, { place: string; name: string }[]>
        }> = {}

        yearRows.forEach(row => {
          const divisionName = row.division || ''
          const subsection = row.subsection || ''
          const section = row.section || ''
          const place = row.place || ''
          const name = row.name || ''
          const icon = row.icon || '🎵'

          if (!divisions[divisionName]) {
            divisions[divisionName] = { icon }
          }

          if (subsection) {
            // 서브섹션이 있는 경우
            if (!divisions[divisionName].subsections) {
              divisions[divisionName].subsections = {}
            }
            if (!divisions[divisionName].subsections![subsection]) {
              divisions[divisionName].subsections![subsection] = {}
            }
            if (!divisions[divisionName].subsections![subsection][section]) {
              divisions[divisionName].subsections![subsection][section] = []
            }
            divisions[divisionName].subsections![subsection][section].push({ place, name })
          } else {
            // 서브섹션이 없는 경우
            if (!divisions[divisionName].sections) {
              divisions[divisionName].sections = {}
            }
            if (!divisions[divisionName].sections![section]) {
              divisions[divisionName].sections![section] = []
            }
            divisions[divisionName].sections![section].push({ place, name })
          }
        })

        // 최종 형태로 변환
        result[year] = {
          year: parseInt(year),
          divisions: Object.entries(divisions).map(([name, data]) => {
            const division: {
              name: string
              icon: string
              subsections?: { name: string; sections: { name: string; winners: { place: string; name: string }[] }[] }[]
              sections?: { name: string; winners: { place: string; name: string }[] }[]
            } = {
              name,
              icon: data.icon
            }

            if (data.subsections) {
              division.subsections = Object.entries(data.subsections).map(([subName, sections]) => ({
                name: subName,
                sections: Object.entries(sections).map(([secName, winners]) => ({
                  name: secName,
                  winners
                }))
              }))
            }

            if (data.sections) {
              division.sections = Object.entries(data.sections).map(([secName, winners]) => ({
                name: secName,
                winners
              }))
            }

            return division
          })
        }
      })

      return result
    }
  }
]

async function main() {
  console.log('📥 Fetching data from Google Sheets...\n')

  const contentDir = path.join(process.cwd(), 'src/content')

  // Divisions + Sections (special merge logic)
  await fetchDivisionsAndSections(contentDir)

  for (const sheet of sheets) {
    console.log(`📄 Processing ${sheet.name}...`)

    const rows = await fetchSheet(sheet.name)

    if (rows.length === 0) {
      console.log(`   ⏭️  No data, skipping\n`)
      continue
    }

    const data = sheet.transform(rows)

    // Winners는 특별 처리 (연도별 파일)
    if (sheet.output === 'winners/') {
      const winnersDir = path.join(contentDir, 'winners')
      if (!fs.existsSync(winnersDir)) {
        fs.mkdirSync(winnersDir, { recursive: true })
      }

      const winnersData = data as Record<string, unknown>
      for (const [year, yearData] of Object.entries(winnersData)) {
        const filePath = path.join(winnersDir, `${year}.json`)
        fs.writeFileSync(filePath, JSON.stringify(yearData, null, 2))
        console.log(`   ✅ Saved ${year}.json`)
      }
    } else {
      const filePath = path.join(contentDir, sheet.output)
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
      console.log(`   ✅ Saved ${sheet.output}`)
    }

    console.log('')
  }

  console.log('✨ Done!')
}

main().catch(console.error)
