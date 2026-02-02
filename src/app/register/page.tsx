import Link from 'next/link'
import { config } from '@/lib/config'

const divisions = [
  {
    id: 'piano',
    name: 'Piano',
    icon: '🎹',
    description: 'Classical piano solo performance',
    sections: '11 sections (Age 7-18)',
    available: true,
  },
  {
    id: 'strings',
    name: 'Strings',
    icon: '🎻',
    description: 'Violin, Viola, Cello',
    sections: '8 sections each',
    available: false, // Coming soon
  },
  {
    id: 'voice-classical',
    name: 'Voice (Classical)',
    icon: '🎤',
    description: 'Classical vocal performance',
    sections: '4 sections',
    available: false,
  },
  {
    id: 'voice-musical-theater',
    name: 'Musical Theater',
    icon: '🎭',
    description: 'Broadway & Contemporary',
    sections: '4 sections',
    available: false,
  },
  {
    id: 'woodwinds',
    name: 'Woodwinds',
    icon: '🎵',
    description: 'Flute, Clarinet',
    sections: '8 sections each',
    available: false,
  },
  {
    id: 'guitar',
    name: 'Classical Guitar',
    icon: '🎸',
    description: 'Classical guitar solo',
    sections: '8 sections',
    available: false,
  },
  {
    id: 'chamber',
    name: 'Chamber Music',
    icon: '👥',
    description: 'Ensemble performance',
    sections: '4 sections',
    available: false,
  },
]

export default function RegisterPage() {
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

          <div className="grid gap-4">
            {divisions.map((division) => (
              <div
                key={division.id}
                className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-all ${
                  division.available
                    ? 'border-transparent hover:border-gold cursor-pointer'
                    : 'border-transparent opacity-60'
                }`}
              >
                {division.available ? (
                  <Link href={`/register/${division.id}`} className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gold/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl">{division.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading text-lg text-charcoal">{division.name}</h3>
                      <p className="text-sm text-text-muted">{division.description}</p>
                      <p className="text-xs text-navy mt-1">{division.sections}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="btn btn-gold text-sm py-2 px-4">
                        Register
                      </span>
                    </div>
                  </Link>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl grayscale">{division.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading text-lg text-charcoal">{division.name}</h3>
                      <p className="text-sm text-text-muted">{division.description}</p>
                      <p className="text-xs text-navy mt-1">{division.sections}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-sm text-text-muted bg-gray-100 py-2 px-4 rounded-lg">
                        Coming Soon
                      </span>
                    </div>
                  </div>
                )}
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
