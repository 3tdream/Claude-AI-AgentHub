# AIkinsey Presentation - Next.js

A modern, data-driven presentation website built with Next.js 15, TypeScript, and Tailwind CSS.

## Project Structure

```
aikinsey-presentation/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx             # Main presentation page (data-driven)
│   └── globals.css          # Global styles and Tailwind
├── components/
│   ├── SlideRenderer.tsx    # Dynamic slide renderer based on type
│   ├── Slide.tsx            # Slide container component
│   ├── SlideContent.tsx     # Slide content wrapper
│   ├── ui/                  # shadcn/ui components (40+ components)
│   └── figma/               # Figma integration components
├── data/
│   └── slides.json          # ⭐ All slide content and configuration
├── public/
│   └── assets/              # ⭐ Slide images and visual assets
│       └── README.md        # Instructions for adding images
├── types/
│   └── slides.ts            # TypeScript type definitions
├── lib/
│   └── utils.ts             # Utility functions
├── next.config.ts           # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
```

## Data-Driven Architecture

### 📄 slides.json Structure

All presentation content is stored in `data/slides.json`:

```json
{
  "presentation": {
    "title": "Presentation Title",
    "subtitle": "Subtitle",
    "totalSlides": 12
  },
  "slides": [
    {
      "id": 1,
      "type": "title|content|cards|stats|dual-list|checklist|awards|cta",
      "background": {
        "type": "image|gradient",
        "source": "/assets/slide-name.jpg",
        "fallback": "https://unsplash.com/..."
      },
      "overlay": true,
      "content": {
        // Content varies by slide type
      }
    }
  ]
}
```

### 🎨 Slide Types

The presentation supports 8 different slide types:

1. **title** - Title slide with badge, main title, and subtitle
2. **content** - Text content with optional paragraphs, quotes, and highlights
3. **cards** - Grid of cards with icons, titles, and descriptions
4. **stats** - Statistics display with numbers and labels
5. **dual-list** - Two-column list layout
6. **checklist** - Checklist items with checkmarks
7. **awards** - Awards/recognition grid
8. **cta** - Call-to-action slide with buttons

### 🖼️ Assets Management

Images are stored in `public/assets/` and referenced in `slides.json`:

- **Local images**: `/assets/slide-1-innovation.jpg`
- **Fallback**: External URLs (Unsplash) used if local image not found
- **Optimization**: Next.js automatically optimizes images

**To add images:**
1. Place images in `public/assets/`
2. Name them according to the convention: `slide-{number}-{description}.jpg`
3. Update the `source` field in `slides.json`

## Technology Stack

### Core
- **Next.js 15.5** - React framework with App Router
- **React 18.3** - UI library
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 3.4** - Utility-first CSS

### UI Components
- **shadcn/ui** - 40+ accessible components built on Radix UI
- **Framer Motion** - Animations and transitions
- **Lucide React** - Icon library

### Features
- Client-side rendering for interactive presentation
- Keyboard navigation (Arrow keys, Spacebar)
- Slide indicators and navigation controls
- Responsive design (mobile & desktop)
- Dark mode support
- Image optimization
- TypeScript type safety
- Data-driven architecture

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Editing the Presentation

### Modify Existing Slides

Edit `data/slides.json` to change:
- Slide content (titles, text, lists)
- Colors (badge colors, highlights)
- Images (update source paths)
- Slide order

### Add New Slides

1. Add a new slide object to the `slides` array in `data/slides.json`
2. Increment `totalSlides` in the presentation metadata
3. Add corresponding image to `public/assets/`

Example:
```json
{
  "id": 13,
  "type": "content",
  "background": {
    "type": "image",
    "source": "/assets/slide-13-new.jpg",
    "fallback": "https://..."
  },
  "overlay": true,
  "content": {
    "alignment": "center",
    "badge": {
      "text": "New Section",
      "color": "blue-500"
    },
    "title": "New Slide Title",
    "paragraphs": ["Content here..."]
  }
}
```

### Change Styles

- **Global styles**: Edit `app/globals.css`
- **Tailwind config**: Edit `tailwind.config.ts`
- **Component styles**: Modify className props in `components/SlideRenderer.tsx`

## Keyboard Controls

- **→ Arrow or Spacebar**: Next slide
- **← Arrow**: Previous slide
- **Click indicators**: Jump to specific slide

## Benefits of Data-Driven Approach

✅ **Easy to edit** - Change content without touching code
✅ **Reusable** - Same structure for multiple presentations
✅ **Type-safe** - TypeScript validates slide structure
✅ **Version control** - Track content changes in JSON
✅ **Scalable** - Add unlimited slides easily
✅ **Maintainable** - Clear separation of data and logic

## Next Steps

1. **Add your images** to `public/assets/`
2. **Customize content** in `data/slides.json`
3. **Adjust colors/styles** in Tailwind classes
4. **Deploy** to Vercel, Netlify, or your hosting provider

## Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

### Other Platforms

Build the project and serve the `.next` directory:
```bash
npm run build
```

## License

This project structure can be reused for any presentation needs.
