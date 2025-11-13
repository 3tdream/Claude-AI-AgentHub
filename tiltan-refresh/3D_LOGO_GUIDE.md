# Tiltan 3D Clover Logo - Documentation

## Overview

Two interactive 3D clover logo components created with Three.js and React Three Fiber, inspired by the minimalistic 3D clover design. These components bring your brand to life with real-time 3D rendering, animations, and interactive controls.

## Components

### 1. Tiltan3DLogo (Realistic Version)
**File**: `components/ui/Tiltan3DLogo.tsx`

A high-fidelity 3D model featuring:
- **5 heart-shaped petals** arranged in a circular pattern
- **Pink gradient colors** (#ffc0cb → #ff9ba9) matching the reference
- **Green stem** with dual-layer design and highlights
- **Golden center sphere** with emissive glow
- **Realistic shadows** using shadow mapping
- **Subtle floating animation** on each petal

**Technical Features**:
- Extruded bezier curve geometry for heart shapes
- PBR materials (Metalness/Roughness workflow)
- Directional, point, and spot lighting
- Environment map for reflections
- Ground plane with shadow receiver

### 2. Tiltan3DLogoSimple (Geometric Version)
**File**: `components/ui/Tiltan3DLogoSimple.tsx`

A modern, abstract interpretation featuring:
- **Capsule-shaped petals** arranged radially
- **Mesh distortion material** for dynamic deformation
- **Floating animation** using Drei's Float helper
- **Green glowing center orb** with distortion
- **Particle effects** surrounding the logo
- **Metallic reflective surfaces**

**Technical Features**:
- CapsuleGeometry for clean, modern look
- MeshDistortMaterial shader for organic movement
- Float component for ethereal motion
- Particle system with spheres
- Fog for depth perception

---

## Usage

### Basic Implementation

```tsx
import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues
const Tiltan3DLogo = dynamic(
  () => import("@/components/ui/Tiltan3DLogo"),
  { ssr: false }
);

// In your component
<div className="w-full h-96">
  <Tiltan3DLogo autoRotate={true} interactive={true} />
</div>
```

### Props

Both components accept these props:

```typescript
interface Tiltan3DLogoProps {
  autoRotate?: boolean;      // Enable automatic rotation (default: true)
  interactive?: boolean;      // Enable mouse/touch controls (default: true)
  className?: string;         // Additional CSS classes
  scale?: number;            // Uniform scale (Tiltan3DLogo only, default: 1)
}
```

### Examples

#### Hero Section Background
```tsx
<div className="absolute inset-0 -z-10 opacity-30">
  <Tiltan3DLogoSimple autoRotate={true} interactive={false} />
</div>
```

#### Standalone Showcase
```tsx
<div className="aspect-square max-w-2xl mx-auto">
  <Tiltan3DLogo autoRotate={false} interactive={true} />
</div>
```

#### Loading Screen
```tsx
<div className="h-screen flex items-center justify-center">
  <div className="w-64 h-64">
    <Tiltan3DLogoSimple autoRotate={true} interactive={false} />
  </div>
</div>
```

---

## Demo Page

Visit `/demo-3d` to see both logos in action:
- **URL**: http://localhost:3001/demo-3d
- Side-by-side comparison
- Feature descriptions
- Interactive controls
- Technical specifications

---

## Customization

### Change Colors

#### Realistic Version (Tiltan3DLogo.tsx)
```tsx
// Petal colors
const petalColors = [
  "#YOUR_COLOR_1",
  "#YOUR_COLOR_2",
  // ... 5 colors total
];

// Stem color
<meshStandardMaterial
  color="#YOUR_GREEN"
  // ...
/>

// Center sphere
<meshStandardMaterial
  color="#YOUR_CENTER_COLOR"
  emissive="#YOUR_GLOW_COLOR"
  // ...
/>
```

#### Geometric Version (Tiltan3DLogoSimple.tsx)
```tsx
// Petals
<MeshDistortMaterial
  color="#YOUR_PETAL_COLOR"
  // ...
/>

// Center orb
<MeshDistortMaterial
  color="#YOUR_ORB_COLOR"
  emissive="#YOUR_GLOW"
  // ...
/>
```

### Adjust Animation Speed

```tsx
// Auto-rotation speed
<OrbitControls
  autoRotateSpeed={5} // Change from default 2
  // ...
/>

// Floating speed
<Float speed={3}> // Change from default 2
```

### Modify Lighting

```tsx
// Brighter ambient
<ambientLight intensity={0.8} /> // from 0.5

// Colored lights
<pointLight position={[-5, 5, 5]} color="#ff00ff" />

// More dramatic shadows
<directionalLight
  intensity={2}
  shadow-mapSize-width={4096}
  shadow-mapSize-height={4096}
/>
```

---

## Performance Optimization

### Best Practices

1. **Dynamic Import**: Always use `next/dynamic` with `ssr: false`
   ```tsx
   const Logo = dynamic(() => import("./Logo"), { ssr: false });
   ```

2. **Suspense Fallback**: Provide loading state
   ```tsx
   <Suspense fallback={<LoadingSpinner />}>
     <Tiltan3DLogo />
   </Suspense>
   ```

3. **Container Sizing**: Set explicit dimensions
   ```tsx
   <div className="w-full h-96"> {/* Fixed height */}
     <Tiltan3DLogo />
   </div>
   ```

4. **Conditional Rendering**: Load only when visible
   ```tsx
   {showLogo && <Tiltan3DLogo />}
   ```

### Performance Metrics

- **Realistic Version**:
  - Polygons: ~5,000
  - Target FPS: 60
  - Load time: < 1s

- **Geometric Version**:
  - Polygons: ~2,000
  - Target FPS: 60
  - Load time: < 500ms

---

## Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| WebGL 2.0 | ✅ | ✅ | ✅ | ✅ |
| Shadows | ✅ | ✅ | ✅ | ✅ |
| PBR Materials | ✅ | ✅ | ✅ | ✅ |
| Touch Controls | ✅ | ✅ | ✅ | ✅ |

**Minimum Requirements**:
- WebGL 1.0 support
- Modern browser (last 2 versions)
- Hardware acceleration enabled

---

## Controls

### Mouse/Trackpad
- **Left Click + Drag**: Rotate camera
- **Right Click + Drag**: Pan camera
- **Scroll**: Zoom in/out

### Touch (Mobile/Tablet)
- **One Finger**: Rotate
- **Two Fingers Pinch**: Zoom
- **Two Fingers Drag**: Pan

### Keyboard
- **Arrow Keys**: Rotate (when focused)

---

## Troubleshooting

### Logo Not Appearing

**Issue**: Black screen or no render
**Solution**:
- Check browser console for WebGL errors
- Ensure container has explicit dimensions
- Verify dynamic import is used
- Check if hardware acceleration is enabled

### Low FPS / Laggy

**Issue**: Performance issues
**Solution**:
- Reduce shadow map size (2048 → 1024)
- Disable particles in geometric version
- Set `autoRotate={false}` when not needed
- Lower light count

### Import Errors

**Issue**: Module not found
**Solution**:
```bash
npm install three @react-three/fiber @react-three/drei
```

### SSR Errors

**Issue**: Window is not defined
**Solution**: Always use dynamic import:
```tsx
const Logo = dynamic(() => import("./Logo"), { ssr: false });
```

---

## Advanced Features

### Add Click Events
```tsx
<mesh onClick={(e) => console.log("Clicked!", e)}>
  {/* ... */}
</mesh>
```

### Camera Animation
```tsx
const cameraRef = useRef();
useFrame(() => {
  cameraRef.current.position.x = Math.sin(clock) * 5;
});
```

### Environment Presets
```tsx
<Environment preset="sunset" /> // or: city, dawn, forest, etc.
```

### Post-Processing
```tsx
import { EffectComposer, Bloom } from "@react-three/postprocessing";

<EffectComposer>
  <Bloom intensity={0.5} />
</EffectComposer>
```

---

## Export Options

### Screenshot
```tsx
import { useThree } from "@react-three/fiber";

const { gl } = useThree();
const screenshot = gl.domElement.toDataURL("image/png");
```

### Video Recording
Use browser DevTools or OBS to record the canvas.

### GLTF Export
For use in other 3D software, export geometry to GLTF format using Three.js GLTFExporter.

---

## Future Enhancements

Potential additions:
- [ ] VR support with WebXR
- [ ] Particle trail effects
- [ ] Physics simulation (petals falling)
- [ ] Multiple color themes
- [ ] Outline/toon shading option
- [ ] Bloom post-processing
- [ ] Interactive petal highlighting
- [ ] Sound reactivity

---

## Resources

- **Three.js Docs**: https://threejs.org/docs/
- **React Three Fiber**: https://docs.pmnd.rs/react-three-fiber
- **React Three Drei**: https://github.com/pmndrs/drei
- **Original Logo**: `public/images/clover-logo.jpg`

---

## Credits

**Design**: Based on minimalistic 3D clover concept
**Development**: Claude Code
**Technologies**: Three.js, React Three Fiber, React Three Drei
**Date**: October 15, 2025

---

## License

© 2025 Tiltan College. All rights reserved.
