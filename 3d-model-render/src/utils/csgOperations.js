import { CSG } from 'three-csg-ts'
import * as THREE from 'three'

/**
 * CSG (Constructive Solid Geometry) Operations
 * Perform Boolean operations on 3D meshes
 */

export const CSG_OPERATIONS = {
  UNION: 'union',
  SUBTRACT: 'subtract',
  INTERSECT: 'intersect'
}

/**
 * Perform a CSG operation between two objects
 * @param {object} objectA - First object
 * @param {object} objectB - Second object
 * @param {string} operation - Operation type (union, subtract, intersect)
 * @returns {object} New object with resulting geometry
 */
export function performCSGOperation(objectA, objectB, operation) {
  try {
    // Create meshes from objects
    const meshA = createMeshFromObject(objectA)
    const meshB = createMeshFromObject(objectB)

    // Perform CSG operation
    let resultMesh

    switch (operation) {
      case CSG_OPERATIONS.UNION:
        resultMesh = CSG.union(meshA, meshB)
        break
      case CSG_OPERATIONS.SUBTRACT:
        resultMesh = CSG.subtract(meshA, meshB)
        break
      case CSG_OPERATIONS.INTERSECT:
        resultMesh = CSG.intersect(meshA, meshB)
        break
      default:
        throw new Error(`Unknown CSG operation: ${operation}`)
    }

    // Create new object from result
    const resultObject = {
      id: `csg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${operation}_result`,
      type: 'csg',
      geometryParams: {
        operation,
        sourceA: objectA.id,
        sourceB: objectB.id
      },
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      material: {
        color: objectA.material.color,
        opacity: 1,
        transparent: false,
        wireframe: false
      },
      visible: true,
      geometry: resultMesh.geometry,
      createdAt: Date.now()
    }

    return resultObject
  } catch (error) {
    console.error('CSG operation failed:', error)
    throw error
  }
}

/**
 * Create a Three.js mesh from object data
 * @param {object} obj - Object with geometry and transform data
 * @returns {THREE.Mesh}
 */
function createMeshFromObject(obj) {
  const geometry = obj.geometry.clone()
  const material = new THREE.MeshStandardMaterial({
    color: obj.material.color
  })

  const mesh = new THREE.Mesh(geometry, material)

  // Apply transforms
  mesh.position.set(...obj.position)
  mesh.rotation.set(
    ...obj.rotation.map(deg => (deg * Math.PI) / 180)
  )
  mesh.scale.set(...obj.scale)

  // Update matrix
  mesh.updateMatrix()

  return mesh
}

/**
 * Check if two objects can perform CSG operation
 * @param {object} objA - First object
 * @param {object} objB - Second object
 * @returns {boolean}
 */
export function canPerformCSG(objA, objB) {
  return (
    objA &&
    objB &&
    objA.id !== objB.id &&
    objA.geometry &&
    objB.geometry &&
    objA.visible &&
    objB.visible
  )
}

/**
 * Get display name for CSG operation
 */
export function getCSGOperationName(operation) {
  const names = {
    [CSG_OPERATIONS.UNION]: 'Union (Combine)',
    [CSG_OPERATIONS.SUBTRACT]: 'Subtract (Cut)',
    [CSG_OPERATIONS.INTERSECT]: 'Intersect (Overlap)'
  }
  return names[operation] || operation
}

/**
 * Get icon for CSG operation
 */
export function getCSGOperationIcon(operation) {
  const icons = {
    [CSG_OPERATIONS.UNION]: '➕',
    [CSG_OPERATIONS.SUBTRACT]: '➖',
    [CSG_OPERATIONS.INTERSECT]: '⚡'
  }
  return icons[operation] || '🔧'
}
