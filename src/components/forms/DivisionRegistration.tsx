'use client'

import { useState } from 'react'
import RegistrationForm from './RegistrationForm'
import TeacherRegistrationForm from './TeacherRegistrationForm'
import { config } from '@/lib/config'

type Role = 'select' | 'teacher' | 'student'

interface DivisionRegistrationProps {
  divisionName: string
  sections: { value: string; label: string }[]
  timePeriods: { value: string; label: string }[]
  feeType: 'solo' | 'chamber'
  available: boolean
}

export default function DivisionRegistration({
  divisionName,
  sections,
  timePeriods,
  feeType,
  available,
}: DivisionRegistrationProps) {
  const [role, setRole] = useState<Role>('select')

  if (role === 'select') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-heading font-semibold text-charcoal text-center mb-2">
            How are you registering?
          </h2>
          <p className="text-sm text-text-muted text-center mb-8">
            Select your registration type for {divisionName}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Teacher */}
            <button
              type="button"
              onClick={() => setRole('teacher')}
              className="group p-6 rounded-xl border-2 border-gray-200 hover:border-gold transition-all text-left"
            >
              <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors">
                <span className="text-2xl">👨‍🏫</span>
              </div>
              <h3 className="font-heading text-lg text-charcoal mb-1">
                Teacher Registration
              </h3>
              <p className="text-sm text-text-muted">
                Annual membership registration for teachers
              </p>
              <p className="text-xs font-medium text-gold-dark mt-2">
                ${config.fees.membership.amount}/year
              </p>
            </button>

            {/* Student */}
            <button
              type="button"
              onClick={() => available && setRole('student')}
              disabled={!available}
              className={`group p-6 rounded-xl border-2 text-left transition-all ${
                available
                  ? 'border-gray-200 hover:border-gold'
                  : 'border-gray-100 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                available ? 'bg-gold/10 group-hover:bg-gold/20' : 'bg-gray-100'
              }`}>
                <span className="text-2xl">🎵</span>
              </div>
              <h3 className="font-heading text-lg text-charcoal mb-1">
                Student Registration
              </h3>
              <p className="text-sm text-text-muted">
                {available
                  ? 'Competition entry registration for students'
                  : 'Coming soon'}
              </p>
              {available && (
                <p className="text-xs font-medium text-gold-dark mt-2">
                  {feeType === 'solo'
                    ? `$${config.fees.solo.amount}/entry`
                    : `$${config.fees.chamber.amount}/entry`}
                </p>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Back to role selection */}
      <button
        type="button"
        onClick={() => setRole('select')}
        className="text-sm text-navy hover:text-gold mb-6 inline-flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Change registration type
      </button>

      {role === 'teacher' ? (
        <TeacherRegistrationForm defaultInstrument={divisionName} />
      ) : (
        <RegistrationForm
          division={divisionName}
          sections={sections}
          timePeriods={timePeriods}
          feeType={feeType}
        />
      )}
    </div>
  )
}
