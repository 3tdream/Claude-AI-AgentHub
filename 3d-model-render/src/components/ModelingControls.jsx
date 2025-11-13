import { PivotControls } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Interactive transform controls for 3D objects
 * Wraps @react-three/drei PivotControls for easier usage
 */
export default function ModelingControls({
  object,
  onTransform,
  onTransformEnd,
  enabled = true,
  children
}) {
  if (!enabled || !object) {
    return <>{children}</>
  }

  const handleDrag = (local, delta, world) => {
    if (onTransform) {
      // Extract position, rotation, scale from the matrix
      const position = new THREE.Vector3()
      const rotation = new THREE.Euler()
      const quaternion = new THREE.Quaternion()
      const scale = new THREE.Vector3()

      local.decompose(position, quaternion, scale)
      rotation.setFromQuaternion(quaternion)

      // Convert rotation to degrees for consistency
      const rotationDegrees = [
        THREE.MathUtils.radToDeg(rotation.x),
        THREE.MathUtils.radToDeg(rotation.y),
        THREE.MathUtils.radToDeg(rotation.z)
      ]

      onTransform({
        position: position.toArray(),
        rotation: rotationDegrees,
        scale: scale.toArray()
      })
    }
  }

  const handleDragEnd = () => {
    if (onTransformEnd) {
      onTransformEnd()
    }
  }

  return (
    <PivotControls
      anchor={[0, 0, 0]}
      depthTest={false}
      lineWidth={2}
      axisColors={['#ff2060', '#20df80', '#2080ff']}
      scale={1}
      fixed={false}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      activeAxes={[true, true, true]}
      disableRotations={false}
      disableScaling={false}
      disableSliders={false}
      autoTransform={false}
    >
      {children}
    </PivotControls>
  )
}
