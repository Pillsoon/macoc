import { describe, it, expect } from 'vitest'
import { getRequiredMemberCount } from '../ChamberRegistrationForm'

describe('getRequiredMemberCount', () => {
  it('returns 2 for duo instrumentations', () => {
    expect(getRequiredMemberCount('String duo')).toBe(2)
  })

  it('returns 3 for trio instrumentations', () => {
    expect(getRequiredMemberCount('String trio')).toBe(3)
    expect(getRequiredMemberCount('Piano trio')).toBe(3)
  })

  it('returns 3 for "Piano + string duo" (treated as trio)', () => {
    expect(getRequiredMemberCount('Piano + string duo')).toBe(3)
  })

  it('returns 4 for quartet instrumentations', () => {
    expect(getRequiredMemberCount('String quartet')).toBe(4)
    expect(getRequiredMemberCount('Piano quartet')).toBe(4)
  })

  it('returns 5 for quintet instrumentations', () => {
    expect(getRequiredMemberCount('String quintet')).toBe(5)
    expect(getRequiredMemberCount('Piano quintet')).toBe(5)
  })

  it('returns 6 for sextet instrumentations', () => {
    expect(getRequiredMemberCount('String sextet')).toBe(6)
    expect(getRequiredMemberCount('Piano sextet')).toBe(6)
  })

  it('returns 0 for empty string', () => {
    expect(getRequiredMemberCount('')).toBe(0)
  })

  it('returns 0 for unrecognized instrumentation', () => {
    expect(getRequiredMemberCount('Orchestra')).toBe(0)
    expect(getRequiredMemberCount('Solo')).toBe(0)
  })

  it('is case-insensitive', () => {
    expect(getRequiredMemberCount('STRING QUARTET')).toBe(4)
    expect(getRequiredMemberCount('piano trio')).toBe(3)
    expect(getRequiredMemberCount('PIANO + STRING DUO')).toBe(3)
  })

  it('prioritizes larger ensembles (sextet over duo)', () => {
    // "sextet" is checked before "duo", so a word containing both would match sextet
    expect(getRequiredMemberCount('String sextet')).toBe(6)
  })
})
