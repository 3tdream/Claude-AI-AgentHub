/**
 * Documentation Metadata
 *
 * Provides searchable metadata for each documentation section to enable
 * AI-powered search and navigation.
 */

export interface DocSection {
  id: string
  label: string
  description: string
  keywords: string[]
  content: string // Short summary for AI context
}

export const docsMetadata: DocSection[] = [
  {
    id: 'overview',
    label: 'Overview',
    description: 'Introduction to the project, quick start guide, key features, and technology stack',
    keywords: [
      'overview', 'introduction', 'what is', 'about', 'quick start', 'getting started',
      'features', 'key features', 'tech stack', 'technology', 'openai', 'realtime api',
      'webrtc', 'voice', 'slides', 'presentation', 'ai assistant', 'multilingual'
    ],
    content: 'Real-time AI slideshow application using OpenAI Realtime API with WebRTC. Features voice interaction, dynamic slides, multilingual support (English/Hebrew), responsive design, and state persistence.'
  },
  {
    id: 'architecture',
    label: 'Architecture',
    description: 'System architecture, project structure, component hierarchy, data flow, and state management patterns',
    keywords: [
      'architecture', 'structure', 'project structure', 'folders', 'organization',
      'components', 'hierarchy', 'data flow', 'state', 'zustand', 'how it works',
      'system design', 'flow', 'pattern', 'app router', 'next.js structure'
    ],
    content: 'Modern client-server architecture with Next.js App Router. Uses Zustand for state management with localStorage persistence. WebRTC for real-time communication. Component-based structure with layouts, hooks, and API routes.'
  },
  {
    id: 'claude-agents',
    label: 'Claude Agents',
    description: 'Claude Code agent architecture, agent hierarchy, and specialized sub-agents',
    keywords: [
      'claude', 'agents', 'ai', 'claude code', 'sub-agents', 'automation',
      'qa', 'testing', 'ui/ux', 'design', 'assets', 'workspace', 'hierarchy',
      'specialized', 'task', 'nextjs-qa-tester', 'ui-ux-guru', 'design-asset-generator'
    ],
    content: 'Hierarchical agent system with CLAUDE.md for global instructions and specialized sub-agents for QA testing, UI/UX design, asset generation, and workspace management.'
  },
  {
    id: 'components',
    label: 'Components',
    description: 'React component documentation including SecuritySlides, BroadcastButton, layouts, and UI components',
    keywords: [
      'components', 'react', 'ui', 'security slides', 'broadcast button', 'layout',
      'mobile', 'desktop', 'avatar', 'mute', 'status', 'slides', 'navigation',
      'responsive', 'broadcast', 'controls', 'button', 'display'
    ],
    content: 'Main components include SecuritySlides for presentations, BroadcastButton for session control, MobileLayout/DesktopLayout for responsive design, AvatarInfo, MuteButton, and StatusDisplay for UI feedback.'
  },
  {
    id: 'hooks',
    label: 'Hooks',
    description: 'Custom React hooks including useSlideStore, useLanguageStore, useWebRTC, and useIsMobile',
    keywords: [
      'hooks', 'custom hooks', 'react hooks', 'use', 'slide store', 'language',
      'webrtc', 'mobile', 'zustand', 'state management', 'persistence',
      'localStorage', 'detection', 'store', 'useSlideStore', 'useLanguageStore',
      'useWebRTC', 'useIsMobile', 'how hooks work', 'hook usage'
    ],
    content: 'Custom hooks for state management (useSlideStore for slides, useLanguageStore for i18n), WebRTC session management (useWebRTC), and mobile detection (useIsMobile).'
  },
  {
    id: 'api-routes',
    label: 'API Routes',
    description: 'Next.js API routes including session creation endpoint and AI tools configuration',
    keywords: [
      'api', 'routes', 'endpoints', 'session', 'openai', 'ephemeral token',
      'tools', 'function calling', 'backend', 'server', 'next.js api',
      '/api/session', 'realtime', 'authentication', 'configuration'
    ],
    content: 'POST /api/session endpoint creates OpenAI Realtime API sessions and returns ephemeral tokens for WebRTC authentication. Includes AI tools configuration for slide manipulation.'
  },
  {
    id: 'configuration',
    label: 'Configuration',
    description: 'Environment variables, OpenAI configuration, and site settings',
    keywords: [
      'configuration', 'config', 'environment', 'env', 'variables', 'openai',
      'api key', 'settings', 'setup', 'system prompt', 'voice', 'model',
      'instructions', '.env', 'environment variables', 'api key'
    ],
    content: 'Requires OPENAI_API_KEY environment variable. OpenAI configuration in config/openai.ts includes model selection, voice settings, system prompt (Pixel AI personality), and tool definitions.'
  },
  {
    id: 'local-development',
    label: 'Local Development',
    description: 'Prerequisites, setup steps, development scripts, and troubleshooting',
    keywords: [
      'development', 'local', 'setup', 'install', 'run', 'dev server',
      'prerequisites', 'node', 'npm', 'start', 'troubleshooting', 'errors',
      'hydration', 'microphone', 'hot reload', 'npm run dev', 'port 3000'
    ],
    content: 'Requires Node.js 18.17+, OpenAI API key with Realtime access. Setup: npm install, configure .env.local, npm run dev. Runs on port 3000. Common issues: hydration errors, API key access, microphone permissions.'
  },
  {
    id: 'deployment',
    label: 'Deployment',
    description: 'Production deployment guide for Vercel, Docker, and self-hosted options',
    keywords: [
      'deployment', 'deploy', 'production', 'vercel', 'docker', 'hosting',
      'build', 'publish', 'launch', 'go live', 'self-hosted', 'vps',
      'cloud', 'https', 'ssl', 'domain', 'environment'
    ],
    content: 'Recommended: Vercel deployment with automatic HTTPS and serverless functions. Also supports Docker and self-hosted VPS deployment. Requires OpenAI API key in production environment.'
  },
  {
    id: 'introduction',
    label: 'Handpan Introduction & Posture',
    description: 'Introduction to handpan/pantam, proper sitting position, hand placement, and mindful preparation',
    keywords: [
      'handpan', 'pantam', 'introduction', 'beginner', 'getting started', 'posture',
      'sitting position', 'holding', 'hand position', 'hand placement', 'setup',
      'basics', 'first lesson', 'how to hold', 'proper position', 'mindfulness',
      'preparation', 'ding', 'tone fields', 'what is handpan', 'welcome'
    ],
    content: 'Introduction to handpan (pantam) - a beautiful acoustic percussion instrument creating meditative sounds. Learn proper sitting posture, hand positioning basics, and mindful preparation. The handpan has a central note (ding) surrounded by tone fields, all pre-tuned to harmonious scales.'
  },
  {
    id: 'hand-techniques',
    label: 'Basic Hand Techniques',
    description: 'Index finger strike, three-finger technique, thumb technique, touch pressure, and first week practice routine',
    keywords: [
      'hand techniques', 'finger technique', 'index finger', 'strike', 'striking',
      'three finger', 'thumb', 'ding technique', 'touch pressure', 'dynamics',
      'how to play', 'hand movements', 'practice routine', 'beginner practice',
      'finger strike', 'playing technique', 'touch', 'pressure', 'gentle', 'soft touch',
      'first week', 'daily practice', 'muscle memory'
    ],
    content: 'Master fundamental hand techniques: index finger strike (primary technique), three-finger strike for fuller tones, thumb technique for the ding. Learn proper touch pressure (never strike hard), understand dynamics, and follow a structured first week practice routine. Focus on gentle bouncing motion and letting notes ring out fully.'
  },
  {
    id: 'scale-rhythm',
    label: 'Scales & First Rhythms',
    description: 'Understanding handpan scales (D Kurd, D Minor), note layout, spatial awareness, and first rhythm patterns',
    keywords: [
      'scales', 'handpan scales', 'd kurd', 'd minor', 'celtic minor', 'integral',
      'c major', 'notes', 'note layout', 'rhythm', 'patterns', 'rhythm patterns',
      'first rhythm', 'beats', 'tempo', 'spatial awareness', 'blindfolded playing',
      'circular pattern', 'scale exercise', 'variations', 'timing', 'count',
      'ding side pattern', 'practice patterns', 'ghost notes preview'
    ],
    content: 'Learn about handpan scales including D Kurd (most popular for beginners), D Minor, Integral, and C Major. All notes are pre-tuned harmoniously. Practice spatial awareness with blindfolded exercises. Master your first rhythm pattern: Ding-Side-Ding-Side (4-beat pattern). Create variations with double notes, pauses, and circular scale exercises to build finger independence.'
  },
  {
    id: 'breathing-flow',
    label: 'Breathing, Flow & Expression',
    description: 'Connecting breath to sound, musical phrasing, dynamic expression, flow state, silence, and meditation',
    keywords: [
      'breathing', 'breath', 'breath control', 'flow', 'flow state', 'expression',
      'dynamics', 'phrasing', 'musical phrases', 'silence', 'meditation', 'mindfulness',
      'crescendo', 'diminuendo', 'accent', 'emotion', 'feeling', 'presence',
      'intuition', 'spontaneous', 'meditative playing', 'contemplative',
      'inhale exhale', 'pause', 'quiet mind', 'effortless'
    ],
    content: 'Connect your breathing to playing for natural musical flow. Learn to create musical phrases (2-8 beats with beginning, middle, end). Master dynamic expression (crescendo, diminuendo, accents) to convey emotion. Enter flow state through mindful practice. Understand the power of silence in music. Practice musical meditation combining mindfulness with improvisation.'
  },
  {
    id: 'first-melody',
    label: 'Creating Your First Melody',
    description: 'Melody fundamentals, building 3-5 note melodies, adding rhythm, composition structure, improvisation',
    keywords: [
      'melody', 'melodies', 'creating melody', 'first melody', 'composition',
      'composing', 'song', 'piece', 'music creation', '3 note melody', '4 note melody',
      '5 note melody', 'melodic pattern', 'contour', 'range', 'repetition', 'resolution',
      'home note', 'structure', 'theme', 'improvisation', 'improvise', 'recording',
      'self reflection', 'practice recording', 'journaling', 'next steps'
    ],
    content: 'Learn what makes a melody: contour, range, repetition, and resolution to the home note (ding). Build simple 3-note melodies and expand to 4-5 notes. Combine melodic skills with rhythm. Create complete 2-3 minute compositions with intro, theme A, theme B, and conclusion. Understand improvisation vs composition. Record yourself for self-reflection and progress tracking.'
  },
  {
    id: 'advanced-techniques',
    label: 'Advanced Handpan Techniques',
    description: 'Ghost notes, slap technique, muting, double strikes, finger independence, polyrhythms, overtones, ensemble playing',
    keywords: [
      'advanced', 'ghost notes', 'slap', 'slap technique', 'percussive', 'muting',
      'dampening', 'double strikes', 'rolls', 'finger independence', 'polyrhythms',
      'odd meters', '5/4', '7/8', '3/4', 'waltz', 'overtones', 'harmonics',
      'ensemble', 'playing together', 'collaboration', 'split hand', 'polyphony',
      'nadishana', 'master the handpan', 'handpan dojo', 'professional', 'continuous learning'
    ],
    content: 'Advanced techniques for experienced players: ghost notes (barely audible touches for groove), slap technique (percussive accents), muting/dampening for staccato effects, double strikes and rolls. Develop finger independence with exercises. Explore polyrhythms (3 against 2) and odd meters (5/4, 7/8). Emphasize harmonic overtones for ethereal sounds. Learn to play with other musicians and instruments. Resources for continuous learning.'
  }
]

/**
 * Search documentation by keywords
 */
export function searchDocs(query: string): DocSection[] {
  const lowerQuery = query.toLowerCase().trim()

  if (!lowerQuery) return []

  const results = docsMetadata.filter(section => {
    // Search in label, description, keywords, and content
    const searchText = `
      ${section.label}
      ${section.description}
      ${section.keywords.join(' ')}
      ${section.content}
    `.toLowerCase()

    return searchText.includes(lowerQuery)
  })

  // Sort by relevance (more keyword matches = higher rank)
  return results.sort((a, b) => {
    const aMatches = a.keywords.filter(k => k.includes(lowerQuery)).length
    const bMatches = b.keywords.filter(k => k.includes(lowerQuery)).length
    return bMatches - aMatches
  })
}

/**
 * Get section by ID
 */
export function getDocSection(id: string): DocSection | undefined {
  return docsMetadata.find(section => section.id === id)
}

/**
 * Get all section IDs
 */
export function getAllSectionIds(): string[] {
  return docsMetadata.map(section => section.id)
}
