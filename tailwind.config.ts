import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary - Navy Blue
        navy: {
          DEFAULT: '#1e3a5f',
          dark: '#152a45',
          light: '#2d4a6f',
        },
        // Secondary - Gold
        gold: {
          DEFAULT: '#c9a227',
          dark: '#a68520',
          light: '#e0bb4a',
        },
        // Background
        cream: {
          DEFAULT: '#f9f6f2',
          dark: '#f5f0e8',
        },
        // Text colors
        charcoal: '#333333',
        text: {
          primary: '#1a1a1a',
          secondary: '#4a4a4a',
          muted: '#6b7280',
        },
      },
      fontFamily: {
        heading: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        script: ['Great Vibes', 'cursive'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(to bottom, rgba(30, 58, 95, 0.85), rgba(30, 58, 95, 0.95))',
      },
    },
  },
  plugins: [],
}

export default config
