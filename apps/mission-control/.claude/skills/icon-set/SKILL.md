---
name: icon-set
description: Curate Lucide icon set for a feature — find the right icons for each action and state
argument-hint: <feature description>
---

Curate icons for: $ARGUMENTS

1. Parse the feature description for UI elements
2. For each element, suggest a Lucide React icon:

| Element | Icon | Import | Preview |
|---------|------|--------|---------|
| Save | `Save` | `import { Save } from 'lucide-react'` | floppy disk |
| Delete | `Trash2` | `import { Trash2 } from 'lucide-react'` | trash can |

3. Group by context:
   - **Actions** — create, edit, delete, save, cancel
   - **Navigation** — back, forward, menu, close
   - **Status** — success, error, warning, info, loading
   - **Data** — search, filter, sort, export, import

4. Provide import statement:
```tsx
import { Icon1, Icon2, Icon3 } from 'lucide-react'
```

Rules:
- Only use icons from `lucide-react` (project standard)
- Consistent style — don't mix filled and outlined
- Size convention: `className="w-4 h-4"` for inline, `w-5 h-5` for buttons
