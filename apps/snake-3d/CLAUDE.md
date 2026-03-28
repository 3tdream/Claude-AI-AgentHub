# Design System Rules for Figma Integration via MCP

## Project Overview
This is a **3D Snake Game** built with React, Three.js, Vite, and Tailwind CSS. The project features a modern, cyberpunk-inspired aesthetic with neon colors and dynamic 3D rendering.

---

## 1. Design Token Definitions

### Location
Design tokens are defined in two primary locations:
- **3D Game Constants**: `src/game/constants.js` (lines 18-31)
- **Component-Level Constants**: `src/components/Snake3DGame.jsx` (lines 22-36)

### Color Tokens

#### 3D Scene Colors (Hexadecimal)
All 3D scene colors are defined using Three.js hex format (`0xRRGGBB`):

```javascript
// From src/game/constants.js and Snake3DGame.jsx
export const COLORS = {
  BACKGROUND: 0x0a0e27,      // Deep midnight blue
  FLOOR: 0x1a1f3a,           // Darker blue-gray
  GRID: 0x2d3561,            // Muted blue-purple
  SNAKE: 0x00e5ff,           // Bright cyan
  SNAKE_EMISSIVE: 0x00b8d4,  // Cyan glow
  SNAKE_HEAD: 0x00fff7,      // Bright white-cyan
  FOOD: 0xff006e,            // Hot pink/magenta
  FOOD_EMISSIVE: 0xff1744,   // Pink-red glow
  WALL: 0x4a5568,            // Cool gray
  WALL_EMISSIVE: 0x2d3748,   // Darker gray glow
  OBSTACLE: 0xff4444,        // Red obstacle
  OBSTACLE_EMISSIVE: 0xff0000, // Bright red glow
  FOG: 0x0a0e27,             // Matches background
  ACCENT: 0x7c3aed           // Purple accent
};
```

#### UI Colors (Tailwind CSS Classes)
The UI layer uses Tailwind CSS utility classes with the following color scheme:

| Purpose | Tailwind Classes | Hex Equivalent |
|---------|------------------|----------------|
| Background | `bg-slate-900`, `bg-slate-800` | #0f172a, #1e293b |
| Primary Accent | `text-emerald-400`, `bg-emerald-500` | #34d399, #10b981 |
| Secondary Accent | `text-cyan-400` | #22d3ee |
| Highlight | `text-yellow-400` | #facc15 |
| Warning/Error | `text-red-500` | #ef4444 |
| Power-ups | `text-purple-400`, `bg-purple-600` | #c084fc, #9333ea |

### Typography Tokens

#### Font Family
```css
/* From src/index.css */
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
```

#### Font Sizes (Tailwind Classes)
- **Headings**: `text-3xl` (30px), `text-4xl` (36px), `text-5xl` (48px)
- **Body Large**: `text-2xl` (24px), `text-xl` (20px)
- **Body**: `text-lg` (18px)
- **Small**: `text-sm` (14px), `text-xs` (12px)

#### Font Weights
- **Bold**: `font-bold` (700)
- Default weight applied to most text

### Spacing Tokens
Spacing follows Tailwind's default scale:
- **Padding**: `p-2` (0.5rem), `p-4` (1rem), `p-6` (1.5rem), `px-8` (2rem horizontal)
- **Gaps**: `gap-2`, `gap-4`, `gap-6`
- **Margins**: `mb-2`, `mb-4`, `mb-6`

### 3D-Specific Tokens

#### Camera Configuration
```javascript
// From src/game/constants.js
export const CAMERA_CONFIG = {
  FOV: 75,
  NEAR: 0.1,
  FAR: 1000,
  POSITION: { x: 0, y: 18, z: 12 },
  FOLLOW_SMOOTHNESS: 0.005,
  LOOK_AHEAD: 2,
  LOOK_SMOOTHNESS: 0.008
};
```

#### Lighting Configuration
- **Ambient Light**: Intensity 0.4, color: 0xffffff
- **Directional Light**: Intensity 1.5, position: (15, 25, 10)
- **Point Lights**: Cyan (0x00e5ff) and Pink (0xff006e) with animated positions

---

## 2. Component Library

### Location
All UI components are centralized in:
- `src/components/Snake3DGame.jsx` (main game component)
- `src/App.jsx` (root app wrapper)

### Component Architecture
**Monolithic Component Pattern**: The entire game is encapsulated in a single `Snake3DGame` component with embedded UI states.

### Component States

#### 1. Difficulty Selection Screen
```jsx
// Lines 981-1005
<div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 z-10">
  <h2 className="text-4xl font-bold text-white mb-2">Select Difficulty</h2>
  <div className="grid grid-cols-2 gap-4">
    {/* Difficulty buttons */}
  </div>
</div>
```

**Pattern**: Overlay with black semi-transparent background (`bg-opacity-80`), centered flex layout

#### 2. Game HUD
```jsx
// Lines 945-958
<div className="bg-slate-800 rounded-t-lg p-4 flex justify-between items-center border-b-2 border-emerald-500">
  <h1 className="text-3xl font-bold text-emerald-400">3D Snake Enhanced ⚡</h1>
  <div className="flex gap-6 items-center">
    {/* Score, High Score, Speed */}
  </div>
</div>
```

**Pattern**: Dark header bar with emerald accent border, flex layout with space-between

#### 3. Power-ups Indicator
```jsx
// Lines 960-968
<div className="bg-slate-700 p-2 flex gap-2 flex-wrap">
  {activePowerUps.map(pu => (
    <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
      {pu.label}
    </span>
  ))}
</div>
```

**Pattern**: Purple pill badges with pulse animation

#### 4. Game Over Screen
```jsx
// Lines 1014-1030
<div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 z-10">
  <h2 className="text-5xl font-bold text-red-500 mb-4">Game Over!</h2>
  {/* Score display and restart button */}
</div>
```

**Pattern**: Similar to difficulty screen with red accent for game over state

### UI Component Patterns
- **Buttons**: `px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-xl transition-colors`
- **Cards/Containers**: `bg-slate-800 rounded-lg p-4`
- **Overlays**: `absolute inset-0 bg-black bg-opacity-80 z-10`
- **Badges**: `bg-purple-600 text-white px-3 py-1 rounded-full`

---

## 3. Frameworks & Libraries

### UI Framework
**React 19.1.1** with functional components and hooks
- Primary hooks used: `useState`, `useRef`, `useEffect`
- Component lifecycle managed through `useEffect` cleanup

### 3D Rendering Library
**Three.js 0.180.0**
- Geometries: `BoxGeometry`, `SphereGeometry`, `OctahedronGeometry`, `PlaneGeometry`
- Materials: `MeshStandardMaterial` (primary), `MeshBasicMaterial` (particles)
- Lighting: Ambient, Directional, Point lights
- Shadows: `PCFSoftShadowMap`
- Post-processing: `ACESFilmicToneMapping`, tone mapping exposure: 1.2

### Styling System
**Tailwind CSS 4.1.14**
- Configuration: `tailwind.config.js`
- PostCSS integration via `@tailwindcss/postcss`
- Import method: `@import "tailwindcss"` in `src/index.css`

### Build System
**Vite 7.1.7**
- Plugin: `@vitejs/plugin-react` 5.0.4
- Dev server: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`

### Additional Tools
- **ESLint 9.36.0**: Code linting with React-specific rules
- **Autoprefixer 10.4.21**: CSS vendor prefixing
- **PostCSS 8.5.6**: CSS processing

---

## 4. Asset Management

### Asset Storage
Assets are stored in:
- `src/assets/` directory
- Currently contains: `react.svg`

### Asset Optimization
- **Vite handles asset optimization** during build
- Images are processed and hashed for cache busting
- Production build outputs to `dist/` directory

### 3D Asset Generation
**No external 3D models used** - all geometry is procedurally generated:
- Snake segments: `BoxGeometry(0.9, 0.9, 0.9)`
- Snake head: `BoxGeometry(1.08, 1.08, 1.08)`
- Food: `SphereGeometry(0.5, 16, 16)`
- Power-ups: `OctahedronGeometry(0.5)`
- Obstacles: `BoxGeometry(0.9, 0.9, 0.9)`

### Performance Optimizations
```javascript
// OPTIMIZED: Shared geometries created once (lines 254-271)
sharedGeometriesRef.current.wall = new THREE.BoxGeometry(0.9, 1.5, 0.9);
sharedGeometriesRef.current.snakeSegment = new THREE.BoxGeometry(0.9, 0.9, 0.9);
// ... etc

// OPTIMIZED: Material pooling (lines 364-377)
const MAX_SEGMENTS = 100;
for (let i = 0; i < MAX_SEGMENTS; i++) {
  const gradientFactor = 1.0 - (i / (MAX_SEGMENTS - 1)) * 0.8;
  const material = new THREE.MeshStandardMaterial({...});
  materialPoolRef.current.push(material);
}
```

### CDN Configuration
**No CDN configured** - all assets bundled locally via Vite

---

## 5. Icon System

### Icon Storage
**No icon library used** - icons are Unicode emoji characters

### Icon Usage Pattern
Icons are embedded directly in JSX as text:
```jsx
<span>🎮</span>  // Game controller
<span>⚡</span>  // Lightning bolt
<span>🐌</span>  // Snail
<span>🛡️</span>  // Shield
<span>✖️</span>  // Multiply
<span>🏆</span>  // Trophy
```

### Icon Locations
- Power-ups: Lines 16-20 in `Snake3DGame.jsx`
- UI elements: Throughout component (plays counter, titles, etc.)

### Icon Naming Convention
Icons are semantic and represent their function:
- `⚡` = Speed
- `🐌` = Slow motion
- `🛡️` = Shield/protection
- `✖️` = Multiplier
- `🎮` = Gaming/plays
- `🏆` = Achievement/high score

---

## 6. Styling Approach

### CSS Methodology
**Utility-First CSS with Tailwind**
- No CSS Modules or Styled Components
- Minimal custom CSS in `src/index.css` and `src/App.css`

### Global Styles
```css
/* src/index.css */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#root {
  width: 100%;
  height: 100vh;
}
```

### Responsive Design Implementation

#### Mobile Support
```jsx
// Touch event handlers (lines 591-672)
window.addEventListener('touchstart', handleTouchStart, { passive: true });
window.addEventListener('touchmove', handleTouchMove, { passive: true });
window.addEventListener('touchend', handleTouchEnd, { passive: true });
```

#### Breakpoint Strategy
- Uses Tailwind's responsive utilities implicitly
- Container max-width: `max-w-4xl` (56rem / 896px)
- Fixed game canvas height: `600px`
- Grid layouts: `grid-cols-2` for difficulty buttons

#### Viewport Configuration
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

### Animation Patterns

#### CSS Animations (Tailwind)
- `animate-pulse`: Used for power-up badges and new high score
- `transition-colors`: Button hover states
- `transition-all transform hover:scale-105`: Difficulty buttons

#### JavaScript Animations
- Particle system with manual opacity/position updates
- Snake head eating animation using sine waves
- Camera follow with lerp smoothing
- Light position oscillation

---

## 7. Project Structure

```
snake-3d-game_local/
├── dist/                      # Build output
├── node_modules/              # Dependencies
├── public/                    # Static assets
├── src/
│   ├── assets/
│   │   └── react.svg          # Static SVG assets
│   ├── components/
│   │   ├── Snake3DGame.jsx    # Main game component (1048 lines)
│   │   └── Snake3DGame_ORIGINAL.jsx  # Backup version
│   ├── game/
│   │   ├── constants.js       # Game configuration constants
│   │   └── gameLogic.js       # Game logic utilities
│   ├── App.css                # Legacy app styles
│   ├── App.jsx                # Root component (7 lines)
│   ├── index.css              # Global styles + Tailwind import
│   └── main.jsx               # Entry point
├── .gitignore
├── eslint.config.js           # ESLint configuration
├── index.html                 # HTML entry point
├── package.json               # Dependencies and scripts
├── postcss.config.js          # PostCSS configuration
├── tailwind.config.js         # Tailwind configuration
└── vite.config.js             # Vite build configuration
```

### Feature Organization Pattern
**Co-located by feature type**:
- **Game logic**: `src/game/` directory
- **UI components**: `src/components/` directory
- **Styles**: Component-level (inline Tailwind) + global (`src/index.css`)

### Key File Responsibilities

#### `Snake3DGame.jsx` (Monolithic Component)
Handles:
- Three.js scene setup and rendering
- Game state management (snake position, food, obstacles, power-ups)
- Input handling (keyboard + touch)
- UI rendering (HUD, overlays, game over screen)
- Audio generation (Web Audio API)
- Particle effects
- Camera follow system

#### `constants.js`
Centralized configuration for:
- Grid size and game physics
- Color palette
- Camera settings
- Light configuration
- Key bindings

---

## Figma Integration Guidelines

### When Converting Figma Designs:

1. **Colors**:
   - For 3D elements: Convert colors to Three.js hex format (`0xRRGGBB`)
   - For UI elements: Use Tailwind color classes or extend `tailwind.config.js`
   - Maintain the cyberpunk/neon aesthetic: cyans, purples, pinks, dark blues

2. **Typography**:
   - Use system font stack (already configured)
   - Map Figma text sizes to Tailwind classes: `text-sm`, `text-xl`, etc.
   - All headings should be `font-bold`

3. **Spacing**:
   - Use Tailwind's spacing scale (multiples of 0.25rem)
   - Common values: `p-2`, `p-4`, `gap-4`, `mb-6`

4. **Components**:
   - Buttons: Emerald green (`bg-emerald-500`) with hover states
   - Cards: Dark slate backgrounds (`bg-slate-800`) with rounded corners
   - Overlays: Black with 80% opacity (`bg-opacity-80`)

5. **Icons**:
   - Prefer Unicode emoji over icon libraries
   - Use semantic emoji that match functionality

6. **3D Elements**:
   - All 3D objects use `MeshStandardMaterial` for consistency
   - Emissive properties for glowing effects
   - Shadow casting enabled on dynamic objects

7. **Animations**:
   - Use Tailwind's `animate-pulse` for attention-grabbing elements
   - Use `transition-colors` or `transition-all` for smooth state changes
   - Keep animations subtle and performant

---

## Performance Considerations

### Optimizations Implemented
- **Shared geometry reuse**: Geometries created once and reused across meshes
- **Material pooling**: Pre-created materials for gradient effects
- **Capped pixel ratio**: `Math.min(window.devicePixelRatio, 2)`
- **Reduced shadow map size**: 1024x1024 instead of higher resolutions
- **Point lights without shadows**: Only directional light casts shadows
- **Proper cleanup**: Disposed materials and geometries in component unmount

### When Adding New Features
- Reuse existing geometries from `sharedGeometriesRef`
- Reuse materials from `materialPoolRef` when possible
- Avoid creating new Three.js objects in render loops
- Always dispose of non-shared resources on cleanup

---

## Code Integration Examples

### Adding a New UI Component
```jsx
// Follow existing pattern with Tailwind classes
<div className="bg-slate-800 rounded-lg p-4 flex items-center gap-4">
  <span className="text-2xl">🎯</span>
  <p className="text-white font-bold">New Feature</p>
</div>
```

### Adding a New 3D Object
```javascript
// 1. Add color to COLORS constant
COLORS.NEW_ITEM = 0x00ffaa;

// 2. Create shared geometry (in useEffect setup)
sharedGeometriesRef.current.newItem = new THREE.SphereGeometry(0.6, 16, 16);

// 3. Create material
const newItemMaterial = new THREE.MeshStandardMaterial({
  color: COLORS.NEW_ITEM,
  emissive: COLORS.NEW_ITEM,
  emissiveIntensity: 0.5,
  metalness: 0.7,
  roughness: 0.2
});

// 4. Instantiate mesh
const mesh = new THREE.Mesh(
  sharedGeometriesRef.current.newItem,
  newItemMaterial
);
mesh.position.set(x, y, z);
mesh.castShadow = true;
scene.add(mesh);
```

### Adding a New Power-Up Type
```javascript
// 1. Add to POWER_UP_TYPES (line 15-20)
POWER_UP_TYPES.NEW_POWER = {
  color: 0x00ff88,
  duration: 7000,
  label: '🎯 New Power'
};

// 2. Add activation logic in activatePowerUp() function
else if (type === 'NEW_POWER') {
  // Implement power-up effect
}
```

---

## Summary for Claude AI

When generating code from Figma designs for this project:
- **Use Tailwind CSS utilities** for all styling (avoid inline styles)
- **Match the cyberpunk/neon aesthetic** with cyan, purple, pink, dark slate colors
- **Embed icons as Unicode emoji**, not icon components
- **Follow the monolithic component pattern** (integrate into Snake3DGame.jsx)
- **Use Three.js hex colors (0xRRGGBB)** for 3D elements
- **Implement responsive touch controls** for mobile compatibility
- **Optimize 3D resources** using shared geometries and materials
- **Maintain consistent spacing** with Tailwind's spacing scale
- **Add animations** using Tailwind's animation utilities
- **Keep code performance-optimized** (reuse resources, cleanup properly)
