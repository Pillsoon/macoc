import { describe, it, expect } from 'vitest'
import {
  getDivisionById,
  getAllDivisions,
  getAllDivisionSummaries,
} from '../divisions'

describe('getDivisionById', () => {
  it('returns a division for a valid id', () => {
    const divisions = getAllDivisions()
    if (divisions.length === 0) return
    const first = divisions[0]
    const found = getDivisionById(first.id)
    expect(found).toBeDefined()
    expect(found!.id).toBe(first.id)
  })

  it('returns undefined for an invalid id', () => {
    expect(getDivisionById('invalid')).toBeUndefined()
  })

  it('returns undefined for empty string', () => {
    expect(getDivisionById('')).toBeUndefined()
  })
})

describe('getAllDivisions', () => {
  it('returns an array of divisions', () => {
    const divisions = getAllDivisions()
    expect(Array.isArray(divisions)).toBe(true)
    expect(divisions.length).toBeGreaterThan(0)
  })

  it('each division has a unique id', () => {
    const ids = getAllDivisions().map((d) => d.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('getAllDivisionSummaries', () => {
  it('returns summaries matching division count', () => {
    const divisions = getAllDivisions()
    const summaries = getAllDivisionSummaries()
    expect(summaries).toHaveLength(divisions.length)
  })

  it('formats sectionCount correctly', () => {
    const divisions = getAllDivisions()
    const summaries = getAllDivisionSummaries()
    for (const div of divisions) {
      const summary = summaries.find((s) => s.id === div.id)!
      const expected = div.sections.length > 0 ? `${div.sections.length} sections` : 'Coming Soon'
      expect(summary.sectionCount).toBe(expected)
    }
  })

  it('contains only summary fields (no sections, requirements, etc.)', () => {
    const summaries = getAllDivisionSummaries()
    if (summaries.length === 0) return
    const first = summaries[0] as Record<string, unknown>
    expect(first).toHaveProperty('id')
    expect(first).toHaveProperty('name')
    expect(first).toHaveProperty('icon')
    expect(first).toHaveProperty('description')
    expect(first).toHaveProperty('sectionCount')
    expect(first).toHaveProperty('feeType')
    expect(first).toHaveProperty('available')
    expect(first).not.toHaveProperty('sections')
    expect(first).not.toHaveProperty('requirements')
    expect(first).not.toHaveProperty('timePeriods')
  })
})

describe('data integrity', () => {
  it('every division has all required fields', () => {
    const divisions = getAllDivisions()
    for (const d of divisions) {
      expect(d.id).toBeTruthy()
      expect(d.name).toBeTruthy()
      expect(d.icon).toBeTruthy()
      expect(d.description).toBeTruthy()
      expect(Array.isArray(d.sections)).toBe(true)
      expect(d.timePeriods.length).toBeGreaterThan(0)
      expect(Array.isArray(d.requirements)).toBe(true)
      expect(['solo', 'chamber']).toContain(d.feeType)
      expect(typeof d.memorization).toBe('boolean')
      expect(typeof d.available).toBe('boolean')
    }
  })

  it('available divisions have sections and requirements', () => {
    const divisions = getAllDivisions().filter((d) => d.available)
    for (const d of divisions) {
      expect(d.sections.length).toBeGreaterThan(0)
      expect(d.requirements.length).toBeGreaterThan(0)
    }
  })

  it('section values and labels are non-empty', () => {
    const divisions = getAllDivisions()
    for (const d of divisions) {
      for (const s of d.sections) {
        expect(s.value).toBeTruthy()
        expect(s.label).toBeTruthy()
      }
    }
  })

  it('timePeriod values and labels are non-empty', () => {
    const divisions = getAllDivisions()
    for (const d of divisions) {
      for (const tp of d.timePeriods) {
        expect(tp.value).toBeTruthy()
        expect(tp.label).toBeTruthy()
      }
    }
  })
})
