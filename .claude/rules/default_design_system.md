# Default Design System Rules for All Projects

## Technology Stack Preferences

### Primary Stack (Modern Web Applications)
- **Framework**: Next.js 15+ with App Router OR Vite 7+ with React
- **UI Library**: React 18.3+
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS 3.4+
- **UI Components**: shadcn/ui with Radix UI primitives
- **Icons**: Lucide React
- **Animation**: Framer Motion (Motion)
- **Charts**: Recharts (when needed)

### Alternative Stacks
- **3D Projects**: Three.js + React Three Fiber
- **Presentations**: Next.js + shadcn/ui + Framer Motion
- **Games**: React + Three.js + Vite

---

## Design Token Standards

### Color System
**Use HSL-based CSS variables** for maximum flexibility:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --primary: 220 70% 50%;
  --secondary: 160 60% 45%;
  --accent: 280 65% 60%;
  --muted: 0 0% 96.1%;
  --destructive: 0 84.2% 60.2%;
  --border: 0 0% 89.8%;
  --radius: 0.5rem;
}

.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  /* ... dark mode variants */
}
```

### Typography Scale
- **Hero**: `text-6xl` (60px) `font-bold`
- **H1**: `text-5xl` (48px) `font-bold`
- **H2**: `text-4xl` (36px) `font-bold`
- **H3**: `text-3xl` (30px) `font-semibold`
- **H4**: `text-2xl` (24px) `font-semibold`
- **Body Large**: `text-xl` (20px) `font-normal`
- **Body**: `text-base` (16px) `font-normal`
- **Small**: `text-sm` (14px) `font-normal`
- **Tiny**: `text-xs` (12px) `font-normal`

### Spacing Scale (4px base)
- **xs**: `p-1` (4px)
- **sm**: `p-2` (8px)
- **md**: `p-4` (16px)
- **lg**: `p-6` (24px)
- **xl**: `p-8` (32px)
- **2xl**: `p-12` (48px)
- **3xl**: `p-16` (64px)

### Border Radius
- **sm**: `rounded-sm` (2px)
- **default**: `rounded` (4px)
- **md**: `rounded-md` (6px)
- **lg**: `rounded-lg` (8px)
- **xl**: `rounded-xl` (12px)
- **2xl**: `rounded-2xl` (16px)
- **full**: `rounded-full` (9999px)

---

## Component Patterns

### Button
```tsx
<Button
  variant="default | outline | ghost | link | destructive"
  size="sm | md | lg"
  className="additional-classes"
>
  Content
</Button>
```

### Card
```tsx
<Card className="p-6">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
  <CardFooter>
    Footer
  </CardFooter>
</Card>
```

### Badge
```tsx
<Badge variant="default | secondary | outline | destructive">
  Label
</Badge>
```

---

## Layout Patterns

### Responsive Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => <Card key={item.id} />)}
</div>
```

### Centered Container
```tsx
<div className="container mx-auto px-4 md:px-8 lg:px-16 max-w-7xl">
  Content
</div>
```

### Flexbox Patterns
```tsx
// Horizontal center
<div className="flex items-center justify-center">

// Space between
<div className="flex items-center justify-between">

// Vertical stack
<div className="flex flex-col gap-4">

// Grid with auto-fit
<div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
```

---

## Animation Standards

### Page Transitions (Framer Motion)
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.5, ease: "easeOut" }}
>
  Content
</motion.div>
```

### Hover Effects
```tsx
<div className="transition-all duration-300 hover:scale-105 hover:shadow-xl">
  Hover me
</div>
```

### Tailwind Animations
- **Pulse**: `animate-pulse` - Loading states
- **Spin**: `animate-spin` - Spinners
- **Bounce**: `animate-bounce` - Attention grabbers
- **Fade**: `transition-opacity duration-300`

---

## Icon Usage

### Import Pattern (Lucide React)
```tsx
import { Icon1, Icon2, Icon3 } from 'lucide-react'

<Icon1 className="w-6 h-6 text-primary" />
```

### Icon Sizes
- **xs**: `w-3 h-3` (12px)
- **sm**: `w-4 h-4` (16px)
- **md**: `w-6 h-6` (24px) - default
- **lg**: `w-8 h-8` (32px)
- **xl**: `w-12 h-12` (48px)
- **2xl**: `w-16 h-16` (64px)

---

## File Organization

### Next.js 15 (App Router)
```
project/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── (routes)/
├── components/
│   ├── ui/          # shadcn/ui components
│   └── custom/      # Custom components
├── lib/
│   └── utils.ts
├── public/
│   └── assets/
├── types/
│   └── index.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### Vite + React
```
project/
├── src/
│   ├── components/
│   ├── assets/
│   ├── lib/
│   ├── types/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Figma Integration Workflow

### Step 1: Extract Design Tokens
1. Open Figma inspect panel
2. Note colors (convert to HSL or Tailwind names)
3. Note typography (map to Tailwind scale)
4. Note spacing (round to 4px increments)

### Step 2: Export Assets
1. Export images at 2x resolution
2. Use WebP or AVIF for better compression
3. Name systematically: `{section}-{name}.{ext}`

### Step 3: Build Components
1. Identify reusable patterns
2. Build with shadcn/ui when possible
3. Use Tailwind utilities (avoid custom CSS)
4. Make responsive (mobile-first)

### Step 4: Add Animations
1. Use Framer Motion for complex animations
2. Use Tailwind transitions for simple effects
3. Keep animations subtle and professional

---

## Performance Best Practices

### Images
```tsx
import Image from 'next/image'

<Image
  src="/assets/image.jpg"
  alt="Description"
  width={1920}
  height={1080}
  quality={85}
  priority  // For above-the-fold images
/>
```

### Code Splitting
```tsx
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./Heavy'), {
  loading: () => <Skeleton />,
  ssr: false
})
```

### Lazy Loading
```tsx
import { lazy, Suspense } from 'react'

const Component = lazy(() => import('./Component'))

<Suspense fallback={<Loading />}>
  <Component />
</Suspense>
```

---

## Accessibility Standards

### ARIA Labels
```tsx
<button aria-label="Close dialog">
  <X className="w-4 h-4" />
</button>
```

### Semantic HTML
```tsx
// Good
<nav><ul><li><a href="/"></a></li></ul></nav>

// Bad
<div><div><span onClick={...}></span></div></div>
```

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Tab order should be logical
- Focus states must be visible

---

## TypeScript Standards

### Component Props
```tsx
interface ButtonProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export function Button({
  variant = 'default',
  size = 'md',
  children,
  ...props
}: ButtonProps) {
  return <button {...props}>{children}</button>
}
```

### Type Definitions
```tsx
// types/index.ts
export type Status = 'idle' | 'loading' | 'success' | 'error'

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
}

export interface ApiResponse<T> {
  data: T
  status: Status
  error?: string
}
```

---

## Git Workflow

### Commit Message Format
```
type(scope): description

Examples:
feat(auth): add login functionality
fix(ui): resolve button alignment issue
docs(readme): update installation steps
style(header): improve responsive layout
refactor(api): simplify data fetching logic
perf(images): optimize image loading
test(auth): add login unit tests
```

### Branch Naming
```
feature/feature-name
bugfix/issue-description
hotfix/critical-fix
release/v1.0.0
```

---

## Environment Variables

### Next.js
```
# .env.local
NEXT_PUBLIC_API_URL=https://api.example.com
DATABASE_URL=postgresql://...
SECRET_KEY=your-secret-key
```

### Vite
```
# .env
VITE_API_URL=https://api.example.com
VITE_PUBLIC_KEY=your-public-key
```

---

## Testing Standards

### Unit Tests (Vitest/Jest)
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    screen.getByText('Click').click()
    expect(handleClick).toHaveBeenCalledOnce()
  })
})
```

---

## Deployment

### Vercel (Recommended for Next.js)
```bash
npm i -g vercel
vercel
```

### Build Commands
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

---

## Summary

**Always prefer:**
1. TypeScript over JavaScript
2. Tailwind over custom CSS
3. shadcn/ui over custom components
4. Lucide React over other icon libraries
5. Framer Motion over CSS animations for complex effects
6. Next.js for full-stack apps, Vite for client-only
7. HSL colors over hex
8. Mobile-first responsive design
9. Semantic HTML
10. Accessibility by default
