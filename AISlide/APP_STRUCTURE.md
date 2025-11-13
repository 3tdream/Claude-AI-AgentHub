# App Structure - Routes, Pages & Components

## Project Overview
This is a **Next.js 15** application with TypeScript using Tailwind CSS and shadcn/ui components. It's a real-time slideshow AI application powered by OpenAI's Realtime API with WebRTC for voice interaction.

---

## 1. ROUTING & PAGES

### App Directory Structure
```
app/
├── layout.tsx          (Root layout with Header, Analytics, Toaster)
├── page.tsx           (Main page component)
├── api/
│   └── session/
│       └── route.ts   (POST endpoint for OpenAI session creation)
└── globals.css
```

### Routes Overview

#### **Main Route: `/` (Root Page)**
- **File**: `/Users/avi/dev/avio/sb-projects/sb-realtime-slideshow-ai/app/page.tsx`
- **Purpose**: Entry point of the application
- **Features**:
  - Initializes WebRTC audio session using custom hook
  - Conditionally renders Desktop or Mobile layout based on screen size
  - Manages agent configuration state with localStorage persistence
  - Registers tool functions for slide manipulation
  - Uses hooks: `useWebRTCAudioSession`, `useToolsFunctions`, `useIsMobile`

---

## 2. API ENDPOINTS

### `/api/session` - POST
- **File**: `/Users/avi/dev/avio/sb-projects/sb-realtime-slideshow-ai/app/api/session/route.ts`
- **Method**: POST
- **Purpose**: Creates a new OpenAI Realtime API session
- **Request**: Empty body (uses openAIConfig from server)
- **Response**: JSON with session data from OpenAI
- **Error Handling**: Returns 500 if OPENAI_API_KEY is not set or API fails
- **Implementation**: 
  - Fetches from `https://api.openai.com/v1/realtime/sessions`
  - Uses Bearer token authentication
  - Sends `openAIConfig` as request body

---

## 3. MAIN LAYOUTS

### Desktop Layout
- **File**: `/Users/avi/dev/avio/sb-projects/sb-realtime-slideshow-ai/components/layouts/DesktopLayout.tsx`
- **Props**: `DesktopLayoutProps` with status, session state, callbacks, conversation history, audio/data refs, agentConfig
- **Layout**: 3-column grid (2:1 ratio)
  - **Left (2 cols)**: SecuritySlides component
  - **Right (1 col)**: 
    - Avatar info with edit dialog (top)
    - Conversation section (middle) - only when session active
    - Status and broadcast button (bottom)
- **Features**: Framer Motion animations, language-aware RTL support, responsive spacing

### Mobile Layout
- **File**: `/Users/avi/dev/avio/sb-projects/sb-realtime-slideshow-ai/components/layouts/MobileLayout.tsx`
- **Props**: `MobileLayoutProps` (subset of Desktop - no conversation display)
- **Layout**: Single column with fixed bottom control panel
  - Language toggle and mute button (top)
  - Status display
  - Avatar info and broadcast button (sticky bottom)
  - Safe area padding for mobile devices
- **Features**: Backdrop blur on control panel, touch-friendly sizing

---

## 4. CORE COMPONENTS

### SecuritySlides
- **File**: `/Users/avi/dev/avio/sb-projects/sb-realtime-slideshow-ai/components/security-slides.tsx`
- **Purpose**: Main slideshow component
- **Features**:
  - 3 slides (Welcome, Capabilities, Getting Started)
  - Multi-language support (English, Hebrew)
  - RTL support for Hebrew
  - Slide blocks with icons from @heroicons/react
  - Navigation buttons with disable logic
  - Slide indicators (desktop only)
  - Language toggle button
  - LocalStorage persistence for slide state
  - Uses Zustand for state management
- **Data Source**: 
  - Default slides from translations
  - Can load from localStorage if available
  - Slide structure: Title, Description, 3 Blocks (each with ID, title, content)

### BroadcastButton
- **File**: `/Users/avi/dev/avio/sb-projects/sb-realtime-slideshow-ai/components/broadcast-button.tsx`
- **Purpose**: Start/stop session and send text messages
- **States**:
  - Inactive: Shows start button
  - Active (Desktop): Input field + send button + stop button
  - Active (Mobile): Stop button (full width)
- **Features**:
  - RTCDataChannel communication
  - Text input with Enter key support
  - DataChannel readiness detection
  - Loading state with spinner
  - Language-aware placeholder text
  - Sends user messages and triggers response via WebRTC

### AvatarInfo
- **File**: `/Users/avi/dev/avio/sb-projects/sb-realtime-slideshow-ai/components/avatar-info.tsx`
- **Purpose**: Display AI agent info and allow configuration editing
- **Features**:
  - Avatar image display (128x128px)
  - Agent name and role
  - Edit dialog with form fields:
    - Name (text input)
    - Role (text input)
    - System Prompt (textarea)
  - localStorage persistence
  - Can be hidden during active session
  - Default config: Jacqueline Kovalenko, ai buddy
- **Export**: `AgentConfig` interface for typing

### MessageControls
- **File**: `/Users/avi/dev/avio/sb-projects/sb-realtime-slideshow-ai/components/message-controls.tsx`
- **Purpose**: Display and manage conversation messages
- **Props**: Receives conversation array

### MuteButton
- **File**: `/Users/avi/dev/avio/sb-projects/sb-realtime-slideshow-ai/components/mute-button.tsx`
- **Purpose**: Toggle audio stream mute state
- **Props**: MediaStream reference

### WandButton
- **File**: `/Users/avi/dev/avio/sb-projects/sb-realtime-slideshow-ai/components/wand-button.tsx`
- **Purpose**: Trigger special AI interactions via data channel

### StatusDisplay
- **File**: `/Users/avi/dev/avio/sb-projects/sb-realtime-slideshow-ai/components/status.tsx`
- **Purpose**: Show current session status

### Header
- **File**: `/Users/avi/dev/avio/sb-projects/sb-realtime-slideshow-ai/components/header.tsx`
- **Purpose**: Top navigation/branding (used in root layout)

### TokenUsage
- **File**: `/Users/avi/dev/avio/sb-projects/sb-realtime-slideshow-ai/components/token-usage.tsx`
- **Purpose**: Display API token usage metrics

### Welcome
- **File**: `/Users/avi/dev/avio/sb-projects/sb-realtime-slideshow-ai/components/welcome.tsx`
- **Purpose**: Welcome message component

### ToolsEducation
- **File**: `/Users/avi/dev/avio/sb-projects/sb-realtime-slideshow-ai/components/tools-education.tsx`
- **Purpose**: Educational content about available tools

---

## 5. UI COMPONENTS (shadcn/ui)

All located in `/components/ui/`:

| Component | File | Purpose |
|-----------|------|---------|
| Accordion | accordion.tsx | Collapsible sections |
| Alert Dialog | alert-dialog.tsx | Confirmation dialogs |
| Alert | alert.tsx | Alert messages |
| Avatar | avatar.tsx | User/agent avatar display |
| Badge | badge.tsx | Status badges |
| Breadcrumb | breadcrumb.tsx | Navigation breadcrumbs |
| Button | button.tsx | Button component with variants |
| Card | card.tsx | Card containers |
| Collapsible | collapsible.tsx | Expandable sections |
| Confetti | confetti.tsx | Celebration confetti effect |
| Dialog | dialog.tsx | Modal dialogs |
| Input | input.tsx | Text input field |
| Label | label.tsx | Form labels |
| Pagination | pagination.tsx | Pagination controls |
| Scroll Area | scroll-area.tsx | Scrollable container |
| Select | select.tsx | Dropdown select |
| Sheet | sheet.tsx | Slide-in panel |
| Skeleton | skeleton.tsx | Loading skeleton |
| Sonner | sonner.tsx | Toast notifications |
| Table | table.tsx | Data table |
| Textarea | textarea.tsx | Multi-line text input |
| Three Dots Wave | three-dots-wave.tsx | Loading animation |
| Transcriber | transcriber.tsx | Audio transcription display |

---

## 6. HOOKS (State Management)

### useWebRTCAudioSession
- **File**: `/Users/avi/dev/avio/sb-projects/sb-realtime-slideshow-ai/hooks/use-webrtc.ts`
- **Purpose**: Manages WebRTC connection and OpenAI Realtime API integration
- **Returns**:
  - `status`: Current session status string
  - `isSessionActive`: Boolean for session state
  - `registerFunction`: Register tool functions
  - `handleStartStopClick`: Toggle session
  - `conversation`: Array of messages
  - `audioStreamRef`: MediaStream reference
  - `dataChannelRef`: RTCDataChannel reference

### useSlideStore
- **File**: `/Users/avi/dev/avio/sb-projects/sb-realtime-slideshow-ai/hooks/use-slides-store.ts`
- **Purpose**: Zustand store for slide state management
- **State**:
  - `currentSlide`: Current slide index
  - `totalSlides`: Total number of slides
  - `slides`: Array of slide objects
- **Actions**:
  - `nextSlide()`: Move to next slide
  - `prevSlide()`: Move to previous slide
  - `setTotalSlides(total)`: Set total slides
  - `setSlides(slides)`: Set slides and save to storage
  - `getCurrentSlideContent()`: Get current slide object
  - `updateCurrentSlideTitle(title)`: Update slide title
  - `updateCurrentSlideDescription(description)`: Update slide description
  - `updateSlideBlock(blockId, updates)`: Update specific block in slide
- **Storage**: LocalStorage with key pattern `slides_{language}`
- **Exports**: Helper functions `loadSlidesFromStorage()`, `saveSlidesToStorage()`

### useLanguageStore
- **File**: `/Users/avi/dev/avio/sb-projects/sb-realtime-slideshow-ai/hooks/use-language-store.ts`
- **Purpose**: Zustand store for language selection
- **State**:
  - `language`: Current language ('en' or 'he')
- **Actions**:
  - `setLanguage(language)`: Change language
- **Default**: 'en' (English)

### useToolsFunctions
- **File**: `/Users/avi/dev/avio/sb-projects/sb-realtime-slideshow-ai/hooks/use-tools.ts`
- **Purpose**: Provides tool function implementations for AI to call
- **Returned Functions**:
  - `getCurrentSlideFunction()`: Returns current slide content
  - `nextSlideFunction()`: Move to next slide
  - `prevSlideFunction()`: Move to previous slide
  - `timeFunction()`: Get current time and timezone
  - `updateCurrentSlideTitleFunction(title)`: Update slide title
  - `updateCurrentSlideDescriptionFunction(description)`: Update slide description
  - `updateSlideBlockFunction(blockId, title?, content?)`: Update block content
- **Features**: Toast notifications for user feedback, error handling

### useToolsFunctions (Legacy naming in page.tsx)
Maps functions to tool names for WebRTC registration:
- `getCurrentSlide` -> `getCurrentSlideFunction`
- `nextSlide` -> `nextSlideFunction`
- `prevSlide` -> `prevSlideFunction`
- `getCurrentTime` -> `timeFunction`
- `updateCurrentSlideTitle` -> `updateCurrentSlideTitleFunction`
- `updateCurrentSlideDescription` -> `updateCurrentSlideDescriptionFunction`
- `updateSlideBlock` -> `updateSlideBlockFunction`

### useIsMobile
- **File**: `/Users/avi/dev/avio/sb-projects/sb-realtime-slideshow-ai/hooks/use-mobile.tsx`
- **Purpose**: Detect if device is mobile (breakpoint: 768px)
- **Returns**: Boolean

### useMicrophone
- **File**: `/Users/avi/dev/avio/sb-projects/sb-realtime-slideshow-ai/hooks/use-microphone.ts`
- **Purpose**: Handle microphone access (legacy/unused)

---

## 7. LIBRARY & UTILITIES

### tools.ts
- **File**: `/Users/avi/dev/avio/sb-projects/sb-realtime-slideshow-ai/lib/tools.ts`
- **Purpose**: Define OpenAI tool schemas
- **Tools Defined**:
  1. `getCurrentSlide`: Get current slide content
  2. `updateCurrentSlideTitle`: Update slide title
  3. `updateCurrentSlideDescription`: Update slide description
  4. `updateSlideBlock`: Update block in slide
  5. `nextSlide`: Move to next slide
  6. `prevSlide`: Move to previous slide
  7. `getCurrentTime`: Get current time

### translations.ts
- **File**: `/Users/avi/dev/avio/sb-projects/sb-realtime-slideshow-ai/lib/translations.ts`
- **Purpose**: Multi-language support (English, Hebrew)
- **Supported Languages**: 'en' (English), 'he' (Hebrew)
- **Structure**: Nested object with keys for:
  - Slide content (welcome, capabilities, getting started)
  - Navigation labels
  - Button text
  - Input placeholders
  - Section titles
- **Export**: `Language` type and `translations` object

### conversations.ts
- **File**: `/Users/avi/dev/avio/sb-projects/sb-realtime-slideshow-ai/lib/conversations.ts`
- **Purpose**: Type definitions for conversation messages

### utils.ts
- **File**: `/Users/avi/dev/avio/sb-projects/sb-realtime-slideshow-ai/lib/utils.ts`
- **Purpose**: Utility functions (likely contains `cn()` for classname merging)

---

## 8. CONFIGURATION

### openai.ts
- **File**: `/Users/avi/dev/avio/sb-projects/sb-realtime-slideshow-ai/config/openai.ts`
- **Exports**:
  - `systemPrompt`: Full AI system prompt (Pixel character - friendly AI buddy for kids)
  - `openAIConfig`: Configuration object with:
    - `model`: "gpt-4o-realtime-preview-2024-12-17"
    - `voice`: "shimmer"
    - `modalities`: ["audio", "text"]
    - `instructions`: systemPrompt
    - `tools`: Array of tool definitions
- **Personality**: Pixel - Friendly, multilingual AI helper for teaching kids about tech/AI

### site.ts
- **File**: `/Users/avi/dev/avio/sb-projects/sb-realtime-slideshow-ai/config/site.ts`
- **Purpose**: Site-wide configuration constants

---

## 9. DATA STRUCTURES & TYPES

### Slide
```typescript
interface Slide {
  title: string
  description: string
  blocks: SlideBlock[]
}
```

### SlideBlock
```typescript
interface SlideBlock {
  id: string
  title: string
  content: string
}
```

### AgentConfig
```typescript
interface AgentConfig {
  name: string
  role: string
  prompt: string
}
```

### Conversation
```typescript
// Type defined in conversations.ts
type Conversation = Array<{
  id: number | string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: Date
}>
```

### Tool
```typescript
interface Tool {
  type: 'function'
  name: string
  description: string
  parameters?: {
    type: string
    properties: Record<string, {
      type: string
      description: string
    }>
  }
}
```

---

## 10. KEY FEATURES & FLOWS

### Session Management Flow
1. User clicks "Start" button
2. `handleStartStopClick()` called via BroadcastButton
3. Calls `/api/session` POST endpoint to get OpenAI session
4. Establishes WebRTC connection with data channel
5. Registers tool functions via `registerFunction()`
6. Conversation displayed in message area
7. User can send text or speak via microphone

### Slide Manipulation Flow
1. AI calls tool function (e.g., `updateSlideBlock`)
2. Tool function implementation in `useToolsFunctions` executes
3. Zustand store updates slide state
4. LocalStorage automatically persists changes
5. SecuritySlides component re-renders with new content
6. Toast notification shows action confirmation

### Language Switching Flow
1. User clicks language toggle button
2. `useLanguageStore.setLanguage()` called
3. All text updates via `translations[language]`
4. LocalStorage key for slides changes (language-specific)
5. RTL/LTR direction applied to components

---

## 11. STYLING APPROACH

- **Framework**: Tailwind CSS with custom variants
- **Components**: shadcn/ui components (Radix UI + Tailwind)
- **Icons**: 
  - Lucide React (for button icons like Loader2, Square)
  - @heroicons/react (for larger icons in slides)
- **Animations**: Framer Motion for layout transitions
- **Fonts**: Google Fonts (Raleway for sans-serif)
- **No Gradients**: Follows project guidelines

---

## 12. STATE MANAGEMENT SUMMARY

- **Zustand stores**: useSlideStore, useLanguageStore
- **React Context**: None currently (could be added for theme/global state)
- **LocalStorage**: 
  - `agentConfig`: Agent configuration
  - `slides_{language}`: Language-specific slides
- **Refs**: 
  - `audioStreamRef`: MediaStream
  - `dataChannelRef`: RTCDataChannel

---

## 13. ENVIRONMENT VARIABLES

Required in `.env` or `.env.local`:
- `OPENAI_API_KEY`: OpenAI API key for Realtime API access

---

## 14. RESPONSIVE DESIGN

- **Mobile Breakpoint**: 768px (md in Tailwind)
- **Desktop**: 3-column layout with conversation panel
- **Mobile**: Single column with sticky bottom controls
- **Safe Area**: Respects mobile safe areas (notches, etc.)

---

## 15. KEY DEPENDENCIES

- `next`: 15.1.1
- `react`: 18.2.0
- `zustand`: 5.0.3
- `framer-motion`: 11.15.0
- `tailwindcss`: 3.4.1
- `@radix-ui/*`: Various UI components
- `lucide-react`: 0.468.0
- `@heroicons/react`: 2.2.0
- `sonner`: 1.7.1 (Toast notifications)
- `ws`: 8.18.0 (WebSocket for realtime API)

