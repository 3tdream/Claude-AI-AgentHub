# Claude Code Default Settings & Templates

This directory contains default settings, design system rules, and project templates for all AI-powered development projects.

## Directory Structure

```
.claude/
├── rules/
│   └── default_design_system.md    # Default design system rules
├── templates/
│   ├── figma_integration_guide.md  # Figma-to-code workflow
│   └── project_init_template.md    # Project setup templates
├── settings.local.json              # User permissions
└── README.md                        # This file
```

---

## 📁 Files Overview

### 1. rules/default_design_system.md
**Default design system rules applied to all projects**

Contains:
- Technology stack preferences (Next.js, React, TypeScript, Tailwind, shadcn/ui)
- Design token standards (colors, typography, spacing)
- Component patterns (buttons, cards, layouts)
- Animation standards (Framer Motion, Tailwind)
- Icon usage guidelines (Lucide React)
- File organization patterns
- Performance best practices
- Accessibility standards
- TypeScript conventions
- Git workflow standards
- Testing guidelines

**Use when:**
- Starting any new project
- Creating CLAUDE.md for a project
- Establishing design system conventions

### 2. templates/figma_integration_guide.md
**Complete guide for converting Figma designs to code**

Contains:
- Figma MCP tool usage
- Design token extraction (colors, typography, spacing)
- Component pattern mapping
- Asset export guidelines
- Responsive design translation
- Animation conversion (Figma → Framer Motion)
- Variables & tokens setup
- Common issues & solutions
- Complete component migration examples

**Use when:**
- Converting Figma designs to React components
- Extracting design tokens from Figma
- Setting up design system from Figma variables
- Troubleshooting design inconsistencies

### 3. templates/project_init_template.md
**Project initialization commands and configurations**

Contains:
- Quick start commands (Next.js, Vite, React+Three.js)
- Configuration files (Tailwind, TypeScript, globals.css)
- Project structure templates
- Component templates (Button, Card)
- Environment variable setup
- Git configuration
- VSCode settings
- Deployment guides

**Use when:**
- Initializing a new project
- Setting up development environment
- Configuring build tools
- Preparing for deployment

### 4. settings.local.json
**User permissions and allowed operations**

Contains approved permissions for:
- File read/write operations
- Bash commands
- MCP tool access (Chrome DevTools, Figma, Vercel)
- Web search and fetch
- Development server operations

---

## 🚀 How to Use

### For New Projects

**1. Create Project with Template:**
```bash
# See templates/project_init_template.md for full commands

# Next.js example:
npx create-next-app@latest my-project --typescript --tailwind --app --no-src-dir --import-alias "@/*"
cd my-project
npx shadcn@latest init
npm install framer-motion lucide-react
```

**2. Create Project-Specific CLAUDE.md:**
- Copy relevant sections from `rules/default_design_system.md`
- Add project-specific design tokens
- Document component library
- Add Figma integration notes (using `templates/figma_integration_guide.md`)

**3. Apply Design System Rules:**
- Use HSL-based CSS variables
- Follow Tailwind utility-first approach
- Use shadcn/ui for components
- Apply responsive design patterns

### For Figma Integration

**1. Get Figma Design Context:**
```typescript
// Extract from URL: https://figma.com/design/{fileKey}/{name}?node-id={id}
mcp__figma__get_design_context({
  fileKey: "your-file-key",
  nodeId: "1:2",
  clientLanguages: "typescript",
  clientFrameworks: "react,nextjs"
})
```

**2. Follow Integration Guide:**
- See `templates/figma_integration_guide.md`
- Extract design tokens (colors, spacing, typography)
- Map Figma components to shadcn/ui
- Convert animations to Framer Motion

**3. Document in CLAUDE.md:**
- Add extracted design tokens
- Note component mappings
- Document custom patterns

---

## 📋 Default Technology Stack

### Primary Tools (Recommended for All Projects)

| Category | Tool | Version | Purpose |
|----------|------|---------|---------|
| Framework | Next.js | 15+ | Full-stack React framework |
| UI Library | React | 18.3+ | Component library |
| Language | TypeScript | 5+ | Type-safe development |
| Styling | Tailwind CSS | 3.4+ | Utility-first CSS |
| Components | shadcn/ui | Latest | Accessible components |
| Icons | Lucide React | Latest | Icon library |
| Animation | Framer Motion | 11+ | Animations & transitions |
| Charts | Recharts | 2+ | Data visualization |

### Alternative Tools (Project-Specific)

| Use Case | Tools |
|----------|-------|
| 3D Projects | Three.js, React Three Fiber, @react-three/drei |
| Client-Only Apps | Vite 7+ instead of Next.js |
| Presentations | Next.js + Framer Motion + shadcn/ui |
| Games | React + Three.js + Vite |

---

## 🎨 Design System Standards

### Colors
- **Format**: HSL-based CSS variables
- **Naming**: `--background`, `--foreground`, `--primary`, `--secondary`, `--accent`
- **Dark Mode**: Use `.dark` class with CSS variables

### Typography
- **Scale**: Tailwind default (`text-xs` to `text-6xl`)
- **Weights**: `font-normal`, `font-medium`, `font-semibold`, `font-bold`
- **System Font Stack**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto...`

### Spacing
- **Base**: 4px (Tailwind default)
- **Common Values**: `p-2` (8px), `p-4` (16px), `p-6` (24px), `p-8` (32px)

### Border Radius
- **Default**: `--radius: 0.5rem` (8px)
- **Variants**: `rounded-lg`, `rounded-md`, `rounded-full`

---

## 🔧 MCP Tools Available

### Chrome DevTools MCP
- `mcp__chrome-devtools__list_pages` - List open pages
- `mcp__chrome-devtools__navigate_page` - Navigate to URL
- `mcp__chrome-devtools__take_snapshot` - Take page snapshot
- `mcp__chrome-devtools__take_screenshot` - Screenshot page
- `mcp__chrome-devtools__click` - Click elements
- `mcp__chrome-devtools__resize_page` - Resize viewport

### Figma MCP
- `mcp__figma__get_screenshot` - Get design screenshot
- `mcp__figma__get_design_context` - Get code + assets
- `mcp__figma__get_metadata` - Get structure overview
- `mcp__figma__get_variable_defs` - Get variable definitions
- `mcp__figma__get_code_connect_map` - Get code mapping

### Vercel MCP
- `mcp__vercel__get_project` - Get project details
- `mcp__vercel__list_deployments` - List deployments
- `mcp__vercel__deploy_to_vercel` - Deploy project

---

## 📝 Project Documentation Template

### Minimal CLAUDE.md Structure

```markdown
# Design System Rules for [Project Name]

## Project Overview
[Brief description of project, tech stack, and purpose]

## 1. Design Token Definitions
[Colors, typography, spacing specific to this project]

## 2. Component Library
[Custom components and shadcn/ui usage]

## 3. Frameworks & Libraries
[Specific versions and configurations]

## 4. Figma Integration
[File keys, node mappings, design token extraction]

## 5. Performance Optimizations
[Project-specific optimizations]

## Summary for Claude AI
[Quick reference for AI assistance]
```

---

## 🎯 Quick Commands

### Create New Next.js Project
```bash
npx create-next-app@latest my-project --typescript --tailwind --app
cd my-project
npx shadcn@latest init
npm install framer-motion lucide-react
npm run dev
```

### Add shadcn/ui Components
```bash
npx shadcn@latest add button card badge input dialog tabs
```

### Initialize Tailwind in Existing Project
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Deploy to Vercel
```bash
npm i -g vercel
vercel
```

---

## 🔄 Updating These Templates

### When to Update

**default_design_system.md:**
- New preferred technology added
- Design pattern improvements
- Best practice updates

**figma_integration_guide.md:**
- New Figma features
- MCP tool updates
- New conversion patterns

**project_init_template.md:**
- Package version updates
- New configuration requirements
- Build tool changes

### How to Update

1. Edit the relevant file in `.claude/rules/` or `.claude/templates/`
2. Test the changes in a new project
3. Update this README if directory structure changes

---

## 📚 External References

- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Next.js**: https://nextjs.org/docs
- **Framer Motion**: https://www.framer.com/motion
- **Lucide Icons**: https://lucide.dev
- **Figma**: https://figma.com
- **Vercel**: https://vercel.com

---

## 🆘 Troubleshooting

### Common Issues

**Issue: shadcn/ui components not working**
```bash
# Ensure you've run init
npx shadcn@latest init

# Check components.json exists
# Verify tailwind.config.ts has correct content paths
```

**Issue: Tailwind classes not applying**
```bash
# Check tailwind.config.ts content array includes your files
content: [
  "./app/**/*.{js,ts,jsx,tsx,mdx}",
  "./components/**/*.{js,ts,jsx,tsx,mdx}",
]
```

**Issue: TypeScript errors**
```bash
# Regenerate types
npm run type-check

# Check tsconfig.json paths configuration
```

**Issue: Figma MCP not working**
```bash
# Check Figma desktop app is open
# Verify MCP is authenticated
claude mcp list

# Re-authenticate if needed
# Close and reopen Figma
```

---

## 💡 Tips

1. **Always start with templates** - Use `project_init_template.md` for consistent setup
2. **Create project CLAUDE.md** - Document design system for each project
3. **Use MCP tools** - Leverage Figma MCP for design-to-code workflow
4. **Follow conventions** - Stick to default design system rules
5. **Keep updated** - Update templates as tools evolve

---

## 📄 License

These templates are for internal use and can be modified as needed for your projects.

---

**Last Updated**: October 2025
**Version**: 1.0.0
**Maintained By**: Claude Code AI Assistant
