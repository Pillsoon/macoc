export interface SiteConfig {
  site: {
    name: string
    shortName: string
    description: string
    url: string
  }
  president: {
    name: string
    title: string
  }
  currentYear: number
  competition: {
    date: string
    location: string
    registration: {
      open: string
      close: string
      lateDeadline: string
      ageAsOf: string
    }
  }
  winnersConcert: {
    date: string
    location: string
    time: string
  }
  fees: {
    membership: {
      amount: number
      label: string
    }
    solo: {
      amount: number
      label: string
    }
    chamber: {
      amount: number
      label: string
    }
    nonParticipation: {
      small: { amount: number; label: string }
      large: { amount: number; label: string }
    }
    lateFee: {
      amount: number
      label: string
    }
  }
  contact: {
    email: string
  }
  accountant: {
    name: string
    email: string
  }
  divisionContacts: {
    division: string
    chair: string
    email: string
  }[]
  socialLinks: {
    facebook: string
    instagram: string
  }
  history: {
    founded: number
    story: string
  }
}
