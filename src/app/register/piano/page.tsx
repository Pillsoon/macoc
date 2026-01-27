import RegistrationForm from '@/components/forms/RegistrationForm'
import Link from 'next/link'

const pianoSections = [
  { value: 'section-1', label: 'Section I - Age 7 and under (4 min)' },
  { value: 'section-2', label: 'Section II - Age 8 and under (4 min)' },
  { value: 'section-3', label: 'Section III - Age 9 and under (5 min)' },
  { value: 'section-4', label: 'Section IV - Age 10 and under (5 min)' },
  { value: 'section-5', label: 'Section V - Age 11 and under (5 min)' },
  { value: 'section-6', label: 'Section VI - Age 12 and under (6 min)' },
  { value: 'section-7', label: 'Section VII - Age 13 and under (7 min)' },
  { value: 'section-8', label: 'Section VIII - Age 14 and under (8 min)' },
  { value: 'section-9', label: 'Section IX - Age 15 and under (8 min)' },
  { value: 'section-10', label: 'Section X - Age 16 and under (10 min)' },
  { value: 'section-11', label: 'Section XI - Age 18 and under (12 min)' },
]

const timePeriods = [
  { value: 'baroque', label: 'Baroque (1600-1750)' },
  { value: 'classical', label: 'Classical (1750-1820)' },
  { value: 'romantic', label: 'Romantic (1820-1900)' },
  { value: 'modern', label: 'Modern/Contemporary (1900-present)' },
]

export default function PianoRegistrationPage() {
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
            Piano Division Registration
          </h1>
          <p className="text-text-muted mt-2">
            2026 Musical Arts Competition of Orange County
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
          <h2 className="font-semibold text-navy mb-3">Piano Division Requirements</h2>
          <ul className="text-sm text-text-secondary space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-gold">•</span>
              Select two pieces representing different periods and styles
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold">•</span>
              Time limits must be observed (see section selection)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold">•</span>
              All pieces must be memorized
            </li>
          </ul>
        </div>

        {/* Form */}
        <RegistrationForm
          division="Piano"
          sections={pianoSections}
          timePeriods={timePeriods}
        />
      </div>
    </div>
  )
}
