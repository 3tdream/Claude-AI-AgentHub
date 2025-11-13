# JSON-Driven Slideshow Guide

Complete guide to customizing your slideshow using JSON configuration.

## Overview

The slideshow system is **fully customizable** through a JSON configuration file. You can control:
- Theme colors and fonts
- Layout types for each slide
- Animation effects
- Content and images
- And much more!

## Theme Configuration

The theme controls the overall look and feel of your slideshow.

```json
{
  "theme": {
    "name": "Light & Bright",
    "colors": {
      "primary": "#2563eb",        // Primary brand color
      "secondary": "#7c3aed",      // Secondary brand color
      "accent": "#f59e0b",         // Accent color
      "background": "#ffffff",     // Main background
      "panelBackground": "#f8fafc", // Sidebar/panel background
      "text": "#1e293b",           // Main text color
      "textSecondary": "#64748b",  // Secondary text color
      "border": "#e2e8f0",         // Border color
      "controlBg": "#2563eb",      // Button background
      "controlText": "#ffffff",    // Button text
      "controlHover": "#1d4ed8"    // Button hover color
    },
    "fonts": {
      "title": "'Inter', sans-serif",
      "body": "'Inter', sans-serif"
    },
    "effects": {
      "borderRadius": "16px",
      "shadow": "0 10px 40px rgba(0,0,0,0.1)"
    }
  }
}
```

### Pre-made Theme Examples

#### Dark Theme
```json
{
  "colors": {
    "primary": "#a78bfa",
    "secondary": "#f472b6",
    "accent": "#fbbf24",
    "background": "#0f172a",
    "panelBackground": "#1e293b",
    "text": "#ffffff",
    "textSecondary": "#94a3b8",
    "border": "#334155",
    "controlBg": "#4c1d95",
    "controlText": "#ffffff",
    "controlHover": "#6d28d9"
  }
}
```

#### Corporate Blue
```json
{
  "colors": {
    "primary": "#1e40af",
    "secondary": "#0ea5e9",
    "accent": "#eab308",
    "background": "#ffffff",
    "panelBackground": "#f1f5f9",
    "text": "#0f172a",
    "textSecondary": "#475569",
    "border": "#cbd5e1",
    "controlBg": "#1e40af",
    "controlText": "#ffffff",
    "controlHover": "#1e3a8a"
  }
}
```

## Layout Types

Choose from 6 different layout types for each slide:

### 1. Centered
Perfect for title slides and key messages.
```json
{
  "layout": "centered",
  "badge": "Welcome",
  "title": "Your Title",
  "subtitle": "Subtitle text",
  "content": "Main content",
  "footer": "Footer text"
}
```

### 2. Split Left
Image on the left, content on the right.
```json
{
  "layout": "split-left",
  "title": "Your Title",
  "subtitle": "Subtitle",
  "image": "app-logo",
  "items": ["Point 1", "Point 2", "Point 3"]
}
```

### 3. Split Right
Content on the left, image on the right.
```json
{
  "layout": "split-right",
  "title": "Your Title",
  "subtitle": "Subtitle",
  "image": "hero-banner",
  "content": "Description text",
  "items": ["Point 1", "Point 2"]
}
```

### 4. Minimal
Clean, left-aligned layout with lots of whitespace.
```json
{
  "layout": "minimal",
  "badge": "Section",
  "title": "Title",
  "subtitle": "Subtitle",
  "content": "Content paragraph",
  "items": ["Item 1", "Item 2"]
}
```

### 5. Image Focus
Large image with centered caption below.
```json
{
  "layout": "image-focus",
  "title": "Image Title",
  "subtitle": "Description",
  "image": "product-demo",
  "content": "Caption text"
}
```

### 6. Grid
Display items in a responsive grid layout.
```json
{
  "layout": "grid",
  "title": "Features",
  "subtitle": "Our key capabilities",
  "gridItems": [
    {"title": "Feature 1", "content": "Description"},
    {"title": "Feature 2", "content": "Description"},
    {"title": "Feature 3", "content": "Description"},
    {"title": "Feature 4", "content": "Description"}
  ]
}
```

## Animation Types

Choose from 5 animation effects:

- `fade` - Simple fade in
- `slide-right` - Slide in from the right
- `slide-left` - Slide in from the left
- `slide-bottom` - Slide up from the bottom
- `zoom` - Zoom in effect

Example:
```json
{
  "layout": "centered",
  "animation": "zoom",
  "title": "Your Title"
}
```

## Image Loading

Images are loaded from the `assets/images/` folder by key.

### Setup
1. Place your image in `assets/images/`
2. Reference it in JSON by filename (without extension)

Example:
```
assets/images/app-logo.png
assets/images/hero-banner.jpg
assets/images/team-photo.png
```

JSON:
```json
{
  "image": "app-logo"
}
```

The system will automatically find the correct file extension (png, jpg, jpeg, svg, webp, gif).

## Slide Properties

Each slide can have:

| Property | Type | Description |
|----------|------|-------------|
| `layout` | string | Layout type (required) |
| `animation` | string | Animation effect (required) |
| `background` | string | Custom background (CSS color/gradient) |
| `badge` | string | Small label at top |
| `title` | string | Main title |
| `subtitle` | string | Subtitle text |
| `content` | string | Paragraph content |
| `items` | array | Bullet point list |
| `gridItems` | array | Grid items (for grid layout) |
| `image` | string | Image key |
| `footer` | string | Footer text |
| `textColor` | string | Override text color |
| `badgeColor` | string | Override badge background |
| `badgeBorder` | string | Override badge border |
| `badgeText` | string | Override badge text color |

## Custom Slide Colors

Override theme colors for individual slides:

```json
{
  "layout": "centered",
  "background": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "textColor": "#ffffff",
  "badgeColor": "rgba(255,255,255,0.2)",
  "badgeBorder": "rgba(255,255,255,0.3)",
  "badgeText": "#ffffff",
  "title": "Your Title"
}
```

## Complete Example

Here's a complete slideshow configuration:

```json
{
  "theme": {
    "name": "Modern Blue",
    "colors": {
      "primary": "#2563eb",
      "secondary": "#7c3aed",
      "accent": "#f59e0b",
      "background": "#ffffff",
      "panelBackground": "#f8fafc",
      "text": "#1e293b",
      "textSecondary": "#64748b",
      "border": "#e2e8f0",
      "controlBg": "#2563eb",
      "controlText": "#ffffff",
      "controlHover": "#1d4ed8"
    },
    "fonts": {
      "title": "'Inter', sans-serif",
      "body": "'Inter', sans-serif"
    },
    "effects": {
      "borderRadius": "16px",
      "shadow": "0 10px 40px rgba(0,0,0,0.1)"
    }
  },
  "slides": [
    {
      "layout": "centered",
      "animation": "fade",
      "background": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "badge": "Introduction",
      "title": "Welcome",
      "subtitle": "Let's get started",
      "textColor": "#ffffff",
      "badgeColor": "rgba(255,255,255,0.2)",
      "badgeText": "#ffffff"
    },
    {
      "layout": "split-left",
      "animation": "slide-right",
      "badge": "Features",
      "title": "Amazing Features",
      "subtitle": "What we offer",
      "image": "app-logo",
      "items": [
        "Fast performance",
        "Easy to use",
        "Fully customizable"
      ]
    },
    {
      "layout": "grid",
      "animation": "zoom",
      "title": "Our Services",
      "subtitle": "What we do best",
      "gridItems": [
        {"title": "Design", "content": "Beautiful interfaces"},
        {"title": "Development", "content": "Clean code"},
        {"title": "Support", "content": "24/7 assistance"},
        {"title": "Training", "content": "Expert guidance"}
      ]
    }
  ]
}
```

## Tips & Best Practices

1. **Theme First**: Define your theme colors first, then build slides
2. **Consistent Animations**: Use 2-3 animation types max for consistency
3. **Image Optimization**: Use compressed images (< 500KB each)
4. **Readable Text**: Ensure good contrast between text and backgrounds
5. **Mobile Friendly**: Keep layouts simple, avoid too much text
6. **Test Layout Combos**: Try different layout types for variety
7. **Grid Items**: Use 2-6 grid items for best results

## Navigation

- **Keyboard**: Arrow keys or spacebar
- **On-screen**: Previous/Next buttons
- **Indicator**: Shows current slide number

## File Structure

```
your-project/
├── assets/
│   ├── images/
│   │   ├── app-logo.png
│   │   ├── hero-banner.jpg
│   │   └── product-demo.png
│   └── icons/
├── slideshow-json-demo.html
├── slideshow-config-example.json
└── SLIDESHOW-GUIDE.md
```

## Troubleshooting

### Images not loading?
- Check file exists in `assets/images/`
- Verify filename matches the key in JSON
- Supported formats: png, jpg, jpeg, svg, webp, gif

### Colors not applying?
- Use valid CSS color values (hex, rgb, rgba)
- Check JSON syntax is valid

### Layout looks broken?
- Ensure layout name is spelled correctly
- Verify you're using supported layout types

## Need Help?

Refer to `slideshow-config-example.json` for a working example configuration.
