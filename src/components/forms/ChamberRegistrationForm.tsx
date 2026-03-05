'use client'

import { useState } from 'react'
import FileUpload from './FileUpload'
import PayPalButton from './PayPalButton'
import { config } from '@/lib/config'

interface ChamberRegistrationFormProps {
  division: string
  sections: { value: string; label: string }[]
}

const INSTRUMENTATIONS = [
  'String duo',
  'String trio',
  'String quartet',
  'String quintet',
  'String sextet',
  'Piano + string duo',
  'Piano trio',
  'Piano quartet',
  'Piano quintet',
  'Piano sextet',
] as const

const MAX_MEMBERS = 6

export function getRequiredMemberCount(instrumentation: string): number {
  const lower = instrumentation.toLowerCase()
  if (lower.includes('sextet')) return 6
  if (lower.includes('quintet')) return 5
  if (lower.includes('quartet')) return 4
  if (lower.includes('trio') || lower === 'piano + string duo') return 3
  if (lower.includes('duo')) return 2
  return 0
}

interface MemberData {
  name: string
  instrument: string
  age: string
  proofOfAgeUrl: string
}

const emptyMember = (): MemberData => ({
  name: '',
  instrument: '',
  age: '',
  proofOfAgeUrl: '',
})

const initialFormData = {
  section: '',
  instrumentation: '',
  composer: '',
  pieceTitle: '',
  noKeyMovement: '',
  duration: '',
  coachName: '',
  coachPhone: '',
  coachEmail: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  division: '',
}

export default function ChamberRegistrationForm({
  division,
  sections,
}: ChamberRegistrationFormProps) {
  const entryFee = config.fees.chamber.amount
  const [formData, setFormData] = useState({ ...initialFormData, division })
  const [members, setMembers] = useState<MemberData[]>(
    Array.from({ length: MAX_MEMBERS }, emptyMember)
  )
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{
    success: boolean; registrationId?: number; sheetName?: string; error?: string
  } | null>(null)
  const [paymentComplete, setPaymentComplete] = useState(false)
  const [showValidation, setShowValidation] = useState(false)

  const requiredMemberCount = getRequiredMemberCount(formData.instrumentation)
  const totalFee = entryFee * (requiredMemberCount || 1)

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleInstrumentationChange = (value: string) => {
    const prevCount = getRequiredMemberCount(formData.instrumentation)
    const newCount = getRequiredMemberCount(value)
    updateField('instrumentation', value)
    if (newCount < prevCount) {
      setMembers(prev => {
        const next = [...prev]
        for (let i = newCount; i < MAX_MEMBERS; i++) {
          next[i] = emptyMember()
        }
        return next
      })
    }
  }

  const updateMember = (index: number, field: keyof MemberData, value: string) => {
    setMembers(prev => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const isFieldEmpty = (field: keyof typeof formData) =>
    showValidation && formData[field].trim() === ''

  const validationBorder = (field: keyof typeof formData) =>
    isFieldEmpty(field) ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-300'

  const memberValidationBorder = (index: number, field: keyof MemberData) =>
    showValidation && members[index][field].trim() === ''
      ? 'border-red-400 ring-1 ring-red-400'
      : 'border-gray-300'

  // Step 1 validation
  const step1Fields = ['section', 'instrumentation', 'composer', 'pieceTitle', 'noKeyMovement', 'duration'] as const
  const canAdvanceStep1 = () => step1Fields.every(f => formData[f].trim() !== '')

  // Step 2 validation: all shown members must be complete
  const isMemberComplete = (m: MemberData) =>
    m.name.trim() && m.instrument.trim() && m.age.trim() && m.proofOfAgeUrl.trim()
  const visibleMembers = members.slice(0, requiredMemberCount || 0)
  const filledMembers = visibleMembers.filter(isMemberComplete)
  const canAdvanceStep2 = () => {
    if (!requiredMemberCount) return false
    return visibleMembers.every(isMemberComplete)
  }

  // Step 3 validation
  const step3Fields = [
    'coachName', 'coachPhone', 'coachEmail',
    'contactName', 'contactPhone', 'contactEmail',
  ] as const
  const canAdvanceStep3 = () => step3Fields.every(f => formData[f].trim() !== '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canAdvanceStep3()) { setShowValidation(true); return }
    if (!canAdvanceStep2()) {
      setStep(2)
      setShowValidation(true)
      return
    }
    setIsSubmitting(true)
    try {
      const activeMembers = visibleMembers.filter(isMemberComplete)
      const response = await fetch('/api/chamber-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, members: activeMembers }),
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
        <p className="text-text-muted">Your group registration and payment have been received. You will receive a confirmation email shortly.</p>
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
          <p className="text-2xl font-heading font-bold text-gold-dark">${totalFee}.00</p>
          <p className="text-sm text-text-muted">${entryFee} &times; {requiredMemberCount} members</p>
        </div>
        <PayPalButton
          registrationId={submitResult.registrationId!}
          sheetName={submitResult.sheetName || division}
          amount={totalFee}
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
        {/* Top Statement */}
        <div className="p-4 bg-gold/10 border border-gold/30 rounded-lg mb-6 text-sm text-charcoal">
          Each group must submit <strong>one registration per group</strong> listing all members, along with <strong>one payment per group</strong>.
          All required birth documents must be current and submitted at the time of registration.
        </div>

        {/* Step 1: Group Info */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-heading font-semibold text-charcoal mb-6">Group Information</h2>

            {/* Section */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">
                Section <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-text-muted mb-1">(by the oldest member in a group as of April 30)</p>
              <select value={formData.section} onChange={(e) => updateField('section', e.target.value)}
                className={`w-full px-4 py-2 border ${validationBorder('section')} rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent`} required>
                <option value="">Select your section</option>
                {sections.map((s) => (
                  <option key={s.value} value={s.label}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Instrumentation */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">Instrumentation <span className="text-red-500">*</span></label>
              <select value={formData.instrumentation} onChange={(e) => handleInstrumentationChange(e.target.value)}
                className={`w-full px-4 py-2 border ${validationBorder('instrumentation')} rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent`} required>
                <option value="">Select instrumentation</option>
                {INSTRUMENTATIONS.map((inst) => (
                  <option key={inst} value={inst}>{inst}</option>
                ))}
              </select>
            </div>

            {/* Competition Piece */}
            <fieldset className="space-y-4 p-4 bg-cream/50 rounded-lg">
              <legend className="text-sm font-semibold text-navy">Competition Piece</legend>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Composer&apos;s Name <span className="text-red-500">*</span></label>
                <input type="text" value={formData.composer} onChange={(e) => updateField('composer', e.target.value)}
                  className={`w-full px-4 py-2 border ${validationBorder('composer')} rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent`} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Piece / Title <span className="text-red-500">*</span></label>
                <input type="text" value={formData.pieceTitle} onChange={(e) => updateField('pieceTitle', e.target.value)}
                  className={`w-full px-4 py-2 border ${validationBorder('pieceTitle')} rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent`} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">No, Key and Movement <span className="text-red-500">*</span></label>
                <input type="text" placeholder="e.g. No 3 in F Major 1st Movement" value={formData.noKeyMovement} onChange={(e) => updateField('noKeyMovement', e.target.value)}
                  className={`w-full px-4 py-2 border ${validationBorder('noKeyMovement')} rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent`} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Duration (min) <span className="text-red-500">*</span></label>
                <input type="text" placeholder="e.g. 5 min" value={formData.duration} onChange={(e) => updateField('duration', e.target.value)}
                  className={`w-full px-4 py-2 border ${validationBorder('duration')} rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent`} required />
              </div>
            </fieldset>

            {showValidation && !canAdvanceStep1() && (
              <p className="text-sm text-red-600">Please fill in all required fields.</p>
            )}

            <div className="flex justify-end pt-4">
              <button type="button" onClick={() => {
                if (canAdvanceStep1()) { setShowValidation(false); setStep(2) } else { setShowValidation(true) }
              }} className="btn btn-gold">
                Next: Group Members
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Group Members */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-heading font-semibold text-charcoal mb-2">Group Members</h2>
            <p className="text-sm text-text-muted mb-6">
              Enter information for each group member ({requiredMemberCount} members for {formData.instrumentation}).
            </p>

            {visibleMembers.map((member, i) => (
              <fieldset key={i} className="space-y-4 p-4 bg-cream/50 rounded-lg">
                <legend className="text-sm font-semibold text-navy">
                  Member {i + 1} <span className="text-red-500">*</span>
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input type="text" value={member.name} onChange={(e) => updateMember(i, 'name', e.target.value)}
                      className={`w-full px-4 py-2 border ${memberValidationBorder(i, 'name')} rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent`} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">
                      Instrument <span className="text-red-500">*</span>
                    </label>
                    <input type="text" value={member.instrument} onChange={(e) => updateMember(i, 'instrument', e.target.value)}
                      placeholder="e.g. Violin, Piano"
                      className={`w-full px-4 py-2 border ${memberValidationBorder(i, 'instrument')} rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent`} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">
                      Age <span className="text-text-muted font-normal">(as of April 30)</span> <span className="text-red-500">*</span>
                    </label>
                    <input type="number" min="4" max="25" value={member.age} onChange={(e) => updateMember(i, 'age', e.target.value)}
                      className={`w-full px-4 py-2 border ${memberValidationBorder(i, 'age')} rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent`} />
                  </div>
                </div>
                <FileUpload
                  label={`Birth Document (Member ${i + 1})`}
                  required
                  onUpload={(url) => updateMember(i, 'proofOfAgeUrl', url)}
                />
              </fieldset>
            ))}

            {!requiredMemberCount && (
              <p className="text-sm text-text-muted">Please select an instrumentation in Step 1 first.</p>
            )}

            {showValidation && !canAdvanceStep2() && (
              <p className="text-sm text-red-600">
                Please fill in all {requiredMemberCount} members with name, instrument, age, and birth document.
              </p>
            )}

            <div className="flex justify-between pt-4">
              <button type="button" onClick={() => setStep(1)} className="btn bg-gray-100 text-charcoal hover:bg-gray-200">Back</button>
              <button type="button" onClick={() => {
                if (canAdvanceStep2()) { setShowValidation(false); setStep(3) } else { setShowValidation(true) }
              }} className="btn btn-gold">
                Next: Coach & Contact
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Coach, Contact & Review */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-heading font-semibold text-charcoal mb-6">Coach, Contact & Review</h2>

            {/* Coach */}
            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold text-navy uppercase tracking-wider">Main Coach <span className="text-red-500">*</span></legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Name <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.coachName} onChange={(e) => updateField('coachName', e.target.value)}
                    className={`w-full px-4 py-2 border ${validationBorder('coachName')} rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent`} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Phone <span className="text-red-500">*</span></label>
                  <input type="tel" value={formData.coachPhone} onChange={(e) => updateField('coachPhone', e.target.value)}
                    className={`w-full px-4 py-2 border ${validationBorder('coachPhone')} rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent`} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Email <span className="text-red-500">*</span></label>
                  <input type="email" value={formData.coachEmail} onChange={(e) => updateField('coachEmail', e.target.value)}
                    className={`w-full px-4 py-2 border ${validationBorder('coachEmail')} rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent`} required />
                </div>
              </div>
            </fieldset>

            {/* Contact / Parent */}
            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold text-navy uppercase tracking-wider">Main Contact / Parent <span className="text-red-500">*</span></legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Name <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.contactName} onChange={(e) => updateField('contactName', e.target.value)}
                    className={`w-full px-4 py-2 border ${validationBorder('contactName')} rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent`} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Phone <span className="text-red-500">*</span></label>
                  <input type="tel" value={formData.contactPhone} onChange={(e) => updateField('contactPhone', e.target.value)}
                    className={`w-full px-4 py-2 border ${validationBorder('contactPhone')} rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent`} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">Email <span className="text-red-500">*</span></label>
                  <input type="email" value={formData.contactEmail} onChange={(e) => updateField('contactEmail', e.target.value)}
                    className={`w-full px-4 py-2 border ${validationBorder('contactEmail')} rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent`} required />
                </div>
              </div>
            </fieldset>

            {/* Review */}
            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-heading font-semibold text-charcoal">Review</h3>

              <div className="p-4 bg-cream/50 rounded-lg">
                <h4 className="font-semibold text-navy mb-2">Group Info</h4>
                <p className="text-sm text-text-secondary">
                  {division} &mdash; {formData.section}<br />
                  {formData.instrumentation}<br />
                  {formData.composer} &mdash; {formData.pieceTitle}<br />
                  {formData.noKeyMovement}<br />
                  Duration: {formData.duration}{!formData.duration.includes('min') ? ' min' : ''}
                </p>
              </div>

              <div className="p-4 bg-cream/50 rounded-lg">
                <h4 className="font-semibold text-navy mb-2">Group Members ({filledMembers.length})</h4>
                <div className="space-y-1">
                  {visibleMembers.map((m, i) => {
                    if (!m.name.trim()) return null
                    return (
                      <p key={i} className="text-sm text-text-secondary">
                        {i + 1}. {m.name} &mdash; {m.instrument}, Age {m.age}
                      </p>
                    )
                  })}
                </div>
              </div>

              <div className="p-4 bg-cream/50 rounded-lg">
                <h4 className="font-semibold text-navy mb-2">Main Coach</h4>
                <p className="text-sm text-text-secondary">
                  {formData.coachName} | {formData.coachPhone} | {formData.coachEmail}
                </p>
              </div>

              <div className="p-4 bg-cream/50 rounded-lg">
                <h4 className="font-semibold text-navy mb-2">Main Contact / Parent</h4>
                <p className="text-sm text-text-secondary">
                  {formData.contactName} | {formData.contactPhone} | {formData.contactEmail}
                </p>
              </div>

              <div className="p-4 bg-gold/10 border border-gold/30 rounded-lg">
                <h4 className="font-semibold text-navy mb-2">Entry Fee</h4>
                <p className="text-2xl font-heading font-bold text-gold-dark">${totalFee}.00</p>
                <p className="text-sm text-text-muted mt-1">
                  ${entryFee} &times; {requiredMemberCount} members = ${totalFee}
                </p>
                <p className="text-sm text-text-muted">Payment will be processed after submission via PayPal.</p>
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
