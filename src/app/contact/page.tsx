import Link from 'next/link'
import config from '@/content/config.json'

const faqs = [
  {
    q: 'How do I register my students?',
    a: 'Teachers must first become MACOC members, then can register students through our online registration system.',
  },
  {
    q: 'What are the age requirements?',
    a: 'Age requirements vary by division and section. Please refer to the Regulations page for specific details.',
  },
  {
    q: 'Where is the competition held?',
    a: 'The competition takes place at California State University, Long Beach.',
  },
  {
    q: 'When will I receive my schedule?',
    a: 'Competition schedules are typically sent to teachers 2 weeks before the competition date.',
  },
]

export default function ContactPage() {
  return (
    <div>
      {/* Header */}
      <section className="bg-navy py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="badge badge-gold mb-4">Get in Touch</span>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              Contact Us
            </h1>
            <p className="text-white/70 max-w-2xl mx-auto">
              Have questions? We&apos;re here to help you on your musical journey.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="section-title text-left">Get in Touch</h2>
              <p className="text-text-secondary mb-8">
                Reach out to us with any questions about the competition, registration, or membership.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">👤</span>
                  </div>
                  <div>
                    <p className="text-sm text-text-muted mb-1">President</p>
                    <p className="font-medium text-charcoal">{config.president.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">✉️</span>
                  </div>
                  <div>
                    <p className="text-sm text-text-muted mb-1">Email</p>
                    <a
                      href={`mailto:${config.contact.email}`}
                      className="font-medium text-navy hover:text-gold transition-colors"
                    >
                      {config.contact.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">🏛️</span>
                  </div>
                  <div>
                    <p className="text-sm text-text-muted mb-1">Organization</p>
                    <p className="font-medium text-charcoal">{config.site.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">📍</span>
                  </div>
                  <div>
                    <p className="text-sm text-text-muted mb-1">Competition Venue</p>
                    <p className="font-medium text-charcoal">{config.competition.location}</p>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="mt-10 p-6 bg-cream rounded-xl">
                <h3 className="font-heading text-lg text-charcoal mb-4">Quick Links</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/competition/registration" className="text-sm text-navy hover:text-gold transition-colors">
                    → Registration
                  </Link>
                  <Link href="/competition/regulation" className="text-sm text-navy hover:text-gold transition-colors">
                    → Regulations
                  </Link>
                  <Link href="/competition/schedule" className="text-sm text-navy hover:text-gold transition-colors">
                    → Schedule
                  </Link>
                  <Link href="/about" className="text-sm text-navy hover:text-gold transition-colors">
                    → About Us
                  </Link>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="card">
              <h2 className="font-heading text-xl text-charcoal mb-6">Send a Message</h2>

              <form className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-charcoal mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="input"
                    placeholder="Full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="input"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-charcoal mb-2">
                    Subject
                  </label>
                  <select id="subject" className="input">
                    <option value="">Select a topic</option>
                    <option value="registration">Registration Question</option>
                    <option value="membership">Membership Inquiry</option>
                    <option value="competition">Competition Information</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-charcoal mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    className="input resize-none"
                    placeholder="How can we help you?"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full opacity-50 cursor-not-allowed"
                  disabled
                >
                  Send Message (Coming Soon)
                </button>

                <p className="text-xs text-text-muted text-center">
                  We typically respond within 24-48 hours
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section bg-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle mx-auto">Quick answers to common questions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="card">
                <h3 className="font-heading text-lg text-charcoal mb-2">{faq.q}</h3>
                <p className="text-text-muted text-sm">{faq.a}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="text-text-secondary mb-4">
              Can&apos;t find what you&apos;re looking for?
            </p>
            <Link href="/competition/regulation" className="btn btn-secondary">
              View Full Regulations
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-4">
            Ready to Register?
          </h2>
          <p className="text-white/70 mb-6">
            Join hundreds of talented musicians competing in MACOC.
          </p>
          <Link href="/competition/registration" className="btn btn-gold">
            Start Registration
          </Link>
        </div>
      </section>
    </div>
  )
}
