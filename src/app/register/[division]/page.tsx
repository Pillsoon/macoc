import { notFound } from 'next/navigation'
import Link from 'next/link'
import RegistrationForm from '@/components/forms/RegistrationForm'
import { getDivisionById, getAllDivisions } from '@/content/divisions'
import { config } from '@/lib/config'

export function generateStaticParams() {
  return getAllDivisions()
    .filter((d) => d.available)
    .map((d) => ({ division: d.id }))
}

export default function DivisionRegistrationPage({
  params,
}: {
  params: { division: string }
}) {
  const divisionId = params.division
  const division = getDivisionById(divisionId)

  if (!division || !division.available) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/register" className="text-sm text-navy hover:text-gold mb-4 inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to divisions
          </Link>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-charcoal mt-4">
            {division.name} Division Registration
          </h1>
          <p className="text-text-muted mt-2">
            {config.currentYear} Musical Arts Competition of Orange County
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
          <h2 className="font-semibold text-navy mb-3">{division.name} Division Requirements</h2>
          <ul className="text-sm text-text-secondary space-y-2">
            {division.requirements.map((req, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-gold">•</span>
                {req}
              </li>
            ))}
          </ul>
        </div>

        {/* Form */}
        <RegistrationForm
          division={division.name}
          sections={division.sections}
          timePeriods={division.timePeriods}
          feeType={division.feeType}
        />
      </div>
    </div>
  )
}
