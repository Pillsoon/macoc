import { MetadataRoute } from 'next'
import { getAllDivisions } from '@/content/divisions'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.musicalartsoc.org'
  const divisions = getAllDivisions()

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/competition`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/competition/registration`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/competition/regulation`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/competition/schedule`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/winners`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.6 },
    { url: `${baseUrl}/directory`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
    { url: `${baseUrl}/register`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/register/teacher`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ]

  const divisionPages: MetadataRoute.Sitemap = divisions.flatMap((d) => [
    { url: `${baseUrl}/register/${d.id}`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${baseUrl}/competition/regulation/${d.id}`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
  ])

  return [...staticPages, ...divisionPages]
}
