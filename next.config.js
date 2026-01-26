/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/macoc',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
