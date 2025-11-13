# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Real-time AI presentation system using OpenAI's Realtime API with WebRTC for voice-controlled slideshows. Next.js 15.1.1 app with TypeScript, Tailwind CSS, shadcn/ui components, and multi-language support (English, Hebrew, Arabic).

**Key Features**: Voice-controlled presentations, real-time slide updates via AI, multi-language with RTL support, responsive mobile/desktop layouts, developer portal with docs/analytics.

## Development Commands

```bash
# Start development server (typically already running)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type checking (implicit during build)
npx tsc --noEmit
```

**Important**: Always check if the dev server is running before suggesting `npm run dev`. Use Chrome DevTools MCP (`mcp__chrome-devtools__list_pages`, `mcp__chrome-devtools__navigate_page`) to verify localhost:3000 is active.

## Architecture Overview

### WebRTC Real-time Communication
- **Core Hook**: `hooks/use-webrtc.ts` - Manages OpenAI Realtime API connection via WebRTC
- **Session Flow**:
  1. Request mic access → Get ephemeral token from `/api/session` → Establish RTCPeerConnection
  2. Create data channel for transcripts/events → Add local audio track → Exchange SDP offer/answer
  3. Handle incoming events (transcriptions, function calls, audio streams) via data channel
- **Key Concepts**:
  - Ephemeral user messages: Track partial transcriptions while user speaks (using `ephemeralUserMessageIdRef`)
  - Function registry: AI can call registered tools (getCurrentSlide, updateSlideTitle, etc.)
  - Volume analysis: Monitor assistant audio for visual feedback
  - Message validation: Ensure all incoming WebRTC messages have required fields

### State Management (Zustand)
- **Slides Store** (`hooks/use-slides-store.ts`):
  - Manages current slide index, slide content, navigation
  - Language-specific localStorage persistence (`slides_en`, `slides_he`, `slides_ar`)
  - Actions: `nextSlide()`, `prevSlide()`, `updateCurrentSlideTitle()`, `updateSlideBlock()`
  - Automatically syncs to localStorage on every update

- **Language Store** (`hooks/use-language-store.ts`):
  - Simple language switcher (en/he/ar)
  - Triggers slide reload from language-specific localStorage

### Data Flow & Persistence
1. **Source of Truth**: Static translations in `/lib/translations.ts` (default slides)
2. **Runtime State**: Zustand stores hold current session state
3. **Persistence**: localStorage with language-specific keys
4. **Loading Priority**: localStorage → fallback to default translations
5. **AI Updates**: Via tool functions → Zustand actions → localStorage sync

### Tool System
- **Definition**: `/lib/tools.ts` - OpenAI function calling schema
- **Implementation**: `hooks/use-tools.ts` - Actual function implementations
- **Registration**: Main app registers all tools with WebRTC hook on mount
- **Available Tools**:
  - `getCurrentSlide`: Returns current slide content
  - `nextSlide`/`prevSlide`: Navigate slides
  - `updateCurrentSlideTitle`: Update slide title
  - `updateCurrentSlideDescription`: Update slide description
  - `updateSlideBlock`: Update specific content block by ID
  - `getCurrentTime`: Get current time/timezone

### Responsive Layout Strategy
- **Detection**: `hooks/use-mobile.tsx` - Custom hook using `matchMedia`
- **Layouts**:
  - `components/layouts/DesktopLayout.tsx` - Full feature layout with conversation panel
  - `components/layouts/MobileLayout.tsx` - Simplified mobile-optimized layout
- **Dynamic Switching**: Main `app/page.tsx` conditionally renders based on `useIsMobile()`

### Multi-language & RTL Support
- **Translations**: Static content in `/lib/translations.ts` with nested structure
- **RTL**: Hebrew automatically triggers `dir="rtl"` on HTML elements
- **Storage Isolation**: Each language has separate localStorage key to prevent cross-contamination
- **Language Switch**: Triggers slide reload from appropriate storage key

### API Routes
- **`/api/session` (POST)**: Generates ephemeral token for OpenAI Realtime API
  - Validates `OPENAI_API_KEY` environment variable
  - Forwards config from `config/openai.ts` to OpenAI sessions endpoint
  - Returns ephemeral token used for WebRTC authentication

## Component Architecture

### Conversation Management
- **Type**: `lib/conversations.ts` defines `Conversation` interface
- **States**: `speaking`, `processing`, `final`
- **Ephemeral Messages**: Temporary messages updated during speech recognition
- **Final Messages**: Committed after transcription completion

### Slide Structure
```typescript
interface Slide {
  title: string
  description: string
  blocks: SlideBlock[] // Array of content blocks with id/title/content
}
```

Each slide has multiple blocks for granular AI updates.

## Key Technical Patterns

### 1. Hydration Safety
- All client-side state (localStorage) wrapped in `typeof window !== 'undefined'` checks
- `suppressHydrationWarning` on root elements that use client state
- Proper SSR/CSR boundaries with `"use client"` directives

### 2. Message ID Generation
- Use `uuid.v4()` for unique IDs, not timestamps
- Prevents duplicate React keys during rapid message additions

### 3. Audio Stream Handling
- Inbound track (assistant TTS) attached to dynamically created `<audio>` element
- Outbound track (user mic) added directly to peer connection
- Volume analysis via AudioContext AnalyserNode

### 4. Function Call Response Pattern
```typescript
// AI calls function → Execute → Send result back
const result = await functionRegistry.current[name](args);
dataChannel.send(JSON.stringify({
  type: "conversation.item.create",
  item: { type: "function_call_output", call_id, output: JSON.stringify(result) }
}));
dataChannel.send(JSON.stringify({ type: "response.create" }));
```

### 5. Environment Variables
- **Required**: `OPENAI_API_KEY` - Must have Realtime API access
- Used only server-side in `/api/session` route

## Development Practices

### Testing New Features
1. **Verify page loads**: Navigate and check console for errors
2. **Check API endpoints**: Test new/modified endpoints independently
3. **Test responsive**: Check mobile viewport (375px, 768px, 1024px breakpoints)
4. **Use Chrome DevTools MCP**: List console messages, take screenshots
5. **Language switching**: Verify all languages work with new features

### Styling Guidelines
- **Always use**: Tailwind CSS utility classes, shadcn/ui components
- **Icons**: Lucide React (already imported and used throughout)
- **Fonts**: Google Fonts (Raleway is primary font)
- **Avoid**: Gradients, custom CSS files, inline styles, custom font files
- **RTL Support**: Use logical properties (`start`/`end` instead of `left`/`right`)

### Common Pitfalls
- **Don't**: Suggest running `npm run dev` unless confirmed app is not running
- **Don't**: Create new markdown files without checking for existing docs
- **Don't**: Commit code without user approval
- **Do**: Check Chrome DevTools MCP to see if localhost:3000 is active
- **Do**: Update existing documentation files rather than creating duplicates
- **Do**: Test language switching after modifying translation-dependent features

## Project Structure

```
/app
  /api/session          # Ephemeral token generation
  /dev-portal          # Developer documentation/tools
    /docs              # Architecture documentation
    /diagrams          # System diagrams (React Flow)
  page.tsx             # Main app (conditional mobile/desktop layout)
  layout.tsx           # Root layout with Header
/components
  /layouts             # DesktopLayout, MobileLayout
  /ui                  # shadcn/ui components
  header.tsx           # Top navigation with language switcher
/hooks
  use-webrtc.ts        # Core WebRTC session management
  use-slides-store.ts  # Slide state + localStorage persistence
  use-language-store.ts # Language switching
  use-tools.ts         # AI tool implementations
  use-mobile.tsx       # Mobile detection
/lib
  tools.ts             # OpenAI function definitions
  translations.ts      # Multi-language content
  conversations.ts     # Conversation type definitions
/config
  openai.ts            # OpenAI API config + system prompt
/public
  /avatars             # AI avatar images
  /diagrams            # Static diagram assets
```

## Debugging Tips

### WebRTC Issues
- Check browser console for SDP errors or connection failures
- Verify `OPENAI_API_KEY` is set and has Realtime API access
- Ensure HTTPS (mic access requires secure context)
- Test with Chrome/Edge (best WebRTC support)

### Hydration Errors
- Look for mismatches between SSR and CSR (localStorage usage)
- Check for browser extensions interfering (Grammarly is known culprit)
- Clear localStorage and restart dev server
- Verify `suppressHydrationWarning` on affected elements

### Slide Persistence Issues
- Check language-specific localStorage key (`slides_en`, `slides_he`, `slides_ar`)
- Verify `saveSlidesToStorage()` is called after each update
- Test language switching to ensure slides don't cross-contaminate
- Use browser DevTools → Application → Local Storage to inspect stored data

### AI Tool Call Failures
- Verify function is registered in main app's `useEffect`
- Check tool definition in `/lib/tools.ts` matches implementation signature
- Ensure function returns proper `{success, message, ...}` structure
- Monitor data channel messages for function call events in console

## AI Assistant Configuration

The system prompt (in `config/openai.ts`) defines the AI personality as "Pixel" - a friendly, child-focused teaching assistant. When modifying AI behavior, update the `systemPrompt` string. The AI has access to all tools defined in `/lib/tools.ts` and can call them during conversations.

## Deployment

Designed for Vercel deployment:
1. Push to GitHub
2. Import in Vercel dashboard
3. Add environment variable: `OPENAI_API_KEY`
4. Deploy

Supports Docker deployment (see README.md for Dockerfile).
