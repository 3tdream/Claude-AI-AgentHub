# Tiltan Logo Components Guide

## Overview

The Tiltan website features custom-designed, animated SVG logo components inspired by the geometric, modern aesthetic of sites like Alche.studio. The logos are built with Framer Motion for smooth animations and come in multiple variants.

## Logo Components

### 1. TiltanLogo (`components/ui/TiltanLogo.tsx`)
The main animated logo with full effects.

**Features:**
- Animated geometric T shape
- Gradient fills (#22c55e to #10b981)
- Glow effects with pulsing animation
- Decorative accent triangles
- Circular frame border
- Path animation on load

**Usage:**
```tsx
import TiltanLogo from "@/components/ui/TiltanLogo";

// Default animated logo
<TiltanLogo size={120} animated={true} />

// Static version
<TiltanLogo size={60} animated={false} />

// With custom className
<TiltanLogo size={80} animated={true} className="my-custom-class" />
```

**Props:**
- `size?: number` - Size in pixels (default: 40)
- `animated?: boolean` - Enable animations (default: true)
- `className?: string` - Additional CSS classes

**Where it's used:**
- Hero section (large, 120px, animated on page load)

---

### 2. TiltanLogoMark (`components/ui/TiltanLogoMark.tsx`)
A versatile logo mark with three style variants.

**Variants:**

#### a) `geometric` (default for navigation)
- Angular, modern T shape inspired by Alche.studio
- Drop shadow and glow effects
- Rotating background ring (optional)
- Side decorative elements
- Perfect for headers and branding

#### b) `minimal`
- Clean line-based T shape
- No fill, stroke only
- Subtle path animation
- Great for footers and small spaces

#### c) `default`
- Simple, solid T shape
- Gradient fill
- Rounded corners
- Stagger animation on elements

**Usage:**
```tsx
import TiltanLogoMark from "@/components/ui/TiltanLogoMark";

// Geometric variant (used in navigation)
<TiltanLogoMark size={40} variant="geometric" animated={false} />

// Minimal variant
<TiltanLogoMark size={32} variant="minimal" animated={true} />

// Default variant
<TiltanLogoMark size={48} variant="default" animated={true} />
```

**Props:**
- `size?: number` - Size in pixels (default: 40)
- `animated?: boolean` - Enable animations (default: true)
- `variant?: "default" | "minimal" | "geometric"` - Visual style
- `className?: string` - Additional CSS classes

**Where it's used:**
- Navigation header (geometric variant, 40px)
- Can be used in footer, loading states, etc.

---

## Design System

### Colors
Both logos use the brand's accent color:
- **Primary Green**: #22c55e (accent)
- **Darker Green**: #16a34a / #10b981 (gradient end)

These match the Tailwind theme:
```css
--accent: 142 76% 36%;
```

### Animations

**TiltanLogo animations:**
1. Path drawing (1.5s easeInOut)
2. Scale fade-in (0.8s easeOut)
3. Pulsing glow (2s infinite)

**TiltanLogoMark animations:**
1. Stagger children (0.1s delay between elements)
2. Scale fade-in (0.4s backOut)
3. Rotating ring (20s infinite) - geometric variant only

All animations respect `prefers-reduced-motion`.

---

## Customization

### Change Colors
Edit the gradient stops in each component:

```tsx
<linearGradient id="logoGradient">
  <stop offset="0%" style={{ stopColor: "#YOUR_COLOR" }} />
  <stop offset="100%" style={{ stopColor: "#YOUR_COLOR_2" }} />
</linearGradient>
```

### Adjust Animations
Modify the `variants` objects:

```tsx
const pathVariants = {
  visible: {
    pathLength: 1,
    transition: {
      duration: 1.5, // <- Change duration
      ease: "easeInOut",
    },
  },
};
```

### Create New Variants
Add new cases to TiltanLogoMark's variant prop:

```tsx
if (variant === "myNewVariant") {
  return (
    <svg>{/* Your custom design */}</svg>
  );
}
```

---

## Best Practices

### Size Guidelines
- **Navigation**: 40-48px (geometric variant)
- **Hero**: 100-150px (full TiltanLogo)
- **Footer**: 32-40px (minimal variant)
- **Favicon**: 32px or 64px
- **Loading states**: 60-80px

### Animation Recommendations
- **Use `animated={true}`** for:
  - First page load (Hero)
  - Loading screens
  - Brand showcases

- **Use `animated={false}`** for:
  - Navigation (to avoid distraction)
  - Repeated elements
  - Small icons

### Performance
- Logos are lightweight SVG
- Animations use GPU-accelerated CSS transforms
- No external image loading required
- Framer Motion lazy-loads animation data

---

## Examples

### Navigation Logo
```tsx
<a href="#home" className="flex items-center space-x-3 group">
  <TiltanLogoMark
    size={40}
    animated={false}
    variant="geometric"
    className="transition-transform group-hover:scale-110"
  />
  <span className="font-bold">TILTAN</span>
</a>
```

### Hero Logo
```tsx
<motion.div className="mb-8 flex justify-center">
  <TiltanLogo size={120} animated={true} />
</motion.div>
```

### Footer Logo
```tsx
<TiltanLogoMark
  size={32}
  variant="minimal"
  animated={false}
  className="opacity-60 hover:opacity-100 transition-opacity"
/>
```

### Loading Spinner
```tsx
<div className="flex items-center justify-center h-screen">
  <TiltanLogo size={80} animated={true} />
</div>
```

---

## Export for Other Uses

### Export as PNG
To create PNG versions for social media or documents:

1. Open component in browser
2. Right-click SVG → Inspect
3. Copy SVG code
4. Use online converter (svg2png.com) or Figma

### Export for Print
SVGs scale infinitely - use the component directly or export at high resolution (300dpi recommended).

### Create Favicon
```tsx
// Render at 32x32 or 64x64
<TiltanLogoMark size={32} variant="geometric" animated={false} />
```

Then convert to .ico format using online tools.

---

## Inspiration & References

The logo design is inspired by:
- **Alche.studio** - Angular, geometric shapes
- **Modern tech brands** - Clean, minimal aesthetics
- **Bauhaus movement** - Functional, geometric forms

The "T" shape represents:
- **Tiltan** (obviously)
- **Technology** and modern design
- **Transform** (students' creative journey)
- **Triangle** elements = stability and creativity

---

## Future Enhancements

Potential additions:
- [ ] 3D version with Three.js
- [ ] Animated microinteractions on hover
- [ ] Alternative color schemes (for dark/light modes)
- [ ] Monochrome version for documents
- [ ] Outlined version for merchandise
- [ ] Loading spinner variant

---

**Created**: October 15, 2025
**Designer**: Claude Code
**Format**: SVG with Framer Motion
**License**: Tiltan College © 2025
