import Link from 'next/link'
import { getAllDivisions } from '@/content/divisions'

const eligibility = [
  'Participants must reside in Southern California or study with a teacher from Southern California',
  'Students must be registered by a MACOC member teacher',
  'Age requirements vary by section – see specific division rules',
  'Each student may enter multiple divisions but only one section per division',
]

const requirements = [
  'All music must be memorized (except Chamber Music)',
  'Time limits vary by section and must be observed',
  'Original compositions are allowed with specific guidelines',
  'Students must perform their registered repertoire',
  'No electronic accompaniment is permitted',
]

const awards = [
  { place: '1st Place', desc: 'Cash award + Trophy + invitation to Winners\' Concert', icon: '🥇', color: 'text-gold-dark' },
  { place: '2nd Place', desc: 'Trophy', icon: '🥈', color: 'text-gray-500' },
  { place: '3rd Place', desc: 'Trophy', icon: '🥉', color: 'text-amber-600' },
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

      {/* Eligibility Section */}
      <section className="section bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="section-title text-left">Eligibility</h2>
              <p className="text-text-secondary mb-6">
                Requirements for participating in the MACOC competition
              </p>
              <ul className="space-y-4">
                {eligibility.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-navy text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-text-secondary">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="section-title text-left">Performance Requirements</h2>
              <p className="text-text-secondary mb-6">
                Standards that must be observed during competition
              </p>
              <ul className="space-y-3">
                {requirements.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-text-secondary">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
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

      {/* Age Requirements Note */}
      <section className="bg-navy py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="font-heading text-2xl text-white mb-4">Age Sections</h3>
            <p className="text-white/70 mb-6">
              Each division has multiple age-based sections to ensure fair competition.
              Ages are calculated as of April 30th of the competition year.
            </p>
            <div className="grid grid-cols-4 gap-3 max-w-lg mx-auto">
              {['5-6', '7-8', '9-10', '11-12', '13-14', '15-16', '17-18', '19+'].map((age) => (
                <span key={age} className="px-4 py-2 bg-white/10 rounded-full text-white text-sm text-center">
                  {age} years
                </span>
              ))}
            </div>
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
