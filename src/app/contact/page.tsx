'use client'

import { useState } from 'react'
import Link from 'next/link'
import { config } from '@/lib/config'

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
                    <span className="text-xl">💼</span>
                  </div>
                  <div>
                    <p className="text-sm text-text-muted mb-1">Accountant</p>
                    <p className="font-medium text-charcoal">{config.accountant.name}</p>
                    <a
                      href={`mailto:${config.accountant.email}`}
                      className="text-sm text-navy hover:text-gold transition-colors"
                    >
                      {config.accountant.email}
                    </a>
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

            {/* Contact by Department */}
            <DepartmentContact />
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
            Registration opens {config.competition.registration.open}
          </p>
          <Link href="/competition/registration" className="btn btn-gold">
            Start Registration
          </Link>
        </div>
      </section>
    </div>
  )
}

function DepartmentContact() {
  const [selectedDivision, setSelectedDivision] = useState('')

  return (
    <div className="card">
      <h2 className="font-heading text-xl text-charcoal mb-6">Contact a Department</h2>
      <p className="text-text-muted text-sm mb-6">
        Select a department or browse all contacts below.
      </p>

      <div className="space-y-5">
        <div>
          <label htmlFor="department" className="block text-sm font-medium text-charcoal mb-2">
            Department
          </label>
          <select
            id="department"
            className="input"
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
          >
            <option value="">All departments</option>
            {config.divisionContacts.map((dc) => (
              <option key={dc.division} value={dc.division}>
                {dc.division}
              </option>
            ))}
            <option value="general">General Inquiry</option>
          </select>
        </div>

        <div className="space-y-2">
          {config.divisionContacts.map((dc) => (
            <div
              key={dc.division}
              className={`p-3 rounded-lg transition-colors ${
                selectedDivision === dc.division
                  ? 'bg-gold/10 border border-gold'
                  : selectedDivision && selectedDivision !== dc.division
                    ? 'hidden'
                    : 'bg-cream'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-charcoal">{dc.division}</p>
                  <p className="text-xs text-text-muted">{dc.chair}</p>
                </div>
                <a
                  href={`mailto:${dc.email}`}
                  className="text-xs text-navy hover:text-gold transition-colors"
                >
                  {dc.email}
                </a>
              </div>
            </div>
          ))}

          <div
            className={`p-3 rounded-lg transition-colors ${
              selectedDivision === 'general'
                ? 'bg-gold/10 border border-gold'
                : selectedDivision && selectedDivision !== 'general'
                  ? 'hidden'
                  : 'bg-cream'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-charcoal">General Inquiry</p>
                <p className="text-xs text-text-muted">{config.president.name}</p>
              </div>
              <a
                href={`mailto:${config.contact.email}`}
                className="text-xs text-navy hover:text-gold transition-colors"
              >
                {config.contact.email}
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
