import staticData from '@/content/directory.json'

export const revalidate = 3600 // 1시간마다 재검증

interface DirectoryData {
  title: string
  year: number
  categories: { name: string; teachers: string[] }[]
}

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

async function fetchDirectory(): Promise<DirectoryData> {
  const sheetId = process.env.GOOGLE_SHEET_ID
  if (!sheetId) return staticData

  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('Directory')}&headers=1`

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const csv = await res.text()
    const lines = csv.split('\n').filter(line => line.trim())
    if (lines.length < 2) return staticData

    const headers = parseCSVLine(lines[0])
    const rows = lines.slice(1).map(line => {
      const values = parseCSVLine(line)
      const row: Record<string, string> = {}
      headers.forEach((h, i) => { row[h.trim()] = values[i]?.trim() || '' })
      return row
    })

    const categories: Record<string, string[]> = {}
    rows.forEach(row => {
      const category = row.category || 'Other'
      const teacher = row.name || row.teacher || ''
      if (teacher) {
        if (!categories[category]) categories[category] = []
        categories[category].push(teacher)
      }
    })

    const year = rows[0]?.year || new Date().getFullYear().toString()

    return {
      title: 'Teachers Membership',
      year: parseInt(year),
      categories: Object.entries(categories).map(([name, teachers]) => ({
        name,
        teachers: teachers.sort(),
      })),
    }
  } catch {
    return staticData
  }
}

export default async function DirectoryPage() {
  const directoryData = await fetchDirectory()

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-heading font-semibold text-navy">
          {directoryData.title}
        </h1>
        <p className="text-text-muted">
          {directoryData.year} Member Directory
        </p>
      </div>

      <div className="grid gap-8 md:gap-10">
        {directoryData.categories.map((category) => (
          <section key={category.name} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-navy px-6 py-4">
              <h2 className="text-xl font-heading font-semibold text-white">
                {category.name}
              </h2>
            </div>
            <div className="p-6">
              {category.teachers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {category.teachers.map((teacher, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 bg-cream/50 rounded-lg text-charcoal text-sm"
                    >
                      {teacher}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-muted text-sm italic">
                  No registered teachers in this category
                </p>
              )}
            </div>
          </section>
        ))}
      </div>

      <div className="bg-cream border-l-4 border-gold p-6 rounded-r-lg">
        <h3 className="font-heading font-semibold text-navy mb-2">Become a Member</h3>
        <p className="text-text-secondary text-sm">
          Interested in joining MACOC as a teacher member?
          Visit our <a href="/competition/registration" className="text-gold hover:text-gold/80 underline">registration page</a> to apply for membership.
        </p>
      </div>
    </div>
  )
}
