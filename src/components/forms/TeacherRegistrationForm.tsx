'use client'

import { useState } from 'react'
import PayPalButton from './PayPalButton'
import { config } from '@/lib/config'

const INSTRUMENTS = [
  'Piano',
  'Vocal: Classical',
  'Vocal: Musical Theater',
  'Strings + Piano Chamber',
  'Strings',
  'Guitar Chamber Music',
  'Classical Guitar',
  'Woodwinds',
] as const

const STRING_INSTRUMENTS = [
  'Violin',
  'Viola',
  'Violin & Viola',
  'Cello',
  'None',
] as const

const HELP_PREFERENCES = [
  'Morning Help',
  'Afternoon Help',
  'Both',
  'Non-available ($60)',
] as const

const SUB_DIVISIONS = [
  'Strings',
  'Vocal',
  'Woodwinds',
  'Guitar',
  'Chamber Music',
] as const

const MEMBERSHIP_TIERS = [
  { label: 'Regular Member', price: 40 },
  { label: 'Patron Member', price: 50 },
  { label: 'Contributing Member', price: 60 },
  { label: 'Sponsor Member', price: 100 },
  { label: 'Emeritus Member (70+)', price: 20 },
] as const

const NON_AVAILABLE_FEE = 60

const initialFormData = {
  firstName: '',
  middleName: '',
  lastName: '',
  streetAddress: '',
  streetAddress2: '',
  city: '',
  state: '',
  zipCode: '',
  email: '',
  mobileNumber: '',
  phoneNumber: '',
  instrument: '',
  stringInstrument: '',
  helpPreference: '',
  subDivisions: [] as string[],
  membershipTier: '',
}

export default function TeacherRegistrationForm() {
  const [formData, setFormData] = useState({ ...initialFormData })
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{
    success: boolean
    registrationId?: number
    error?: string
  } | null>(null)
  const [paymentComplete, setPaymentComplete] = useState(false)

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleSubDivision = (div: string) => {
    setFormData((prev) => ({
      ...prev,
      subDivisions: prev.subDivisions.includes(div)
        ? prev.subDivisions.filter((d) => d !== div)
        : [...prev.subDivisions, div],
    }))
  }

  const isNonAvailable = formData.helpPreference === 'Non-available ($60)'

  const selectedTier = MEMBERSHIP_TIERS.find(
    (t) => t.label === formData.membershipTier
  )
  const tierPrice = selectedTier?.price ?? 0
  const totalAmount = tierPrice + (isNonAvailable ? NON_AVAILABLE_FEE : 0)

  const step1Required = [
    'firstName',
    'lastName',
    'streetAddress',
    'city',
    'state',
    'zipCode',
    'email',
    'mobileNumber',
    'instrument',
    'stringInstrument',
    'helpPreference',
  ] as const

  const canAdvanceStep1 = step1Required.every(
    (f) => formData[f].trim() !== ''
  )

  const canSubmit = formData.membershipTier !== ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/teacher-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          nonAvailableFee: isNonAvailable,
          totalAmount,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitResult({
          success: true,
          registrationId: result.registrationId,
        })
      } else {
        setSubmitResult({ success: false, error: result.error })
      }
    } catch {
      setSubmitResult({
        success: false,
        error: 'Network error. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Payment complete screen
  if (submitResult?.success && paymentComplete) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-lg text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-heading font-bold text-charcoal mb-4">
          Payment Complete!
        </h2>
        <p className="text-text-muted">
          Your membership registration and payment have been received. You will
          receive a confirmation email shortly.
        </p>
      </div>
    )
  }

  // PayPal payment screen
  if (submitResult?.success) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-heading font-bold text-charcoal mb-4">
            Registration Submitted!
          </h2>
          <p className="text-text-muted mb-2">
            Please complete your payment below to finalize your membership.
          </p>
          <p className="text-2xl font-heading font-bold text-gold-dark">
            ${totalAmount}.00
          </p>
        </div>
        <PayPalButton
          registrationId={submitResult.registrationId!}
          amount={totalAmount}
          description="MACOC Teacher Membership"
          onSuccess={() => setPaymentComplete(true)}
        />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s
                  ? 'bg-gold text-navy-dark'
                  : 'bg-gray-200 text-text-muted'
              }`}
            >
              {s}
            </div>
            {s < 2 && (
              <div
                className={`w-12 h-1 ${step > s ? 'bg-gold' : 'bg-gray-200'}`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-heading font-semibold text-charcoal mb-6">
              Teacher Information
            </h2>

            {/* Name */}
            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold text-navy uppercase tracking-wider">
                Name
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
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
                    value={formData.middleName}
                    onChange={(e) => updateField('middleName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </fieldset>

            {/* Mailing Address */}
            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold text-navy uppercase tracking-wider">
                Mailing Address
              </legend>
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
            </fieldset>

            {/* Contact */}
            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold text-navy uppercase tracking-wider">
                Contact
              </legend>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.mobileNumber}
                    onChange={(e) =>
                      updateField('mobileNumber', e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      updateField('phoneNumber', e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
              </div>
            </fieldset>

            {/* Instrument */}
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold text-navy uppercase tracking-wider">
                Instrument <span className="text-red-500">*</span>
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {INSTRUMENTS.map((inst) => (
                  <label
                    key={inst}
                    className="flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <input
                      type="radio"
                      name="instrument"
                      value={inst}
                      checked={formData.instrument === inst}
                      onChange={(e) =>
                        updateField('instrument', e.target.value)
                      }
                      className="text-gold focus:ring-gold"
                    />
                    {inst}
                  </label>
                ))}
              </div>
            </fieldset>

            {/* String Teacher Instrument */}
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold text-navy uppercase tracking-wider">
                String Teacher Instrument{' '}
                <span className="text-red-500">*</span>
              </legend>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {STRING_INSTRUMENTS.map((inst) => (
                  <label
                    key={inst}
                    className="flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <input
                      type="radio"
                      name="stringInstrument"
                      value={inst}
                      checked={formData.stringInstrument === inst}
                      onChange={(e) =>
                        updateField('stringInstrument', e.target.value)
                      }
                      className="text-gold focus:ring-gold"
                    />
                    {inst}
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Help Preference */}
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold text-navy uppercase tracking-wider">
                Help Preference <span className="text-red-500">*</span>
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {HELP_PREFERENCES.map((pref) => (
                  <label
                    key={pref}
                    className="flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <input
                      type="radio"
                      name="helpPreference"
                      value={pref}
                      checked={formData.helpPreference === pref}
                      onChange={(e) =>
                        updateField('helpPreference', e.target.value)
                      }
                      className="text-gold focus:ring-gold"
                    />
                    {pref}
                  </label>
                ))}
              </div>
              {isNonAvailable && (
                <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">
                  A non-available fee of ${NON_AVAILABLE_FEE}.00 will be added
                  to your membership.
                </p>
              )}
            </fieldset>

            {/* Sub Division */}
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold text-navy uppercase tracking-wider">
                Sub Division{' '}
                <span className="text-text-muted font-normal normal-case">
                  (optional)
                </span>
              </legend>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {SUB_DIVISIONS.map((div) => (
                  <label
                    key={div}
                    className="flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={formData.subDivisions.includes(div)}
                      onChange={() => toggleSubDivision(div)}
                      className="text-gold focus:ring-gold rounded"
                    />
                    {div}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!canAdvanceStep1}
                className="btn btn-gold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next: Review & Payment
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Review & Membership Selection */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-heading font-semibold text-charcoal mb-6">
              Review & Submit
            </h2>

            {/* Review Info */}
            <div className="space-y-4">
              <div className="p-4 bg-cream/50 rounded-lg">
                <h3 className="font-semibold text-navy mb-2">
                  Personal Information
                </h3>
                <p className="text-sm text-text-secondary">
                  {formData.firstName} {formData.middleName}{' '}
                  {formData.lastName}
                  <br />
                  {formData.email}
                  <br />
                  Mobile: {formData.mobileNumber}
                  {formData.phoneNumber && (
                    <>
                      {' '}
                      | Phone: {formData.phoneNumber}
                    </>
                  )}
                </p>
              </div>

              <div className="p-4 bg-cream/50 rounded-lg">
                <h3 className="font-semibold text-navy mb-2">Address</h3>
                <p className="text-sm text-text-secondary">
                  {formData.streetAddress}
                  {formData.streetAddress2 && (
                    <>
                      <br />
                      {formData.streetAddress2}
                    </>
                  )}
                  <br />
                  {formData.city}, {formData.state} {formData.zipCode}
                </p>
              </div>

              <div className="p-4 bg-cream/50 rounded-lg">
                <h3 className="font-semibold text-navy mb-2">
                  Teaching Details
                </h3>
                <p className="text-sm text-text-secondary">
                  Instrument: {formData.instrument}
                  <br />
                  String Instrument: {formData.stringInstrument}
                  <br />
                  Help Preference: {formData.helpPreference}
                  {formData.subDivisions.length > 0 && (
                    <>
                      <br />
                      Sub Divisions: {formData.subDivisions.join(', ')}
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Membership Tier Selection */}
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold text-navy uppercase tracking-wider">
                Select Membership Tier{' '}
                <span className="text-red-500">*</span>
              </legend>
              <div className="space-y-2">
                {MEMBERSHIP_TIERS.map((tier) => (
                  <label
                    key={tier.label}
                    className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                      formData.membershipTier === tier.label
                        ? 'border-gold bg-gold/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="membershipTier"
                        value={tier.label}
                        checked={formData.membershipTier === tier.label}
                        onChange={(e) =>
                          updateField('membershipTier', e.target.value)
                        }
                        className="text-gold focus:ring-gold"
                      />
                      <span className="text-sm font-medium text-charcoal">
                        {tier.label}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-navy">
                      ${tier.price}.00
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Total */}
            <div className="p-4 bg-gold/10 border border-gold/30 rounded-lg">
              <h3 className="font-semibold text-navy mb-2">Total</h3>
              {selectedTier && (
                <div className="text-sm text-text-secondary space-y-1">
                  <div className="flex justify-between">
                    <span>{selectedTier.label}</span>
                    <span>${selectedTier.price}.00</span>
                  </div>
                  {isNonAvailable && (
                    <div className="flex justify-between">
                      <span>Non-Available Fee</span>
                      <span>${NON_AVAILABLE_FEE}.00</span>
                    </div>
                  )}
                  <div className="border-t border-gold/30 pt-1 mt-1">
                    <div className="flex justify-between">
                      <span className="font-semibold text-charcoal">
                        Total
                      </span>
                      <span className="text-2xl font-heading font-bold text-gold-dark">
                        ${totalAmount}.00
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {!selectedTier && (
                <p className="text-sm text-text-muted">
                  Please select a membership tier above.
                </p>
              )}
              <p className="text-sm text-text-muted mt-2">
                Payment will be processed after submission via PayPal.
              </p>
            </div>

            {submitResult?.error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {submitResult.error}
              </div>
            )}

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn bg-gray-100 text-charcoal hover:bg-gray-200"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !canSubmit}
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
