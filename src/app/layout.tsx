import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { config } from '@/lib/config'

const siteUrl = config.site.url || 'https://www.musicalartsoc.org'

export const metadata: Metadata = {
  title: {
    default: config.site.name,
    template: `%s | ${config.site.shortName || 'MACOC'}`,
  },
  description: config.site.description,
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: config.site.name,
    title: config.site.name,
    description: config.site.description,
  },
  twitter: {
    card: 'summary',
    title: config.site.name,
    description: config.site.description,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: config.site.name,
        url: siteUrl,
        email: config.contact.email,
        foundingDate: '1932',
        description: config.site.description,
      },
      {
        '@type': 'MusicEvent',
        name: `${config.currentYear} ${config.site.name}`,
        startDate: config.competition.date,
        location: {
          '@type': 'Place',
          name: config.competition.location,
        },
        organizer: {
          '@type': 'Organization',
          name: config.site.name,
          url: siteUrl,
        },
        description: `Annual music competition in Orange County featuring piano, vocal, string, guitar, and woodwind divisions.`,
      },
    ],
  }

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
