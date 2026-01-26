/**
 * Export existing JSON data to CSV format for Google Sheets import
 */

import * as fs from 'fs'
import * as path from 'path'

const contentDir = path.join(process.cwd(), 'src/content')
const outputDir = path.join(process.cwd(), 'exports')

// CSV 변환 함수
function toCSV(headers: string[], rows: string[][]): string {
  const escape = (val: string) => {
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return `"${val.replace(/"/g, '""')}"`
    }
    return val
  }

  const lines = [
    headers.map(escape).join(','),
    ...rows.map(row => row.map(escape).join(','))
  ]

  return lines.join('\n')
}

// Config 내보내기
function exportConfig() {
  const config = JSON.parse(fs.readFileSync(path.join(contentDir, 'config.json'), 'utf-8'))

  const rows: string[][] = []

  function flatten(obj: Record<string, unknown>, prefix = '') {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        flatten(value as Record<string, unknown>, fullKey)
      } else if (!Array.isArray(value)) {
        rows.push([fullKey, String(value)])
      }
    }
  }

  flatten(config)

  // divisionContacts 별도 처리
  if (config.divisionContacts) {
    config.divisionContacts.forEach((contact: { division: string; chair: string; email: string }) => {
      rows.push([`divisionContacts.${contact.division}.chair`, contact.chair])
      rows.push([`divisionContacts.${contact.division}.email`, contact.email])
    })
  }

  return toCSV(['key', 'value'], rows)
}

// Directory 내보내기
function exportDirectory() {
  const data = JSON.parse(fs.readFileSync(path.join(contentDir, 'directory.json'), 'utf-8'))

  const rows: string[][] = []

  data.categories.forEach((category: { name: string; teachers: string[] }) => {
    category.teachers.forEach(teacher => {
      rows.push([String(data.year), category.name, teacher])
    })
  })

  return toCSV(['year', 'category', 'name'], rows)
}

// Winners 내보내기
function exportWinners() {
  const winnersDir = path.join(contentDir, 'winners')
  const files = fs.readdirSync(winnersDir).filter(f => f.endsWith('.json'))

  const rows: string[][] = []

  files.forEach(file => {
    const year = file.replace('.json', '')
    const data = JSON.parse(fs.readFileSync(path.join(winnersDir, file), 'utf-8'))

    data.divisions?.forEach((division: {
      name: string
      icon: string
      subsections?: { name: string; sections: { name: string; winners: { place: string; name: string }[] }[] }[]
      sections?: { name: string; winners: { place: string; name: string }[] }[]
    }) => {
      if (division.subsections) {
        division.subsections.forEach(subsection => {
          subsection.sections.forEach(section => {
            section.winners.forEach(winner => {
              rows.push([
                year,
                division.name,
                subsection.name,
                section.name,
                winner.place,
                winner.name,
                division.icon
              ])
            })
          })
        })
      }

      if (division.sections) {
        division.sections.forEach(section => {
          section.winners.forEach(winner => {
            rows.push([
              year,
              division.name,
              '',  // no subsection
              section.name,
              winner.place,
              winner.name,
              division.icon
            ])
          })
        })
      }
    })
  })

  return toCSV(['year', 'division', 'subsection', 'section', 'place', 'name', 'icon'], rows)
}

// KeyDates 내보내기 (하드코딩된 데이터 기반)
function exportKeyDates() {
  const rows: string[][] = [
    ['March 16, 2026', 'Registration Opens', 'Begin your registration process', 'deadline', 'true'],
    ['April 16, 2026', 'Regular Deadline', 'Last day for $50 entry fee', 'deadline', 'true'],
    ['April 23, 2026', 'Late Registration', 'Final deadline - $70 late fee applies', 'deadline', 'false'],
    ['May 16, 2026', 'Competition Day', 'California State University, Long Beach', 'event', 'true'],
    ['June 6, 2026', 'Winners\' Concert', 'Richard Nixon Library - Yorba Linda, 7:00 PM', 'event', 'true'],
  ]

  return toCSV(['date', 'title', 'description', 'type', 'highlight'], rows)
}

// Divisions 내보내기 (하드코딩된 데이터 기반)
function exportDivisions() {
  const rows: string[][] = [
    ['Classical Piano', '🎹', 'Solo piano performance', 'Section 1-8', 'Dr. Hyunjoo Choi', 'musicalartsoc@gmail.com'],
    ['Voice', '🎤', 'Classical Voice performance', 'Section 1-4', 'Dr. SuJung Kim', 'sjsoprano1@gmail.com'],
    ['Musical Theater', '🎭', 'Musical Theater performance', 'Section 1-4', 'Dr. SuJung Kim', 'sjsoprano1@gmail.com'],
    ['Violin', '🎻', 'Solo violin performance', 'Section 1-8', 'Sorah Myung', 'strings@musicalartsoc.org'],
    ['Viola', '🎻', 'Solo viola performance', 'Section 1-8', 'Sorah Myung', 'strings@musicalartsoc.org'],
    ['Cello', '🎻', 'Solo cello performance', 'Section 1-8', 'Sorah Myung', 'strings@musicalartsoc.org'],
    ['Flute', '🎵', 'Solo flute performance', 'Section 1-8', 'Alice Yu', 'ayuhsiu@gmail.com'],
    ['Clarinet', '🎵', 'Solo clarinet performance', 'Section 1-8', 'Alice Yu', 'ayuhsiu@gmail.com'],
    ['Classical Guitar', '🎸', 'Solo classical guitar', 'Section 1-8', 'Nikola Chekardzhikov', 'guitar@musicalartsoc.org'],
    ['Chamber Music', '🎶', 'Ensemble performance', 'Section 1-4', '', ''],
  ]

  return toCSV(['name', 'icon', 'description', 'sections', 'chairName', 'chairEmail'], rows)
}

// FAQs 내보내기 (하드코딩된 데이터 기반)
function exportFAQs() {
  const rows: string[][] = [
    ['Who can participate in the competition?', 'Students of MACOC member teachers are eligible to participate. Teachers must have an active membership for their students to compete.'],
    ['How do I become a member teacher?', 'You can apply for membership through our registration page. Annual membership fee is $40.'],
    ['What are the entry fees?', 'Regular entry fee is $50 per entry. Late registration (after the regular deadline) is $70 per entry.'],
    ['When and where is the competition held?', 'The competition is held annually in May at California State University, Long Beach.'],
  ]

  return toCSV(['question', 'answer'], rows)
}

// History 내보내기 (하드코딩된 데이터 기반)
function exportHistory() {
  const rows: string[][] = [
    ['1932', 'Founded', 'Initially organized as the Orange County Chapter of Musical Arts Club'],
    ['1940s', 'Competition Begins', 'Annual competition for piano, organ and voice students became an established event'],
    ['1974', 'Incorporation', 'Musical Arts Club of Orange County was incorporated as a non-profit corporation'],
    ['2011', 'Renamed', 'Organization officially changed its name to Musical Arts Competition of Orange County'],
    ['Today', 'Growing Strong', 'Continues to serve hundreds of young musicians annually'],
  ]

  return toCSV(['year', 'title', 'description'], rows)
}

// 메인 함수
async function main() {
  console.log('📤 Exporting data to CSV...\n')

  // 출력 디렉토리 생성
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const exports = [
    { name: 'Config', fn: exportConfig },
    { name: 'KeyDates', fn: exportKeyDates },
    { name: 'Divisions', fn: exportDivisions },
    { name: 'FAQs', fn: exportFAQs },
    { name: 'History', fn: exportHistory },
    { name: 'Directory', fn: exportDirectory },
    { name: 'Winners', fn: exportWinners },
  ]

  for (const { name, fn } of exports) {
    console.log(`📄 Exporting ${name}...`)
    try {
      const csv = fn()
      const filePath = path.join(outputDir, `${name}.csv`)
      fs.writeFileSync(filePath, csv)
      console.log(`   ✅ Saved to exports/${name}.csv\n`)
    } catch (error) {
      console.error(`   ❌ Error: ${error}\n`)
    }
  }

  console.log('✨ Done!')
  console.log('\n📋 Next steps:')
  console.log('1. Open Google Sheets')
  console.log('2. For each CSV file:')
  console.log('   - Create a new sheet with the same name (Config, KeyDates, etc.)')
  console.log('   - File → Import → Upload → Select the CSV')
  console.log('   - Choose "Replace current sheet"')
}

main().catch(console.error)
