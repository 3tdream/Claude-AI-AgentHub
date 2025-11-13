import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter'
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter'
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter'

/**
 * Export scene or object to GLB format (binary GLTF)
 * @param {THREE.Scene|THREE.Object3D} object - The scene or object to export
 * @param {string} filename - Name for the downloaded file
 */
export function exportGLB(object, filename = 'scene.glb') {
  const exporter = new GLTFExporter()

  exporter.parse(
    object,
    (result) => {
      // GLB format is binary
      const blob = new Blob([result], { type: 'application/octet-stream' })
      downloadFile(blob, filename)
    },
    (error) => {
      console.error('Error exporting GLB:', error)
      alert('Failed to export GLB file')
    },
    { binary: true }
  )
}

/**
 * Export scene or object to GLTF format (JSON)
 * @param {THREE.Scene|THREE.Object3D} object - The scene or object to export
 * @param {string} filename - Name for the downloaded file
 */
export function exportGLTF(object, filename = 'scene.gltf') {
  const exporter = new GLTFExporter()

  exporter.parse(
    object,
    (result) => {
      // GLTF format is JSON
      const json = JSON.stringify(result, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      downloadFile(blob, filename)
    },
    (error) => {
      console.error('Error exporting GLTF:', error)
      alert('Failed to export GLTF file')
    },
    { binary: false }
  )
}

/**
 * Export scene or object to OBJ format
 * @param {THREE.Scene|THREE.Object3D} object - The scene or object to export
 * @param {string} filename - Name for the downloaded file
 */
export function exportOBJ(object, filename = 'scene.obj') {
  const exporter = new OBJExporter()

  try {
    const result = exporter.parse(object)
    const blob = new Blob([result], { type: 'text/plain' })
    downloadFile(blob, filename)
  } catch (error) {
    console.error('Error exporting OBJ:', error)
    alert('Failed to export OBJ file')
  }
}

/**
 * Export scene or object to STL format
 * @param {THREE.Scene|THREE.Object3D} object - The scene or object to export
 * @param {string} filename - Name for the downloaded file
 * @param {boolean} binary - Export as binary STL (default: true)
 */
export function exportSTL(object, filename = 'scene.stl', binary = true) {
  const exporter = new STLExporter()

  try {
    const result = exporter.parse(object, { binary })

    if (binary) {
      const blob = new Blob([result], { type: 'application/octet-stream' })
      downloadFile(blob, filename)
    } else {
      const blob = new Blob([result], { type: 'text/plain' })
      downloadFile(blob, filename)
    }
  } catch (error) {
    console.error('Error exporting STL:', error)
    alert('Failed to export STL file')
  }
}

/**
 * Helper function to download a blob as a file
 * @param {Blob} blob - The blob to download
 * @param {string} filename - Name for the downloaded file
 */
function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
