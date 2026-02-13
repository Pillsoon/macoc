'use client'

import { useState } from 'react'
import FileUpload from './FileUpload'
import PayPalButton from './PayPalButton'
import { config } from '@/lib/config'

interface RegistrationFormProps {
  division: string
  sections: { value: string; label: string }[]
  timePeriods: { value: string; label: string }[]
  feeType?: 'solo' | 'chamber'
}

const initialFormData = {
  // Teacher
  teacherFirstName: '',
  teacherLastName: '',
  teacherEmail: '',
  teacherPhone: '',
  // Student
  studentFirstName: '',
  studentMiddleName: '',
  studentLastName: '',
  studentEmail: '',
  dateOfBirth: '',
  studentAge: '',
  proofOfAgeUrl: '',
  // Address
  streetAddress: '',
  streetAddress2: '',
  city: '',
  state: '',
  zipCode: '',
  // Competition
  division: '',
  section: '',
  // Repertoire
  repertoire1Title: '',
  repertoire1Composer: '',
  repertoire1TimePeriod: '',
  repertoire2Title: '',
  repertoire2Composer: '',
  repertoire2TimePeriod: '',
}

export default function RegistrationForm({ division, sections, timePeriods, feeType = 'solo' }: RegistrationFormProps) {
  const entryFee = feeType === 'chamber' ? config.fees.chamber.amount : config.fees.solo.amount
  const [formData, setFormData] = useState({ ...initialFormData, division })
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{ success: boolean; registrationId?: number; error?: string } | null>(null)
  const [paymentComplete, setPaymentComplete] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const step1Fields = [
    'teacherFirstName', 'teacherLastName', 'teacherEmail', 'teacherPhone',
    'studentFirstName', 'studentLastName', 'studentEmail',
    'dateOfBirth', 'studentAge',
    'streetAddress', 'city', 'state', 'zipCode',
  ] as const

  const step2Fields = [
    'section',
    'repertoire1Title', 'repertoire1Composer', 'repertoire1TimePeriod',
    'repertoire2Title', 'repertoire2Composer', 'repertoire2TimePeriod',
  ] as const

  const canAdvance = (fields: readonly (keyof typeof formData)[]) =>
    fields.every((f) => formData[f].trim() !== '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitResult({ success: true, registrationId: result.registrationId })
      } else {
        setSubmitResult({ success: false, error: result.error })
      }
    } catch (error) {
      setSubmitResult({ success: false, error: 'Network error. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Success screen
  if (submitResult?.success) {
    if (paymentComplete) {
      return (
        <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-lg text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-heading font-bold text-charcoal mb-4">
            Payment Complete!
          </h2>
          <p className="text-text-muted">
            Your registration and payment have been received. You will receive a confirmation email shortly.
          </p>
        </div>
      )
    }

    return (
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-heading font-bold text-charcoal mb-4">
            Registration Submitted!
          </h2>
          <p className="text-text-muted mb-2">
            Please complete your payment below to finalize your entry.
          </p>
          <p className="text-2xl font-heading font-bold text-gold-dark">${entryFee}.00</p>
        </div>
        <PayPalButton
          registrationId={submitResult.registrationId!}
          amount={entryFee}
          description={`MACOC ${division} Entry`}
          onSuccess={() => setPaymentComplete(true)}
        />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s ? 'bg-gold text-navy-dark' : 'bg-gray-200 text-text-muted'
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div className={`w-12 h-1 ${step > s ? 'bg-gold' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
        {/* Step 1: Student & Teacher Info */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-heading font-semibold text-charcoal mb-6">
              Student & Teacher Information
            </h2>

            {/* Agreement */}
            <div className="p-4 bg-cream rounded-lg">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-gold border-gray-300 rounded focus:ring-gold"
                  required
                />
                <span className="text-sm text-text-secondary">
                  I understand that students can only be entered by their teacher.
                  A student entered under another teacher&apos;s name will be disqualified.
                </span>
              </label>
            </div>

            {/* Teacher Info */}
            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold text-navy uppercase tracking-wider">
                Teacher Information
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.teacherFirstName}
                    onChange={(e) => updateField('teacherFirstName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.teacherLastName}
                    onChange={(e) => updateField('teacherLastName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.teacherEmail}
                    onChange={(e) => updateField('teacherEmail', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.teacherPhone}
                    onChange={(e) => updateField('teacherPhone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </fieldset>

            {/* Student Info */}
            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold text-navy uppercase tracking-wider">
                Student Information
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.studentFirstName}
                    onChange={(e) => updateField('studentFirstName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    value={formData.studentMiddleName}
                    onChange={(e) => updateField('studentMiddleName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.studentLastName}
                    onChange={(e) => updateField('studentLastName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">
                  Student Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.studentEmail}
                  onChange={(e) => updateField('studentEmail', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateField('dateOfBirth', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">
                    Age (as of April 30) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="4"
                    max="25"
                    value={formData.studentAge}
                    onChange={(e) => updateField('studentAge', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <FileUpload
                label="Proof of Age (Birth Certificate or Passport)"
                required
                onUpload={(url) => updateField('proofOfAgeUrl', url)}
              />

              {/* Address */}
              <div className="pt-4 space-y-4">
                <label className="block text-sm font-medium text-charcoal">
                  Student Mailing Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Street Address"
                  value={formData.streetAddress}
                  onChange={(e) => updateField('streetAddress', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  required
                />
                <input
                  type="text"
                  placeholder="Street Address Line 2"
                  value={formData.streetAddress2}
                  onChange={(e) => updateField('streetAddress2', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    className="col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                    required
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) => updateField('state', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Zip Code"
                    value={formData.zipCode}
                    onChange={(e) => updateField('zipCode', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </fieldset>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!agreedToTerms || !canAdvance(step1Fields)}
                className="btn btn-gold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next: Repertoire
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Repertoire */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-heading font-semibold text-charcoal mb-6">
              Repertoire Entry - {division}
            </h2>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">
                Section <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.section}
                onChange={(e) => updateField('section', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                required
              >
                <option value="">Select your section</option>
                {sections.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Repertoire 1 */}
            <fieldset className="space-y-4 p-4 bg-cream/50 rounded-lg">
              <legend className="text-sm font-semibold text-navy">Repertoire No. 1</legend>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">
                  Title (with Opus/Key/Movement) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.repertoire1Title}
                  onChange={(e) => updateField('repertoire1Title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">
                  Composer <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.repertoire1Composer}
                  onChange={(e) => updateField('repertoire1Composer', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">
                  Time Period <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.repertoire1TimePeriod}
                  onChange={(e) => updateField('repertoire1TimePeriod', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  required
                >
                  <option value="">Select time period</option>
                  {timePeriods.map((tp) => (
                    <option key={tp.value} value={tp.value}>{tp.label}</option>
                  ))}
                </select>
              </div>
            </fieldset>

            {/* Repertoire 2 */}
            <fieldset className="space-y-4 p-4 bg-cream/50 rounded-lg">
              <legend className="text-sm font-semibold text-navy">Repertoire No. 2</legend>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">
                  Title (with Opus/Key/Movement) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.repertoire2Title}
                  onChange={(e) => updateField('repertoire2Title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">
                  Composer <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.repertoire2Composer}
                  onChange={(e) => updateField('repertoire2Composer', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">
                  Time Period <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.repertoire2TimePeriod}
                  onChange={(e) => updateField('repertoire2TimePeriod', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  required
                >
                  <option value="">Select time period</option>
                  {timePeriods.map((tp) => (
                    <option key={tp.value} value={tp.value}>{tp.label}</option>
                  ))}
                </select>
              </div>
            </fieldset>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn bg-gray-100 text-charcoal hover:bg-gray-200"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={!canAdvance(step2Fields)}
                className="btn btn-gold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next: Review
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-heading font-semibold text-charcoal mb-6">
              Review & Submit
            </h2>

            <div className="space-y-4">
              <div className="p-4 bg-cream/50 rounded-lg">
                <h3 className="font-semibold text-navy mb-2">Teacher</h3>
                <p className="text-sm text-text-secondary">
                  {formData.teacherFirstName} {formData.teacherLastName}<br />
                  {formData.teacherEmail} | {formData.teacherPhone}
                </p>
              </div>

              <div className="p-4 bg-cream/50 rounded-lg">
                <h3 className="font-semibold text-navy mb-2">Student</h3>
                <p className="text-sm text-text-secondary">
                  {formData.studentFirstName} {formData.studentMiddleName} {formData.studentLastName}<br />
                  {formData.studentEmail}<br />
                  Age: {formData.studentAge} | DOB: {formData.dateOfBirth}
                </p>
              </div>

              <div className="p-4 bg-cream/50 rounded-lg">
                <h3 className="font-semibold text-navy mb-2">Competition</h3>
                <p className="text-sm text-text-secondary">
                  {division} - {formData.section}
                </p>
              </div>

              <div className="p-4 bg-cream/50 rounded-lg">
                <h3 className="font-semibold text-navy mb-2">Repertoire</h3>
                <div className="text-sm text-text-secondary space-y-2">
                  <p>
                    <strong>1.</strong> {formData.repertoire1Title} - {formData.repertoire1Composer} ({formData.repertoire1TimePeriod})
                  </p>
                  <p>
                    <strong>2.</strong> {formData.repertoire2Title} - {formData.repertoire2Composer} ({formData.repertoire2TimePeriod})
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gold/10 border border-gold/30 rounded-lg">
                <h3 className="font-semibold text-navy mb-2">Entry Fee</h3>
                <p className="text-2xl font-heading font-bold text-gold-dark">${entryFee}.00</p>
                <p className="text-sm text-text-muted mt-1">
                  Payment will be processed after submission via PayPal.
                </p>
              </div>
            </div>

            {submitResult?.error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {submitResult.error}
              </div>
            )}

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn bg-gray-100 text-charcoal hover:bg-gray-200"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-gold disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Registration'}
              </button>
            </div>
          </div>
        )}
      </div>
    </form>
  )
}
