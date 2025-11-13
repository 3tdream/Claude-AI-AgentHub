import { useState, useRef } from 'react'
import Scene3D from './components/Scene3D'
import ControlPanel from './components/ControlPanel'
import './App.css'

function App() {
  // State management
  const [showWireframe, setShowWireframe] = useState(false)
  const [showHeatMap, setShowHeatMap] = useState(false)
  const [frameNumber, setFrameNumber] = useState(1)
  const [lightIntensity, setLightIntensity] = useState(1)
  const [ambientIntensity, setAmbientIntensity] = useState(0.5)
  const [cameraPreset, setCameraPreset] = useState('default')

  const canvasContainerRef = useRef()

  // Screenshot capture function
  const handleCapture = () => {
    const canvas = document.querySelector('canvas')
    if (canvas) {
      try {
        // Convert canvas to blob and download
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `3d-render-${Date.now()}.png`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        })
      } catch (error) {
        console.error('Error capturing screenshot:', error)
        alert('Failed to capture screenshot. Please try again.')
      }
    }
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <h1>3D Building Model Viewer</h1>
        <p>Interactive 3D visualization with heat map overlays</p>
      </header>

      {/* Main content */}
      <div className="app-content">
        {/* 3D Scene */}
        <div className="scene-container" ref={canvasContainerRef}>
          <Scene3D
            showWireframe={showWireframe}
            showHeatMap={showHeatMap}
            frameNumber={frameNumber}
            lightIntensity={lightIntensity}
            ambientIntensity={ambientIntensity}
            cameraPreset={cameraPreset}
          />
        </div>

        {/* Control Panel */}
        <ControlPanel
          showWireframe={showWireframe}
          setShowWireframe={setShowWireframe}
          showHeatMap={showHeatMap}
          setShowHeatMap={setShowHeatMap}
          frameNumber={frameNumber}
          setFrameNumber={setFrameNumber}
          lightIntensity={lightIntensity}
          setLightIntensity={setLightIntensity}
          ambientIntensity={ambientIntensity}
          setAmbientIntensity={setAmbientIntensity}
          cameraPreset={cameraPreset}
          setCameraPreset={setCameraPreset}
          onCapture={handleCapture}
        />
      </div>
    </div>
  )
}

export default App
