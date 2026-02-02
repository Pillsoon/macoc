import configData from '@/content/config.json'
import type { SiteConfig } from '@/types/config'

// Default config values as fallback
const defaultConfig: SiteConfig = {
  site: {
    name: 'Musical Arts Competition of Orange County',
    shortName: 'MACOC',
    description: 'The oldest and most prestigious music competition in Orange County',
    url: 'https://www.musicalartsoc.org'
  },
  president: {
    name: 'Marie Djang',
    title: 'President, Musical Arts Competition of Orange County'
  },
  currentYear: new Date().getFullYear(),
  competition: {
    date: 'May 2026',
    location: 'California State University, Long Beach',
    registration: {
      open: 'March 2026',
      close: 'April 2026',
      lateDeadline: 'April 2026',
      ageAsOf: 'April 30, 2026'
    }
  },
  winnersConcert: {
    date: 'June 2026',
    location: 'Richard Nixon Library - Yorba Linda',
    time: '7:00 PM'
  },
  fees: {
    membership: { amount: 40, label: "Teacher's Membership" },
    solo: { amount: 60, label: 'Solo Entry' },
    chamber: { amount: 30, label: 'Chamber Entry' },
    nonParticipation: {
      small: { amount: 50, label: '1–5 students' },
      large: { amount: 100, label: '6+ students' },
    },
    lateFee: { amount: 70, label: 'Late Registration Fee' }
  },
  contact: {
    email: 'info@musicalartsoc.org'
  },
  divisionContacts: [],
  socialLinks: {
    facebook: '',
    instagram: ''
  },
  history: {
    founded: 1932,
    story: ''
  }
}

// Merge loaded config with defaults
function mergeConfig(loaded: Partial<SiteConfig> | null | undefined): SiteConfig {
  if (!loaded) return defaultConfig

  return {
    site: { ...defaultConfig.site, ...loaded.site },
    president: { ...defaultConfig.president, ...loaded.president },
    currentYear: loaded.currentYear ?? defaultConfig.currentYear,
    competition: {
      ...defaultConfig.competition,
      ...loaded.competition,
      registration: {
        ...defaultConfig.competition.registration,
        ...loaded.competition?.registration
      }
    },
    winnersConcert: { ...defaultConfig.winnersConcert, ...loaded.winnersConcert },
    fees: {
      membership: { ...defaultConfig.fees.membership, ...loaded.fees?.membership },
      solo: { ...defaultConfig.fees.solo, ...loaded.fees?.solo },
      chamber: { ...defaultConfig.fees.chamber, ...loaded.fees?.chamber },
      nonParticipation: {
        small: { ...defaultConfig.fees.nonParticipation.small, ...loaded.fees?.nonParticipation?.small },
        large: { ...defaultConfig.fees.nonParticipation.large, ...loaded.fees?.nonParticipation?.large },
      },
      lateFee: { ...defaultConfig.fees.lateFee, ...loaded.fees?.lateFee }
    },
    contact: { ...defaultConfig.contact, ...loaded.contact },
    divisionContacts: loaded.divisionContacts ?? defaultConfig.divisionContacts,
    socialLinks: { ...defaultConfig.socialLinks, ...loaded.socialLinks },
    history: { ...defaultConfig.history, ...loaded.history }
  }
}

export const config = mergeConfig(configData as Partial<SiteConfig>)
