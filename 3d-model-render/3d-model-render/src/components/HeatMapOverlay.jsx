import { useRef, useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'

export default function HeatMapOverlay({
  visible = false,
  frameNumber = 1,
  opacity = 0.6
}) {
  const overlayRef = useRef()

  // Building dimensions (should match BuildingModel)
  const length = 30
  const width = 8
  const wallHeight = 4
  const roofHeight = 3

  // Load the texture for the current frame
  const texture = useMemo(() => {
    try {
      const loader = new THREE.TextureLoader()
      const imagePath = `/src/assets/images/frame_0${frameNumber}.png`
      return loader.load(imagePath)
    } catch (error) {
      console.error('Error loading texture:', error)
      return null
    }
  }, [frameNumber])

  if (!visible || !texture) return null

  // Heat map visualization as a transparent overlay
  return (
    <group ref={overlayRef}>
      {/* Top view heat map overlay */}
      <mesh
        position={[0, wallHeight + roofHeight + 0.1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[width, length]} />
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={opacity}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Volumetric heat visualization inside the building */}
      <mesh position={[0, wallHeight / 2, 0]}>
        <boxGeometry args={[width - 0.2, wallHeight - 0.2, length - 0.2]} />
        <meshBasicMaterial
          color="#ff6b6b"
          transparent
          opacity={opacity * 0.2}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
