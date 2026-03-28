import { useState } from 'react'

export default function ControlPanel({
  showWireframe,
  setShowWireframe,
  showHeatMap,
  setShowHeatMap,
  frameNumber,
  setFrameNumber,
  lightIntensity,
  setLightIntensity,
  ambientIntensity,
  setAmbientIntensity,
  cameraPreset,
  setCameraPreset,
  onCapture
}) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="control-panel">
      <div className="panel-header">
        <h2>3D Model Controls</h2>
        <button
          className="toggle-btn"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label="Toggle panel"
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      {isExpanded && (
        <div className="panel-content">
          {/* Display Options */}
          <section>
            <h3>Display</h3>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showWireframe}
                onChange={(e) => setShowWireframe(e.target.checked)}
              />
              <span>Show Wireframe</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showHeatMap}
                onChange={(e) => setShowHeatMap(e.target.checked)}
              />
              <span>Show Heat Map</span>
            </label>
          </section>

          {/* Heat Map Frame Selection */}
          {showHeatMap && (
            <section>
              <h3>Heat Map Frame</h3>
              <label className="slider-label">
                <span>Frame: {frameNumber}</span>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={frameNumber}
                  onChange={(e) => setFrameNumber(parseInt(e.target.value))}
                  className="slider"
                />
              </label>
            </section>
          )}

          {/* Lighting Controls */}
          <section>
            <h3>Lighting</h3>
            <label className="slider-label">
              <span>Directional: {lightIntensity.toFixed(1)}</span>
              <input
                type="range"
                min="0"
                max="3"
                step="0.1"
                value={lightIntensity}
                onChange={(e) => setLightIntensity(parseFloat(e.target.value))}
                className="slider"
              />
            </label>

            <label className="slider-label">
              <span>Ambient: {ambientIntensity.toFixed(1)}</span>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={ambientIntensity}
                onChange={(e) => setAmbientIntensity(parseFloat(e.target.value))}
                className="slider"
              />
            </label>
          </section>

          {/* Camera Presets */}
          <section>
            <h3>Camera View</h3>
            <div className="button-group">
              <button
                className={cameraPreset === 'default' ? 'active' : ''}
                onClick={() => setCameraPreset('default')}
              >
                Default
              </button>
              <button
                className={cameraPreset === 'top' ? 'active' : ''}
                onClick={() => setCameraPreset('top')}
              >
                Top
              </button>
              <button
                className={cameraPreset === 'front' ? 'active' : ''}
                onClick={() => setCameraPreset('front')}
              >
                Front
              </button>
              <button
                className={cameraPreset === 'side' ? 'active' : ''}
                onClick={() => setCameraPreset('side')}
              >
                Side
              </button>
              <button
                className={cameraPreset === 'isometric' ? 'active' : ''}
                onClick={() => setCameraPreset('isometric')}
              >
                Isometric
              </button>
            </div>
          </section>

          {/* Export */}
          <section>
            <h3>Export</h3>
            <button className="capture-btn" onClick={onCapture}>
              📸 Capture Screenshot
            </button>
          </section>

          {/* Instructions */}
          <section>
            <h3>Controls</h3>
            <ul className="instructions">
              <li><strong>Left Click + Drag:</strong> Rotate view</li>
              <li><strong>Right Click + Drag:</strong> Pan view</li>
              <li><strong>Scroll:</strong> Zoom in/out</li>
            </ul>
          </section>
        </div>
      )}
    </div>
  )
}
