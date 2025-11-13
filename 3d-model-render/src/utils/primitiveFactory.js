import * as THREE from 'three'

/**
 * Factory for creating primitive 3D shapes
 * Returns geometry and default material properties
 */

export const PRIMITIVE_TYPES = {
  BOX: 'box',
  SPHERE: 'sphere',
  CYLINDER: 'cylinder',
  CONE: 'cone',
  TORUS: 'torus',
  PLANE: 'plane',
  DODECAHEDRON: 'dodecahedron',
  ICOSAHEDRON: 'icosahedron'
}

/**
 * Create a primitive shape geometry
 * @param {string} type - Type of primitive from PRIMITIVE_TYPES
 * @param {object} params - Optional parameters for the shape
 * @returns {THREE.BufferGeometry} The geometry
 */
export function createPrimitiveGeometry(type, params = {}) {
  switch (type) {
    case PRIMITIVE_TYPES.BOX:
      return new THREE.BoxGeometry(
        params.width || 2,
        params.height || 2,
        params.depth || 2,
        params.widthSegments || 1,
        params.heightSegments || 1,
        params.depthSegments || 1
      )

    case PRIMITIVE_TYPES.SPHERE:
      return new THREE.SphereGeometry(
        params.radius || 1,
        params.widthSegments || 32,
        params.heightSegments || 16
      )

    case PRIMITIVE_TYPES.CYLINDER:
      return new THREE.CylinderGeometry(
        params.radiusTop || 1,
        params.radiusBottom || 1,
        params.height || 2,
        params.radialSegments || 32
      )

    case PRIMITIVE_TYPES.CONE:
      return new THREE.ConeGeometry(
        params.radius || 1,
        params.height || 2,
        params.radialSegments || 32
      )

    case PRIMITIVE_TYPES.TORUS:
      return new THREE.TorusGeometry(
        params.radius || 1,
        params.tube || 0.4,
        params.radialSegments || 16,
        params.tubularSegments || 100
      )

    case PRIMITIVE_TYPES.PLANE:
      return new THREE.PlaneGeometry(
        params.width || 2,
        params.height || 2,
        params.widthSegments || 1,
        params.heightSegments || 1
      )

    case PRIMITIVE_TYPES.DODECAHEDRON:
      return new THREE.DodecahedronGeometry(
        params.radius || 1,
        params.detail || 0
      )

    case PRIMITIVE_TYPES.ICOSAHEDRON:
      return new THREE.IcosahedronGeometry(
        params.radius || 1,
        params.detail || 0
      )

    default:
      // Default to box
      return new THREE.BoxGeometry(2, 2, 2)
  }
}

/**
 * Create a complete object with geometry and material
 * @param {string} type - Type of primitive
 * @param {object} options - Options including geometry params, position, color, etc.
 * @returns {object} Object data for state management
 */
export function createPrimitiveObject(type, options = {}) {
  const {
    position = [0, 2, 0],
    rotation = [0, 0, 0],
    scale = [1, 1, 1],
    color = '#8899ff',
    opacity = 1,
    wireframe = false,
    geometryParams = {},
    name = null
  } = options

  // Generate unique ID
  const id = `object_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Create geometry
  const geometry = createPrimitiveGeometry(type, geometryParams)

  return {
    id,
    name: name || `${type}_${id.slice(-6)}`,
    type,
    geometryParams,
    position,
    rotation,
    scale,
    material: {
      color,
      opacity,
      transparent: opacity < 1,
      wireframe
    },
    visible: true,
    geometry, // Store geometry reference
    createdAt: Date.now()
  }
}

/**
 * Get display name for primitive type
 */
export function getPrimitiveDisplayName(type) {
  const names = {
    [PRIMITIVE_TYPES.BOX]: 'Box',
    [PRIMITIVE_TYPES.SPHERE]: 'Sphere',
    [PRIMITIVE_TYPES.CYLINDER]: 'Cylinder',
    [PRIMITIVE_TYPES.CONE]: 'Cone',
    [PRIMITIVE_TYPES.TORUS]: 'Torus',
    [PRIMITIVE_TYPES.PLANE]: 'Plane',
    [PRIMITIVE_TYPES.DODECAHEDRON]: 'Dodecahedron',
    [PRIMITIVE_TYPES.ICOSAHEDRON]: 'Icosahedron'
  }
  return names[type] || type
}

/**
 * Get icon/emoji for primitive type
 */
export function getPrimitiveIcon(type) {
  const icons = {
    [PRIMITIVE_TYPES.BOX]: '📦',
    [PRIMITIVE_TYPES.SPHERE]: '⚽',
    [PRIMITIVE_TYPES.CYLINDER]: '🥫',
    [PRIMITIVE_TYPES.CONE]: '🔺',
    [PRIMITIVE_TYPES.TORUS]: '🍩',
    [PRIMITIVE_TYPES.PLANE]: '▭',
    [PRIMITIVE_TYPES.DODECAHEDRON]: '⬢',
    [PRIMITIVE_TYPES.ICOSAHEDRON]: '💎'
  }
  return icons[type] || '📐'
}
