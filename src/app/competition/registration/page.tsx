import Link from 'next/link'
import { config } from '@/lib/config'

export default function RegistrationPage() {
  const { competition, fees, currentYear } = config

    return (
    <div>
      {/* Header */}
      <section className="bg-navy py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="badge badge-gold mb-4">Registration</span>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              {currentYear} Competition Registration
            </h1>
            <p className="text-white/70 max-w-2xl mx-auto">
              Join us for another exciting year of musical excellence
            </p>
          </div>
        </div>
      </section>

      {/* Status Banner */}
      <section className="bg-green-50 border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center gap-3">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <p className="text-green-700 font-medium">
              Registration opens {competition.registration.open}
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="section bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Select Your Tier</h2>
            <p className="section-subtitle mx-auto">Choose the membership type that fits your role</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Teacher Membership */}
            <div className="pricing-card">
              <h3 className="font-heading text-xl text-charcoal mb-2">Teacher Membership</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-heading font-bold text-navy">${fees.membership.amount}</span>
                <span className="text-text-muted">/year</span>
              </div>
              <p className="text-text-muted text-sm mb-6">Required for student registration</p>

              <div className="mb-8" />

              <Link href="/register" className="btn btn-primary w-full text-center">
                Select Division
              </Link>
            </div>

            {/* Solo Entry */}
            <div className="pricing-card pricing-card-featured">
              <h3 className="font-heading text-xl text-charcoal mb-2">Solo Entry</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-heading font-bold text-navy">${fees.solo.amount}</span>
                <span className="text-text-muted">/entry</span>
              </div>
              <p className="text-text-muted text-sm mb-6">Per student, per division</p>

              <div className="mb-8" />

              <Link href="/register" className="btn btn-secondary w-full text-center">
                Select Division
              </Link>

              <p className="text-center text-xs text-text-muted mt-4">
                Late fee: ${fees.lateFee.amount} after {competition.registration.close}
              </p>
            </div>

            {/* Chamber Entry */}
            <div className="pricing-card">
              <h3 className="font-heading text-xl text-charcoal mb-2">Chamber Entry</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-heading font-bold text-navy">${fees.chamber.amount}</span>
                <span className="text-text-muted">/entry</span>
              </div>
              <p className="text-text-muted text-sm mb-6">Per group entry</p>

              <div className="mb-8" />

              <button className="btn btn-secondary w-full opacity-50 cursor-not-allowed" disabled>
                Coming Soon
              </button>
              <p className="text-center text-xs text-text-muted mt-4">
                <Link href="/contact" className="text-gold hover:underline">Contact us</Link> for chamber registration inquiries.
              </p>
            </div>
          </div>

          {/* Non-Participation Fee */}
          <div className="mt-8 max-w-5xl mx-auto">
            <div className="p-6 bg-cream rounded-xl text-center">
              <h3 className="font-heading text-lg text-charcoal mb-2">Non-Participation Fee</h3>
              <p className="text-text-muted text-sm mb-3">
                For member teachers who do not enter students in the competition
              </p>
              <div className="flex justify-center gap-8">
                <div>
                  <span className="text-2xl font-heading font-bold text-navy">${fees.nonParticipation.small.amount}</span>
                  <p className="text-text-muted text-xs mt-1">{fees.nonParticipation.small.label}</p>
                </div>
                <div>
                  <span className="text-2xl font-heading font-bold text-navy">${fees.nonParticipation.large.amount}</span>
                  <p className="text-text-muted text-xs mt-1">{fees.nonParticipation.large.label}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="section bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="section-title">Secure Payment</h2>
            <p className="section-subtitle mx-auto">We accept multiple payment methods</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">💳</span>
              <span className="text-sm font-medium text-charcoal">Credit / Debit Card</span>
            </div>
            <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">🅿️</span>
              <span className="text-sm font-medium text-charcoal">PayPal</span>
            </div>
          </div>

          <p className="text-center text-xs text-text-muted mt-6">
            🔒 SSL Encrypted Transaction
          </p>
        </div>
      </section>

      {/* Important Notes */}
      <section className="bg-amber-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="font-heading text-lg text-amber-800 mb-4">Important Notes</h3>
          <ul className="space-y-2 text-amber-700 text-sm">
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Registration: {competition.registration.open} to {competition.registration.close}</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Late registration deadline: {competition.registration.lateDeadline}</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Age calculated as of {competition.registration.ageAsOf}</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Students must be registered by a MACOC member teacher</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Questions */}
      <section className="section bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="section-title">Have Questions?</h2>
          <p className="section-subtitle mx-auto mb-8">
            Our team is here to help you through the registration process.
          </p>
          <Link href="/contact" className="btn btn-secondary">
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  )
}
