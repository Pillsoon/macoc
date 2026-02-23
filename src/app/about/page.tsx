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
            About MACOC
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Established in 1932
          </p>
        </div>
      </section>

      {/* History Timeline */}
      <section className="section bg-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Our History</h2>
            <p className="section-subtitle mx-auto">Since 1932</p>
          </div>

          <div className="space-y-0">
            {history.map((item, idx) => (
              <div key={idx} className="timeline-item">
                {idx !== history.length - 1 && <div className="timeline-line" />}
                <div className="timeline-dot border-gray-300" />
                <div>
                  <p className="text-sm font-semibold text-navy">
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

      {/* Divisions */}
      <section className="section bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Competition Divisions</h2>
            <p className="section-subtitle mx-auto">Spanning major instruments and voice</p>
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

      {/* CTA */}
      <section className="section bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="section-title">Questions?</h2>
          <p className="section-subtitle mx-auto mb-8">
            Reach out to us for more information.
          </p>
          <Link href="/contact" className="btn btn-primary">
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  )
}
