import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Grid, PerspectiveCamera } from '@react-three/drei'
import { Suspense, useRef } from 'react'
import BuildingModel from './BuildingModel'
import HeatMapOverlay from './HeatMapOverlay'

export default function Scene3D({
  showWireframe = false,
  showHeatMap = false,
  frameNumber = 1,
  lightIntensity = 1,
  ambientIntensity = 0.5,
  cameraPreset = 'default',
  onCaptureRef
}) {
  const canvasRef = useRef()

  // Camera preset positions
  const cameraPresets = {
    default: { position: [20, 15, 20], target: [0, 4, 0] },
    top: { position: [0, 30, 0], target: [0, 0, 0] },
    front: { position: [0, 8, 40], target: [0, 4, 0] },
    side: { position: [25, 8, 0], target: [0, 4, 0] },
    isometric: { position: [20, 20, 20], target: [0, 4, 0] }
  }

  const currentPreset = cameraPresets[cameraPreset] || cameraPresets.default

  // Loading fallback
  const LoadingFallback = () => (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#888888" wireframe />
    </mesh>
  )

  return (
    <Canvas
      ref={canvasRef}
      shadows
      camera={{
        position: currentPreset.position,
        fov: 60,
        near: 0.1,
        far: 1000
      }}
      style={{ background: '#0a0a0a' }}
      gl={{ preserveDrawingBuffer: true }}
    >
      {/* Ambient lighting */}
      <ambientLight intensity={ambientIntensity} />

      {/* Main directional light */}
      <directionalLight
        position={[10, 20, 10]}
        intensity={lightIntensity}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />

      {/* Additional fill lights */}
      <directionalLight position={[-10, 10, -10]} intensity={lightIntensity * 0.3} />
      <directionalLight position={[10, 5, -10]} intensity={lightIntensity * 0.2} />

      {/* Hemisphere light for better ambient lighting */}
      <hemisphereLight
        color="#ffffff"
        groundColor="#444444"
        intensity={ambientIntensity * 0.5}
      />

      {/* Camera controls */}
      <OrbitControls
        target={currentPreset.target}
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={100}
        maxPolarAngle={Math.PI / 2}
      />

      {/* Environment for reflections */}
      <Environment preset="sunset" />

      {/* Scene content */}
      <Suspense fallback={<LoadingFallback />}>
        <BuildingModel showWireframe={showWireframe} opacity={showHeatMap ? 0.7 : 1} />
        <HeatMapOverlay visible={showHeatMap} frameNumber={frameNumber} opacity={0.8} />
      </Suspense>

      {/* Ground grid for reference */}
      <Grid
        args={[100, 100]}
        cellSize={2}
        cellThickness={0.5}
        cellColor="#404040"
        sectionSize={10}
        sectionThickness={1}
        sectionColor="#606060"
        fadeDistance={80}
        fadeStrength={1}
        followCamera={false}
        position={[0, -0.01, 0]}
      />

      {/* Ground plane for shadows */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <shadowMaterial opacity={0.3} />
      </mesh>
    </Canvas>
  )
}
