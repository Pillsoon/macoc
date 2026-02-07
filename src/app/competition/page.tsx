import Link from 'next/link'
import { config } from '@/lib/config'
import { getAllDivisionSummaries } from '@/content/divisions'

const quickLinks = [
  {
    icon: '📝',
    title: 'Registration',
    desc: 'Sign up for the competition',
    href: '/competition/registration',
    cta: 'Register Now',
  },
  {
    icon: '📅',
    title: 'Schedule',
    desc: 'View important dates',
    href: '/competition/schedule',
    cta: 'View Schedule',
  },
  {
    icon: '📋',
    title: 'Regulations',
    desc: 'Rules & requirements',
    href: '/competition/regulation',
    cta: 'Read Rules',
  },
]

export default function CompetitionPage() {
  const { currentYear, competition } = config
  const divisions = getAllDivisionSummaries()

  return (
    <div>
      {/* Hero Section */}
      <section className="hero min-h-[400px] flex items-center relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507838153414-b4b713384a76?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')" }}
        />
        <div className="hero-overlay" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <span className="badge badge-gold mb-4">Since 1932</span>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
            {currentYear} Annual Competition
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
            Celebrating excellence in classical music performance. Join us for a historic season of artistry.
          </p>
          <Link href="/competition/registration" className="btn btn-gold">
            Register Now
            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Quick Links */}
      <section className="section bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickLinks.map((link, idx) => (
              <Link
                key={idx}
                href={link.href}
                className="card group hover:border-gold"
              >
                <span className="text-3xl mb-4 block">{link.icon}</span>
                <h3 className="font-heading text-xl text-charcoal mb-2 group-hover:text-navy transition-colors">
                  {link.title}
                </h3>
                <p className="text-text-muted text-sm mb-4">{link.desc}</p>
                <span className="text-navy font-medium text-sm inline-flex items-center">
                  {link.cta}
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Divisions */}
      <section className="section bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Select a Division</h2>
            <p className="section-subtitle mx-auto">Choose your instrument or category to compete</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {divisions.map((division) => (
              <div
                key={division.id}
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-gold/30 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">{division.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-lg text-charcoal">{division.name}</h3>
                  <p className="text-text-muted text-sm">{division.description}</p>
                </div>
                <span className="text-xs text-navy font-medium bg-navy/5 px-2 py-1 rounded">
                  {division.sectionCount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Competition Info */}
      <section className="section bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="section-title">Competition Details</h2>
              <div className="space-y-4 text-text-secondary">
                <p>
                  The Musical Arts Competition of Orange County provides a platform for young musicians to showcase their talents before distinguished judges from leading conservatories and orchestras.
                </p>
                <p>
                  Winners receive cash prizes and the opportunity to perform at the prestigious Winners&apos; Concert held at the Richard Nixon Library in Yorba Linda.
                </p>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center">
                    <span>📍</span>
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">Location</p>
                    <p className="font-medium text-charcoal">{competition.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center">
                    <span>📆</span>
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">Competition Date</p>
                    <p className="font-medium text-charcoal">{competition.date}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-navy rounded-2xl p-8 text-white">
              <h3 className="font-heading text-2xl mb-6">By the Numbers</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-3xl font-heading font-bold text-gold">90+</div>
                  <div className="text-white/70 text-sm">Years Legacy</div>
                </div>
                <div>
                  <div className="text-3xl font-heading font-bold text-gold">$50k+</div>
                  <div className="text-white/70 text-sm">Annual Prizes</div>
                </div>
                <div>
                  <div className="text-3xl font-heading font-bold text-gold">10</div>
                  <div className="text-white/70 text-sm">Divisions</div>
                </div>
                <div>
                  <div className="text-3xl font-heading font-bold text-gold">250+</div>
                  <div className="text-white/70 text-sm">Annual Participants</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gold py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-navy-dark mb-4">
            Ready to Compete?
          </h2>
          <p className="text-navy-dark/80 mb-6">
            Registration opens {competition.registration.open}. Don&apos;t miss your chance to perform.
          </p>
          <Link href="/competition/registration" className="btn btn-primary">
            Start Registration
          </Link>
        </div>
      </section>
    </div>
  )
}
