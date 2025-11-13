# Figma to Code Integration Guide

## Quick Start with Figma MCP

### Available MCP Tools
1. **mcp__figma__get_screenshot** - Get screenshot of Figma node
2. **mcp__figma__get_design_context** - Get code and assets for a node
3. **mcp__figma__get_metadata** - Get structure overview in XML
4. **mcp__figma__get_variable_defs** - Get variable definitions
5. **mcp__figma__get_code_connect_map** - Get code mapping

### Workflow

#### 1. Extract File Key and Node ID from URL
```
Figma URL format:
https://figma.com/design/{fileKey}/{fileName}?node-id={int1}-{int2}

Example:
https://figma.com/design/abc123/MyDesign?node-id=1-2

Extract:
- fileKey: "abc123"
- nodeId: "1:2" (replace dash with colon)
```

#### 2. Get Design Context
```typescript
// Use get_design_context to get code + assets
mcp__figma__get_design_context({
  fileKey: "abc123",
  nodeId: "1:2",
  clientLanguages: "typescript,javascript",
  clientFrameworks: "react,nextjs"
})
```

#### 3. Get Screenshot for Reference
```typescript
mcp__figma__get_screenshot({
  fileKey: "abc123",
  nodeId: "1:2"
})
```

---

## Design Token Extraction

### Colors

#### From Figma Inspect Panel
```
Figma: #3B82F6
Convert to: blue-500 (Tailwind)
Or: hsl(217 91% 60%) (CSS variable)
```

#### Gradient Conversion
```
Figma: Linear gradient 135deg
Colors: #667eea → #764ba2

CSS: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
Tailwind: bg-gradient-to-br from-indigo-500 to-purple-600
```

### Typography

#### Font Size Mapping
```
Figma → Tailwind
60px  → text-6xl
48px  → text-5xl
36px  → text-4xl
30px  → text-3xl
24px  → text-2xl
20px  → text-xl
16px  → text-base
14px  → text-sm
12px  → text-xs
```

#### Font Weight Mapping
```
Figma → Tailwind → CSS
100   → font-thin → 100
300   → font-light → 300
400   → font-normal → 400
500   → font-medium → 500
600   → font-semibold → 600
700   → font-bold → 700
900   → font-black → 900
```

### Spacing

#### Auto Layout → Flexbox/Grid
```
Figma Auto Layout:
- Direction: Horizontal → flex-row
- Direction: Vertical → flex-col
- Gap: 16px → gap-4
- Padding: 24px → p-6
- Align: Start → items-start
- Align: Center → items-center
- Justify: Space Between → justify-between
```

#### Spacing Scale
```
Figma → Tailwind
4px   → 1 (p-1, gap-1)
8px   → 2 (p-2, gap-2)
12px  → 3 (p-3, gap-3)
16px  → 4 (p-4, gap-4)
24px  → 6 (p-6, gap-6)
32px  → 8 (p-8, gap-8)
48px  → 12 (p-12, gap-12)
64px  → 16 (p-16, gap-16)
```

### Effects

#### Shadow Conversion
```
Figma Shadow:
X: 0, Y: 10, Blur: 30, Spread: 0, Color: rgba(0,0,0,0.1)

Tailwind:
shadow-xl (closest match)

Custom:
shadow-[0_10px_30px_rgba(0,0,0,0.1)]
```

#### Blur Effects
```
Figma Background Blur: 20px
Tailwind: backdrop-blur-md

Figma Blur: 10px
Tailwind: blur-md
```

---

## Component Patterns

### Button from Figma

**Figma Properties:**
- Width: 120px
- Height: 40px
- Padding: 12px 24px
- Border Radius: 6px
- Background: #3B82F6
- Text: "Click me"
- Font: 14px, 600

**Code:**
```tsx
<Button
  className="h-10 px-6 rounded-md bg-blue-500 text-sm font-semibold"
>
  Click me
</Button>
```

### Card from Figma

**Figma Properties:**
- Auto Layout: Vertical, gap 16px
- Padding: 24px
- Border Radius: 12px
- Background: #FFFFFF
- Shadow: 0 4px 20px rgba(0,0,0,0.08)

**Code:**
```tsx
<Card className="p-6 rounded-xl shadow-lg">
  <CardContent className="space-y-4">
    {content}
  </CardContent>
</Card>
```

### Grid Layout from Figma

**Figma Properties:**
- Layout Grid: 3 columns
- Gutter: 24px
- Margin: 48px

**Code:**
```tsx
<div className="container mx-auto px-12">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {items.map(item => <Card key={item.id} />)}
  </div>
</div>
```

---

## Asset Export

### Export Settings

#### Images
```
Format: WebP (best compression)
Scale: 2x (for retina displays)
Naming: {section}-{name}.webp

Example: hero-background.webp
```

#### Icons
```
Format: SVG
Options: Outline text, Include id attribute
Naming: icon-{name}.svg

Example: icon-arrow-right.svg
```

#### Logo
```
Formats: SVG (primary), PNG (fallback)
Sizes: Original + @2x
Naming: logo.svg, logo@2x.png
```

### Next.js Image Optimization

```tsx
import Image from 'next/image'

<Image
  src="/assets/hero-background.webp"
  alt="Hero background"
  width={1920}
  height={1080}
  quality={90}
  priority
  className="object-cover"
/>
```

### Vite Asset Handling

```tsx
import heroImage from './assets/hero-background.webp'

<img
  src={heroImage}
  alt="Hero background"
  className="object-cover w-full h-full"
/>
```

---

## Responsive Design

### Figma Breakpoints → Tailwind

#### Desktop First (Figma)
```
Desktop: 1440px
Tablet: 768px
Mobile: 375px
```

#### Mobile First (Code)
```tsx
// Mobile (default)
<div className="text-2xl">

// Tablet (768px+)
<div className="text-2xl md:text-3xl">

// Desktop (1024px+)
<div className="text-2xl md:text-3xl lg:text-4xl">
```

### Responsive Grid Example

**Figma:**
- Desktop: 4 columns
- Tablet: 2 columns
- Mobile: 1 column

**Code:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {items.map(item => <Card />)}
</div>
```

---

## Animation Translation

### Figma Smart Animate → Framer Motion

#### Fade In
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
>
```

#### Slide In
```tsx
<motion.div
  initial={{ x: -100, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  transition={{ duration: 0.6, ease: "easeOut" }}
>
```

#### Scale
```tsx
<motion.div
  whileHover={{ scale: 1.05 }}
  transition={{ type: "spring", stiffness: 300 }}
>
```

### Figma Prototype → Code

**Prototype:**
- Trigger: On Click
- Action: Navigate to Frame 2
- Animation: Move In, 300ms, Ease Out

**Code:**
```tsx
const [currentFrame, setCurrentFrame] = useState(1)

<AnimatePresence mode="wait">
  <motion.div
    key={currentFrame}
    initial={{ x: 300, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: -300, opacity: 0 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
  >
    <Frame />
  </motion.div>
</AnimatePresence>
```

---

## Variables & Tokens

### Figma Variables → CSS Variables

**Figma Variables:**
```
color/primary: #3B82F6
color/secondary: #8B5CF6
spacing/lg: 24px
radius/md: 8px
```

**CSS Variables:**
```css
:root {
  --color-primary: 217 91% 60%;
  --color-secondary: 258 90% 66%;
  --spacing-lg: 1.5rem;
  --radius-md: 0.5rem;
}
```

**Tailwind Config:**
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

## Component Library Mapping

### Figma Component → shadcn/ui

| Figma Component | shadcn/ui Component |
|----------------|---------------------|
| Button | Button |
| Input Field | Input |
| Checkbox | Checkbox |
| Radio Button | RadioGroup |
| Toggle | Switch |
| Dropdown | Select |
| Modal | Dialog |
| Tooltip | Tooltip |
| Card | Card |
| Tab Bar | Tabs |
| Badge | Badge |
| Alert | Alert |
| Menu | DropdownMenu |

### Custom Components

When shadcn/ui doesn't have a match:
1. Check if it can be composed from existing components
2. Build with Radix UI primitives
3. Use Tailwind for styling

---

## Common Issues & Solutions

### Issue: Colors Don't Match
**Solution:**
1. Check color profile in Figma (RGB vs Display P3)
2. Use HSL instead of hex for better browser support
3. Test on multiple displays

### Issue: Spacing is Off
**Solution:**
1. Use Figma's measurement tool
2. Round to nearest Tailwind value (4px increments)
3. Use exact values with arbitrary values: `p-[23px]`

### Issue: Fonts Look Different
**Solution:**
1. Ensure same font family is loaded
2. Check font weights match exactly
3. Adjust line-height and letter-spacing

### Issue: Layout Breaks on Mobile
**Solution:**
1. Use mobile-first approach
2. Test all breakpoints
3. Use `min-w-0` to prevent flex shrink issues

---

## Checklist

### Before Starting
- [ ] Extract file key and node IDs from Figma URL
- [ ] Get design context via MCP
- [ ] Export all assets at 2x resolution
- [ ] Note all colors and convert to HSL/Tailwind
- [ ] Map typography to Tailwind scale
- [ ] Document spacing values

### During Development
- [ ] Build mobile layout first
- [ ] Add tablet breakpoint (md:)
- [ ] Add desktop breakpoint (lg:)
- [ ] Use shadcn/ui components when possible
- [ ] Add Framer Motion animations
- [ ] Test keyboard navigation
- [ ] Add ARIA labels

### Before Deployment
- [ ] Optimize all images
- [ ] Test on real devices
- [ ] Check accessibility (WCAG 2.1 AA)
- [ ] Validate responsive design
- [ ] Test dark mode (if applicable)
- [ ] Run Lighthouse audit

---

## Example: Complete Component Migration

### 1. Figma Design
```
Component: Hero Section
- Background: Image with gradient overlay
- Title: "Welcome to AIkinsey", 60px, Bold
- Subtitle: "Autonomous AI Workforce", 24px, Medium
- CTA Button: "Get Started", Blue, 16px, Semibold
- Layout: Centered, vertical stack, gap 24px
- Padding: 64px
```

### 2. Code Implementation
```tsx
<section className="relative h-screen flex items-center justify-center p-16">
  {/* Background Image */}
  <Image
    src="/assets/hero-background.webp"
    alt="Hero background"
    fill
    className="object-cover"
    priority
  />

  {/* Gradient Overlay */}
  <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />

  {/* Content */}
  <div className="relative z-10 text-center space-y-6 max-w-4xl">
    <motion.h1
      className="text-6xl font-bold text-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      Welcome to AIkinsey
    </motion.h1>

    <motion.p
      className="text-2xl font-medium text-white/90"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      Autonomous AI Workforce
    </motion.p>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <Button size="lg" className="text-base font-semibold">
        Get Started
      </Button>
    </motion.div>
  </div>
</section>
```

---

## Quick Reference

### Figma → Tailwind Cheat Sheet

```
# Colors
#000000 → black
#FFFFFF → white
#3B82F6 → blue-500
#10B981 → green-500
#F59E0B → yellow-500
#EF4444 → red-500

# Sizing
w: 100% → w-full
h: 100% → h-full
w: 320px → w-80
h: 40px → h-10

# Flexbox
justify-content: center → justify-center
align-items: center → items-center
flex-direction: column → flex-col
gap: 16px → gap-4

# Typography
font-size: 16px → text-base
font-weight: 600 → font-semibold
text-align: center → text-center
line-height: 1.5 → leading-normal
```
