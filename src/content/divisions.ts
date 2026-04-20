import divisionsData from './divisions.json'

export interface DivisionSection {
  value: string
  label: string
}

export interface Division {
  id: string
  name: string
  icon: string
  description: string
  sections: DivisionSection[]
  timePeriods: { value: string; label: string }[]
  requirements: string[]
  feeType: 'solo' | 'chamber'
  memorization: boolean
  available: boolean
}

export interface DivisionSummary {
  id: string
  name: string
  icon: string
  description: string
  sectionCount: string
  feeType: 'solo' | 'chamber'
  available: boolean
}

// Web-only registration closures. Keeps Google Sheets as source of truth;
// listed IDs are forced closed at runtime without touching the sheet.
const CLOSURES: Record<string, { closedOn: string }> = {
  strings: { closedOn: 'April 23, 2026 at 11:59pm' },
}

const divisions: Division[] = ((divisionsData as Division[]) || []).map((d) =>
  d.id in CLOSURES ? { ...d, available: false } : d
)

export function getClosureDate(id: string): string | undefined {
  return CLOSURES[id]?.closedOn
}

export function getDivisionById(id: string): Division | undefined {
  return divisions.find((d) => d.id === id)
}

export function getAllDivisions(): Division[] {
  return divisions
}

export function getAllDivisionSummaries(): DivisionSummary[] {
  return divisions.map((d) => ({
    id: d.id,
    name: d.name,
    icon: d.icon,
    description: d.description,
    sectionCount: d.sections.length > 0 ? `${d.sections.length} sections` : 'Coming Soon',
    feeType: d.feeType,
    available: d.available,
  }))
}
