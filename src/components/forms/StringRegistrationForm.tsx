'use client'

import { useState } from 'react'
import FileUpload from './FileUpload'
import PayPalButton from './PayPalButton'
import { config } from '@/lib/config'

interface StringRegistrationFormProps {
  division: string
  sections: { value: string; label: string }[]
  feeType: 'solo' | 'chamber'
}

const STRING_INSTRUMENTS = ['Violin', 'Viola', 'Cello'] as const

const initialFormData = {
  // Student
  studentFirstName: '',
  studentMiddleName: '',
  studentLastName: '',
  instrument: '',
  section: '',
  studentAge: '',
  dateOfBirth: '',
  proofOfAgeUrl: '',
  composer: '',
  pieceTitle: '',
  duration: '',
  // Pianist
  pianistName: '',
  pianistPhone: '',
  pianistEmail: '',
  // Teacher
  teacherName: '',
  teacherPhone: '',
  teacherEmail: '',
  // Parent
  parentName: '',
  parentPhone: '',
  parentEmail: '',
  parentStreetAddress: '',
  parentStreetAddress2: '',
  parentCity: '',
  parentState: '',
  parentZipCode: '',
  // Cross-division
  crossDivision: '',
  crossDivisionDetails: '',
  // Hidden
  division: '',
}

export default function StringRegistrationForm({
  division,
  sections,
  feeType,
}: StringRegistrationFormProps) {
  const entryFee = feeType === 'chamber' ? config.fees.chamber.amount : config.fees.solo.amount
  const [formData, setFormData] = useState({ ...initialFormData, division })
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{
    success: boolean; registrationId?: number; sheetName?: string; error?: string
  } | null>(null)
  const [paymentComplete, setPaymentComplete] = useState(false)
  const [showValidation, setShowValidation] = useState(false)

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const step1Fields = [
    'studentFirstName', 'studentLastName', 'instrument', 'section',
    'studentAge', 'dateOfBirth', 'composer', 'pieceTitle', 'duration',
  ] as const

  const step2Fields = [
    'pianistName', 'pianistPhone', 'pianistEmail',
    'teacherName', 'teacherPhone', 'teacherEmail',
    'parentName', 'parentPhone', 'parentEmail',
    'parentStreetAddress', 'parentCity', 'parentState', 'parentZipCode',
    'crossDivision',
  ] as const

  const canAdvance = (fields: readonly (keyof typeof formData)[]) =>
    fields.every((f) => formData[f].trim() !== '')

  const isFieldEmpty = (field: keyof typeof formData) =>
    showValidation && formData[field].trim() === ''

  const validationBorder = (field: keyof typeof formData) =>
    isFieldEmpty(field) ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-300'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/string-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const result = await response.json()
      if (response.ok) {
        setSubmitResult({ success: true, registrationId: result.registrationId, sheetName: result.sheetName })
      } else {
        setSubmitResult({ success: false, error: result.error })
      }
    } catch {
      setSubmitResult({ success: false, error: 'Network error. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Success: payment complete
  if (submitResult?.success && paymentComplete) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-lg text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-heading font-bold text-charcoal mb-4">Payment Complete!</h2>
        <p className="text-text-muted">Your registration and payment have been received. You will receive a confirmation email shortly.</p>
      </div>
    )
  }

  // Success: show PayPal
  if (submitResult?.success) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-heading font-bold text-charcoal mb-4">Registration Submitted!</h2>
          <p className="text-text-muted mb-2">Please complete your payment below to finalize your entry.</p>
          <p className="text-2xl font-heading font-bold text-gold-dark">${entryFee}.00</p>
        </div>
        <PayPalButton
          registrationId={submitResult.registrationId!}
          sheetName={submitResult.sheetName || division}
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
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= s ? 'bg-gold text-navy-dark' : 'bg-gray-200 text-text-muted'
            }`}>
              {s}
            </div>
            {s < 3 && <div className={`w-12 h-1 ${step > s ? 'bg-gold' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
        {/* Step 1: Student Info & Piece */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-heading font-semibold text-charcoal mb-6">Student & Competition Information</h2>

            {/* Student Name */}
            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold text-navy uppercase tracking-wider">Student Name</legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">First Name <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.studentFirstName} onChange={(e) => updateField('studentFirstName', e.target.value)}
                    className={`w-full px-4 py-2 border ${validationBorder('studentFirstName')} rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent`} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Middle Name</label>
                  <input type="text" value={formData.studentMiddleName} onChange={(e) => updateField('studentMiddleName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Last Name <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.studentLastName} onChange={(e) => updateField('studentLastName', e.target.value)}
                    className={`w-full px-4 py-2 border ${validationBorder('studentLastName')} rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent`} required />
                </div>
              </div>
            </fieldset>

            {/* Instrument */}
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold text-navy uppercase tracking-wider">Instrument <span className="text-red-500">*</span></legend>
              <div className="flex gap-4">
                {STRING_INSTRUMENTS.map((inst) => (
                  <label key={inst} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="radio" name="instrument" value={inst} checked={formData.instrument === inst}
                      onChange={(e) => updateField('instrument', e.target.value)} className="text-gold focus:ring-gold" />
                    {inst}
                  </label>
                ))}
              </div>
              {showValidation && !formData.instrument && <p className="text-xs text-red-500">Please select an instrument.</p>}
            </fieldset>

            {/* Section */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">Section <span className="text-red-500">*</span></label>
              <select value={formData.section} onChange={(e) => updateField('section', e.target.value)}
                className={`w-full px-4 py-2 border ${validationBorder('section')} rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent`} required>
                <option value="">Select your section</option>
                {sections.map((s) => (
                  <option key={s.value} value={s.label}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Age & DOB */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Age (as of April 30) <span className="text-red-500">*</span></label>
                <input type="number" min="4" max="25" value={formData.studentAge} onChange={(e) => updateField('studentAge', e.target.value)}
                  className={`w-full px-4 py-2 border ${validationBorder('studentAge')} rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent`} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Date of Birth <span className="text-red-500">*</span></label>
                <input type="date" value={formData.dateOfBirth} onChange={(e) => updateField('dateOfBirth', e.target.value)}
                  className={`w-full px-4 py-2 border ${validationBorder('dateOfBirth')} rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent`} required />
              </div>
            </div>

            {/* Proof of Age */}
            <FileUpload label="Proof of Age (Birth Certificate or Passport)" required onUpload={(url) => updateField('proofOfAgeUrl', url)} />

            {/* Competition Piece */}
            <fieldset className="space-y-4 p-4 bg-cream/50 rounded-lg">
              <legend className="text-sm font-semibold text-navy">Competition Piece</legend>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Composer <span className="text-red-500">*</span></label>
                <input type="text" value={formData.composer} onChange={(e) => updateField('composer', e.target.value)}
                  className={`w-full px-4 py-2 border ${validationBorder('composer')} rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent`} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Title (with Opus/Key/Movement) <span className="text-red-500">*</span></label>
                <input type="text" value={formData.pieceTitle} onChange={(e) => updateField('pieceTitle', e.target.value)}
                  className={`w-full px-4 py-2 border ${validationBorder('pieceTitle')} rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent`} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Duration <span className="text-red-500">*</span></label>
                <input type="text" placeholder="e.g. 5 min" value={formData.duration} onChange={(e) => updateField('duration', e.target.value)}
                  className={`w-full px-4 py-2 border ${validationBorder('duration')} rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent`} required />
              </div>
            </fieldset>

            {showValidation && !canAdvance(step1Fields) && (
              <p className="text-sm text-red-600">Please fill in all required fields.</p>
            )}

            <div className="flex justify-end pt-4">
              <button type="button" onClick={() => {
                if (canAdvance(step1Fields)) { setShowValidation(false); setStep(2) } else { setShowValidation(true) }
              }} className="btn btn-gold">
                Next: Contact Information
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Pianist / Teacher / Parent / Cross-division */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-heading font-semibold text-charcoal mb-6">Contact Information</h2>

            {/* Pianist */}
            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold text-navy uppercase tracking-wider">Pianist (Accompanist) Information <span className="text-red-500">*</span></legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Name <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.pianistName} onChange={(e) => updateField('pianistName', e.target.value)}
                    className={`w-full px-4 py-2 border ${validationBorder('pianistName')} rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent`} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Phone <span className="text-red-500">*</span></label>
                  <input type="tel" value={formData.pianistPhone} onChange={(e) => updateField('pianistPhone', e.target.value)}
                    className={`w-full px-4 py-2 border ${validationBorder('pianistPhone')} rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent`} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Email <span className="text-red-500">*</span></label>
                  <input type="email" value={formData.pianistEmail} onChange={(e) => updateField('pianistEmail', e.target.value)}
                    className={`w-full px-4 py-2 border ${validationBorder('pianistEmail')} rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent`} required />
                </div>
              </div>
            </fieldset>

            {/* Teacher */}
            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold text-navy uppercase tracking-wider">Teacher Information <span className="text-red-500">*</span></legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Name <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.teacherName} onChange={(e) => updateField('teacherName', e.target.value)}
                    className={`w-full px-4 py-2 border ${validationBorder('teacherName')} rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent`} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Phone <span className="text-red-500">*</span></label>
                  <input type="tel" value={formData.teacherPhone} onChange={(e) => updateField('teacherPhone', e.target.value)}
                    className={`w-full px-4 py-2 border ${validationBorder('teacherPhone')} rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent`} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Email <span className="text-red-500">*</span></label>
                  <input type="email" value={formData.teacherEmail} onChange={(e) => updateField('teacherEmail', e.target.value)}
                    className={`w-full px-4 py-2 border ${validationBorder('teacherEmail')} rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent`} required />
                </div>
              </div>
            </fieldset>

            {/* Parent */}
            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold text-navy uppercase tracking-wider">Parent/Guardian Information <span className="text-red-500">*</span></legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Name <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.parentName} onChange={(e) => updateField('parentName', e.target.value)}
                    className={`w-full px-4 py-2 border ${validationBorder('parentName')} rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent`} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Phone <span className="text-red-500">*</span></label>
                  <input type="tel" value={formData.parentPhone} onChange={(e) => updateField('parentPhone', e.target.value)}
                    className={`w-full px-4 py-2 border ${validationBorder('parentPhone')} rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent`} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Email <span className="text-red-500">*</span></label>
                  <input type="email" value={formData.parentEmail} onChange={(e) => updateField('parentEmail', e.target.value)}
                    className={`w-full px-4 py-2 border ${validationBorder('parentEmail')} rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent`} required />
                </div>
              </div>
              <div className="pt-2 space-y-4">
                <label className="block text-sm font-medium text-charcoal">Mailing Address <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Street Address" value={formData.parentStreetAddress} onChange={(e) => updateField('parentStreetAddress', e.target.value)}
                  className={`w-full px-4 py-2 border ${validationBorder('parentStreetAddress')} rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent`} required />
                <input type="text" placeholder="Street Address Line 2" value={formData.parentStreetAddress2} onChange={(e) => updateField('parentStreetAddress2', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <input type="text" placeholder="City" value={formData.parentCity} onChange={(e) => updateField('parentCity', e.target.value)}
                    className={`col-span-2 px-4 py-2 border ${validationBorder('parentCity')} rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent`} required />
                  <input type="text" placeholder="State" value={formData.parentState} onChange={(e) => updateField('parentState', e.target.value)}
                    className={`px-4 py-2 border ${validationBorder('parentState')} rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent`} required />
                  <input type="text" placeholder="Zip Code" value={formData.parentZipCode} onChange={(e) => updateField('parentZipCode', e.target.value)}
                    className={`px-4 py-2 border ${validationBorder('parentZipCode')} rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent`} required />
                </div>
              </div>
            </fieldset>

            {/* Cross-division */}
            <fieldset className="space-y-3 p-4 bg-cream/50 rounded-lg">
              <legend className="text-sm font-semibold text-navy">
                Will you compete in a different division other than Strings? <span className="text-red-500">*</span>
              </legend>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="radio" name="crossDivision" value="No" checked={formData.crossDivision === 'No'}
                    onChange={(e) => updateField('crossDivision', e.target.value)} className="text-gold focus:ring-gold" />
                  No
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="radio" name="crossDivision" value="Yes" checked={formData.crossDivision === 'Yes'}
                    onChange={(e) => updateField('crossDivision', e.target.value)} className="text-gold focus:ring-gold" />
                  Yes
                </label>
              </div>
              {formData.crossDivision === 'Yes' && (
                <div className="pt-2">
                  <label className="block text-sm font-medium text-charcoal mb-1">
                    Which division, instrument & section?
                  </label>
                  <input type="text" placeholder="e.g. Piano, Division V" value={formData.crossDivisionDetails}
                    onChange={(e) => updateField('crossDivisionDetails', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent" />
                </div>
              )}
            </fieldset>

            {showValidation && !canAdvance(step2Fields) && (
              <p className="text-sm text-red-600">Please fill in all required fields.</p>
            )}

            <div className="flex justify-between pt-4">
              <button type="button" onClick={() => setStep(1)} className="btn bg-gray-100 text-charcoal hover:bg-gray-200">Back</button>
              <button type="button" onClick={() => {
                if (canAdvance(step2Fields)) { setShowValidation(false); setStep(3) } else { setShowValidation(true) }
              }} className="btn btn-gold">
                Next: Review
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-heading font-semibold text-charcoal mb-6">Review & Submit</h2>

            <div className="space-y-4">
              <div className="p-4 bg-cream/50 rounded-lg">
                <h3 className="font-semibold text-navy mb-2">Student</h3>
                <p className="text-sm text-text-secondary">
                  {formData.studentFirstName} {formData.studentMiddleName} {formData.studentLastName}<br />
                  {formData.instrument} | Age: {formData.studentAge} | DOB: {formData.dateOfBirth}
                </p>
              </div>

              <div className="p-4 bg-cream/50 rounded-lg">
                <h3 className="font-semibold text-navy mb-2">Competition</h3>
                <p className="text-sm text-text-secondary">
                  {division} - {formData.section}<br />
                  {formData.composer} — {formData.pieceTitle} ({formData.duration})
                </p>
              </div>

              <div className="p-4 bg-cream/50 rounded-lg">
                <h3 className="font-semibold text-navy mb-2">Pianist (Accompanist)</h3>
                <p className="text-sm text-text-secondary">
                  {formData.pianistName} | {formData.pianistPhone} | {formData.pianistEmail}
                </p>
              </div>

              <div className="p-4 bg-cream/50 rounded-lg">
                <h3 className="font-semibold text-navy mb-2">Teacher</h3>
                <p className="text-sm text-text-secondary">
                  {formData.teacherName} | {formData.teacherPhone} | {formData.teacherEmail}
                </p>
              </div>

              <div className="p-4 bg-cream/50 rounded-lg">
                <h3 className="font-semibold text-navy mb-2">Parent/Guardian</h3>
                <p className="text-sm text-text-secondary">
                  {formData.parentName} | {formData.parentPhone} | {formData.parentEmail}<br />
                  {formData.parentStreetAddress}{formData.parentStreetAddress2 ? `, ${formData.parentStreetAddress2}` : ''}<br />
                  {formData.parentCity}, {formData.parentState} {formData.parentZipCode}
                </p>
              </div>

              {formData.crossDivision === 'Yes' && formData.crossDivisionDetails && (
                <div className="p-4 bg-cream/50 rounded-lg">
                  <h3 className="font-semibold text-navy mb-2">Cross-Division Entry</h3>
                  <p className="text-sm text-text-secondary">{formData.crossDivisionDetails}</p>
                </div>
              )}

              <div className="p-4 bg-gold/10 border border-gold/30 rounded-lg">
                <h3 className="font-semibold text-navy mb-2">Entry Fee</h3>
                <p className="text-2xl font-heading font-bold text-gold-dark">${entryFee}.00</p>
                <p className="text-sm text-text-muted mt-1">Payment will be processed after submission via PayPal.</p>
              </div>
            </div>

            {submitResult?.error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{submitResult.error}</div>
            )}

            <div className="flex justify-between pt-4">
              <button type="button" onClick={() => setStep(2)} className="btn bg-gray-100 text-charcoal hover:bg-gray-200">Back</button>
              <button type="submit" disabled={isSubmitting} className="btn btn-gold disabled:opacity-50">
                {isSubmitting ? 'Submitting...' : 'Submit Registration'}
              </button>
            </div>
          </div>
        )}
      </div>
    </form>
  )
}
