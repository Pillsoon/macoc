// Teacher Membership Registration Form Configuration
// Edit options and prices here — no need to touch the component code.

export const INSTRUMENTS = [
  'Piano',
  'Vocal: Classical',
  'Vocal: Musical Theater',
  'Strings + Piano Chamber',
  'Strings',
  'Guitar Chamber Music',
  'Classical Guitar',
  'Woodwinds',
] as const

// Instruments that trigger the String Teacher Instrument field
export const STRING_INSTRUMENT_TRIGGERS = [
  'Strings',
  'Strings + Piano Chamber',
] as const

export const STRING_INSTRUMENTS = [
  'Violin',
  'Viola',
  'Violin & Viola',
  'Cello',
  'None',
] as const

export const HELP_PREFERENCES = [
  'Morning Help',
  'Afternoon Help',
  'Morning and Afternoon Help',
  'Non-available: pay non-involvement fee ($60)',
] as const

export const SUB_DIVISIONS = [
  'Strings',
  'Vocal',
  'Woodwinds',
  'Guitar',
  'Chamber Music',
] as const

export const MEMBERSHIP_PRODUCTS = [
  { label: 'Regular Member', price: 40, description: 'Regular Member' },
  { label: 'Patron Member', price: 50, description: 'Patron Member' },
  { label: 'Contributing Member', price: 60, description: 'Contributing Member' },
  { label: 'Sponsor Member', price: 100, description: 'Sponsor Member' },
  { label: 'Emeritus Member', price: 20, description: 'Emeritus Member Age 70+' },
  { label: 'Non-Available Fee', price: 60, description: 'If you are unable to help out on the day of competition please pay a fee of $60 on top of your membership fee.' },
] as const
