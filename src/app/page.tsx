import Link from 'next/link'
import { config } from '@/lib/config'
import { getAllDivisionSummaries } from '@/content/divisions'

const divisionCategories = [
  { label: 'Keyboard', ids: ['piano'] },
  { label: 'Vocal', ids: ['vocal-classical', 'vocal-musical-theater'] },
  { label: 'Strings', ids: ['strings', 'strings-piano-chamber'] },
  { label: 'Guitar', ids: ['classical-guitar', 'guitar-chamber-music'] },
  { label: 'Woodwinds', ids: ['woodwinds', 'woodwinds-ensemble'] },
]

export default function Home() {
  const { competition, winnersConcert, fees, currentYear } = config
  const summaries = getAllDivisionSummaries()
  const summaryMap = new Map(summaries.map((s) => [s.id, s]))

  const keyDates = [
    { icon: '📝', date: competition.registration.open, title: 'Registration Opens', desc: 'Begin submitting entries' },
    { icon: '📅', date: competition.registration.close, title: 'Registration Closes', desc: 'Last day for regular registration' },
    { icon: '🎹', date: competition.date, title: 'Competition Day', desc: competition.location, highlight: true },
    { icon: '🏆', date: winnersConcert.date, title: "Winners' Concert", desc: winnersConcert.location, highlight: true },
  ]

  const highlights = [
    { icon: '👨‍⚖️', title: 'Elite Judges', desc: 'Adjudicated by university professors and concert artists' },
    { icon: '🎭', title: "Winners' Concert", desc: 'Top winners perform at the Richard Nixon Library' },
    { icon: '🌐', title: 'Alumni Network', desc: 'Join 5,000+ alumni from over 90 years of competition' },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="hero min-h-[600px] flex items-center relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')" }}
        />
        <div className="hero-overlay" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <span className="badge badge-gold mb-6">
              {competition.date} &bull; {competition.location}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white leading-tight mb-6">
              Musical Arts Competition <span className="text-gold">of Orange County</span>
            </h1>
            <p className="text-xl text-white/80 mb-8 max-w-2xl">
              Nurturing Musical Excellence Since 1932. Join the legacy of prestigious performance.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/competition/registration" className="btn btn-gold">
                Register Now
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/about" className="btn btn-secondary border-white/30 text-white hover:bg-white hover:text-navy">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Key Dates Section */}
      <section className="section bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">{currentYear} Key Dates</h2>
            <p className="section-subtitle mx-auto">Mark your calendar for these important dates</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyDates.map((item, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-xl border p-6 text-center ${item.highlight ? 'border-gold border-2' : 'border-gray-100'}`}
              >
                <span className="text-3xl mb-4 block">{item.icon}</span>
                <p className={`text-sm font-semibold mb-1 ${item.highlight ? 'text-gold-dark' : 'text-navy'}`}>
                  {item.date}
                </p>
                <h3 className="font-heading text-lg text-charcoal mb-2">{item.title}</h3>
                <p className="text-text-muted text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Competition Highlights */}
      <section className="section bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Competition Highlights</h2>
            <p className="section-subtitle mx-auto">What makes MACOC special</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {highlights.map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">{item.icon}</span>
                </div>
                <h3 className="font-heading text-lg text-charcoal mb-2">{item.title}</h3>
                <p className="text-text-muted text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration by Division */}
      <section className="section bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Register by Division</h2>
            <p className="section-subtitle mx-auto mb-4">
              Select your division to register as a teacher or enter a student.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-navy/10 text-navy">
                Solo: ${fees.solo.amount}/entry
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-navy/10 text-navy">
                Chamber: ${fees.chamber.amount}/entry
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gold/10 text-gold-dark">
                Teacher: ${fees.membership.amount}/year
              </span>
            </div>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {divisionCategories.map((category) => {
              const divisions = category.ids
                .map((id) => summaryMap.get(id))
                .filter(Boolean)
              return (
                <div key={category.label}>
                  <h3 className="text-sm font-semibold text-navy uppercase tracking-wider mb-3">
                    {category.label}
                  </h3>
                  <div className={`grid grid-cols-1 ${divisions.length > 1 ? 'md:grid-cols-2' : ''} gap-3`}>
                    {divisions.map((d) => d && (
                      <Link
                        key={d.id}
                        href={`/register/${d.id}`}
                        className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-gray-100 hover:border-gold transition-colors group"
                      >
                        <span className="text-2xl">{d.icon}</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-heading text-charcoal group-hover:text-navy truncate">{d.name}</h4>
                          <p className="text-xs text-text-muted">{d.sectionCount}</p>
                        </div>
                        <svg className="w-5 h-5 text-gray-300 group-hover:text-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-navy py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-heading font-bold text-gold mb-2">90+</div>
              <div className="text-white/70 text-sm">Years of Excellence</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-heading font-bold text-gold mb-2">9</div>
              <div className="text-white/70 text-sm">Divisions</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-heading font-bold text-gold mb-2">5k+</div>
              <div className="text-white/70 text-sm">Alumni Community</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="script-accent mb-4">&quot;Where musical dreams take flight&quot;</p>
          <h2 className="section-title">Join Our Legacy</h2>
          <p className="section-subtitle mx-auto mb-8">
            Be part of a 90-year tradition of nurturing musical excellence in Southern California.
          </p>
          <Link href="/competition/registration" className="btn btn-gold">
            Start Your Journey
            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  )
}
