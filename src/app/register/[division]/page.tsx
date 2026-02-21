import { notFound } from 'next/navigation'
import Link from 'next/link'
import DivisionRegistration from '@/components/forms/DivisionRegistration'
import { getDivisionById, getAllDivisions } from '@/content/divisions'
import { config } from '@/lib/config'

export function generateStaticParams() {
  return getAllDivisions().map((d) => ({ division: d.id }))
}

function VocalClassicalRequirements() {
  const sections = [
    { label: 'Section I: Age 8 and under (6 min)', a: 'One English Art song or folk song', b: 'One classical Art song' },
    { label: 'Section II: Age 9-10 (6 min)', a: 'One English song by a British or American composer', b: 'Any classical Italian art song from the 17th or 18th Century' },
    { label: 'Section III: Age 11-12 (8 min)', a: 'One English song by a British or American composer', b: 'Any classical Italian art song' },
    { label: 'Section IV: Age 13-14 (8 min)', a: 'Any classical Italian art song', b: 'One classical art song in any language other than Italian (original language)' },
    { label: 'Section V: Age 15-16 (8 min)', a: '(1) An Oratorio Aria or an aria from the standard operatic repertoire in the original language and key. (2) One French art song or German lied in the original language.', b: 'One classical art song in any language (must be a different language from Selection A)' },
    { label: 'Section VI: Age 17-18 (10 min)', a: '(1) An Oratorio Aria or an aria from the standard operatic repertoire in the original language and key. (2) One French art song or German lied in the original language.', b: 'One classical art song in any language (must be a different language from Selection A)' },
    { label: 'Section VII: Age 19-20 (10 min)', a: 'Any classical repertoire in contrasting styles (should include at least one Opera aria in the original key and language)', b: '' },
    { label: 'Section VIII: Age 22 and above (12 min)', a: 'Any classical repertoire in contrasting styles (should include at least one Opera aria in the original key and language)', b: '' },
  ]

  return (
    <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
      <h2 className="font-semibold text-navy mb-2">Repertoire Requirements</h2>
      <p className="text-sm text-text-secondary mb-4">
        Choose one selection from Group A and Group B in a contrasting style.
        You may cut the accompaniment to meet the time limit. If it is longer than the suggested time,
        the judges might cut your performance short.
      </p>
      <div className="space-y-3">
        {sections.map((s, i) => (
          <div key={i} className="p-3 bg-cream/50 rounded-lg">
            <p className="text-sm font-semibold text-charcoal mb-1">{s.label}</p>
            <p className="text-sm text-text-secondary">
              <span className="font-medium text-navy">A.</span> {s.a}
            </p>
            {s.b && (
              <p className="text-sm text-text-secondary">
                <span className="font-medium text-navy">B.</span> {s.b}
              </p>
            )}
          </div>
        ))}
      </div>
      <ul className="text-sm text-text-secondary space-y-1 mt-4">
        <li className="flex items-start gap-2"><span className="text-gold">•</span>You may cut the long piano part to fit in the time frame.</li>
        <li className="flex items-start gap-2"><span className="text-gold">•</span>You must bring your original scores or sheet music purchased online and downloaded/printed must be accompanied by a receipt.</li>
        <li className="flex items-start gap-2"><span className="text-gold">•</span>Vocal participants must provide their own accompanist. Teachers may not accompany their vocal students.</li>
      </ul>
    </div>
  )
}

function VocalMusicalTheaterRequirements() {
  const sections = [
    'Section I: Age 8 and under (6 min)',
    'Section II: Age 9-10 (6 min)',
    'Section III: Age 11-12 (8 min)',
    'Section IV: Age 13-14 (8 min)',
    'Section V: Age 15-16 (8 min)',
    'Section VI: Age 17-18 (10 min)',
    'Section VII: Age 19-20 (10 min)',
    'Section VIII: Age 21 and above (10 min)',
  ]

  return (
    <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
      <h2 className="font-semibold text-navy mb-2">Repertoire Requirements</h2>
      <p className="text-sm text-text-secondary mb-4">
        Please be prepared with an age-appropriate pair of contrasting songs from musical theater shows.
        There is so much new literature coming out regularly that we ask that you use your discretion in choosing
        repertoire in the older categories. If you have any questions about appropriate repertoire, check with the Chairman.
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        {sections.map((s, i) => (
          <span key={i} className="text-xs bg-cream px-3 py-1.5 rounded-full text-charcoal">
            {s}
          </span>
        ))}
      </div>
      <ul className="text-sm text-text-secondary space-y-1">
        <li className="flex items-start gap-2"><span className="text-gold">•</span>You may cut the long piano part to fit in the time frame.</li>
        <li className="flex items-start gap-2"><span className="text-gold">•</span>You must bring your original scores or sheet music purchased online and downloaded/printed must be accompanied by a receipt.</li>
        <li className="flex items-start gap-2"><span className="text-gold">•</span>Vocal participants must provide their own accompanist. Teachers may not accompany their vocal students.</li>
      </ul>
    </div>
  )
}

export default function DivisionRegistrationPage({
  params,
}: {
  params: { division: string }
}) {
  const divisionId = params.division
  const division = getDivisionById(divisionId)

  if (!division) {
    notFound()
  }

  const isVocal = divisionId.startsWith('vocal-')

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/register" className="text-sm text-navy hover:text-gold mb-4 inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to divisions
          </Link>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-charcoal mt-4">
            {division.name} Registration
          </h1>
          <p className="text-text-muted mt-2">
            {config.currentYear} Musical Arts Competition of Orange County
          </p>
        </div>

        {/* Vocal Repertoire Requirements */}
        {divisionId === 'vocal-classical' && <VocalClassicalRequirements />}
        {divisionId === 'vocal-musical-theater' && <VocalMusicalTheaterRequirements />}

        {/* Requirements (shown for all roles) */}
        {!isVocal && division.requirements.length > 0 && (
          <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
            <h2 className="font-semibold text-navy mb-3">{division.name} Requirements</h2>
            <ul className="text-sm text-text-secondary space-y-2">
              {division.requirements.map((req, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-gold">•</span>
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Role Selection + Form */}
        <DivisionRegistration
          divisionName={division.name}
          sections={division.sections}
          timePeriods={division.timePeriods}
          feeType={division.feeType}
          available={division.available}
        />
      </div>
    </div>
  )
}
