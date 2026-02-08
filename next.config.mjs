/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel handles these automatically
  // No need for 'export' mode - enables API routes
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
}

export default nextConfig
