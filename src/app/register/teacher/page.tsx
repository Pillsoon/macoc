import Link from 'next/link'
import TeacherRegistrationForm from '@/components/forms/TeacherRegistrationForm'
import { config } from '@/lib/config'

export default function TeacherRegistrationPage() {
  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/competition/registration"
            className="text-sm text-navy hover:text-gold mb-4 inline-flex items-center gap-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to registration
          </Link>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-charcoal mt-4">
            Teacher Membership Registration
          </h1>
          <p className="text-text-muted mt-2">
            {config.currentYear} Musical Arts Competition of Orange County
          </p>
        </div>

        {/* Form */}
        <TeacherRegistrationForm />
      </div>
    </div>
  )
}
