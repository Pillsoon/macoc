/**
 * Fetch data from Google Sheets and save to JSON files
 *
 * Google Sheets must be published to web as CSV
 * URL format: https://docs.google.com/spreadsheets/d/{SHEET_ID}/gviz/tq?tqx=out:csv&sheet={SHEET_NAME}
 */

import * as fs from 'fs'
import * as path from 'path'

const SHEET_ID = process.env.GOOGLE_SHEET_ID || ''

interface SheetConfig {
  name: string
  output: string
  transform: (rows: Record<string, string>[]) => unknown
}

// CSV 파싱 함수
function parseCSV(csv: string): Record<string, string>[] {
  const lines = csv.split('\n').filter(line => line.trim())
  if (lines.length === 0) return []

  // 첫 줄은 헤더
  const headers = parseCSVLine(lines[0])

  return lines.slice(1).map(line => {
    const values = parseCSVLine(line)
    const row: Record<string, string> = {}
    headers.forEach((header, i) => {
      row[header.trim()] = values[i]?.trim() || ''
    })
    return row
  })
}

// CSV 라인 파싱 (따옴표 처리)
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  result.push(current)

  return result.map(s => s.replace(/^"|"$/g, ''))
}

// Google Sheet에서 CSV 가져오기
async function fetchSheet(sheetName: string): Promise<Record<string, string>[]> {
  if (!SHEET_ID) {
    console.log(`⚠️  GOOGLE_SHEET_ID not set, skipping ${sheetName}`)
    return []
  }

  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    const csv = await response.text()
    return parseCSV(csv)
  } catch (error) {
    console.error(`❌ Failed to fetch ${sheetName}:`, error)
    return []
  }
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
    name: 'Divisions',
    output: 'divisions.json',
    transform: (rows) => rows.map(row => ({
      name: row.name || '',
      icon: row.icon || '',
      description: row.description || '',
      sections: row.sections || '',
      chairName: row.chairName || '',
      chairEmail: row.chairEmail || ''
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
