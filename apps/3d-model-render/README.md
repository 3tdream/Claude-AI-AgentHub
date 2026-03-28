# 3D Building Model Viewer

An interactive 3D web application for visualizing building structures with heat map overlays, built with React, Three.js, and React Three Fiber.

## Features

- **Interactive 3D Model**: Fully rendered building structure based on architectural wireframes
- **Camera Controls**: Rotate, zoom, and pan with mouse/touch controls
- **Heat Map Overlays**: Toggle temperature visualization overlays with multiple frames
- **Lighting Controls**: Adjust directional and ambient lighting in real-time
- **Camera Presets**: Quick access to top, front, side, and isometric views
- **Screenshot Export**: Capture and download current view as PNG
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Dark-themed control panel with smooth animations

## Installation

```bash
# Navigate to project directory
cd 3d-model-render

# Install dependencies (already done)
npm install

# Start development server
npm run dev
```

## Usage

### Running the Application

1. Start the development server with `npm run dev`
2. Open your browser to `http://localhost:5173` (or the port shown in terminal)
3. The 3D building model will load automatically

### Controls

#### Mouse/Trackpad
- **Left Click + Drag**: Rotate the camera around the building
- **Right Click + Drag**: Pan the camera view
- **Scroll Wheel**: Zoom in and out

#### Touch Devices
- **One Finger Drag**: Rotate view
- **Two Finger Drag**: Pan view
- **Pinch**: Zoom in/out

### Control Panel

Located in the top-right corner, the control panel provides:

1. **Display Options**
   - Toggle wireframe mode
   - Enable/disable heat map overlay

2. **Heat Map Frame Selection**
   - Choose between 5 different temperature visualization frames
   - Slider to animate through frames

3. **Lighting Controls**
   - Adjust directional light intensity (0-3)
   - Adjust ambient light intensity (0-2)

4. **Camera Presets**
   - Default: Isometric view
   - Top: Bird's eye view
   - Front: Front elevation
   - Side: Side elevation
   - Isometric: Technical isometric view

5. **Export**
   - Capture screenshot button downloads current view as PNG

## Project Structure

```
3d-model-render/
├── src/
│   ├── components/
│   │   ├── BuildingModel.jsx      # 3D building geometry
│   │   ├── HeatMapOverlay.jsx     # Temperature visualization
│   │   ├── Scene3D.jsx            # Main 3D scene with lighting
│   │   └── ControlPanel.jsx       # UI controls
│   ├── assets/
│   │   └── images/                # Base.png and frame images
│   ├── App.jsx                    # Main application component
│   ├── App.css                    # Application styles
│   ├── index.css                  # Global styles
│   └── main.jsx                   # Entry point
├── package.json
└── README.md
```

## Technologies Used

- **React** - UI framework
- **Vite** - Build tool and dev server
- **Three.js** - 3D graphics library
- **React Three Fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for R3F

## Building for Production

```bash
# Create optimized production build
npm run build

# Preview production build
npm run preview
```

The production files will be in the `dist/` directory.

## Performance

- Uses GPU-accelerated WebGL rendering
- Optimized for 60 FPS on modern hardware
- Responsive design adapts to device capabilities
- Reduced motion support for accessibility

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 15+
- Mobile browsers with WebGL support

## Customization

### Modifying Building Dimensions

Edit `src/components/BuildingModel.jsx`:
```javascript
const length = 30    // Building length
const width = 8      // Building width
const wallHeight = 4 // Wall height
const roofHeight = 3 // Roof height
const numFrames = 10 // Number of support frames
```

### Adding More Heat Map Frames

1. Add frame images to `src/assets/images/`
2. Update frame slider max value in `ControlPanel.jsx`
3. Update frame loader in `HeatMapOverlay.jsx`

### Changing Colors/Theme

Modify color values in `src/App.css` and component materials in JSX files.

## License

MIT

## Author

Created for the Gif_Sinornis building visualization project.

## Support

For issues or questions, please open an issue on the project repository.
