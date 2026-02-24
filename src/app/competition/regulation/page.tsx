import Link from 'next/link'
import { getAllDivisions } from '@/content/divisions'

const awards = [
  { place: '1st Place', desc: 'Cash award + Trophy + invitation to Winners\' Concert', icon: '🥇', color: 'text-gold-dark' },
  { place: '2nd Place', desc: 'Trophy', icon: '🥈', color: 'text-gray-500' },
  { place: '3rd Place', desc: 'Trophy', icon: '🥉', color: 'text-amber-600' },
  { place: 'Honorable Mention', desc: 'Ribbon', icon: '🎀', color: 'text-navy' },
]

export default function RegulationPage() {
  return (
    <div>
      {/* Header */}
      <section className="bg-navy py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="badge badge-gold mb-4">Official Rules</span>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              Competition Regulations
            </h1>
            <p className="text-white/70 max-w-2xl mx-auto">
              Guidelines and requirements for all participants
            </p>
          </div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="section bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Awards & Recognition</h2>
            <p className="section-subtitle mx-auto">Excellence deserves recognition</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {awards.map((award) => (
              <div key={award.place} className="bg-white rounded-xl border border-gray-100 p-6 flex items-center gap-4">
                <span className="text-4xl">{award.icon}</span>
                <div>
                  <h3 className={`font-heading text-lg ${award.color}`}>{award.place}</h3>
                  <p className="text-text-muted text-sm">{award.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Division-Specific Regulations */}
      <section className="section bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Division Regulations</h2>
            <p className="section-subtitle mx-auto">
              View detailed rules, sections, and repertoire requirements for each division
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {getAllDivisions().map((d) => (
              <Link
                key={d.id}
                href={`/competition/regulation/${d.id}`}
                className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-gray-100 hover:border-gold transition-colors group"
              >
                <span className="text-2xl">{d.icon}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-heading text-charcoal group-hover:text-navy truncate">{d.name}</h4>
                  <p className="text-xs text-text-muted">{d.sections.length} sections</p>
                </div>
                <svg className="w-5 h-5 text-gray-300 group-hover:text-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="section-title">Ready to Compete?</h2>
          <p className="section-subtitle mx-auto mb-8">
            Review complete, register your students, and join us for an inspiring competition.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/competition/registration" className="btn btn-primary">
              Register Now
            </Link>
            <Link href="/contact" className="btn btn-secondary">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
