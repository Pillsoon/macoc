import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Teacher Directory',
  description: 'Directory of registered music teachers in the Musical Arts Competition of Orange County.',
  alternates: { canonical: '/directory' },
}

export default function DirectoryLayout({ children }: { children: React.ReactNode }) {
  return children
}
