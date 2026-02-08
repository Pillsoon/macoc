'use client'

import { useState } from 'react'
import Link from 'next/link'
import winners2025 from '@/content/winners/2025.json'
import winners2024 from '@/content/winners/2024.json'
import winners2023 from '@/content/winners/2023.json'
import winners2022 from '@/content/winners/2022.json'
import winners2021 from '@/content/winners/2021.json'

const winnersData: Record<string, typeof winners2025> = {
  '2025': winners2025,
  '2024': winners2024,
  '2023': winners2023,
  '2022': winners2022,
  '2021': winners2021,
}

const years = ['2025', '2024', '2023', '2022', '2021']

export default function WinnersPage() {
  const [selectedYear, setSelectedYear] = useState('2025')
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null)
  const currentData = winnersData[selectedYear]
  const divisions = currentData?.divisions ?? []
  const filteredDivisions = selectedDivision
    ? divisions.filter(d => d.name === selectedDivision)
    : divisions

  return (
    <div>
      {/* Hero Section */}
      <section className="hero min-h-[300px] flex items-center relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1465847899084-d164df4dedc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')" }}
        />
        <div className="hero-overlay" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <span className="badge badge-gold mb-4">Hall of Fame</span>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
            Past Winners
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Celebrating Excellence in Musical Performance
          </p>
        </div>
      </section>

      {/* Year Tabs */}
      <section className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2 py-4">
            {years.map((year) => (
              <button
                key={year}
                onClick={() => {
                  if (winnersData[year]) {
                    setSelectedYear(year)
                    setSelectedDivision(null)
                  }
                }}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                  selectedYear === year
                    ? 'bg-navy text-white shadow-md'
                    : winnersData[year]
                    ? 'bg-gray-100 text-text-secondary hover:bg-gold/10 hover:text-navy'
                    : 'bg-gray-50 text-text-muted cursor-not-allowed'
                }`}
                disabled={!winnersData[year]}
              >
                {year}
              </button>
            ))}
          </div>

          {/* Division Filters */}
          {divisions.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 pb-4">
              <button
                onClick={() => setSelectedDivision(null)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedDivision === null
                    ? 'bg-gold text-navy-dark shadow-sm'
                    : 'bg-gray-100 text-text-secondary hover:bg-gold/10 border border-gray-200'
                }`}
              >
                All Divisions
              </button>
              {divisions.map((d) => (
                <button
                  key={d.name}
                  onClick={() => setSelectedDivision(d.name)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedDivision === d.name
                      ? 'bg-gold text-navy-dark shadow-sm'
                      : 'bg-gray-100 text-text-secondary hover:bg-gold/10 border border-gray-200'
                  }`}
                >
                  {d.icon} {d.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Winners Content */}
      <section className="section bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {currentData ? (
            <div className="space-y-12">
              {filteredDivisions.map((division) => (
                <DivisionSection key={division.name} division={division} />
              ))}

              {/* Winners Concert Info */}
              <div className="bg-navy rounded-2xl p-8 text-center">
                <span className="text-4xl mb-4 block">🎭</span>
                <h3 className="font-heading text-2xl text-white mb-3">Winners&apos; Concert</h3>
                <p className="text-white/70 max-w-xl mx-auto mb-6">
                  First-place winners from each division are invited to perform at the annual Winners&apos; Concert at the Richard Nixon Presidential Library.
                </p>
                <Link href="/about" className="btn btn-gold">
                  Learn More
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <span className="text-6xl mb-6 block">🎵</span>
              <h3 className="font-heading text-2xl text-charcoal mb-2">Coming Soon</h3>
              <p className="text-text-muted">
                Winners data for {selectedYear} will be available after the competition.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gold py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-navy-dark mb-4">
            Want to See Your Name Here?
          </h2>
          <p className="text-navy-dark/80 mb-6">
            Register for the next competition and showcase your talent.
          </p>
          <Link href="/competition/registration" className="btn btn-primary">
            Register Now
          </Link>
        </div>
      </section>
    </div>
  )
}

interface Division {
  name: string
  icon: string
  subsections?: {
    name: string
    sections: Section[]
  }[]
  sections?: Section[]
}

interface Section {
  name: string
  winners: {
    place: string
    name: string
  }[]
}

function DivisionSection({ division }: { division: Division }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-gold/30">
        <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center">
          <span className="text-2xl">{division.icon}</span>
        </div>
        <h2 className="text-2xl font-heading text-charcoal">{division.name}</h2>
      </div>

      {division.subsections ? (
        <div className="space-y-8">
          {division.subsections.map((subsection) => (
            <div key={subsection.name}>
              <h3 className="text-sm font-semibold text-gold uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-8 h-px bg-gold/50"></span>
                {subsection.name}
              </h3>
              <SectionsGrid sections={subsection.sections} />
            </div>
          ))}
        </div>
      ) : (
        division.sections && <SectionsGrid sections={division.sections} />
      )}
    </div>
  )
}

function SectionsGrid({ sections }: { sections: Section[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sections.map((section) => (
        <div key={section.name} className="card hover:border-gold/30 transition-colors">
          <h4 className="font-heading text-charcoal mb-4 pb-2 border-b border-gray-100">
            {section.name}
          </h4>
          <div className="space-y-2">
            {section.winners.map((winner, idx) => (
              <WinnerEntry key={idx} place={winner.place} name={winner.name} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function WinnerEntry({ place, name }: { place: string; name: string }) {
  const placeConfig: Record<string, { bg: string; text: string; icon: string }> = {
    '1st': { bg: 'bg-gold/15', text: 'text-gold-dark', icon: '🥇' },
    '2nd': { bg: 'bg-gray-100', text: 'text-text-secondary', icon: '🥈' },
    '3rd': { bg: 'bg-amber-50', text: 'text-amber-700', icon: '🥉' },
    'HM': { bg: 'bg-navy/5', text: 'text-navy', icon: '⭐' },
  }

  const config = placeConfig[place] || { bg: 'bg-gray-50', text: 'text-text-muted', icon: '' }

  return (
    <div className={`flex items-center gap-2 text-sm py-2 px-3 rounded-lg ${config.bg}`}>
      <span>{config.icon}</span>
      <span className={`font-semibold ${config.text}`}>{place}</span>
      <span className="text-charcoal">{name}</span>
    </div>
  )
}
