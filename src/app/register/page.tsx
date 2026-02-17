import Link from 'next/link'
import { config } from '@/lib/config'
import { getAllDivisionSummaries } from '@/content/divisions'

const categories: { label: string; ids: string[] }[] = [
  { label: 'Keyboard', ids: ['piano'] },
  { label: 'Vocal', ids: ['vocal-classical', 'vocal-musical-theater'] },
  { label: 'Strings', ids: ['strings', 'strings-piano-chamber'] },
  { label: 'Guitar', ids: ['classical-guitar', 'guitar-chamber-music'] },
  { label: 'Woodwinds', ids: ['woodwinds', 'woodwinds-ensemble'] },
]

export default function RegisterPage() {
  const summaries = getAllDivisionSummaries()
  const summaryMap = new Map(summaries.map((s) => [s.id, s]))

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-navy py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="badge badge-gold mb-4">Registration Open</span>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
            {config.currentYear} Competition Registration
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto">
            Select your division below to begin registration. Solo entry: ${config.fees.solo.amount} | Chamber: ${config.fees.chamber.amount}.
          </p>
        </div>
      </section>

      {/* Important Dates */}
      <section className="bg-gold/10 border-b border-gold/20 py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gold">📅</span>
              <span className="text-text-secondary">Registration closes: <strong className="text-charcoal">{config.competition.registration.close}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gold">🎹</span>
              <span className="text-text-secondary">Competition: <strong className="text-charcoal">{config.competition.date}</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* Divisions */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-heading font-semibold text-charcoal mb-6">
            Select Your Division
          </h2>

          <div className="space-y-8">
            {categories.map((category) => (
              <div key={category.label}>
                <h3 className="text-sm font-semibold text-navy uppercase tracking-wider mb-3">
                  {category.label}
                </h3>
                <div className="grid gap-4">
                  {category.ids.map((id) => {
                    const division = summaryMap.get(id)
                    if (!division) return null
                    return (
                      <div
                        key={division.id}
                        className="bg-white rounded-xl p-6 shadow-sm border-2 border-transparent hover:border-gold cursor-pointer transition-all"
                      >
                        <Link href={`/register/${division.id}`} className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gold/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <span className="text-3xl">{division.icon}</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-heading text-lg text-charcoal">{division.name}</h3>
                            <p className="text-sm text-text-muted">{division.description}</p>
                            <p className="text-xs text-navy mt-1">{division.sectionCount}</p>
                          </div>
                          <div className="flex-shrink-0">
                            <span className="btn btn-gold text-sm py-2 px-4">
                              Register
                            </span>
                          </div>
                        </Link>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Help */}
          <div className="mt-8 p-6 bg-white rounded-xl shadow-sm">
            <h3 className="font-semibold text-navy mb-2">Need Help?</h3>
            <p className="text-sm text-text-secondary">
              Contact us at{' '}
              <a href={`mailto:${config.contact.email}`} className="text-gold hover:underline">
                {config.contact.email}
              </a>
              {' '}if you have any questions about registration.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
