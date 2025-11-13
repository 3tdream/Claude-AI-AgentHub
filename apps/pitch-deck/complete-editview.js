const fs = require('fs');

// Read current EditView
let content = fs.readFileSync('components/EditView.tsx', 'utf8');

// 1. Add imports for Plus and X from lucide-react
content = content.replace(
  "import { ChevronLeft, Home, Sparkles, Zap } from 'lucide-react';",
  "import { ChevronLeft, Home, Sparkles, Zap, Plus, X, Image as ImageIcon, Palette } from 'lucide-react';"
);

// 2. Add state declarations after the handleKeyPress function
const stateCode = `
  const [showAddSlideModal, setShowAddSlideModal] = useState(false);
  const [showBackgroundPanel, setShowBackgroundPanel] = useState(false);
  const [showImagePanel, setShowImagePanel] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageStyle, setImageStyle] = useState<'background' | 'corner' | 'center'>('corner');
`;

content = content.replace(
  'const handleKeyPress',
  stateCode + '\n  const handleKeyPress'
);

// 3. Add state import at the top
content = content.replace(
  "import React from 'react';",
  "import React, { useState } from 'react';"
);

// 4. Add action buttons after slide dots (before closing div of left side)
const actionButtonsCode = `
              {/* Action Buttons */}
              <div className="flex gap-3 justify-center mt-6">
                <button
                  onClick={() => setShowBackgroundPanel(!showBackgroundPanel)}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
                >
                  <Palette className="w-4 h-4" />
                  <span className="text-sm font-semibold">Background</span>
                </button>
                <button
                  onClick={() => setShowImagePanel(!showImagePanel)}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span className="text-sm font-semibold">Add Image</span>
                </button>
                <button
                  onClick={() => setShowAddSlideModal(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-semibold">Add Slide</span>
                </button>
              </div>
`;

content = content.replace(
  /(})}\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*{\/\* Right Side - Chat UI)/,
  '$1' + actionButtonsCode + '\n          </div>\n        </div>\n\n        $2'
);

console.log('✓ EditView updated with UI features');
fs.writeFileSync('components/EditView.tsx', content, 'utf8');
