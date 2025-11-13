import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function BuildingModel({ showWireframe = false, opacity = 1 }) {
  const buildingRef = useRef()

  // Building dimensions (scaled to match wireframe proportions)
  const length = 30
  const width = 8
  const wallHeight = 4
  const roofHeight = 3
  const numFrames = 10

  // Roof geometry
  const RoofStructure = () => {
    const roofShape = new THREE.Shape()
    roofShape.moveTo(-width / 2, 0)
    roofShape.lineTo(0, roofHeight)
    roofShape.lineTo(width / 2, 0)
    roofShape.lineTo(-width / 2, 0)

    return (
      <mesh position={[0, wallHeight, 0]} rotation={[Math.PI / 2, 0, Math.PI / 2]}>
        <extrudeGeometry args={[roofShape, { depth: length, bevelEnabled: false }]} />
        <meshStandardMaterial
          color="#e0e0e0"
          transparent
          opacity={opacity}
          wireframe={showWireframe}
          side={THREE.DoubleSide}
        />
      </mesh>
    )
  }

  // Building frame structures
  const FrameStructures = () => {
    const frames = []
    const frameSpacing = length / (numFrames - 1)

    for (let i = 0; i < numFrames; i++) {
      const z = -length / 2 + i * frameSpacing

      frames.push(
        <group key={`frame-${i}`} position={[0, 0, z]}>
          {/* Left vertical post */}
          <mesh position={[-width / 2, wallHeight / 2, 0]}>
            <boxGeometry args={[0.15, wallHeight, 0.15]} />
            <meshStandardMaterial color="#404040" />
          </mesh>

          {/* Right vertical post */}
          <mesh position={[width / 2, wallHeight / 2, 0]}>
            <boxGeometry args={[0.15, wallHeight, 0.15]} />
            <meshStandardMaterial color="#404040" />
          </mesh>

          {/* Roof support beams */}
          <mesh position={[-width / 4, wallHeight + roofHeight / 2, 0]} rotation={[0, 0, Math.atan(roofHeight / (width / 2))]}>
            <boxGeometry args={[0.12, width / 1.8, 0.12]} />
            <meshStandardMaterial color="#404040" />
          </mesh>

          <mesh position={[width / 4, wallHeight + roofHeight / 2, 0]} rotation={[0, 0, -Math.atan(roofHeight / (width / 2))]}>
            <boxGeometry args={[0.12, width / 1.8, 0.12]} />
            <meshStandardMaterial color="#404040" />
          </mesh>
        </group>
      )
    }

    return <>{frames}</>
  }

  // Foundation/floor
  const Foundation = () => (
    <mesh position={[0, -0.1, 0]} receiveShadow>
      <boxGeometry args={[width + 0.5, 0.2, length + 0.5]} />
      <meshStandardMaterial color="#2a2a2a" />
    </mesh>
  )

  // Side walls (transparent panels)
  const Walls = () => (
    <>
      {/* Left wall */}
      <mesh position={[-width / 2, wallHeight / 2, 0]} castShadow>
        <boxGeometry args={[0.05, wallHeight, length]} />
        <meshStandardMaterial
          color="#90caf9"
          transparent
          opacity={opacity * 0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Right wall */}
      <mesh position={[width / 2, wallHeight / 2, 0]} castShadow>
        <boxGeometry args={[0.05, wallHeight, length]} />
        <meshStandardMaterial
          color="#90caf9"
          transparent
          opacity={opacity * 0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Front wall */}
      <mesh position={[0, wallHeight / 2, -length / 2]} castShadow>
        <boxGeometry args={[width, wallHeight, 0.05]} />
        <meshStandardMaterial
          color="#90caf9"
          transparent
          opacity={opacity * 0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, wallHeight / 2, length / 2]} castShadow>
        <boxGeometry args={[width, wallHeight, 0.05]} />
        <meshStandardMaterial
          color="#90caf9"
          transparent
          opacity={opacity * 0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  )

  // Grid floor for reference
  const GridFloor = () => (
    <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[width, length, 10, 30]} />
      <meshStandardMaterial
        color="#ffffff"
        wireframe
        transparent
        opacity={0.1}
      />
    </mesh>
  )

  return (
    <group ref={buildingRef}>
      <Foundation />
      <Walls />
      <FrameStructures />
      <RoofStructure />
      <GridFloor />
    </group>
  )
}
