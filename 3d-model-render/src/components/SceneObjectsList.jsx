export default function SceneObjectsList({
  showHeatMap,
  visibility,
  toggleVisibility,
  transforms,
  updateTransform,
  resetTransform,
  editingObject,
  toggleEdit
}) {
  const sceneObjects = [
    {
      category: "Building Structure",
      items: [
        { name: "Foundation", key: "foundation", color: "#2a2a2a", description: "Base platform (8.5m × 30.5m × 0.2m)" },
        { name: "Left Wall", key: "leftWall", color: "#90caf9", description: "Transparent side panel (30m long)" },
        { name: "Right Wall", key: "rightWall", color: "#90caf9", description: "Transparent side panel (30m long)" },
        { name: "Front Wall", key: "frontWall", color: "#90caf9", description: "Transparent end panel (8m wide)" },
        { name: "Back Wall", key: "backWall", color: "#90caf9", description: "Transparent end panel (8m wide)" },
        { name: "Roof Structure", key: "roof", color: "#e0e0e0", description: "Gable roof (3m peak height)" },
        { name: "Grid Floor", key: "gridFloor", color: "#ffffff", description: "Reference grid (wireframe)" }
      ]
    },
    {
      category: "Support Frames (10 units)",
      items: [
        { name: "Vertical Posts", key: "verticalPosts", color: "#404040", description: "20 posts total (2 per frame)" },
        { name: "Roof Support Beams", key: "roofBeams", color: "#404040", description: "20 angled beams (2 per frame)" }
      ]
    },
    {
      category: "Scene Elements",
      items: [
        { name: "Ground Grid", key: "groundGrid", color: "#404040/#606060", description: "Reference grid (100×100)" },
        { name: "Shadow Plane", key: "shadowPlane", color: "transparent", description: "Shadow catcher (200×200)" }
      ]
    },
    {
      category: "Lighting",
      items: [
        { name: "Ambient Light", key: "ambientLight", description: "Overall scene illumination" },
        { name: "Main Directional Light", key: "mainLight", description: "Primary light with shadows" },
        { name: "Fill Light 1", key: "fillLight1", description: "Left-back fill (30% intensity)" },
        { name: "Fill Light 2", key: "fillLight2", description: "Right-back fill (20% intensity)" },
        { name: "Hemisphere Light", key: "hemisphereLight", description: "Sky/ground ambient light" }
      ]
    }
  ]

  if (showHeatMap) {
    sceneObjects.push({
      category: "Heat Map Visualization",
      items: [
        { name: "Top Overlay Plane", key: "heatMapOverlay", color: "texture", description: "Heat map texture above roof" },
        { name: "Volumetric Heat Box", key: "heatMapVolume", color: "#ff6b6b", description: "Semi-transparent heat volume" }
      ]
    })
  }

  return (
    <div className="scene-objects-list">
      <div className="objects-header">
        <h2>Scene Objects</h2>
      </div>
      <div className="objects-content">
        {sceneObjects.map((category, idx) => (
          <div key={idx} className="object-category">
            <h3>{category.category}</h3>
            <ul>
              {category.items.map((item, itemIdx) => (
                <li key={itemIdx} className="object-item-wrapper">
                  <div className="object-item">
                    <button
                      className="eye-toggle"
                      onClick={() => toggleVisibility(item.key)}
                      aria-label={`Toggle ${item.name} visibility`}
                      title={visibility[item.key] ? 'Hide' : 'Show'}
                    >
                      {visibility[item.key] ? '👁️' : '👁️‍🗨️'}
                    </button>
                    <button
                      className="edit-toggle"
                      onClick={() => toggleEdit(item.key)}
                      aria-label={`Edit ${item.name} transforms`}
                      title={editingObject === item.key ? 'Close editor' : 'Edit transforms'}
                    >
                      ✏️
                    </button>
                    {item.color && (
                      <span
                        className="color-indicator"
                        style={{
                          background: item.color.includes('/')
                            ? `linear-gradient(to right, ${item.color.split('/').join(', ')})`
                            : item.color === 'texture'
                            ? 'linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #48dbfb 100%)'
                            : item.color === 'transparent'
                            ? 'repeating-linear-gradient(45deg, #333 0px, #333 5px, #555 5px, #555 10px)'
                            : item.color
                        }}
                      />
                    )}
                    <div className="object-details">
                      <strong style={{ opacity: visibility[item.key] ? 1 : 0.5 }}>
                        {item.name}
                      </strong>
                      {item.description && (
                        <span className="object-desc" style={{ opacity: visibility[item.key] ? 1 : 0.5 }}>
                          {item.description}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Transform Editor */}
                  {editingObject === item.key && (
                    <div className="transform-editor">
                      {/* Position Controls */}
                      <div className="transform-group">
                        <label className="transform-label">📍 Position</label>
                        <div className="transform-inputs">
                          <div className="transform-input-group">
                            <label>X</label>
                            <input
                              type="number"
                              step="0.1"
                              value={transforms[item.key]?.position[0] || 0}
                              onChange={(e) => updateTransform(item.key, 'position', 0, e.target.value)}
                            />
                          </div>
                          <div className="transform-input-group">
                            <label>Y</label>
                            <input
                              type="number"
                              step="0.1"
                              value={transforms[item.key]?.position[1] || 0}
                              onChange={(e) => updateTransform(item.key, 'position', 1, e.target.value)}
                            />
                          </div>
                          <div className="transform-input-group">
                            <label>Z</label>
                            <input
                              type="number"
                              step="0.1"
                              value={transforms[item.key]?.position[2] || 0}
                              onChange={(e) => updateTransform(item.key, 'position', 2, e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Rotation Controls */}
                      <div className="transform-group">
                        <label className="transform-label">🔄 Rotation (degrees)</label>
                        <div className="transform-inputs">
                          <div className="transform-input-group">
                            <label>X</label>
                            <input
                              type="number"
                              step="1"
                              value={transforms[item.key]?.rotation[0] || 0}
                              onChange={(e) => updateTransform(item.key, 'rotation', 0, e.target.value)}
                            />
                          </div>
                          <div className="transform-input-group">
                            <label>Y</label>
                            <input
                              type="number"
                              step="1"
                              value={transforms[item.key]?.rotation[1] || 0}
                              onChange={(e) => updateTransform(item.key, 'rotation', 1, e.target.value)}
                            />
                          </div>
                          <div className="transform-input-group">
                            <label>Z</label>
                            <input
                              type="number"
                              step="1"
                              value={transforms[item.key]?.rotation[2] || 0}
                              onChange={(e) => updateTransform(item.key, 'rotation', 2, e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Scale Controls */}
                      <div className="transform-group">
                        <label className="transform-label">📏 Scale</label>
                        <div className="transform-inputs">
                          <div className="transform-input-group">
                            <label>X</label>
                            <input
                              type="number"
                              step="0.1"
                              min="0.01"
                              value={transforms[item.key]?.scale[0] || 1}
                              onChange={(e) => updateTransform(item.key, 'scale', 0, e.target.value)}
                            />
                          </div>
                          <div className="transform-input-group">
                            <label>Y</label>
                            <input
                              type="number"
                              step="0.1"
                              min="0.01"
                              value={transforms[item.key]?.scale[1] || 1}
                              onChange={(e) => updateTransform(item.key, 'scale', 1, e.target.value)}
                            />
                          </div>
                          <div className="transform-input-group">
                            <label>Z</label>
                            <input
                              type="number"
                              step="0.1"
                              min="0.01"
                              value={transforms[item.key]?.scale[2] || 1}
                              onChange={(e) => updateTransform(item.key, 'scale', 2, e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Reset Button */}
                      <button
                        className="reset-transform-btn"
                        onClick={() => resetTransform(item.key)}
                      >
                        🔄 Reset to Default
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
