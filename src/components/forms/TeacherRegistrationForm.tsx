'use client'

import { useState } from 'react'
import PayPalButton from './PayPalButton'
import {
  INSTRUMENTS,
  STRING_INSTRUMENT_TRIGGERS,
  STRING_INSTRUMENTS,
  HELP_PREFERENCES,
  SUB_DIVISIONS,
  MEMBERSHIP_PRODUCTS,
} from '@/content/teacher-form'

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
  subDivision: '',
  selectedProducts: [] as string[],
}

interface TeacherRegistrationFormProps {
  defaultInstrument?: string
}

export default function TeacherRegistrationForm({ defaultInstrument }: TeacherRegistrationFormProps = {}) {
  const [formData, setFormData] = useState({
    ...initialFormData,
    ...(defaultInstrument ? { instrument: defaultInstrument } : {}),
  })
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{
    success: boolean
    registrationId?: number
    sheetName?: string
    error?: string
  } | null>(null)
  const [paymentComplete, setPaymentComplete] = useState(false)

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleProduct = (label: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedProducts: prev.selectedProducts.includes(label)
        ? prev.selectedProducts.filter((p) => p !== label)
        : [...prev.selectedProducts, label],
    }))
  }

  const totalAmount = formData.selectedProducts.reduce((sum, label) => {
    const product = MEMBERSHIP_PRODUCTS.find((p) => p.label === label)
    return sum + (product?.price ?? 0)
  }, 0)

  const isStringInstrument = (STRING_INSTRUMENT_TRIGGERS as readonly string[]).includes(
    formData.instrument
  )

  const step1Required = [
    'firstName',
    'lastName',
    'streetAddress',
    'city',
    'state',
    'zipCode',
    'email',
    'mobileNumber',
    'phoneNumber',
    'instrument',
    'helpPreference',
  ] as const

  const canAdvanceStep1 =
    step1Required.every((f) => formData[f].trim() !== '') &&
    (!isStringInstrument || formData.stringInstrument.trim() !== '')

  const hasNonFeeProduct = formData.selectedProducts.some(
    (p) => p !== 'Non-Available Fee'
  )
  const canSubmit = hasNonFeeProduct

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/teacher-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          totalAmount,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitResult({
          success: true,
          registrationId: result.registrationId,
          sheetName: result.sheetName,
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
          sheetName={submitResult.sheetName || 'Teacher Memberships'}
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
                Name <span className="text-red-500">*</span>
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">
                    First Name
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
                    Last Name
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
                Mailing Address <span className="text-red-500">*</span>
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
                  placeholder="State / Province"
                  value={formData.state}
                  onChange={(e) => updateField('state', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  required
                />
                <input
                  type="text"
                  placeholder="Postal / Zip Code"
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
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="example@example.com"
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
                    placeholder="(000) 000-0000"
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
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      updateField('phoneNumber', e.target.value)
                    }
                    placeholder="(000) 000-0000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </fieldset>

            {/* Instrument */}
            {defaultInstrument ? (
              <div className="p-4 bg-cream/50 rounded-lg">
                <p className="text-sm font-semibold text-navy uppercase tracking-wider mb-1">
                  Instrument
                </p>
                <p className="text-charcoal font-medium">{defaultInstrument}</p>
              </div>
            ) : (
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
            )}

            {/* String Teacher Instrument - only shown for string instruments */}
            {isStringInstrument && (
              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-navy uppercase tracking-wider">
                  String Teacher Instrument{' '}
                  <span className="text-red-500">*</span>
                </legend>
                <p className="text-xs text-text-muted">
                  Pick your instrument based on your student&apos;s entry form
                  for Solo division.
                </p>
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
            )}

            {/* Help Preference */}
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold text-navy uppercase tracking-wider">
                Help Preference <span className="text-red-500">*</span>
              </legend>
              <p className="text-xs text-text-muted">
                MACOC would appreciate your help! Please check your preference
                out of the following:
              </p>
              <div className="grid grid-cols-1 gap-2">
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
            </fieldset>

            {/* Sub Division */}
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold text-navy uppercase tracking-wider">
                Sub Division{' '}
                <span className="text-text-muted font-normal normal-case">
                  (optional)
                </span>
              </legend>
              <p className="text-xs text-text-muted">
                If you are submitting students with more than one
                division/instrument.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {SUB_DIVISIONS.map((div) => (
                  <label
                    key={div}
                    className="flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <input
                      type="radio"
                      name="subDivision"
                      value={div}
                      checked={formData.subDivision === div}
                      onChange={(e) =>
                        updateField('subDivision', e.target.value)
                      }
                      className="text-gold focus:ring-gold"
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
                  Mobile: {formData.mobileNumber} | Phone:{' '}
                  {formData.phoneNumber}
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
                  String Instrument:{' '}
                  {formData.stringInstrument || 'N/A'}
                  <br />
                  Help Preference: {formData.helpPreference}
                  {formData.subDivision && (
                    <>
                      <br />
                      Sub Division: {formData.subDivision}
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Membership Product Selection */}
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold text-navy uppercase tracking-wider">
                Membership Products{' '}
                <span className="text-red-500">*</span>
              </legend>
              <div className="space-y-2">
                {MEMBERSHIP_PRODUCTS.map((product) => (
                  <label
                    key={product.label}
                    className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                      formData.selectedProducts.includes(product.label)
                        ? 'border-gold bg-gold/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.selectedProducts.includes(
                          product.label
                        )}
                        onChange={() => toggleProduct(product.label)}
                        className="text-gold focus:ring-gold rounded"
                      />
                      <div>
                        <span className="text-sm font-medium text-charcoal">
                          {product.label}
                        </span>
                        {product.label !== product.description && (
                          <p className="text-xs text-text-muted mt-0.5">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-bold text-navy">
                      ${product.price}.00
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Total */}
            <div className="p-4 bg-gold/10 border border-gold/30 rounded-lg">
              <h3 className="font-semibold text-navy mb-2">Total</h3>
              {formData.selectedProducts.length > 0 ? (
                <div className="text-sm text-text-secondary space-y-1">
                  {formData.selectedProducts.map((label) => {
                    const product = MEMBERSHIP_PRODUCTS.find(
                      (p) => p.label === label
                    )
                    return (
                      <div key={label} className="flex justify-between">
                        <span>{label}</span>
                        <span>${product?.price}.00</span>
                      </div>
                    )
                  })}
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
              ) : (
                <p className="text-sm text-text-muted">
                  Please select a membership product above.
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
