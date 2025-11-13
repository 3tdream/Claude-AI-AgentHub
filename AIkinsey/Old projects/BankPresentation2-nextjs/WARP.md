# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

### Development
```bash
npm run dev          # Start development server on http://localhost:3000
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

### Image Generation
```bash
npm run generate-images    # Generate slide images using fal.ai API (requires FAL_KEY in .env.local)
```

## Architecture

### Data-Driven Presentation System
This is a **fully data-driven** presentation application. All slide content, types, and configurations are stored in `data/slides.json`. The architecture separates data from rendering logic.

**Key principle**: To add/modify content, edit JSON. To change rendering behavior, edit components.

### Core Flow
1. **Data Layer** (`data/slides.json`): Contains all presentation content and metadata
2. **Type Layer** (`types/slides.ts`): TypeScript definitions for 8 slide types and their content structures
3. **Rendering Layer** (`components/SlideRenderer.tsx`): Dynamic component that renders slides based on their `type` field
4. **Presentation Layer** (`app/page.tsx`): Client-side navigation, keyboard controls, and slide state management

### Slide Type System
The application supports 8 distinct slide types, each with specific content structures:
- **title**: Badge, main title, subtitle (center-aligned)
- **content**: Text content with paragraphs, quotes, items, highlights
- **cards**: Grid of icon cards with titles/descriptions
- **stats**: Numeric statistics display
- **dual-list**: Two-column list layout
- **checklist**: Checklist with checkmarks
- **awards**: Awards/recognition grid
- **cta**: Call-to-action with buttons

### Component Architecture

#### Main Components
- **`SlideRenderer.tsx`**: Switch-case component that dynamically renders slide types. Contains animation variants (Framer Motion) and rendering logic for each slide type.
- **`Slide.tsx`**: Wrapper component handling backgrounds (gradient or image) and overlays
- **`SlideContent.tsx`**: Layout component managing content alignment (left/center/right)
- **`LucideIcon.tsx`**: Parses icon notation `[IconName]` in text and renders Lucide icons

#### UI Components
40+ shadcn/ui components in `components/ui/`, built on Radix UI primitives. Use these for consistent, accessible UI elements.

### Adding Content

#### To Add a New Slide
1. Edit `data/slides.json`:
   - Add slide object to `slides` array
   - Increment `presentation.totalSlides`
   - Set appropriate `type` field (must match one of 8 types)
   - Define background (gradient or image)
2. For images: Place in `public/assets/` with naming convention `slide-{number}-{description}.jpg`
3. No code changes needed - renderer handles all types automatically

#### Icon Notation
Use `[IconName]` syntax in `items` arrays. Example: `"[Shield] Security First"` renders Shield icon + text.

### Background System
Two background types:
- **Gradient**: `"type": "gradient"`, `"source": "linear-gradient(...)"`
- **Image**: `"type": "image"`, `"source": "/assets/..."`, `"fallback": "https://..."`

Fallback URLs (Unsplash) are used when local images don't exist. Next.js Image component handles optimization.

### Client-Side Features
- Keyboard navigation: Arrow keys and Spacebar
- Slide indicators (bottom center) for direct navigation
- Share button (copies URL to clipboard)
- Slide counter (top right)
- All interactions use Framer Motion animations

### State Management
Simple useState in `app/page.tsx`:
- `currentSlide`: Index of active slide
- Navigation functions: `nextSlide()`, `prevSlide()`, `goToSlide(index)`
- No external state management library

### Styling Approach
- **Tailwind CSS** with custom configuration in `tailwind.config.ts`
- **shadcn/ui** components use `cn()` utility (from `lib/utils.ts`) for class merging
- Badge colors use Tailwind color notation: `"blue-500"`, `"purple-200"`, etc.
- Responsive design with `md:` breakpoints
- Backdrop blur effects: `backdrop-blur-md` for glass-morphism

### TypeScript Patterns
- All slide types defined in `types/slides.ts`
- JSON data typed as `PresentationData`
- Component props use explicit interfaces (e.g., `SlideRendererProps`)
- Type assertion: `slidesData as PresentationData` in `page.tsx`

### Next.js Configuration
- App Router (Next.js 15)
- Client components use `"use client"` directive
- Image optimization configured for `images.unsplash.com` in `next.config.ts`
- No server-side rendering for presentation slides - all client-side

### AI Image Generation
The `scripts/generate-images.js` script uses fal.ai API to generate slide backgrounds:
- Requires `FAL_KEY` environment variable in `.env.local`
- Generates 1920x1080 images using fal-ai/flux/schnell model
- Saves to `public/assets/` with predefined filenames
- Image prompts are hardcoded in the script

## Editing Guidelines

### When Modifying Slides
- **Content changes**: Edit `data/slides.json` only
- **Styling changes**: Edit Tailwind classes in `components/SlideRenderer.tsx`
- **Animation changes**: Edit Framer Motion variants in `SlideRenderer.tsx`
- **New slide types**: Add case to switch statement in `renderContent()` + update `types/slides.ts`

### Maintaining Type Safety
When adding new slide content fields:
1. Update interface in `types/slides.ts`
2. Update `data/slides.json` to match
3. Update rendering logic in `components/SlideRenderer.tsx`

### Animation Patterns
Framer Motion variants follow a pattern:
- `containerVariants`: Stagger children animations
- `itemVariants`: Fade in + slide up (y: 20 → 0)
- `cardVariants`: Fade in + scale + slide up

All animations use easing `[0.4, 0, 0.2, 1]` (ease-out-cubic).
