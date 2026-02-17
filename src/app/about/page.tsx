import Link from 'next/link'
import { getAllDivisionSummaries } from '@/content/divisions'

const history = [
  {
    year: '1932',
    title: 'The Beginning',
    desc: 'Initially organized as the Orange County Chapter of Musical Arts Club, establishing a rapport among performing and teaching colleagues.',
  },
  {
    year: '1940s',
    title: 'Competition Era',
    desc: 'A competition for piano, organ, and voice students became an annual event, growing through the years.',
  },
  {
    year: '1974',
    title: 'Non-Profit Status',
    desc: 'Incorporated as a non-profit corporation, investing all proceeds in an endowment fund left by founder Clarence Gustlin.',
  },
  {
    year: '2011',
    title: 'New Identity',
    desc: 'Officially renamed to Musical Arts Competition of Orange County, reflecting our evolved mission.',
  },
  {
    year: 'Today',
    title: 'Continuing Legacy',
    desc: 'Over 250 students compete annually across 10 divisions, with winners performing at the Nixon Library.',
    highlight: true,
  },
]

const offerings = [
  { icon: '🏆', title: 'Awards', desc: 'Cash prizes and recognition for top performers' },
  { icon: '🎭', title: 'Performance', desc: 'Opportunities at prestigious venues' },
  { icon: '👨‍🏫', title: 'Mentorship', desc: 'Guidance from world-class masters' },
  { icon: '📰', title: 'Recognition', desc: 'International press coverage for winners' },
]

export default function AboutPage() {
  const divisions = getAllDivisionSummaries()

  return (
    <div>
      {/* Hero Section */}
      <section className="hero min-h-[400px] flex items-center relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')" }}
        />
        <div className="hero-overlay" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <span className="badge badge-gold mb-4">About Us</span>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
            90 Years of Musical Excellence
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Celebrating a legacy of discovering the world&apos;s finest classical talent
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="section-title">Our Mission</h2>
          <blockquote className="text-xl md:text-2xl text-text-secondary italic leading-relaxed">
            &quot;To identify and support the world&apos;s most promising young musicians through competition, mentorship, and performance opportunities.&quot;
          </blockquote>
        </div>
      </section>

      {/* History Timeline */}
      <section className="section bg-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Our History</h2>
            <p className="section-subtitle mx-auto">Tracing 90 years of artistic dedication</p>
          </div>

          <div className="space-y-0">
            {history.map((item, idx) => (
              <div key={idx} className="timeline-item">
                {idx !== history.length - 1 && <div className="timeline-line" />}
                <div className={`timeline-dot ${item.highlight ? 'timeline-dot-gold' : 'border-gray-300'}`} />
                <div>
                  <p className={`text-sm font-semibold ${item.highlight ? 'text-gold-dark' : 'text-navy'}`}>
                    {item.year}
                  </p>
                  <h3 className="font-heading text-lg text-charcoal">{item.title}</h3>
                  <p className="text-text-muted text-sm mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="section bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">What We Offer</h2>
            <p className="section-subtitle mx-auto">Supporting young musicians on their journey</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {offerings.map((item, idx) => (
              <div key={idx} className="card text-center">
                <div className="w-14 h-14 bg-gold/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <h3 className="font-heading text-lg text-charcoal mb-2">{item.title}</h3>
                <p className="text-text-muted text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divisions */}
      <section className="section bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Competition Divisions</h2>
            <p className="section-subtitle mx-auto">Nine divisions spanning all major instruments and voice</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {divisions.map((division) => (
              <div
                key={division.id}
                className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100 hover:border-gold/30 transition-colors"
              >
                <span className="font-medium text-charcoal">{division.name}</span>
                <span className="text-sm text-text-muted">{division.sectionCount}</span>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/competition/regulation" className="btn btn-secondary">
              View Full Regulations
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-navy py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-heading font-bold text-gold mb-2">$1M+</div>
              <div className="text-white/70 text-sm">Scholarships Awarded</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-heading font-bold text-gold mb-2">5,000+</div>
              <div className="text-white/70 text-sm">Alumni Community</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-heading font-bold text-gold mb-2">90+</div>
              <div className="text-white/70 text-sm">Years of Excellence</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-heading font-bold text-gold mb-2">50+</div>
              <div className="text-white/70 text-sm">Countries Represented</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="section-title">Join Our Team</h2>
          <p className="section-subtitle mx-auto mb-8">
            We are always looking for passionate individuals to join our board and volunteer team.
          </p>
          <Link href="/contact" className="btn btn-primary">
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  )
}
