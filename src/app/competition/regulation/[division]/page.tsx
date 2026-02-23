import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDivisionById, getAllDivisions } from '@/content/divisions'
import { config } from '@/lib/config'

export function generateStaticParams() {
  return getAllDivisions().map((d) => ({ division: d.id }))
}

export default function DivisionRegulationPage({
  params,
}: {
  params: { division: string }
}) {
  const division = getDivisionById(params.division)
  if (!division) return notFound()

  const contact = config.divisionContacts?.find((c) =>
    division.name.toLowerCase().includes(c.division.toLowerCase())
  )

  return (
    <div>
      {/* Header */}
      <section className="bg-navy py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Link
              href="/competition/regulation"
              className="text-white/50 hover:text-white text-sm mb-4 inline-block"
            >
              &larr; All Regulations
            </Link>
            <div className="text-5xl mb-4">{division.icon}</div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              {division.name}
            </h1>
            <p className="text-white/70 max-w-2xl mx-auto">
              {division.description}
            </p>
          </div>
        </div>
      </section>

      {/* Quick Info Bar */}
      <section className="bg-gold/10 border-b border-gold/20 py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-navy">Fee:</span>
              <span className="text-text-secondary">
                ${division.feeType === 'chamber' ? config.fees.chamber.amount : config.fees.solo.amount}
                /{division.feeType === 'chamber' ? 'group' : 'entry'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-navy">Memorization:</span>
              <span className="text-text-secondary">
                {division.memorization ? 'Required' : 'Not required'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-navy">Sections:</span>
              <span className="text-text-secondary">{division.sections.length}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Age Sections */}
      {division.sections.length > 0 && (
        <section className="section bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="section-title">Age Sections</h2>
            <p className="section-subtitle mx-auto mb-8">
              Ages are calculated as of April 30th of the competition year.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {division.sections.map((section) => (
                <div
                  key={section.value}
                  className="flex items-center gap-3 p-4 bg-cream/50 rounded-lg border border-gray-100"
                >
                  <span className="w-8 h-8 bg-navy text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {section.value.replace('section-', '')}
                  </span>
                  <span className="text-text-secondary text-sm">{section.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Requirements */}
      {division.requirements.length > 0 && (
        <section className="section bg-cream">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="section-title">Requirements</h2>
            <p className="section-subtitle mx-auto mb-8">
              Rules and guidelines for this division
            </p>
            <div className="max-w-2xl mx-auto">
              <ul className="space-y-4">
                {division.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-gold flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-text-secondary">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Division Contact */}
      {contact && (
        <section className="bg-navy py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="font-heading text-lg text-white mb-2">Division Contact</h3>
            <p className="text-white/70 text-sm">
              {contact.chair} &mdash;{' '}
              <a href={`mailto:${contact.email}`} className="text-gold hover:underline">
                {contact.email}
              </a>
            </p>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section bg-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="section-title">Ready to Register?</h2>
          <p className="section-subtitle mx-auto mb-8">
            Start your {division.name} registration now.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href={`/register/${division.id}`} className="btn btn-gold">
              Register for {division.name}
            </Link>
            <Link href="/competition/regulation" className="btn btn-secondary">
              View All Regulations
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
