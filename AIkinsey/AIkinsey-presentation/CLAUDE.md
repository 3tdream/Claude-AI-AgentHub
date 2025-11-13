# Design System Rules for Figma Integration via MCP

## Project Overview
This is an **AIkinsey Autonomous AI Workforce Presentation** - a professional investor pitch deck built with Next.js 15, TypeScript, React 18.3, Framer Motion, shadcn/ui, and Tailwind CSS. The presentation features 16 slides with a modern, data-driven architecture optimized for Seed/Series A investment pitches.

---

## 1. Design Token Definitions

### Location
Design tokens are defined in multiple locations:
- **CSS Variables**: `app/globals.css` (lines 5-60) - HSL color system
- **Tailwind Config**: `tailwind.config.ts` - Extended theme configuration
- **Slide Data**: `data/slides.json` - Content-specific colors and badges
- **Component Props**: Dynamic color assignments in `components/SlideRenderer.tsx`

### Color Tokens

#### HSL-Based Theme System
All colors use HSL format for better manipulation and theming:

**Light Mode** (lines 6-32 in globals.css):
```css
--background: 0 0% 100%;        /* Pure white */
--foreground: 0 0% 3.9%;        /* Near black text */
--card: 0 0% 100%;              /* White cards */
--primary: 0 0% 9%;             /* Dark primary */
--secondary: 0 0% 96.1%;        /* Light gray */
--muted: 0 0% 96.1%;            /* Muted backgrounds */
--accent: 0 0% 96.1%;           /* Accent color */
--destructive: 0 84.2% 60.2%;   /* Error red */
--border: 0 0% 89.8%;           /* Light borders */
--radius: 0.5rem;               /* 8px border radius */
```

**Dark Mode** (lines 34-59 in globals.css):
```css
--background: 0 0% 3.9%;        /* Dark slate #0a0a0a */
--foreground: 0 0% 98%;         /* Near white text */
--card: 0 0% 3.9%;              /* Dark cards */
--primary: 0 0% 98%;            /* Light primary */
--secondary: 0 0% 14.9%;        /* Dark gray */
--muted: 0 0% 14.9%;            /* Muted dark backgrounds */
--destructive: 0 62.8% 30.6%;   /* Dark red */
--border: 0 0% 14.9%;           /* Dark borders */
```

#### Chart Color Palette
```css
/* Light Mode Charts */
--chart-1: 12 76% 61%;    /* Warm orange */
--chart-2: 173 58% 39%;   /* Teal */
--chart-3: 197 37% 24%;   /* Dark blue */
--chart-4: 43 74% 66%;    /* Yellow */
--chart-5: 27 87% 67%;    /* Coral */

/* Dark Mode Charts */
--chart-1: 220 70% 50%;   /* Blue */
--chart-2: 160 60% 45%;   /* Green-teal */
--chart-3: 30 80% 55%;    /* Orange */
--chart-4: 280 65% 60%;   /* Purple */
--chart-5: 340 75% 55%;   /* Pink-red */
```

#### Presentation-Specific Colors (from slides.json)
Badge colors used throughout slides:
- **yellow-500**: Investment opportunity badges
- **red-500**: Problem statements
- **green-500**: Market opportunity
- **blue-500**: Solution/product
- **purple-500**: Technology/innovation
- **pink-500**: Team/differentiators
- **indigo-500**: Roadmap/future

#### Gradient Backgrounds
```css
/* Slide 1 - Title */
linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e40af 100%)
/* Dark slate → Slate → Blue gradient */

/* Slide 4 - Solution */
linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)
/* Dark blue → Bright blue gradient */
```

### Typography Tokens

#### Font Families
```css
/* System font stack (default) */
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

#### Font Sizes (Tailwind Scale)
- **Slide Titles**: `text-4xl` (36px) to `text-6xl` (60px)
- **Subtitles**: `text-xl` (20px) to `text-2xl` (24px)
- **Body Text**: `text-base` (16px) to `text-lg` (18px)
- **Small Text**: `text-sm` (14px)
- **Badges**: `text-xs` (12px) to `text-sm` (14px)

#### Font Weights
- **Bold**: `font-bold` (700) - Used for all titles and badges
- **Semibold**: `font-semibold` (600) - Subtitles and emphasis
- **Medium**: `font-medium` (500) - Body text with emphasis
- **Normal**: `font-normal` (400) - Regular body text

### Spacing Tokens
Spacing follows Tailwind's default 4px base scale:

#### Padding
- **Small**: `p-2` (8px), `p-3` (12px), `p-4` (16px)
- **Medium**: `p-6` (24px), `p-8` (32px)
- **Large**: `p-12` (48px), `p-16` (64px)
- **Slide Container**: `px-8 md:px-16 lg:px-24`

#### Gaps
- **Grid Gaps**: `gap-4` (16px), `gap-6` (24px), `gap-8` (32px)
- **Stack Gaps**: `space-y-4`, `space-y-6`, `space-y-8`

#### Margins
- **Section Margins**: `mb-4`, `mb-6`, `mb-8`, `mb-12`
- **Element Margins**: `mt-2`, `mt-4`, `mt-6`

### Border Radius Tokens
```css
--radius: 0.5rem;               /* Base: 8px */
border-radius: var(--radius)    /* lg: 8px */
border-radius: calc(var(--radius) - 2px)  /* md: 6px */
border-radius: calc(var(--radius) - 4px)  /* sm: 4px */
```

Applied as:
- **Cards**: `rounded-lg` (8px)
- **Badges**: `rounded-full` (9999px)
- **Buttons**: `rounded-md` (6px)
- **Images**: `rounded-xl` (12px)

---

## 2. Component Library

### Location
All UI components are organized in:
- **shadcn/ui components**: `components/ui/` (40+ components)
- **Presentation components**: `components/` (custom slide components)
- **Figma integration**: `components/figma/` (Figma-specific components)

### Component Architecture
**Data-Driven Component Pattern**: The entire presentation is rendered from JSON data with type-safe rendering.

### Core Presentation Components

#### 1. Slide Container (`Slide.tsx`)
The main wrapper for each slide with animation and navigation:

```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.5 }}
  className="relative w-full h-screen overflow-hidden"
>
  {/* Slide content */}
</motion.div>
```

**Key Features**:
- Framer Motion page transitions
- Full-screen layout (`h-screen`)
- Background image/gradient support
- Optional dark overlay (`bg-black/60`)

#### 2. SlideRenderer (`SlideRenderer.tsx`)
Dynamic slide type renderer - 8 different slide layouts:

**a) Title Slide**
```tsx
<div className="flex flex-col items-center justify-center h-full text-center px-8">
  <Badge className="mb-6 text-sm font-semibold">
    {badge.text}
  </Badge>
  <h1 className="text-6xl font-bold mb-4">
    {title}
  </h1>
  <p className="text-2xl text-muted-foreground max-w-4xl">
    {subtitle}
  </p>
</div>
```

**b) Content Slide**
```tsx
<div className="h-full flex items-center px-8 md:px-16 lg:px-24">
  <div className="max-w-3xl">
    <Badge className="mb-4">{badge}</Badge>
    <h2 className="text-5xl font-bold mb-4">{title}</h2>
    <p className="text-xl mb-6">{subtitle}</p>
    <ul className="space-y-4">
      {items.map(item => (
        <li className="flex items-start gap-3">
          <Icon className="w-6 h-6 text-primary mt-1" />
          <span className="text-lg">{text}</span>
        </li>
      ))}
    </ul>
  </div>
</div>
```

**c) Stats Slide**
```tsx
<div className="h-full flex flex-col items-center justify-center px-8 text-center">
  <Badge className="mb-6">{badge}</Badge>
  <h2 className="text-4xl font-bold mb-12">{title}</h2>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl">
    {stats.map(stat => (
      <div className="space-y-2">
        <div className="text-6xl font-bold text-primary">
          {stat.number}
        </div>
        <p className="text-lg text-muted-foreground">
          {stat.label}
        </p>
      </div>
    ))}
  </div>
</div>
```

**d) Cards Slide**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
  {cards.map(card => (
    <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
      <Icon className="w-12 h-12 text-primary mb-4" />
      <h3 className="text-2xl font-bold">{card.title}</h3>
      <p className="text-muted-foreground">{card.description}</p>
    </Card>
  ))}
</div>
```

**e) Dual-List Slide**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-12 p-16">
  <div>
    <h3 className="text-3xl font-bold mb-6">{leftTitle}</h3>
    <ul className="space-y-4">
      {leftItems.map(item => (
        <li className="flex gap-3">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
  <div>
    <h3 className="text-3xl font-bold mb-6">{rightTitle}</h3>
    <ul className="space-y-4">
      {rightItems.map(item => (
        <li className="flex gap-3">
          <XCircle className="w-5 h-5 text-red-500" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
</div>
```

**f) Checklist Slide**
```tsx
<div className="space-y-6 max-w-3xl mx-auto p-16">
  {items.map((item, index) => (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
        {index + 1}
      </div>
      <div>
        <h4 className="text-xl font-bold mb-2">{item.title}</h4>
        <p className="text-muted-foreground">{item.description}</p>
      </div>
    </div>
  ))}
</div>
```

**g) Awards Slide**
```tsx
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 p-16">
  {awards.map(award => (
    <div className="text-center space-y-3">
      <Trophy className="w-16 h-16 mx-auto text-yellow-500" />
      <h4 className="font-bold text-lg">{award.title}</h4>
      <p className="text-sm text-muted-foreground">{award.year}</p>
    </div>
  ))}
</div>
```

**h) CTA Slide**
```tsx
<div className="flex flex-col items-center justify-center h-full text-center px-8">
  <h2 className="text-5xl font-bold mb-6">{title}</h2>
  <p className="text-xl text-muted-foreground mb-12 max-w-2xl">
    {subtitle}
  </p>
  <div className="flex gap-4">
    <Button size="lg" className="px-8 py-6 text-lg">
      {primaryCTA}
    </Button>
    <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
      {secondaryCTA}
    </Button>
  </div>
</div>
```

### shadcn/ui Components Used

#### Installed Components (40+)
```
Accordion, AlertDialog, AspectRatio, Avatar, Badge, Button,
Calendar, Card, Carousel, Checkbox, Collapsible, Command,
ContextMenu, Dialog, Dropdown, HoverCard, Input, Label,
Menubar, NavigationMenu, Popover, Progress, RadioGroup,
ScrollArea, Select, Separator, Sheet, Skeleton, Slider,
Switch, Table, Tabs, Textarea, Toast, Toggle, ToggleGroup,
Tooltip
```

#### Common UI Patterns

**Badge Component**
```tsx
<Badge className="bg-yellow-500 text-black px-4 py-1.5 text-sm font-semibold">
  Investment Opportunity
</Badge>
```

**Card Component**
```tsx
<Card className="p-6 bg-card hover:shadow-xl transition-shadow duration-300">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
</Card>
```

**Button Component**
```tsx
<Button
  variant="default | outline | ghost | link"
  size="sm | md | lg"
  className="custom-classes"
>
  Click me
</Button>
```

---

## 3. Frameworks & Libraries

### Core Framework
**Next.js 15.5.6** with App Router
- Server-side rendering (SSR) capabilities
- File-based routing in `app/` directory
- API routes support
- Image optimization with `next/image`
- Metadata API for SEO

### UI Framework
**React 18.3.1**
- Functional components with hooks
- Primary hooks: `useState`, `useEffect`, `useRef`, `useCallback`
- Context API for theme management

### Animation Library
**Framer Motion 11.18.2**
- Page transitions with `motion.div`
- Spring physics animations
- Gesture-based interactions
- Animation variants

**Common Animation Patterns**:
```tsx
// Page transition
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.6, ease: "easeOut" }}
/>

// Stagger children
<motion.div
  variants={{
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }}
/>

// Spring animation
<motion.div
  animate={{ scale: 1 }}
  transition={{ type: "spring", stiffness: 300, damping: 20 }}
/>
```

### UI Component Libraries
**shadcn/ui** - Accessible component system built on:
- **Radix UI Primitives** - Unstyled, accessible components
- **class-variance-authority** - Type-safe variant styling
- **tailwind-merge** - Intelligent Tailwind class merging

### Styling System
**Tailwind CSS 3.4.18**
- Utility-first CSS framework
- JIT (Just-In-Time) compiler
- Custom theme extensions
- Dark mode support (`class` strategy)
- **tailwindcss-animate** plugin for animations

### Icon Library
**Lucide React 0.487.0**
- 1000+ consistent icons
- Tree-shakeable imports
- Customizable size and color

**Usage Pattern**:
```tsx
import { TrendingDown, Database, Users, DollarSign, AlertCircle } from 'lucide-react'

<TrendingDown className="w-6 h-6 text-primary" />
```

### Chart Library
**Recharts 2.15.4**
- React-based charting library
- Responsive charts
- Customizable and composable

### Type System
**TypeScript 5.9.3**
- Full type safety
- Type definitions in `types/slides.ts`
- Strict mode enabled

### Additional Libraries
- **next-themes 0.4.6**: Dark/light mode theming
- **react-hook-form 7.65.0**: Form validation
- **sonner 2.0.7**: Toast notifications
- **vaul 1.1.2**: Drawer components
- **embla-carousel-react 8.6.0**: Carousel slider

### Build System
**Next.js Built-in Tooling**
- **Turbopack** (opt-in): Fast bundler
- **SWC**: Rust-based compiler
- **PostCSS 8.5.6**: CSS processing
- **Autoprefixer 10.4.21**: Vendor prefixing

### Development Tools
- **ESLint 9.38.0**: Code linting with Next.js config
- **eslint-config-next 15.5.6**: Next.js-specific rules

---

## 4. Asset Management

### Asset Storage Structure
```
public/
└── assets/
    ├── slide-1-title.jpg
    ├── slide-2-problem.jpg
    ├── slide-3-market.jpg
    ├── slide-4-solution.jpg
    ├── slide-5-product.jpg
    ├── slide-6-technology.jpg
    └── ... (up to slide-16)
```

### Asset Configuration in slides.json
```json
{
  "background": {
    "type": "image | gradient",
    "source": "/assets/slide-2-problem.jpg",
    "fallback": "https://images.unsplash.com/photo-id?crop=entropy&fit=max&fm=jpg&q=80&w=1920"
  }
}
```

### Asset Optimization

**Next.js Image Component**
```tsx
import Image from 'next/image'

<Image
  src="/assets/slide-1.jpg"
  alt="Slide background"
  fill
  className="object-cover"
  priority  // For above-the-fold images
  quality={90}
/>
```

**Optimization Features**:
- Automatic WebP/AVIF conversion
- Responsive image sizes
- Lazy loading by default
- Blur placeholder support
- CDN integration (Vercel)

### Naming Convention
```
slide-{number}-{description}.{ext}

Examples:
slide-1-title.jpg
slide-2-problem.jpg
slide-3-market.jpg
slide-4-solution.jpg
```

### Supported Formats
- **Images**: JPG, PNG, WebP, AVIF
- **Vector**: SVG
- **Video**: MP4, WebM (for background videos)

### External Assets (Fallback)
When local assets are unavailable, Unsplash URLs are used:
```
https://images.unsplash.com/photo-{id}?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920
```

**Unsplash Query Parameters**:
- `crop=entropy`: Smart cropping
- `fit=max`: Maximum fit
- `fm=jpg`: Format
- `q=80`: Quality (80%)
- `w=1920`: Width (1920px)

---

## 5. Icon System

### Icon Library
**Lucide React** - 1000+ consistent, customizable icons

### Icon Storage & Import
Icons are imported directly from `lucide-react` package:

```tsx
import {
  TrendingDown,    // Analytics
  Database,        // Data
  Users,           // People
  DollarSign,      // Money
  AlertCircle,     // Warning
  CheckCircle,     // Success
  Trophy,          // Award
  Rocket,          // Launch
  Target,          // Goal
  Zap,             // Speed/Power
  Brain,           // AI/Intelligence
  GitBranch,       // Structure
  Sparkles         // Enhancement
} from 'lucide-react'
```

### Icon Usage Pattern

#### In Slide Content (JSON)
Icons are referenced as strings in `slides.json`:
```json
{
  "items": [
    "[TrendingDown] Analytical Capacity Gap",
    "[Database] Information Silos",
    "[Users] Limited Human Expertise"
  ]
}
```

#### Icon Mapping Component
```tsx
// components/LucideIcon.tsx
const iconMap = {
  TrendingDown,
  Database,
  Users,
  DollarSign,
  AlertCircle,
  CheckCircle,
  // ... etc
}

export function LucideIcon({ name, className }: Props) {
  const Icon = iconMap[name] || AlertCircle
  return <Icon className={className} />
}
```

### Icon Styling
```tsx
// Default icon style
<Icon className="w-6 h-6 text-primary" />

// Large icon
<Icon className="w-12 h-12 text-primary" />

// Colored icon
<Icon className="w-6 h-6 text-green-500" />

// With background
<div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
  <Icon className="w-8 h-8 text-primary" />
</div>
```

### Icon Naming Convention
Icons follow PascalCase naming matching Lucide React exports:
- `TrendingDown` - Not `trending-down` or `trending_down`
- `DollarSign` - Not `Dollar` or `dollar-sign`
- `AlertCircle` - Not `Alert` or `alert-circle`

### Custom Icon Sizes
```css
.icon-xs: w-3 h-3    /* 12px */
.icon-sm: w-4 h-4    /* 16px */
.icon-md: w-6 h-6    /* 24px - default */
.icon-lg: w-8 h-8    /* 32px */
.icon-xl: w-12 h-12  /* 48px */
.icon-2xl: w-16 h-16 /* 64px */
```

---

## 6. Styling Approach

### CSS Methodology
**Utility-First CSS with Tailwind + CSS Variables**

### Architecture Layers

#### 1. CSS Variables (Design Tokens)
```css
/* app/globals.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --primary: 0 0% 9%;
    --radius: 0.5rem;
  }
}
```

#### 2. Tailwind Utilities
```tsx
<div className="flex items-center justify-center h-screen bg-background text-foreground">
  {/* Content */}
</div>
```

#### 3. Component Composition
```tsx
// shadcn/ui pattern
<Card className="p-6 bg-card hover:shadow-xl transition-shadow duration-300">
  <CardContent>
    Content
  </CardContent>
</Card>
```

### Global Styles

**Base Styles** (`app/globals.css`):
```css
@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### Responsive Design Implementation

#### Breakpoint Strategy
Tailwind's default breakpoints:
- **sm**: 640px (mobile landscape)
- **md**: 768px (tablet portrait)
- **lg**: 1024px (tablet landscape)
- **xl**: 1280px (desktop)
- **2xl**: 1536px (large desktop)

#### Responsive Patterns
```tsx
// Mobile-first approach
<div className="px-4 md:px-8 lg:px-16">
  <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
    Title
  </h1>
</div>

// Grid responsive layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => <Card />)}
</div>

// Hide/show based on screen size
<div className="hidden md:block">Desktop only</div>
<div className="block md:hidden">Mobile only</div>
```

### Dark Mode Implementation

#### Strategy
**Class-based dark mode** with `next-themes`:

```tsx
// app/layout.tsx
import { ThemeProvider } from 'next-themes'

<ThemeProvider attribute="class" defaultTheme="dark">
  {children}
</ThemeProvider>
```

#### Usage
```tsx
// Automatic dark mode support via CSS variables
<div className="bg-background text-foreground">
  {/* Automatically switches between light/dark */}
</div>

// Manual dark mode classes
<div className="dark:bg-slate-900 dark:text-white">
  Content
</div>
```

### Animation Patterns

#### Framer Motion Animations
```tsx
// Fade in
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.6 }}
/>

// Slide up
<motion.div
  initial={{ opacity: 0, y: 50 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, ease: "easeOut" }}
/>

// Scale and fade
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.4 }}
/>
```

#### Tailwind CSS Animations
```tsx
// Pulse animation
<div className="animate-pulse">Loading...</div>

// Spin animation
<div className="animate-spin">Loading...</div>

// Bounce animation
<div className="animate-bounce">Scroll down</div>

// Custom transition
<div className="transition-all duration-300 hover:scale-105">
  Hover me
</div>
```

### Visual Effects

#### Glassmorphism
```tsx
<div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-lg">
  Glass effect
</div>
```

#### Gradient Text
```tsx
<h1 className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
  Gradient Text
</h1>
```

#### Radial Gradient Backgrounds
```tsx
<div className="bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900 via-slate-900 to-slate-950">
  Content
</div>
```

#### Blur Orbs (Background Effects)
```tsx
<div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl">
</div>
<div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl">
</div>
```

---

## 7. Project Structure

```
AIkinsey-presentation/
├── app/
│   ├── layout.tsx                 # Root layout with metadata & theme provider
│   ├── page.tsx                   # Main presentation page (slide navigation)
│   ├── globals.css                # Global styles + CSS variables
│   └── favicon.ico                # App favicon
├── components/
│   ├── ui/                        # shadcn/ui components (40+ components)
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ... (37 more)
│   ├── figma/                     # Figma integration components
│   ├── Slide.tsx                  # Slide wrapper with animations
│   ├── SlideContent.tsx           # Slide content container
│   ├── SlideRenderer.tsx          # Dynamic slide type renderer
│   └── LucideIcon.tsx             # Icon mapping component
├── data/
│   └── slides.json                # ⭐ All slide content & configuration
├── lib/
│   └── utils.ts                   # Utility functions (cn, etc.)
├── public/
│   └── assets/                    # Slide images (slide-1.jpg, slide-2.jpg, etc.)
├── types/
│   └── slides.ts                  # TypeScript type definitions
├── .env.local.template            # Environment variables template
├── .gitignore                     # Git ignore rules
├── CLAUDE.md                      # This design system documentation
├── DEPLOYMENT.md                  # Deployment guide
├── next.config.ts                 # Next.js configuration
├── next-env.d.ts                  # Next.js TypeScript declarations
├── package.json                   # Dependencies and scripts
├── package-lock.json              # Locked dependencies
├── postcss.config.mjs             # PostCSS configuration
├── README.md                      # Project documentation
├── tailwind.config.ts             # Tailwind CSS configuration
└── tsconfig.json                  # TypeScript configuration
```

### Key File Responsibilities

#### `data/slides.json`
Central data file containing all presentation content:
- Slide metadata (type, background, overlay)
- Content (titles, text, lists, stats)
- Badge colors and labels
- Icon references
- Layout configurations

#### `components/SlideRenderer.tsx`
Dynamic renderer that maps slide types to components:
- Type detection and rendering
- Icon parsing from text
- Dynamic styling based on slide data
- Responsive layout handling

#### `app/page.tsx`
Main presentation controller:
- Slide navigation (keyboard, buttons, indicators)
- State management (current slide)
- Animation orchestration
- Keyboard event handling

#### `app/layout.tsx`
Root layout providing:
- HTML structure and metadata
- Theme provider (dark/light mode)
- Font loading
- Global providers

#### `lib/utils.ts`
Utility functions:
```tsx
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## 8. Figma Integration Guidelines

### Converting Figma Designs to Code

#### Step 1: Identify Slide Type
Match Figma layout to one of 8 slide types:
- **Title**: Full-screen centered title with badge
- **Content**: Text content with bullet points
- **Stats**: Number grid (2-4 stats)
- **Cards**: Icon cards in grid layout
- **Dual-list**: Two-column comparison
- **Checklist**: Numbered steps
- **Awards**: Grid of achievements
- **CTA**: Call-to-action buttons

#### Step 2: Extract Design Tokens

**Colors**:
1. Use Figma inspect to get hex colors
2. Convert to HSL for CSS variables
3. Or use Tailwind color names (e.g., `blue-500`)

**Typography**:
1. Font size → Map to Tailwind class
2. Font weight → Map to Tailwind weight
3. Line height → Use Tailwind leading classes

**Spacing**:
1. Measure gaps in Figma
2. Round to nearest Tailwind value (4px increments)
3. Use `p-4`, `gap-6`, etc.

#### Step 3: Add to slides.json

```json
{
  "id": 17,
  "type": "content",
  "background": {
    "type": "gradient",
    "source": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  },
  "overlay": false,
  "content": {
    "alignment": "center",
    "badge": {
      "text": "New Section",
      "color": "purple-500"
    },
    "title": "Your Title from Figma",
    "subtitle": "Your subtitle",
    "items": [
      "[Icon] Item text",
      "[Icon] Item text"
    ]
  }
}
```

#### Step 4: Add Assets

1. Export images from Figma (1920x1080 recommended)
2. Save to `public/assets/slide-{number}-{name}.jpg`
3. Update `source` in slides.json

#### Step 5: Test Responsiveness

```bash
npm run dev
```

Check on multiple screen sizes:
- Mobile (375px)
- Tablet (768px)
- Desktop (1280px)
- Large (1920px)

### Common Figma → Code Patterns

#### Figma Auto Layout → Tailwind Flexbox
```
Figma: Auto Layout (Horizontal, Gap 16px, Center)
Code: className="flex items-center gap-4"

Figma: Auto Layout (Vertical, Gap 24px, Start)
Code: className="flex flex-col items-start gap-6"

Figma: Auto Layout (Horizontal, Space Between)
Code: className="flex justify-between items-center"
```

#### Figma Grid → Tailwind Grid
```
Figma: Grid (3 columns, 24px gap)
Code: className="grid grid-cols-3 gap-6"

Figma: Grid (Responsive: 1→2→3 columns)
Code: className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
```

#### Figma Effects → Tailwind Classes
```
Figma: Drop Shadow (0px 10px 30px rgba(0,0,0,0.1))
Code: className="shadow-xl"

Figma: Blur Effect (Background Blur 20px)
Code: className="backdrop-blur-md"

Figma: Border Radius (8px)
Code: className="rounded-lg"

Figma: Opacity (60%)
Code: className="opacity-60"
```

#### Figma Colors → Tailwind Colors
```
Figma: #3B82F6 → blue-500
Figma: #10B981 → green-500
Figma: #F59E0B → yellow-500
Figma: #EF4444 → red-500
Figma: #8B5CF6 → purple-500
Figma: #EC4899 → pink-500
```

### Using Figma Variables

If Figma design uses variables:

1. **Export variables** to JSON
2. **Map to CSS variables** in `globals.css`:
```css
:root {
  --color-primary: 59 130 246;  /* blue-500 in HSL */
  --color-secondary: 139 92 246; /* purple-500 in HSL */
}
```

3. **Use in Tailwind config**:
```ts
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      primary: 'hsl(var(--color-primary))',
      secondary: 'hsl(var(--color-secondary))',
    }
  }
}
```

---

## 9. Interactive Features

### Keyboard Navigation
```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === ' ') nextSlide()
    if (e.key === 'ArrowLeft') prevSlide()
    if (e.key === 'Home') setCurrentSlide(0)
    if (e.key === 'End') setCurrentSlide(totalSlides - 1)
  }

  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [currentSlide])
```

### Swipe Gestures (Mobile)
```tsx
import { motion, PanInfo } from 'framer-motion'

<motion.div
  drag="x"
  dragConstraints={{ left: 0, right: 0 }}
  dragElastic={0.2}
  onDragEnd={(e, info: PanInfo) => {
    if (info.offset.x > 100) prevSlide()
    if (info.offset.x < -100) nextSlide()
  }}
>
  {/* Slide content */}
</motion.div>
```

### Slide Indicators
```tsx
<div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
  {Array.from({ length: totalSlides }).map((_, i) => (
    <button
      key={i}
      onClick={() => setCurrentSlide(i)}
      className={cn(
        "w-2 h-2 rounded-full transition-all",
        currentSlide === i
          ? "bg-primary w-8"
          : "bg-primary/30 hover:bg-primary/60"
      )}
    />
  ))}
</div>
```

### Audio Controls
```tsx
const [isPlaying, setIsPlaying] = useState(false)
const audioRef = useRef<HTMLAudioElement>(null)

const toggleAudio = () => {
  if (isPlaying) {
    audioRef.current?.pause()
  } else {
    audioRef.current?.play()
  }
  setIsPlaying(!isPlaying)
}

<audio ref={audioRef} src="/audio/background.mp3" loop />
<Button onClick={toggleAudio}>
  {isPlaying ? <Volume2 /> : <VolumeX />}
</Button>
```

### Share Functionality
```tsx
const sharePresentation = async () => {
  if (navigator.share) {
    await navigator.share({
      title: 'AIkinsey Presentation',
      text: 'Check out this presentation',
      url: window.location.href
    })
  } else {
    await navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied to clipboard!')
  }
}

<Button onClick={sharePresentation}>
  <Share className="w-4 h-4 mr-2" />
  Share
</Button>
```

---

## 10. Performance Optimizations

### Image Optimization
```tsx
import Image from 'next/image'

<Image
  src="/assets/slide-1.jpg"
  alt="Background"
  fill
  className="object-cover"
  priority={currentSlide === 0}  // Prioritize first slide
  quality={85}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### Code Splitting
```tsx
import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('./Chart'), {
  loading: () => <Skeleton className="w-full h-64" />,
  ssr: false  // Disable SSR for heavy components
})
```

### Animation Performance
```tsx
// Use transform instead of position changes
<motion.div
  animate={{ x: 100, y: 50 }}  // ✅ GPU accelerated
  // NOT: animate={{ left: 100, top: 50 }}  // ❌ Triggers layout
/>

// Use will-change for smoother animations
<div className="will-change-transform">
  <motion.div animate={{ scale: 1.1 }} />
</div>
```

---

## Summary for Claude AI

When generating code from Figma designs for this AIkinsey presentation:

**Design System**:
- Use **HSL-based CSS variables** from `globals.css`
- Follow **Tailwind utility-first** approach (avoid custom CSS)
- Match **shadcn/ui component patterns** for consistency

**Colors**:
- Extract from Figma → Convert to Tailwind color names
- Badges: Use `yellow-500`, `red-500`, `green-500`, `blue-500`, `purple-500`, `pink-500`
- Gradients: Use `bg-gradient-to-r from-{color} to-{color}`

**Typography**:
- Titles: `text-4xl` to `text-6xl` + `font-bold`
- Subtitles: `text-xl` to `text-2xl` + `font-semibold`
- Body: `text-base` to `text-lg` + `font-normal`

**Layout**:
- Use **data-driven architecture** - add to `slides.json`
- Choose one of 8 slide types
- Responsive: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

**Icons**:
- Use **Lucide React** icons only
- Reference in JSON as `"[IconName] Text"`
- Import: `import { IconName } from 'lucide-react'`

**Animations**:
- Use **Framer Motion** for page transitions
- Use **Tailwind animations** for micro-interactions
- Keep animations subtle and professional

**Assets**:
- Export from Figma at **1920x1080**
- Save to `public/assets/slide-{number}-{name}.jpg`
- Use Next.js `<Image>` component with `fill` and `priority`

**Best Practices**:
- Always add TypeScript types
- Use `cn()` utility for class merging
- Maintain accessibility (ARIA labels, semantic HTML)
- Test responsiveness on mobile, tablet, desktop
- Optimize for performance (lazy load, code split)
