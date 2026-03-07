// Teacher Membership Registration Form Configuration
// Edit options and prices here — no need to touch the component code.

export const INSTRUMENTS = [
  'Piano',
  'Vocal: Classical',
  'Vocal: Musical Theater',
  'String + Piano Chamber Music',
  'String Solo',
  'Guitar Chamber Music',
  'Classical Guitar',
  'Woodwinds',
  'Woodwinds Ensemble',
] as const

// Instruments that trigger the String Teacher Instrument field
export const STRING_INSTRUMENT_TRIGGERS = [
  'String Solo',
  'String + Piano Chamber Music',
] as const

export const STRING_INSTRUMENTS = [
  'Violin',
  'Viola',
  'Cello',
] as const

export const HELP_PREFERENCES = [
  'Morning Help',
  'Afternoon Help',
  'Morning and Afternoon Help',
  'Non-available: pay non-involvement fee ($60)',
] as const

export const SUB_DIVISIONS = [
  'String',
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
