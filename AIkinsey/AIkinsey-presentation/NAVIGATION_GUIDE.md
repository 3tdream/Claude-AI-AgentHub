# Navigation Reordering Guide

## Overview
Your presentation now has a fully customizable navigation system! You can reorder buttons, show/hide controls, and change positions through a settings panel.

---

## How to Access Settings

**Click the ⚙️ Settings button** in the top-right corner (next to the slide counter)

![Settings Button Location](top-right corner of presentation)

---

## Customization Options

### 1. Bottom Navigation (Slide Controls)

**Available Buttons:**
- ◀️ **Previous Button** - Go to previous slide
- ⚫ **Slide Indicators** - Dots showing current position
- ▶️ **Next Button** - Go to next slide

**Customization:**
- **Reorder**: Use ↑ ↓ arrows to move buttons up/down in the list
- **Show/Hide**: Toggle the switch on each button
- **Position**: Choose Left, Center, or Right alignment

**Default Order:**
```
[Previous] [Indicators] [Next]
```

**Examples:**
```
[Indicators] [Previous] [Next]     ← Indicators first
[Previous] [Next] [Indicators]     ← Indicators last
[Indicators only]                  ← Hide prev/next buttons
```

---

### 2. Top Navigation (Controls)

**Available Buttons:**
- 🔗 **Share Button** - Copy presentation link to clipboard
- 📊 **Slide Counter** - Shows "1 / 16" current position

**Customization:**
- **Reorder**: Use ↑ ↓ arrows to change button order
- **Show/Hide**: Toggle visibility for each button
- **Position**: Choose Left or Right side

**Default Order:**
```
[Share] [Counter] [Settings]
```

**Examples:**
```
[Counter] [Share] [Settings]      ← Counter first
[Settings] only                   ← Hide share & counter
```

---

### 3. Keyboard Hint

**What it shows:**
"Use ← → arrows or spacebar to navigate"

**Customization:**
- **Show/Hide**: Toggle visibility on/off
- **Position**: Choose from 4 corners:
  - Top Left (default)
  - Top Right
  - Bottom Left
  - Bottom Right

---

## Settings Interface

### Button Order Panel

Each button shows:
```
[↑ ↓]  ⋮  [Icon] Button Name    [Toggle] [👁️]
```

- **↑ ↓** = Move up/down in order
- **⋮** = Drag handle (visual indicator)
- **Icon** = Button preview
- **Toggle** = Show/hide switch
- **👁️** = Visibility indicator (green = visible, gray = hidden)

---

## Quick Presets

### Minimal Mode
**Best for clean presentations**
- Bottom: Indicators only, centered
- Top: Counter only, right
- Keyboard Hint: Hidden

```json
{
  "bottomNav": {
    "order": ["indicators"],
    "visible": { "prev": false, "indicators": true, "next": false },
    "position": "center"
  },
  "topNav": {
    "order": ["counter"],
    "visible": { "share": false, "counter": true },
    "position": "right"
  },
  "keyboardHint": { "visible": false }
}
```

### Full Control Mode
**Best for presenter control**
- Bottom: All buttons, centered
- Top: All buttons, right
- Keyboard Hint: Visible top-left

```json
{
  "bottomNav": {
    "order": ["prev", "indicators", "next"],
    "visible": { "prev": true, "indicators": true, "next": true },
    "position": "center"
  },
  "topNav": {
    "order": ["share", "counter"],
    "visible": { "share": true, "counter": true },
    "position": "right"
  },
  "keyboardHint": { "visible": true, "position": "top-left" }
}
```

### Mobile Optimized
**Best for touch devices**
- Bottom: Large prev/next buttons, left/right
- Top: Counter only, right
- Keyboard Hint: Hidden

```json
{
  "bottomNav": {
    "order": ["prev", "indicators", "next"],
    "visible": { "prev": true, "indicators": true, "next": true },
    "position": "center"
  },
  "topNav": {
    "order": ["counter"],
    "visible": { "share": false, "counter": true },
    "position": "right"
  },
  "keyboardHint": { "visible": false }
}
```

---

## Persistent Settings

**Your preferences are automatically saved!**

- Settings are stored in browser `localStorage`
- Survives page refresh
- Persists across sessions
- Each browser/device has independent settings

**To reset:**
Click "Reset to Default" button at the bottom of the settings panel

---

## Keyboard Shortcuts

Navigation still works with keyboard regardless of button visibility:

- **→ Arrow** or **Space** - Next slide
- **← Arrow** - Previous slide
- Works even if buttons are hidden!

---

## Use Cases

### 1. Investor Pitch (Professional)
```
Bottom: [Indicators] only, center
Top: [Counter] only, right
Hint: Hidden
```
Clean and professional, minimal distractions

### 2. Training Session (Interactive)
```
Bottom: [Prev] [Indicators] [Next], center
Top: [Share] [Counter], right
Hint: Visible, top-left
```
Full controls for interactive navigation

### 3. Auto-Play Demo (Passive)
```
Bottom: [Indicators] only, center
Top: None
Hint: Hidden
```
Minimal interface for auto-advancing presentations

### 4. Mobile Presentation
```
Bottom: [Prev] [Next], left/right corners
Top: [Counter], right
Hint: Hidden
```
Large touch targets on edges

---

## Advanced Tips

### Hide All Navigation
Perfect for embedded presentations or auto-play:
1. Hide all bottom navigation buttons
2. Hide all top navigation buttons
3. Hide keyboard hint
4. Slide still navigates via keyboard shortcuts!

### Custom Button Order Examples

**Indicators in the middle (default):**
```
[Prev] [●●●] [Next]
```

**Indicators on the side:**
```
[●●●] [Prev] [Next]
[Prev] [Next] [●●●]
```

**Asymmetric layout:**
```
Bottom: [Indicators] only, left
Top: [Share] [Counter], left
```
All controls on left side for left-handed users

---

## Troubleshooting

### Settings don't save
- Check if cookies/localStorage are enabled
- Try incognito mode to test
- Clear browser cache if issues persist

### Buttons overlap
- Reduce number of visible buttons
- Change position (left/center/right)
- Consider hiding indicators on small screens

### Can't find settings button
- Look in top-right corner (⚙️ icon)
- If hidden, it's part of top navigation
- Check if top navigation is visible

---

## Technical Details

### Storage Format
Settings are stored as JSON in `localStorage` with key: `navigation-config`

### Default Configuration
```typescript
{
  bottomNav: {
    order: ['prev', 'indicators', 'next'],
    visible: { prev: true, indicators: true, next: true },
    position: 'center'
  },
  topNav: {
    order: ['share', 'counter'],
    visible: { share: true, counter: true },
    position: 'right'
  },
  keyboardHint: {
    visible: true,
    position: 'top-left'
  }
}
```

### File Locations
- **Settings Component**: `components/NavigationSettings.tsx`
- **Main Page**: `app/page.tsx`
- **Original Backup**: `app/page-original.tsx`

---

## Examples in Action

### Conference Presentation
```
Settings:
- Bottom: Indicators only, centered
- Top: Slide counter, right
- Hint: Hidden

Rationale: Clean, professional look with minimal distractions
```

### Workshop/Training
```
Settings:
- Bottom: All buttons visible, centered
- Top: Share + Counter, right
- Hint: Visible, top-left

Rationale: Full control for instructor, visible hints for participants
```

### Embedded on Website
```
Settings:
- Bottom: Indicators only, centered
- Top: Nothing visible
- Hint: Hidden

Rationale: Seamless integration, no external controls needed
```

---

## Future Enhancements

Planned features:
- [ ] Button size customization
- [ ] Color theme options
- [ ] Animation speed control
- [ ] Export/import configuration
- [ ] Preset templates (one-click presets)
- [ ] Touch gesture configuration

---

## Feedback

Found a bug or want a feature?
- Open an issue on GitHub
- Email: your-email@example.com
- Or update `NavigationSettings.tsx` directly!

---

**Enjoy your customizable presentation! 🎉**
