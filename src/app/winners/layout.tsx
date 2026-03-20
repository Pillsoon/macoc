import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Winners',
  description: 'Past winners and award recipients of the Musical Arts Competition of Orange County.',
  alternates: { canonical: '/winners' },
}

export default function WinnersLayout({ children }: { children: React.ReactNode }) {
  return children
}
