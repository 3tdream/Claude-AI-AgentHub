import { useState } from 'react'
import { PRIMITIVE_TYPES, getPrimitiveDisplayName, getPrimitiveIcon } from '../utils/primitiveFactory'

export default function ModelerPanel({
  onCreateObject,
  createdObjects,
  selectedObjectId,
  onSelectObject,
  onDeleteObject,
  onToggleVisibility,
  onUpdateObjectMaterial,
  onDuplicateObject
}) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showPrimitives, setShowPrimitives] = useState(false)

  const primitiveTypes = [
    PRIMITIVE_TYPES.BOX,
    PRIMITIVE_TYPES.SPHERE,
    PRIMITIVE_TYPES.CYLINDER,
    PRIMITIVE_TYPES.CONE,
    PRIMITIVE_TYPES.TORUS,
    PRIMITIVE_TYPES.PLANE,
    PRIMITIVE_TYPES.DODECAHEDRON,
    PRIMITIVE_TYPES.ICOSAHEDRON
  ]

  const selectedObject = createdObjects.find(obj => obj.id === selectedObjectId)

  return (
    <div className="modeler-panel">
      <div className="panel-header">
        <h2>3D Modeler</h2>
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
          {/* Create Primitives Section */}
          <section>
            <h3>Create Shapes</h3>
            <button
              className="create-shapes-btn"
              onClick={() => setShowPrimitives(!showPrimitives)}
            >
              ➕ {showPrimitives ? 'Hide' : 'Add Primitive Shape'}
            </button>

            {showPrimitives && (
              <div className="primitives-grid">
                {primitiveTypes.map((type) => (
                  <button
                    key={type}
                    className="primitive-btn"
                    onClick={() => {
                      onCreateObject(type)
                      setShowPrimitives(false)
                    }}
                    title={`Create ${getPrimitiveDisplayName(type)}`}
                  >
                    <span className="primitive-icon">{getPrimitiveIcon(type)}</span>
                    <span className="primitive-name">{getPrimitiveDisplayName(type)}</span>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Objects List */}
          <section>
            <h3>Objects ({createdObjects.length})</h3>
            {createdObjects.length === 0 ? (
              <p className="empty-state">No objects created yet. Add a primitive shape to get started!</p>
            ) : (
              <div className="objects-list">
                {createdObjects.map((obj) => (
                  <div
                    key={obj.id}
                    className={`object-item ${selectedObjectId === obj.id ? 'selected' : ''}`}
                    onClick={() => onSelectObject(obj.id)}
                  >
                    <button
                      className="visibility-toggle"
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleVisibility(obj.id)
                      }}
                      title={obj.visible ? 'Hide' : 'Show'}
                    >
                      {obj.visible ? '👁️' : '👁️‍🗨️'}
                    </button>

                    <span className="object-icon">{getPrimitiveIcon(obj.type)}</span>

                    <div className="object-details">
                      <strong>{obj.name}</strong>
                      <span className="object-type">{getPrimitiveDisplayName(obj.type)}</span>
                    </div>

                    <div className="object-actions">
                      <button
                        className="action-btn duplicate-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDuplicateObject(obj.id)
                        }}
                        title="Duplicate"
                      >
                        📋
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteObject(obj.id)
                        }}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Material Editor for Selected Object */}
          {selectedObject && (
            <section>
              <h3>Edit Material</h3>
              <div className="material-editor">
                <div className="material-control">
                  <label htmlFor="object-color">Color</label>
                  <input
                    id="object-color"
                    type="color"
                    value={selectedObject.material.color}
                    onChange={(e) => onUpdateObjectMaterial(selectedObject.id, { color: e.target.value })}
                  />
                </div>

                <div className="material-control">
                  <label htmlFor="object-opacity">Opacity: {selectedObject.material.opacity.toFixed(2)}</label>
                  <input
                    id="object-opacity"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={selectedObject.material.opacity}
                    onChange={(e) => onUpdateObjectMaterial(selectedObject.id, {
                      opacity: parseFloat(e.target.value),
                      transparent: parseFloat(e.target.value) < 1
                    })}
                    className="slider"
                  />
                </div>

                <div className="material-control">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedObject.material.wireframe}
                      onChange={(e) => onUpdateObjectMaterial(selectedObject.id, { wireframe: e.target.checked })}
                    />
                    <span>Wireframe Mode</span>
                  </label>
                </div>
              </div>
            </section>
          )}

          {/* Instructions */}
          <section>
            <h3>Controls</h3>
            <ul className="instructions">
              <li><strong>Click object:</strong> Select for editing</li>
              <li><strong>Transform gizmo:</strong> Move/Rotate/Scale</li>
              <li><strong>Delete:</strong> Remove selected object</li>
            </ul>
          </section>
        </div>
      )}
    </div>
  )
}
