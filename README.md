# AI Projects Monorepo

Production-grade monorepo for AI-powered applications built with TypeScript, React, Next.js, and modern web technologies.

## 🏗️ Architecture

This is a **pnpm + Turborepo monorepo** with centralized dependencies and workspace packages.

```
ai-projects/
├── apps/                    # Applications
│   ├── smart-shop/         # AI-powered e-commerce platform (Next.js 15)
│   ├── pitch-deck/         # AI pitch deck generator (Next.js 16)
│   ├── tiltan-crm/         # School CRM system (Next.js)
│   └── snake-game/         # 3D Snake game (React + Three.js)
├── packages/               # Shared workspace packages
│   ├── utils/             # Common utilities (25+ functions)
│   └── design-tokens/     # Design system tokens (colors, spacing, typography)
├── tools/                  # Development tools
├── docs/                   # Documentation
└── [config files]          # Monorepo configuration
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥ 18.17.0
- **pnpm** ≥ 8.0.0

### Installation

```bash
# Install pnpm globally if not installed
npm install -g pnpm@8.15.0

# Install all dependencies (single node_modules at root)
pnpm install

# Run all apps in development mode
pnpm dev

# Build all apps
pnpm build
```

### Running Individual Apps

```bash
# Development
pnpm --filter @workspace/smart-shop dev
pnpm --filter @workspace/pitch-deck dev
pnpm --filter @workspace/tiltan-crm dev
pnpm --filter @workspace/snake-game dev

# Build specific app
pnpm --filter @workspace/smart-shop build

# Run all tests
pnpm test
```

## 📦 Packages

### @workspace/utils
Common utility functions used across all applications.

```typescript
import { delay, debounce, validateEmail, clamp } from '@workspace/utils';

// 25+ utilities:
// - Async: delay, sleep, retry
// - Functions: debounce, throttle
// - Strings: capitalize, truncate, toCamelCase, toKebabCase
// - Arrays: unique, groupBy
// - Validation: validateEmail, isValidUrl
// - Objects: deepClone, isEmpty
// - Numbers: clamp, generateId
// - Dates: formatDate
```

### @workspace/design-tokens
Design system tokens for consistent styling.

```typescript
import { colors, spacing, typography } from '@workspace/design-tokens';

// Colors: Primary/Secondary/Neutral scales, semantic colors
// Spacing: Tailwind-compatible spacing + border radius + breakpoints
// Typography: Font families, sizes, weights, line heights
```

## 🎯 Applications

### smart-shop - AI E-commerce Platform
**Tech Stack:** Next.js 15, React 18, TypeScript, Tailwind CSS, OpenAI, Anthropic Claude

**Features:**
- AI-powered product search & recommendations
- JSON-driven content management
- Voice UX capabilities
- Real-time chat with AI shopping assistant
- Zustand state management

**Local Development:**
```bash
cd apps/smart-shop
cp .env.example .env.local
# Add your API keys
pnpm dev
```

### pitch-deck - AI Pitch Deck Generator
**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Anthropic Claude

**Features:**
- AI-powered slide generation
- Advanced slide editor
- Multiple deck templates
- Export to JSON/PDF
- Live preview mode

**Local Development:**
```bash
cd apps/pitch-deck
pnpm dev
```

### tiltan-crm - School CRM System
**Tech Stack:** Next.js, TypeScript, shadcn/ui, Tailwind CSS

**Features:**
- Student management
- Instructor tracking
- Lecture scheduling
- JSON-based database

### snake-game - 3D Snake Game
**Tech Stack:** React, Three.js, Vite, Tailwind CSS

**Features:**
- Full 3D rendering with Three.js
- Touch controls for mobile
- Power-ups system
- Cyberpunk/neon aesthetic
- Procedurally generated obstacles

## 🛠️ Development

### Workspace Commands

```bash
# Install dependencies
pnpm install

# Development (all apps)
pnpm dev

# Build (all apps with Turborepo caching)
pnpm build

# Lint (all apps)
pnpm lint

# Type check (all apps)
pnpm typecheck

# Format code
pnpm format

# Clean (remove build artifacts)
pnpm clean

# Architecture validation
pnpm arch:check
```

### Adding Dependencies

```bash
# Add to specific app
pnpm --filter @workspace/smart-shop add package-name

# Add to workspace package
pnpm --filter @workspace/utils add package-name

# Add to root (dev dependencies)
pnpm add -D package-name -w
```

### Creating New Apps

```bash
# Create new app directory
mkdir apps/my-new-app
cd apps/my-new-app

# Initialize with Next.js/React/Vite
npx create-next-app@latest .
# or
npm create vite@latest .

# Update package.json name
"name": "@workspace/my-new-app"

# Update tsconfig.json to extend base
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    // app-specific options
    "paths": {
      "@/*": ["./*"],
      "@workspace/utils": ["../../packages/utils/src"],
      "@workspace/design-tokens": ["../../packages/design-tokens/src"]
    }
  }
}

# Install dependencies
pnpm install
```

### Creating New Packages

```bash
# Create new package
mkdir -p packages/my-package/src

# Create package.json
{
  "name": "@workspace/my-package",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  }
}

# Create tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}

# Install dependencies
pnpm install
```

## 📋 Project Structure

### Monorepo Configuration Files

- **pnpm-workspace.yaml** - Workspace package definitions
- **package.json** - Root package with scripts and shared dev dependencies
- **turbo.json** - Turborepo build pipeline configuration
- **tsconfig.base.json** - Base TypeScript configuration for all packages
- **.npmrc** - pnpm configuration (hoisting, peer dependencies)
- **.gitignore** - Git ignore patterns

### TypeScript Configuration

All apps and packages extend the base `tsconfig.base.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "paths": {
      "@workspace/utils": ["../../packages/utils/src"],
      "@workspace/design-tokens": ["../../packages/design-tokens/src"]
    }
  }
}
```

### Import Paths

```typescript
// From any app or package:
import { delay, capitalize } from '@workspace/utils';
import { colors, spacing } from '@workspace/design-tokens';

// Internal imports use relative paths or path aliases:
import { Button } from '@/components/ui/button';  // In apps
import { helper } from '../utils/helper';         // In packages
```

## 🔧 Turborepo Benefits

- **Intelligent caching**: Builds are cached and never recomputed
- **Parallel execution**: Tasks run in parallel across packages
- **Remote caching**: Share build cache with team (optional)
- **Dependency graph**: Automatically determines build order
- **Incremental builds**: Only rebuilds what changed

## 🎨 Design System

The monorepo includes a centralized design system:

### Color Palette
- **Primary:** Blue scale (cyan-focused)
- **Secondary:** Purple scale
- **Neutral:** Gray scale
- **Semantic:** Success (green), Error (red), Warning (orange), Info (blue)

### Spacing Scale
Follows Tailwind's default spacing (multiples of 0.25rem)

### Typography
- **Font Families:** Sans (Inter/System), Serif (Georgia), Mono (Fira Code), Display (Plus Jakarta Sans)
- **Font Sizes:** xs to 9xl
- **Font Weights:** 100-900

## 🔐 Environment Variables

Each app manages its own environment variables:

```bash
# apps/smart-shop/.env.local
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# apps/pitch-deck/.env.local
ANTHROPIC_API_KEY=sk-ant-...
```

## 📚 Documentation

- **Package READMEs:** Each package has its own README with usage examples
- **App READMEs:** Each app has specific setup and feature documentation
- **Design System:** Documented in `packages/design-tokens/README.md`
- **Architecture:** This file

## 🤝 Contributing

### Branch Strategy
- `master`: Production-ready code
- `develop`: Integration branch (if needed)
- `feature/*`: Feature branches
- `fix/*`: Bug fix branches

### Commit Convention
Follow conventional commits:
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
```

## 📊 Monorepo Statistics

- **Apps:** 4 (smart-shop, pitch-deck, tiltan-crm, snake-game)
- **Packages:** 2 (utils, design-tokens)
- **Total Files:** ~1200+
- **Lines of Code:** ~50,000+
- **Dependencies:** Centralized in single node_modules
- **Build Tool:** Turborepo for parallel builds and caching

## 🚢 Deployment

### Vercel (Recommended for Next.js apps)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy specific app
cd apps/smart-shop
vercel

# Or use Vercel dashboard with root directory set to app folder
```

### Docker (Coming Soon)
Multi-stage Docker builds for each app with optimized production images.

## 📝 License

MIT

## 🤖 Generated with Claude Code

This monorepo structure was set up and optimized using Claude Code, Anthropic's official CLI tool.

---

**Last Updated:** November 2025
