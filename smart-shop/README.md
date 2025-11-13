# Smart Shop 🛍️

A production-grade, AI-powered eCommerce platform built with Next.js 15, featuring JSON-driven content, multiple layout engines, a flexible design system, and intelligent AI agents with voice UX capabilities.

## Features

### Core Platform
- **JSON-Driven Content**: All content (products, pages, menus, themes) controlled via JSON schemas with Zod validation
- **Multiple Layout Engines**: Grid, Masonry, Spotlight, Magazine, Story, and Landing page layouts
- **Flexible Design System**: Token-based theming system that syncs to Tailwind CSS and CSS variables
- **Type-Safe**: Full TypeScript coverage with comprehensive Zod schemas

### AI & Intelligence
- **5 AI Agents**:
  - **Product Agent**: Catalog enrichment, product discovery, specifications
  - **Design Agent**: Design system suggestions, accessibility checks
  - **QA Agent**: Test generation, bug detection, regression checks
  - **Data Agent**: Sales insights, analytics, chart generation
  - **Project Agent**: Task breakdown, roadmap planning

- **Voice UX**: Voice commands via Web Speech API (Speech Recognition + TTS)
- **Streaming Chat**: Real-time AI responses with SSE (Server-Sent Events)
- **Slash Commands**: Quick access to agent capabilities
- **Vector Search**: In-memory product search with cosine similarity

### Commerce
- **Product Management**: Rich product data with variants, specs, media
- **Cart & Checkout**: Optimistic UI updates, persistent cart state
- **Category Browsing**: Hierarchical categories with filtering
- **Search**: AI-powered semantic product search

### Technology Stack
- **Framework**: Next.js 15.0.3 (App Router, React Server Components)
- **UI**: shadcn/ui + Radix UI primitives
- **Styling**: Tailwind CSS 3.4.18
- **Animation**: Framer Motion 11.18.2
- **Icons**: Lucide React 0.487.0
- **Charts**: Recharts 2.15.4
- **State**: Zustand 5.0.2
- **Validation**: Zod 3.24.1
- **AI Providers**: OpenAI + Anthropic (pluggable)

## Project Structure

```
smart-shop/
├── app/                      # Next.js App Router
│   ├── (site)/              # Main site pages
│   │   └── page.tsx         # Home page
│   ├── api/                 # API routes
│   │   └── ai/             # AI endpoints
│   │       ├── chat/       # Streaming chat
│   │       └── tools/      # Tool execution
│   ├── globals.css         # Global styles with design tokens
│   └── layout.tsx          # Root layout
│
├── components/             # React components
│   └── ui/                # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── badge.tsx
│       └── toast.tsx
│
├── content/               # JSON content files
│   ├── design-tokens.json # Theme configuration
│   ├── site.json         # Site config (menus, footer)
│   ├── products.json     # Product catalog (12 products)
│   ├── categories.json   # Product categories (4 categories)
│   └── pages.json        # CMS pages (6 pages)
│
├── lib/                  # Core utilities
│   ├── schemas/         # Zod validation schemas
│   │   ├── product.ts
│   │   ├── category.ts
│   │   ├── page.ts
│   │   ├── design-tokens.ts
│   │   └── site.ts
│   ├── ai/              # AI system
│   │   ├── llm.ts      # Pluggable LLM adapter (OpenAI/Anthropic)
│   │   ├── agents.ts   # Agent system prompts
│   │   └── tools.ts    # AI tool definitions
│   ├── search/         # Search utilities
│   │   └── vector.ts   # Vector search implementation
│   ├── store/          # State management
│   │   └── cart.ts     # Zustand cart store
│   ├── content.ts      # Content loader with caching
│   └── utils.ts        # Utility functions
│
├── hooks/              # React hooks
│   └── use-toast.ts   # Toast notifications
│
├── scripts/           # Build scripts
│   └── sync-tokens.ts # Design token sync script
│
└── styles/
    └── tailwind.config.ts
```

## Getting Started

### Prerequisites

- **Node.js**: 18.17.0 or higher
- **pnpm**: 8.0.0 or higher
- **API Key**: Either OpenAI or Anthropic API key

### Installation

1. **Clone and navigate to the project**:
   ```bash
   cd smart-shop
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```

4. **Configure your AI provider** in `.env.local`:

   **For OpenAI (default)**:
   ```env
   AI_PROVIDER=openai
   OPENAI_API_KEY=sk-proj-your-key-here
   OPENAI_MODEL=gpt-4-turbo-preview

   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_ENABLE_VOICE=true
   NEXT_PUBLIC_ENABLE_AI_CHAT=true
   ```

   **For Anthropic**:
   ```env
   AI_PROVIDER=anthropic
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_ENABLE_VOICE=true
   NEXT_PUBLIC_ENABLE_AI_CHAT=true
   ```

5. **Sync design tokens** (generates CSS variables from JSON):
   ```bash
   pnpm sync:tokens
   ```

6. **Run the development server**:
   ```bash
   pnpm dev
   ```

7. **Open your browser**:
   ```
   http://localhost:3000
   ```

## Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production (includes token sync)
pnpm start            # Start production server

# Utilities
pnpm sync:tokens      # Sync design tokens to CSS/Tailwind
pnpm lint             # Run ESLint
pnpm format           # Format code with Prettier
pnpm type-check       # TypeScript type checking

# Testing
pnpm test             # Run tests
pnpm test:watch       # Run tests in watch mode
```

## Switching AI Providers

The platform supports both OpenAI and Anthropic with zero code changes:

### Switch to OpenAI
```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4-turbo-preview
```

### Switch to Anthropic
```env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

The LLM adapter (`lib/ai/llm.ts`) automatically uses the configured provider.

## Design Token System

### How It Works

1. **Edit tokens**: Modify `content/design-tokens.json`
2. **Sync changes**: Run `pnpm sync:tokens`
3. **Automatic updates**: CSS variables and Tailwind config update automatically

### Token Structure

```json
{
  "themes": [
    { "name": "light", "colors": {...} },
    { "name": "dark", "colors": {...} }
  ],
  "typography": {...},
  "spacing": {...},
  "radius": {...},
  "shadows": {...},
  "motion": {...}
}
```

### Switching Themes

Use the `data-theme` attribute:
```html
<html data-theme="dark">
```

## AI Chat API

### Endpoint
```
POST /api/ai/chat
```

### Request
```json
{
  "messages": [
    { "role": "user", "content": "Find me wireless headphones" }
  ],
  "agent": "product"
}
```

### Agents
- `product` - Product discovery and information
- `design` - Design system and UX suggestions
- `qa` - Quality assurance and testing
- `data` - Analytics and insights
- `project` - Project planning and tasks

### Response
Server-Sent Events (SSE) stream:
```
data: {"content":"Looking"}
data: {"content":" for"}
data: {"content":" headphones"}
data: [DONE]
```

## Voice Commands

Voice shopping is enabled by default. Features:
- **Speech Recognition**: Convert speech to text
- **Text-to-Speech**: AI responses read aloud
- **Browser Support**: Chrome, Edge, Safari (with fallbacks)

Enable/disable via environment:
```env
NEXT_PUBLIC_ENABLE_VOICE=true
```

## Content Management

All content is JSON-based for easy editing without code changes.

### Adding Products

Edit `content/products.json`:
```json
{
  "id": "prod-013",
  "slug": "new-product",
  "title": "New Product",
  "description": "Description here",
  "price": { "amount": 99.99, "currency": "USD" },
  "media": [...],
  "category": "electronics",
  "tags": ["new", "featured"],
  "stock": 100
}
```

### Adding CMS Pages

Edit `content/pages.json`:
```json
{
  "slug": "new-page",
  "title": "New Page",
  "layout": "grid",
  "blocks": [
    {
      "id": "hero-1",
      "type": "hero",
      "title": "Welcome",
      "subtitle": "Subtitle here"
    }
  ]
}
```

### Supported Layouts
- `grid` - Responsive grid layout
- `masonry` - Pinterest-style masonry
- `spotlight` - Hero-focused layout
- `magazine` - Editorial magazine style
- `story` - Narrative storytelling
- `landing` - High-conversion landing page

### Supported Blocks
- `hero` - Hero section with image/CTA
- `feature-grid` - Feature highlights
- `product-carousel` - Scrolling products
- `rich-text` - HTML content
- `cta` - Call-to-action section
- `testimonial` - Customer reviews
- `chart` - Data visualization
- `image` - Image block

## Production Deployment

### Build
```bash
pnpm build
```

### Environment Variables (Production)
Ensure these are set in your hosting platform:
- `AI_PROVIDER` - "openai" or "anthropic"
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`
- `NEXT_PUBLIC_APP_URL` - Your production URL

### Recommended Platforms
- **Vercel**: Zero-config deployment
- **Netlify**: Edge functions support
- **AWS Amplify**: Scalable infrastructure
- **Railway**: Simple container deployment

## Accessibility

- **Semantic HTML**: Proper heading hierarchy
- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Focus Management**: Radix UI components with built-in focus trapping
- **Color Contrast**: WCAG AA compliant (can be verified via Design Agent)
- **Screen Readers**: ARIA labels and announcements

## Performance

- **Lighthouse Target**: 95+ score
- **Server Components**: RSC-first architecture
- **Code Splitting**: Dynamic imports for heavy components
- **Image Optimization**: Next.js Image component
- **Caching**: Content caching with 1-minute TTL

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (last 2 versions)
- **Voice Features**: Chrome, Edge, Safari (Speech Recognition API)
- **Fallbacks**: Keyboard input for browsers without voice support

## Troubleshooting

### "Missing API key" error
Ensure `.env.local` has the correct `AI_PROVIDER` and corresponding API key.

### Design tokens not updating
Run `pnpm sync:tokens` manually, then restart the dev server.

### Voice not working
Check browser support and HTTPS requirement (localhost is exempt).

### Build errors
1. Run `pnpm type-check` to identify TypeScript issues
2. Clear `.next` folder: `rm -rf .next`
3. Reinstall dependencies: `pnpm install`

## Contributing

This is a demonstration project. Feel free to fork and customize for your needs.

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- Check the code comments in `lib/` for implementation details
- Review seed data in `content/` for examples
- Inspect `components/` for UI patterns

---

**Built with Next.js 15 + AI** • [View on GitHub](#)
