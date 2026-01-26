# MACOC - Musical Arts Competition of Orange County

Official website for the Musical Arts Competition of Orange County, the oldest and most prestigious music competition in Orange County since 1932.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Deployment**: Static export (GitHub Pages ready)

## Features

- Competition information and registration
- Past winners database (2021-2025)
- Member directory
- Responsive design

## Project Structure

```
src/
├── app/                    # Next.js pages
│   ├── about/
│   ├── competition/
│   │   ├── registration/
│   │   ├── regulation/
│   │   └── schedule/
│   ├── contact/
│   ├── directory/
│   └── winners/
├── components/             # Reusable components
├── content/                # Content data (JSON)
│   ├── config.json         # Site configuration
│   └── winners/            # Winners by year
└── lib/                    # Utilities
```

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Content Management

### Updating Site Configuration
Edit `src/content/config.json` for:
- Competition dates
- Registration periods
- Fee amounts
- Contact information

### Adding Winners
Add new JSON file in `src/content/winners/` following the existing format.

## Deployment

The site exports as static HTML and can be deployed to any static hosting:

```bash
npm run build
# Output in 'out/' directory
```
