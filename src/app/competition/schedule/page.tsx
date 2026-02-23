import Link from 'next/link'
import { config } from '@/lib/config'

export default function SchedulePage() {
  const { competition, winnersConcert, currentYear, fees } = config

  const events = [
    {
      date: competition.registration.open,
      title: 'Registration Opens',
      description: 'Begin submitting entries for the competition',
      icon: '📝',
    },
    {
      date: competition.registration.close,
      title: 'Registration Closes',
      description: 'Last day for regular registration without late fee',
      icon: '📅',
    },
    {
      date: competition.registration.lateDeadline,
      title: 'Late Registration Deadline',
      description: `Final deadline with late fee ($${fees.lateFee.amount})`,
      icon: '⏰',
    },
    {
      date: competition.date,
      title: 'Competition Day',
      description: competition.location,
      icon: '🎹',
      highlight: true,
    },
    {
      date: winnersConcert.date,
      title: "Winners' Concert",
      description: `${winnersConcert.location} at ${winnersConcert.time}`,
      icon: '🏆',
      highlight: true,
    },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="hero min-h-[300px] flex items-center relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')" }}
        />
        <div className="hero-overlay" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <span className="badge badge-gold mb-4">{currentYear} Competition</span>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
            Schedule & Key Dates
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Mark your calendar for these important dates
          </p>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="section bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Event Timeline</h2>
            <p className="section-subtitle mx-auto">Key milestones for the {currentYear} season</p>
          </div>

          <div className="space-y-0">
            {events.map((event, index) => (
              <div key={event.title} className="timeline-item">
                {index !== events.length - 1 && <div className="timeline-line" />}
                <div className={`timeline-dot ${event.highlight ? 'timeline-dot-gold' : 'border-gray-300'}`} />
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      event.highlight ? 'bg-gold/20' : 'bg-gray-100'
                    }`}>
                      <span className="text-xl">{event.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold mb-1 ${
                        event.highlight ? 'text-gold-dark' : 'text-navy'
                      }`}>
                        {event.date}
                      </p>
                      <h3 className="font-heading text-xl text-charcoal mb-1">{event.title}</h3>
                      <p className="text-text-muted">{event.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Venues Section */}
      <section className="section bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Venues</h2>
            <p className="section-subtitle mx-auto">Where the music happens</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Competition Venue */}
            <div className="card text-center">
              <div className="w-16 h-16 bg-navy/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎹</span>
              </div>
              <h3 className="font-heading text-xl text-charcoal mb-2">Competition Venue</h3>
              <p className="text-text-muted mb-4">{competition.location}</p>
              <p className="text-sm text-navy font-medium">{competition.date}</p>
            </div>

            {/* Winners' Concert Venue */}
            <div className="card text-center border-2 border-gold">
              <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏆</span>
              </div>
              <h3 className="font-heading text-xl text-charcoal mb-2">Winners&apos; Concert</h3>
              <p className="text-text-muted mb-4">{winnersConcert.location}</p>
              <p className="text-sm text-gold-dark font-medium">{winnersConcert.date} at {winnersConcert.time}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Important Notes */}
      <section className="bg-amber-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="font-heading text-lg text-amber-800 mb-4">Important Reminders</h3>
          <ul className="space-y-2 text-amber-700 text-sm">
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Age is calculated as of {competition.registration.ageAsOf}</span>
            </li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="section-title">Ready to Participate?</h2>
          <p className="section-subtitle mx-auto mb-8">
            Registration is open. Secure your spot in the competition.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/competition/registration" className="btn btn-primary">
              Register Now
            </Link>
            <Link href="/competition/regulation" className="btn btn-secondary">
              View Regulations
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
