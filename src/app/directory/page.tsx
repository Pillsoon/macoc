import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'
import staticData from '@/content/directory.json'

export const revalidate = 0

interface DirectoryData {
  title: string
  year: number
  categories: { name: string; teachers: string[] }[]
}

async function fetchDirectory(): Promise<DirectoryData> {
  const sheetId = process.env.GOOGLE_SHEET_ID
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const key = process.env.GOOGLE_PRIVATE_KEY

  if (!sheetId || !email || !key) return staticData

  try {
    const auth = new JWT({
      email,
      key: key.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })

    const doc = new GoogleSpreadsheet(sheetId, auth)
    await doc.loadInfo()

    const sheet = doc.sheetsByTitle['Directory']
    if (!sheet) return staticData

    const rows = await sheet.getRows()

    const categories: Record<string, string[]> = {}
    let year = new Date().getFullYear().toString()

    for (const row of rows) {
      const category = row.get('category') || 'Other'
      const teacher = row.get('name') || row.get('teacher') || ''
      if (!year || year === new Date().getFullYear().toString()) {
        year = row.get('year') || year
      }
      if (teacher) {
        if (!categories[category]) categories[category] = []
        categories[category].push(teacher)
      }
    }

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
