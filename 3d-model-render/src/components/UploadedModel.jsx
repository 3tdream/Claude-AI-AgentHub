import { useEffect, useState } from 'react'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader'
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader'
import * as THREE from 'three'

export default function UploadedModel({ file, onError }) {
  const [modelUrl, setModelUrl] = useState(null)
  const [fileExtension, setFileExtension] = useState(null)

  useEffect(() => {
    if (file) {
      // Create object URL from the uploaded file
      const url = URL.createObjectURL(file)
      setModelUrl(url)

      // Extract file extension
      const ext = file.name.split('.').pop().toLowerCase()
      setFileExtension(ext)

      // Cleanup function to revoke object URL
      return () => {
        URL.revokeObjectURL(url)
      }
    }
  }, [file])

  // Return null if no file
  if (!file || !modelUrl || !fileExtension) {
    return null
  }

  // Render appropriate model loader based on file extension
  try {
    switch (fileExtension) {
      case 'glb':
      case 'gltf':
        return <GLTFModel url={modelUrl} onError={onError} />
      case 'obj':
        return <OBJModel url={modelUrl} onError={onError} />
      case 'fbx':
        return <FBXModel url={modelUrl} onError={onError} />
      case 'stl':
        return <STLModel url={modelUrl} onError={onError} />
      case 'ply':
        return <PLYModel url={modelUrl} onError={onError} />
      case 'dae':
        return <DAEModel url={modelUrl} onError={onError} />
      case 'svg':
        return <SVGModel url={modelUrl} onError={onError} />
      default:
        if (onError) {
          onError(`Unsupported file format: ${fileExtension}`)
        }
        return null
    }
  } catch (error) {
    console.error('Error loading model:', error)
    if (onError) {
      onError(error.message)
    }
    return null
  }
}

// GLB/GLTF Model Component
function GLTFModel({ url, onError }) {
  try {
    const gltf = useLoader(GLTFLoader, url)

    // Center and scale the model
    const scene = gltf.scene.clone()

    // Calculate bounding box
    const box = new THREE.Box3().setFromObject(scene)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())

    // Scale to fit in a reasonable size (max dimension = 10 units)
    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = 10 / maxDim

    scene.scale.setScalar(scale)
    scene.position.set(-center.x * scale, -center.y * scale, -center.z * scale)

    return <primitive object={scene} />
  } catch (error) {
    console.error('Error loading GLTF:', error)
    if (onError) onError(error.message)
    return null
  }
}

// OBJ Model Component
function OBJModel({ url, onError }) {
  try {
    const obj = useLoader(OBJLoader, url)

    const scene = obj.clone()

    // Calculate bounding box and center
    const box = new THREE.Box3().setFromObject(scene)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())

    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = 10 / maxDim

    scene.scale.setScalar(scale)
    scene.position.set(-center.x * scale, -center.y * scale, -center.z * scale)

    // Add basic material if none exists
    scene.traverse((child) => {
      if (child.isMesh && !child.material) {
        child.material = new THREE.MeshStandardMaterial({ color: '#888888' })
      }
    })

    return <primitive object={scene} />
  } catch (error) {
    console.error('Error loading OBJ:', error)
    if (onError) onError(error.message)
    return null
  }
}

// FBX Model Component
function FBXModel({ url, onError }) {
  try {
    const fbx = useLoader(FBXLoader, url)

    const scene = fbx.clone()

    const box = new THREE.Box3().setFromObject(scene)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())

    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = 10 / maxDim

    scene.scale.setScalar(scale)
    scene.position.set(-center.x * scale, -center.y * scale, -center.z * scale)

    return <primitive object={scene} />
  } catch (error) {
    console.error('Error loading FBX:', error)
    if (onError) onError(error.message)
    return null
  }
}

// STL Model Component
function STLModel({ url, onError }) {
  try {
    const geometry = useLoader(STLLoader, url)

    // Center the geometry
    geometry.center()

    // Calculate scale
    geometry.computeBoundingBox()
    const box = geometry.boundingBox
    const size = new THREE.Vector3()
    box.getSize(size)

    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = 10 / maxDim

    return (
      <mesh scale={scale}>
        <primitive object={geometry} attach="geometry" />
        <meshStandardMaterial color="#888888" />
      </mesh>
    )
  } catch (error) {
    console.error('Error loading STL:', error)
    if (onError) onError(error.message)
    return null
  }
}

// PLY Model Component
function PLYModel({ url, onError }) {
  try {
    const geometry = useLoader(PLYLoader, url)

    geometry.center()
    geometry.computeBoundingBox()

    const box = geometry.boundingBox
    const size = new THREE.Vector3()
    box.getSize(size)

    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = 10 / maxDim

    return (
      <mesh scale={scale}>
        <primitive object={geometry} attach="geometry" />
        <meshStandardMaterial color="#888888" vertexColors={geometry.attributes.color ? true : false} />
      </mesh>
    )
  } catch (error) {
    console.error('Error loading PLY:', error)
    if (onError) onError(error.message)
    return null
  }
}

// DAE (Collada) Model Component
function DAEModel({ url, onError }) {
  try {
    const collada = useLoader(ColladaLoader, url)

    const scene = collada.scene.clone()

    const box = new THREE.Box3().setFromObject(scene)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())

    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = 10 / maxDim

    scene.scale.setScalar(scale)
    scene.position.set(-center.x * scale, -center.y * scale, -center.z * scale)

    return <primitive object={scene} />
  } catch (error) {
    console.error('Error loading DAE:', error)
    if (onError) onError(error.message)
    return null
  }
}

// SVG Model Component (2D to 3D extrusion)
function SVGModel({ url, onError }) {
  try {
    const svgData = useLoader(SVGLoader, url)

    const shapes = []
    const group = new THREE.Group()

    // Process all SVG paths and convert to 3D shapes
    svgData.paths.forEach((path, i) => {
      const fillColor = path.userData.style.fill

      // Get shapes from the path
      const pathShapes = SVGLoader.createShapes(path)

      pathShapes.forEach((shape) => {
        // Extrude the 2D shape to create 3D geometry
        const extrudeSettings = {
          depth: 0.5, // Extrusion depth (adjustable)
          bevelEnabled: true,
          bevelThickness: 0.05,
          bevelSize: 0.05,
          bevelSegments: 3
        }

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
        const material = new THREE.MeshStandardMaterial({
          color: fillColor && fillColor !== 'none' ? fillColor : '#888888',
          side: THREE.DoubleSide
        })

        const mesh = new THREE.Mesh(geometry, material)
        group.add(mesh)
      })
    })

    // Calculate bounding box and center the group
    const box = new THREE.Box3().setFromObject(group)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())

    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = 10 / maxDim

    group.scale.setScalar(scale)
    group.position.set(-center.x * scale, -center.y * scale, -center.z * scale)

    // Rotate to face forward (SVGs are typically in XY plane)
    group.rotation.x = 0

    return <primitive object={group} />
  } catch (error) {
    console.error('Error loading SVG:', error)
    if (onError) onError(error.message)
    return null
  }
}
