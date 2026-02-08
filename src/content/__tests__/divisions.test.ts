import { describe, it, expect } from 'vitest'
import {
  getDivisionById,
  getAllDivisions,
  getAllDivisionSummaries,
  type Division,
} from '../divisions'

describe('getDivisionById', () => {
  it('returns the Piano division for id "piano"', () => {
    const piano = getDivisionById('piano')
    expect(piano).toBeDefined()
    expect(piano!.id).toBe('piano')
    expect(piano!.name).toBe('Classical Piano')
  })

  it('returns undefined for an invalid id', () => {
    expect(getDivisionById('invalid')).toBeUndefined()
  })

  it('returns undefined for empty string', () => {
    expect(getDivisionById('')).toBeUndefined()
  })
})

describe('getAllDivisions', () => {
  it('returns all 10 divisions', () => {
    const divisions = getAllDivisions()
    expect(divisions).toHaveLength(10)
  })

  it('includes expected division ids', () => {
    const ids = getAllDivisions().map((d) => d.id)
    expect(ids).toContain('piano')
    expect(ids).toContain('violin')
    expect(ids).toContain('chamber')
  })
})

describe('getAllDivisionSummaries', () => {
  it('returns summaries for all divisions', () => {
    const summaries = getAllDivisionSummaries()
    expect(summaries).toHaveLength(10)
  })

  it('formats sectionCount correctly', () => {
    const summaries = getAllDivisionSummaries()
    const piano = summaries.find((s) => s.id === 'piano')!
    expect(piano.sectionCount).toBe('11 sections')
  })

  it('contains only summary fields (no sections, requirements, etc.)', () => {
    const summaries = getAllDivisionSummaries()
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
      expect(d.sections.length).toBeGreaterThan(0)
      expect(d.timePeriods.length).toBeGreaterThan(0)
      expect(d.requirements.length).toBeGreaterThan(0)
      expect(['solo', 'chamber']).toContain(d.feeType)
      expect(typeof d.memorization).toBe('boolean')
      expect(typeof d.available).toBe('boolean')
    }
  })

  it('only Piano is currently available', () => {
    const divisions = getAllDivisions()
    const available = divisions.filter((d) => d.available)
    expect(available).toHaveLength(1)
    expect(available[0].id).toBe('piano')
  })

  it('only Chamber uses "chamber" feeType', () => {
    const divisions = getAllDivisions()
    const chamber = divisions.filter((d) => d.feeType === 'chamber')
    expect(chamber).toHaveLength(1)
    expect(chamber[0].id).toBe('chamber')
  })

  it('Chamber does not require memorization', () => {
    const chamber = getDivisionById('chamber')!
    expect(chamber.memorization).toBe(false)
  })
})
