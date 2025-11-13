'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  BookOpen,
  Code2,
  Layout,
  Wrench,
  Database,
  Settings,
  Rocket,
  ArrowLeft,
  Menu,
  X,
  Copy,
  Check
} from 'lucide-react'
import Link from 'next/link'
import { SystemArchitectureDiagram } from '@/components/diagrams/system-architecture-diagram'
import { ClaudeAgentsDiagram } from '@/components/diagrams/claude-agents-diagram'
import { DocsChatButton } from '@/components/docs-chat-button'

const sections = [
  { id: 'overview', label: 'Overview', icon: BookOpen },
  { id: 'architecture', label: 'Architecture', icon: Layout },
  { id: 'claude-agents', label: 'Claude Agents', icon: Code2 },
  { id: 'components', label: 'Components', icon: Code2 },
  { id: 'hooks', label: 'Hooks', icon: Wrench },
  { id: 'api-routes', label: 'API Routes', icon: Database },
  { id: 'configuration', label: 'Configuration', icon: Settings },
  { id: 'local-development', label: 'Local Development', icon: Wrench },
  { id: 'deployment', label: 'Deployment', icon: Rocket },
]

const CodeBlock = ({ code }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </Button>
      <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
        <code className="text-sm">{code}</code>
      </pre>
    </div>
  )
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100

      for (const section of sections) {
        const element = document.getElementById(section.id)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="sticky top-[52px] z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dev-portal">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dev Portal
            </Button>
          </Link>
          <h1 className="text-xl font-semibold text-slate-800">Documentation</h1>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 pb-16">
        <div className="flex gap-8">
          {/* Sidebar - Desktop */}
          <aside className="hidden md:block w-64 sticky top-[140px] h-fit">
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon
                const isActive = activeSection === section.id
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-lg'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{section.label}</span>
                  </button>
                )
              })}
            </nav>
          </aside>

          {/* Sidebar - Mobile */}
          {sidebarOpen && (
            <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)}>
              <div className="fixed left-0 top-[108px] bottom-0 w-64 bg-white shadow-xl p-4" onClick={(e) => e.stopPropagation()}>
                <nav className="space-y-1">
                  {sections.map((section) => {
                    const Icon = section.icon
                    const isActive = activeSection === section.id
                    return (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                          isActive
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{section.label}</span>
                      </button>
                    )
                  })}
                </nav>
              </div>
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1 max-w-4xl">
            {/* Overview */}
            <section id="overview" className="mb-16 scroll-mt-[140px]">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Overview</h2>

              <Card className="p-6 mb-6 bg-gradient-to-br from-slate-50 to-white border-slate-200">
                <h3 className="text-xl font-semibold text-slate-800 mb-3">Welcome</h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  This is a real-time AI slideshow application that uses OpenAI&apos;s Realtime API with WebRTC for voice-enabled,
                  interactive presentations. The app allows users to interact with an AI assistant (Pixel) that can update and
                  navigate through presentation slides in real-time using voice commands.
                </p>
              </Card>

              <Card className="p-6 mb-6 border-slate-200">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Quick Start</h3>
                <ol className="space-y-3 text-slate-600">
                  <li className="flex gap-3">
                    <Badge variant="outline" className="shrink-0">1</Badge>
                    <span>Clone the repository and install dependencies with <code className="px-2 py-1 bg-slate-100 rounded text-sm">npm install</code></span>
                  </li>
                  <li className="flex gap-3">
                    <Badge variant="outline" className="shrink-0">2</Badge>
                    <span>Set up your <code className="px-2 py-1 bg-slate-100 rounded text-sm">.env.local</code> file with your OpenAI API key</span>
                  </li>
                  <li className="flex gap-3">
                    <Badge variant="outline" className="shrink-0">3</Badge>
                    <span>Run the development server with <code className="px-2 py-1 bg-slate-100 rounded text-sm">npm run dev</code></span>
                  </li>
                  <li className="flex gap-3">
                    <Badge variant="outline" className="shrink-0">4</Badge>
                    <span>Click the &ldquo;Start&rdquo; button to begin the AI session</span>
                  </li>
                  <li className="flex gap-3">
                    <Badge variant="outline" className="shrink-0">5</Badge>
                    <span>Use voice commands or text input to interact with the AI assistant</span>
                  </li>
                </ol>
              </Card>

              <Card className="p-6 mb-6 border-slate-200">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Key Features</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-semibold text-slate-800 mb-2">🎙️ Voice Interaction</h4>
                    <p className="text-sm text-slate-600">Real-time voice communication with AI assistant using WebRTC</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-semibold text-slate-800 mb-2">📊 Dynamic Slides</h4>
                    <p className="text-sm text-slate-600">AI can update slide content, titles, and navigate between slides</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-semibold text-slate-800 mb-2">🌐 Multilingual</h4>
                    <p className="text-sm text-slate-600">Support for English and Hebrew with RTL layout</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-semibold text-slate-800 mb-2">📱 Responsive</h4>
                    <p className="text-sm text-slate-600">Optimized layouts for mobile and desktop devices</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-semibold text-slate-800 mb-2">💾 State Persistence</h4>
                    <p className="text-sm text-slate-600">Slides saved to localStorage per language</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-semibold text-slate-800 mb-2">🎨 Modern UI</h4>
                    <p className="text-sm text-slate-600">Built with Tailwind CSS and shadcn/ui components</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-slate-200">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Technology Stack</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge className="shrink-0">Frontend</Badge>
                    <span className="text-slate-600">Next.js 15, React 18, TypeScript</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="shrink-0">Styling</Badge>
                    <span className="text-slate-600">Tailwind CSS, shadcn/ui, Framer Motion</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="shrink-0">State</Badge>
                    <span className="text-slate-600">Zustand for global state management</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="shrink-0">AI</Badge>
                    <span className="text-slate-600">OpenAI Realtime API (GPT-4o)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="shrink-0">Communication</Badge>
                    <span className="text-slate-600">WebRTC for real-time audio/data channels</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="shrink-0">Icons</Badge>
                    <span className="text-slate-600">Lucide React, Heroicons</span>
                  </div>
                </div>
              </Card>
            </section>

            {/* Architecture */}
            <section id="architecture" className="mb-16 scroll-mt-[140px]">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Architecture</h2>

              <Card className="p-6 mb-6 border-slate-200">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">System Architecture</h3>
                <div className="mb-4">
                  <SystemArchitectureDiagram />
                </div>
                <p className="text-slate-600 leading-relaxed mt-4">
                  The application follows a modern client-server architecture with real-time communication:
                </p>
                <ul className="mt-3 space-y-2 text-slate-600 list-disc list-inside">
                  <li><strong>User Layer:</strong> Browser interface with voice/text input</li>
                  <li><strong>Frontend Layer:</strong> Next.js app with React components</li>
                  <li><strong>State Layer:</strong> Zustand stores for slides and language</li>
                  <li><strong>API Layer:</strong> Next.js API routes for session management</li>
                  <li><strong>External Services:</strong> OpenAI Realtime API via WebRTC</li>
                </ul>
              </Card>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Project Structure</h3>
                <p className="text-slate-600 mb-4">Overview of the project folder organization:</p>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* App Router */}
                  <Card className="p-4 border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">App Router</Badge>
                      <span className="text-sm font-mono text-slate-600">/app</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="pl-4 border-l-2 border-blue-200">
                        <div className="text-slate-700 font-medium">page.tsx</div>
                        <div className="text-slate-500">Main application page</div>
                      </div>
                      <div className="pl-4 border-l-2 border-blue-200">
                        <div className="text-slate-700 font-medium">layout.tsx</div>
                        <div className="text-slate-500">Root layout</div>
                      </div>
                      <div className="pl-4 border-l-2 border-blue-200">
                        <div className="text-slate-700 font-medium">api/session/</div>
                        <div className="text-slate-500">OpenAI session endpoint</div>
                      </div>
                      <div className="pl-4 border-l-2 border-blue-200">
                        <div className="text-slate-700 font-medium">dev-portal/</div>
                        <div className="text-slate-500">Developer portal pages</div>
                      </div>
                    </div>
                  </Card>

                  {/* Components */}
                  <Card className="p-4 border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Components</Badge>
                      <span className="text-sm font-mono text-slate-600">/components</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="pl-4 border-l-2 border-green-200">
                        <div className="text-slate-700 font-medium">layouts/</div>
                        <div className="text-slate-500">Desktop & mobile layouts</div>
                      </div>
                      <div className="pl-4 border-l-2 border-green-200">
                        <div className="text-slate-700 font-medium">security-slides.tsx</div>
                        <div className="text-slate-500">Main slideshow component</div>
                      </div>
                      <div className="pl-4 border-l-2 border-green-200">
                        <div className="text-slate-700 font-medium">broadcast-button.tsx</div>
                        <div className="text-slate-500">Session controls</div>
                      </div>
                      <div className="pl-4 border-l-2 border-green-200">
                        <div className="text-slate-700 font-medium">ui/</div>
                        <div className="text-slate-500">shadcn/ui components</div>
                      </div>
                    </div>
                  </Card>

                  {/* Hooks */}
                  <Card className="p-4 border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Hooks</Badge>
                      <span className="text-sm font-mono text-slate-600">/hooks</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="pl-4 border-l-2 border-purple-200">
                        <div className="text-slate-700 font-medium">use-slides-store.ts</div>
                        <div className="text-slate-500">Slide state (Zustand)</div>
                      </div>
                      <div className="pl-4 border-l-2 border-purple-200">
                        <div className="text-slate-700 font-medium">use-language-store.ts</div>
                        <div className="text-slate-500">Language state</div>
                      </div>
                      <div className="pl-4 border-l-2 border-purple-200">
                        <div className="text-slate-700 font-medium">use-webrtc.ts</div>
                        <div className="text-slate-500">WebRTC session</div>
                      </div>
                      <div className="pl-4 border-l-2 border-purple-200">
                        <div className="text-slate-700 font-medium">use-mobile.ts</div>
                        <div className="text-slate-500">Mobile detection</div>
                      </div>
                    </div>
                  </Card>

                  {/* Libraries */}
                  <Card className="p-4 border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Libraries</Badge>
                      <span className="text-sm font-mono text-slate-600">/lib</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="pl-4 border-l-2 border-amber-200">
                        <div className="text-slate-700 font-medium">translations.ts</div>
                        <div className="text-slate-500">i18n translations</div>
                      </div>
                      <div className="pl-4 border-l-2 border-amber-200">
                        <div className="text-slate-700 font-medium">utils.ts</div>
                        <div className="text-slate-500">Helper functions</div>
                      </div>
                    </div>
                  </Card>

                  {/* Public Assets */}
                  <Card className="p-4 border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">Assets</Badge>
                      <span className="text-sm font-mono text-slate-600">/public</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="pl-4 border-l-2 border-rose-200">
                        <div className="text-slate-700 font-medium">avatars/</div>
                        <div className="text-slate-500">AI avatar images</div>
                      </div>
                      <div className="pl-4 border-l-2 border-rose-200">
                        <div className="text-slate-700 font-medium">*.png</div>
                        <div className="text-slate-500">Architecture diagrams</div>
                      </div>
                    </div>
                  </Card>

                  {/* Claude Config */}
                  <Card className="p-4 border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">Claude Config</Badge>
                      <span className="text-sm font-mono text-slate-600">/.claude</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="pl-4 border-l-2 border-indigo-200">
                        <div className="text-slate-700 font-medium">CLAUDE.md</div>
                        <div className="text-slate-500">Project instructions</div>
                      </div>
                      <div className="pl-4 border-l-2 border-indigo-200">
                        <div className="text-slate-700 font-medium">agents/</div>
                        <div className="text-slate-500">Specialized sub-agents</div>
                      </div>
                    </div>
                  </Card>

                  {/* Configuration Files */}
                  <Card className="p-4 border-slate-200 md:col-span-2">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">Config Files</Badge>
                      <span className="text-sm font-mono text-slate-600">/</span>
                    </div>
                    <div className="grid md:grid-cols-4 gap-2 text-sm">
                      <div className="pl-4 border-l-2 border-slate-200">
                        <div className="text-slate-700 font-medium">next.config.ts</div>
                        <div className="text-slate-500">Next.js config</div>
                      </div>
                      <div className="pl-4 border-l-2 border-slate-200">
                        <div className="text-slate-700 font-medium">tailwind.config.ts</div>
                        <div className="text-slate-500">Tailwind config</div>
                      </div>
                      <div className="pl-4 border-l-2 border-slate-200">
                        <div className="text-slate-700 font-medium">tsconfig.json</div>
                        <div className="text-slate-500">TypeScript config</div>
                      </div>
                      <div className="pl-4 border-l-2 border-slate-200">
                        <div className="text-slate-700 font-medium">package.json</div>
                        <div className="text-slate-500">Dependencies</div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              <Card className="p-6 mb-6 border-slate-200">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Component Hierarchy</h3>
                <CodeBlock code={`app/
├── page.tsx (Main Entry)
    ├── MobileLayout / DesktopLayout
        ├── SecuritySlides
        │   └── Slide Blocks
        ├── BroadcastButton
        ├── AvatarInfo
        ├── MuteButton
        └── StatusDisplay`} />
              </Card>

              <Card className="p-6 mb-6 border-slate-200">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Data Flow</h3>
                <ol className="space-y-3 text-slate-600">
                  <li className="flex gap-3">
                    <Badge variant="outline" className="shrink-0">1</Badge>
                    <span>User clicks &ldquo;Start&rdquo; → API creates OpenAI session → Returns ephemeral token</span>
                  </li>
                  <li className="flex gap-3">
                    <Badge variant="outline" className="shrink-0">2</Badge>
                    <span>WebRTC connection established with OpenAI using ephemeral token</span>
                  </li>
                  <li className="flex gap-3">
                    <Badge variant="outline" className="shrink-0">3</Badge>
                    <span>Audio stream and data channel opened for bidirectional communication</span>
                  </li>
                  <li className="flex gap-3">
                    <Badge variant="outline" className="shrink-0">4</Badge>
                    <span>User speaks/types → Sent to OpenAI → AI processes with tools</span>
                  </li>
                  <li className="flex gap-3">
                    <Badge variant="outline" className="shrink-0">5</Badge>
                    <span>AI calls tools (nextSlide, updateSlideBlock, etc.) → Updates Zustand store</span>
                  </li>
                  <li className="flex gap-3">
                    <Badge variant="outline" className="shrink-0">6</Badge>
                    <span>React components re-render with updated state → User sees changes</span>
                  </li>
                </ol>
              </Card>

              <Card className="p-6 border-slate-200">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">State Management Pattern</h3>
                <p className="text-slate-600 mb-3">The app uses Zustand for global state with localStorage persistence:</p>
                <CodeBlock code={`// Slide Store (useSlideStore)
- currentSlide: number
- totalSlides: number
- slides: Slide[]
- Actions: nextSlide(), prevSlide(), updateSlideBlock()

// Language Store (useLanguageStore)
- language: 'en' | 'he'
- Action: setLanguage()

// Persistence
- Slides saved to localStorage per language
- Key format: &ldquo;slides_en&rdquo; or &ldquo;slides_he&rdquo;`} />
              </Card>
            </section>

            {/* Claude Agents */}
            <section id="claude-agents" className="mb-16 scroll-mt-[140px]">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Claude Agents</h2>

              <Card className="p-6 mb-6 border-slate-200">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Agent Architecture</h3>
                <p className="text-slate-600 mb-4">This project uses Claude Code with a hierarchical agent system for specialized development tasks.</p>
                <div className="mb-4">
                  <ClaudeAgentsDiagram />
                </div>
                <div className="space-y-4 mt-6">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-slate-800 mb-2">Main Agent: CLAUDE.md</h4>
                    <p className="text-sm text-slate-600 mb-2">
                      Located at <code className="px-2 py-1 bg-white rounded text-sm">~/.claude/CLAUDE.md</code>
                    </p>
                    <p className="text-sm text-slate-600">
                      Global instructions that apply to all projects. Contains user preferences, coding standards, and general guidelines for Claude to follow across all development work.
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-slate-800 mb-2">Sub-Agents: .claude/ Folder</h4>
                    <p className="text-sm text-slate-600 mb-3">
                      Specialized agents stored in <code className="px-2 py-1 bg-white rounded text-sm">~/.claude/agents/</code> that handle specific tasks:
                    </p>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="bg-white p-3 rounded border border-purple-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">QA</Badge>
                          <span className="font-medium text-sm">nextjs-qa-tester.md</span>
                        </div>
                        <p className="text-xs text-slate-600">Comprehensive Next.js QA testing with browser automation</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-purple-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">UI/UX</Badge>
                          <span className="font-medium text-sm">ui-ux-guru.md</span>
                        </div>
                        <p className="text-xs text-slate-600">UI/UX design guidance and fal.ai asset generation</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-purple-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Assets</Badge>
                          <span className="font-medium text-sm">design-asset-generator.md</span>
                        </div>
                        <p className="text-xs text-slate-600">Generates images, icons, and visual assets</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-purple-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Workspace</Badge>
                          <span className="font-medium text-sm">workspace-agent.md</span>
                        </div>
                        <p className="text-xs text-slate-600">Manages workspace and agent testing</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-slate-200">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">How Agents Work</h3>
                <ol className="space-y-3 text-slate-600">
                  <li className="flex gap-3">
                    <Badge variant="outline" className="shrink-0">1</Badge>
                    <span><strong>Global Configuration:</strong> CLAUDE.md provides global instructions that apply to all projects and agents</span>
                  </li>
                  <li className="flex gap-3">
                    <Badge variant="outline" className="shrink-0">2</Badge>
                    <span><strong>Task Detection:</strong> Claude Code automatically identifies when specialized tasks match an agent&apos;s expertise</span>
                  </li>
                  <li className="flex gap-3">
                    <Badge variant="outline" className="shrink-0">3</Badge>
                    <span><strong>Agent Invocation:</strong> The appropriate sub-agent is launched with full context and specialized tools</span>
                  </li>
                  <li className="flex gap-3">
                    <Badge variant="outline" className="shrink-0">4</Badge>
                    <span><strong>Task Execution:</strong> Agent performs specialized work (QA testing, UI design, asset generation, etc.)</span>
                  </li>
                  <li className="flex gap-3">
                    <Badge variant="outline" className="shrink-0">5</Badge>
                    <span><strong>Results Return:</strong> Agent completes task and returns results to main Claude session</span>
                  </li>
                </ol>
              </Card>
            </section>

            {/* Components */}
            <section id="components" className="mb-16 scroll-mt-[140px]">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Components</h2>

              <div className="space-y-4">
                <Card className="p-6 border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-slate-600" />
                    SecuritySlides
                  </h3>
                  <p className="text-slate-600 mb-3">Main slideshow component that displays slides with animated transitions.</p>
                  <CodeBlock code={`import { SecuritySlides } from '@/components/security-slides'

// Features:
- Displays slide title, description, and blocks
- Animated transitions with Framer Motion
- Navigation controls (next/prev)
- Language toggle (desktop only)
- Mobile/desktop responsive layouts
- Loads slides from localStorage based on language`} />
                </Card>

                <Card className="p-6 border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-slate-600" />
                    BroadcastButton
                  </h3>
                  <p className="text-slate-600 mb-3">Control button for starting/stopping AI session with text input (desktop).</p>
                  <CodeBlock code={`interface BroadcastButtonProps {
  isSessionActive: boolean
  onClick: () => Promise<void>
  dataChannel?: RTCDataChannel | null
}

// Features:
- Mobile: Simple start/stop button
- Desktop: Text input + send + stop buttons
- Monitors dataChannel ready state
- Sends text messages via WebRTC data channel
- Shows loading state during session start`} />
                </Card>

                <Card className="p-6 border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-slate-600" />
                    MobileLayout / DesktopLayout
                  </h3>
                  <p className="text-slate-600 mb-3">Responsive layout containers optimized for different screen sizes.</p>
                  <CodeBlock code={`interface LayoutProps {
  status: string
  isSessionActive: boolean
  handleStartStopClick: () => Promise<void>
  audioStreamRef: React.MutableRefObject<MediaStream | null>
  dataChannelRef: React.MutableRefObject<RTCDataChannel | null>
}

// MobileLayout:
- Fixed bottom control panel with backdrop blur
- Avatar + broadcast button side by side
- Language toggle in controls row
- Safe area padding for iOS

// DesktopLayout:
- Sidebar with avatar and full-width broadcast button
- Main content area for slides
- Status display at top`} />
                </Card>

                <Card className="p-6 border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-slate-600" />
                    AvatarInfo
                  </h3>
                  <p className="text-slate-600 mb-3">Displays AI assistant avatar and information.</p>
                  <CodeBlock code={`// Features:
- Shows Jacqueline avatar image
- Displays name and role
- Themed with consistent styling
- Used in both mobile and desktop layouts`} />
                </Card>

                <Card className="p-6 border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-slate-600" />
                    MuteButton
                  </h3>
                  <p className="text-slate-600 mb-3">Audio mute control for the microphone stream.</p>
                  <CodeBlock code={`interface MuteButtonProps {
  audioStream: MediaStream | null
}

// Features:
- Mutes/unmutes microphone
- Shows mic icon with muted state
- Disables when no audio stream available`} />
                </Card>

                <Card className="p-6 border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-slate-600" />
                    StatusDisplay
                  </h3>
                  <p className="text-slate-600 mb-3">Shows current connection/session status.</p>
                  <CodeBlock code={`// Status messages:
- "Connecting..."
- "Connected"
- "Session active"
- "Disconnected"
- Error messages`} />
                </Card>
              </div>
            </section>

            {/* Hooks */}
            <section id="hooks" className="mb-16 scroll-mt-[140px]">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Hooks</h2>

              <div className="space-y-4">
                <Card className="p-6 border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-slate-600" />
                    useSlideStore
                  </h3>
                  <p className="text-slate-600 mb-3">Zustand store for managing slide state and navigation.</p>
                  <CodeBlock code={`import { useSlideStore } from '@/hooks/use-slides-store'

const {
  currentSlide,
  totalSlides,
  slides,
  nextSlide,
  prevSlide,
  setTotalSlides,
  setSlides,
  getCurrentSlideContent,
  updateCurrentSlideTitle,
  updateCurrentSlideDescription,
  updateSlideBlock
} = useSlideStore()

// State persistence:
- Saves to localStorage with language-specific keys
- Key format: &ldquo;slides_en&rdquo; or &ldquo;slides_he&rdquo;
- Auto-loads on mount`} />
                </Card>

                <Card className="p-6 border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-slate-600" />
                    useLanguageStore
                  </h3>
                  <p className="text-slate-600 mb-3">Zustand store for managing UI language (English/Hebrew).</p>
                  <CodeBlock code={`import { useLanguageStore } from '@/hooks/use-language-store'

const { language, setLanguage } = useLanguageStore()

// Usage:
setLanguage('en') // English
setLanguage('he') // Hebrew (with RTL support)`} />
                </Card>

                <Card className="p-6 border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-slate-600" />
                    useIsMobile
                  </h3>
                  <p className="text-slate-600 mb-3">Detects mobile screen size for responsive layouts.</p>
                  <CodeBlock code={`import { useIsMobile } from '@/hooks/use-mobile'

const isMobile = useIsMobile()

// Returns true for screens < 768px width
// Updates on window resize`} />
                </Card>
              </div>
            </section>

            {/* API Routes */}
            <section id="api-routes" className="mb-16 scroll-mt-[140px]">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">API Routes</h2>

              <Card className="p-6 mb-6 border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Database className="w-5 h-5 text-slate-600" />
                  POST /api/session
                </h3>
                <p className="text-slate-600 mb-4">Creates a new OpenAI Realtime API session and returns ephemeral token for WebRTC.</p>

                <h4 className="font-semibold text-slate-800 mb-2">Request</h4>
                <CodeBlock code={`POST /api/session
Content-Type: application/json

// No body required`} />

                <h4 className="font-semibold text-slate-800 mb-2 mt-4">Response (Success)</h4>
                <CodeBlock code={`{
  "client_secret": {
    "value": "eph_...",
    "expires_at": 1234567890
  },
  "model": "gpt-4o-realtime-preview-2024-12-17",
  "modalities": ["audio", "text"],
  "voice": "shimmer"
}`} />

                <h4 className="font-semibold text-slate-800 mb-2 mt-4">Response (Error)</h4>
                <CodeBlock code={`{
  "error": "Failed to fetch session data"
}`} />

                <h4 className="font-semibold text-slate-800 mb-2 mt-4">Implementation</h4>
                <CodeBlock code={`// app/api/session/route.ts
export async function POST() {
  const response = await fetch(
    "https://api.openai.com/v1/realtime/sessions",
    {
      method: "POST",
      headers: {
        Authorization: \`Bearer \${process.env.OPENAI_API_KEY}\`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(openAIConfig),
    }
  )

  return NextResponse.json(await response.json())
}`} />
              </Card>

              <Card className="p-6 border-slate-200">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">AI Tools Configuration</h3>
                <p className="text-slate-600 mb-3">The session includes function calling tools for slide manipulation:</p>
                <CodeBlock code={`// Available tools sent to OpenAI:
const tools = [
  {
    name: "getCurrentSlide",
    description: "Gets current slide content"
  },
  {
    name: "updateCurrentSlideTitle",
    description: "Updates slide title",
    parameters: { title: string }
  },
  {
    name: "updateCurrentSlideDescription",
    description: "Updates slide description",
    parameters: { description: string }
  },
  {
    name: "updateSlideBlock",
    description: "Updates a block in the slide",
    parameters: {
      blockId: string,
      title?: string,
      content?: string
    }
  },
  {
    name: "nextSlide",
    description: "Move to next slide"
  },
  {
    name: "prevSlide",
    description: "Move to previous slide"
  },
  {
    name: "getCurrentTime",
    description: "Gets current time"
  }
]`} />
              </Card>
            </section>

            {/* Configuration */}
            <section id="configuration" className="mb-16 scroll-mt-[140px]">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Configuration</h2>

              <Card className="p-6 mb-6 border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-slate-600" />
                  Environment Variables
                </h3>
                <p className="text-slate-600 mb-3">Create a <code className="px-2 py-1 bg-slate-100 rounded text-sm">.env.local</code> file in the root directory:</p>
                <CodeBlock code={`# .env.local
OPENAI_API_KEY=sk-proj-...

# Required for OpenAI Realtime API
# Get your key from: https://platform.openai.com/api-keys`} />
              </Card>

              <Card className="p-6 mb-6 border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-3">OpenAI Configuration</h3>
                <p className="text-slate-600 mb-3">Located in <code className="px-2 py-1 bg-slate-100 rounded text-sm">config/openai.ts</code></p>
                <CodeBlock code={`// config/openai.ts
export const openAIConfig = {
  model: "gpt-4o-realtime-preview-2024-12-17",
  voice: "shimmer",
  modalities: ["audio", "text"],
  instructions: systemPrompt,  // AI personality/behavior
  tools: tools,                // Function calling tools
}

// System Prompt defines AI personality:
- Name: Pixel
- Role: Friendly AI helper for kids
- Personality: Enthusiastic, patient, playful
- Language preference: English
- Teaching style: Learning through play`} />
              </Card>

              <Card className="p-6 border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-3">Site Configuration</h3>
                <p className="text-slate-600 mb-3">Located in <code className="px-2 py-1 bg-slate-100 rounded text-sm">config/site.ts</code></p>
                <CodeBlock code={`// config/site.ts
export const siteConfig = {
  name: "OpenAI Realtime API Demo",
  url: "https://openai-rt-shadcn.vercel.app",
  description: "A streamlined demo of OpenAI's Realtime API..."
}`} />
              </Card>
            </section>

            {/* Local Development */}
            <section id="local-development" className="mb-16 scroll-mt-[140px]">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Local Development</h2>

              <Card className="p-6 mb-6 border-slate-200">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Prerequisites</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <Badge variant="outline" className="shrink-0 mt-1">1</Badge>
                    <div>
                      <p className="font-medium text-slate-800">Node.js 18.17 or later</p>
                      <p className="text-sm text-slate-600">Download from <a href="https://nodejs.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">nodejs.org</a></p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <Badge variant="outline" className="shrink-0 mt-1">2</Badge>
                    <div>
                      <p className="font-medium text-slate-800">OpenAI API Key</p>
                      <p className="text-sm text-slate-600">With Realtime API access (GPT-4o tier) from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">platform.openai.com</a></p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <Badge variant="outline" className="shrink-0 mt-1">3</Badge>
                    <div>
                      <p className="font-medium text-slate-800">Git</p>
                      <p className="text-sm text-slate-600">For version control and cloning the repository</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 mb-6 border-slate-200">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Setup Steps</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-slate-800">Step 1</Badge>
                      <span className="font-medium text-slate-800">Clone the Repository</span>
                    </div>
                    <CodeBlock code={`git clone <repository-url>
cd sb-realtime-slideshow-ai`} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-slate-800">Step 2</Badge>
                      <span className="font-medium text-slate-800">Install Dependencies</span>
                    </div>
                    <CodeBlock code={`npm install`} />
                    <p className="text-sm text-slate-600 mt-2">This will install all required packages including Next.js, React, Tailwind, and other dependencies.</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-slate-800">Step 3</Badge>
                      <span className="font-medium text-slate-800">Configure Environment Variables</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">Create a <code className="px-2 py-1 bg-slate-100 rounded text-sm">.env.local</code> file in the root directory:</p>
                    <CodeBlock code={`# .env.local
OPENAI_API_KEY=sk-proj-your-api-key-here

# Required for OpenAI Realtime API
# Get your key from: https://platform.openai.com/api-keys`} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-slate-800">Step 4</Badge>
                      <span className="font-medium text-slate-800">Start Development Server</span>
                    </div>
                    <CodeBlock code={`npm run dev`} />
                    <p className="text-sm text-slate-600 mt-2">
                      The app will be available at <code className="px-2 py-1 bg-slate-100 rounded text-sm">http://localhost:3000</code>
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-slate-800">Step 5</Badge>
                      <span className="font-medium text-slate-800">Open in Browser</span>
                    </div>
                    <p className="text-sm text-slate-600">Navigate to <code className="px-2 py-1 bg-slate-100 rounded text-sm">http://localhost:3000</code> and click &ldquo;Start&rdquo; to begin an AI session.</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 mb-6 border-slate-200">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Development Scripts</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <code className="font-semibold text-slate-800">npm run dev</code>
                      <Badge variant="outline">Development</Badge>
                    </div>
                    <p className="text-sm text-slate-600">Starts the development server with hot reload on port 3000</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <code className="font-semibold text-slate-800">npm run build</code>
                      <Badge variant="outline">Production</Badge>
                    </div>
                    <p className="text-sm text-slate-600">Creates an optimized production build</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <code className="font-semibold text-slate-800">npm start</code>
                      <Badge variant="outline">Production</Badge>
                    </div>
                    <p className="text-sm text-slate-600">Starts the production server (requires build first)</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <code className="font-semibold text-slate-800">npm run lint</code>
                      <Badge variant="outline">Code Quality</Badge>
                    </div>
                    <p className="text-sm text-slate-600">Runs ESLint to check code quality</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-slate-200">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Troubleshooting Common Issues</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2">⚠️ Hydration Errors</h4>
                    <p className="text-sm text-red-700 mb-2">Caused by browser extensions like Grammarly injecting HTML.</p>
                    <p className="text-sm text-red-700"><strong>Solution:</strong> Disable browser extensions or add <code className="px-2 py-1 bg-white rounded text-sm">suppressHydrationWarning</code> to affected components.</p>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">⚠️ API Key Not Working</h4>
                    <p className="text-sm text-yellow-700 mb-2">Ensure your API key has Realtime API access.</p>
                    <p className="text-sm text-yellow-700"><strong>Solution:</strong> Check your OpenAI tier at <a href="https://platform.openai.com/account/limits" target="_blank" rel="noopener noreferrer" className="underline">platform.openai.com/account/limits</a></p>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">💡 Microphone Not Working</h4>
                    <p className="text-sm text-blue-700 mb-2">WebRTC requires HTTPS or localhost.</p>
                    <p className="text-sm text-blue-700"><strong>Solution:</strong> Use <code className="px-2 py-1 bg-white rounded text-sm">localhost</code> for development or enable HTTPS for production.</p>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">✅ Hot Reload Not Working</h4>
                    <p className="text-sm text-green-700 mb-2">Next.js sometimes needs a server restart.</p>
                    <p className="text-sm text-green-700"><strong>Solution:</strong> Stop the server (Ctrl+C) and run <code className="px-2 py-1 bg-white rounded text-sm">npm run dev</code> again.</p>
                  </div>
                </div>
              </Card>
            </section>

            {/* Deployment */}
            <section id="deployment" className="mb-16 scroll-mt-[140px]">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Deployment</h2>

              <Card className="p-6 mb-6 border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-slate-600" />
                  Build Instructions
                </h3>
                <CodeBlock code={`# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start

# Or run development server
npm run dev`} />
              </Card>

              <Card className="p-6 mb-6 border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-3">Environment Setup</h3>
                <ol className="space-y-3 text-slate-600">
                  <li className="flex gap-3">
                    <Badge variant="outline" className="shrink-0">1</Badge>
                    <span>Get OpenAI API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-slate-900 underline">platform.openai.com</a></span>
                  </li>
                  <li className="flex gap-3">
                    <Badge variant="outline" className="shrink-0">2</Badge>
                    <span>Ensure API key has access to Realtime API (GPT-4o tier)</span>
                  </li>
                  <li className="flex gap-3">
                    <Badge variant="outline" className="shrink-0">3</Badge>
                    <span>Set <code className="px-2 py-1 bg-slate-100 rounded text-sm">OPENAI_API_KEY</code> in production environment</span>
                  </li>
                  <li className="flex gap-3">
                    <Badge variant="outline" className="shrink-0">4</Badge>
                    <span>Configure CORS if deploying to custom domain</span>
                  </li>
                </ol>
              </Card>

              <Card className="p-6 border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-3">Deployment Checklist</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <input type="checkbox" className="mt-1" disabled checked />
                    <span className="text-slate-600">Environment variables configured</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <input type="checkbox" className="mt-1" disabled />
                    <span className="text-slate-600">OpenAI API key has Realtime API access</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <input type="checkbox" className="mt-1" disabled />
                    <span className="text-slate-600">Production build tested locally</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <input type="checkbox" className="mt-1" disabled />
                    <span className="text-slate-600">HTTPS enabled (required for WebRTC)</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <input type="checkbox" className="mt-1" disabled />
                    <span className="text-slate-600">Browser compatibility verified (Chrome, Safari, Firefox)</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <input type="checkbox" className="mt-1" disabled />
                    <span className="text-slate-600">Mobile devices tested</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <input type="checkbox" className="mt-1" disabled />
                    <span className="text-slate-600">Microphone permissions working</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 mb-6 border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                <h3 className="text-xl font-semibold mb-3">🚀 Vercel Deployment (Recommended)</h3>
                <p className="text-slate-200 mb-4">Vercel is the recommended platform for deploying Next.js applications with zero configuration.</p>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Method 1: Deploy via GitHub (Recommended)</h4>
                    <ol className="space-y-2 text-sm text-slate-200 list-decimal list-inside">
                      <li>Push your code to a GitHub repository</li>
                      <li>Visit <a href="https://vercel.com/new" target="_blank" rel="noopener noreferrer" className="text-blue-300 underline">vercel.com/new</a></li>
                      <li>Import your GitHub repository</li>
                      <li>Configure environment variables (see below)</li>
                      <li>Click &ldquo;Deploy&rdquo;</li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-2">Method 2: Deploy via CLI</h4>
                    <CodeBlock code={`# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Deploy to production
vercel --prod`} />
                  </div>

                  <div className="p-4 bg-white/10 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Environment Variables</h4>
                    <p className="text-sm text-slate-200 mb-2">Add these in Vercel Dashboard → Settings → Environment Variables:</p>
                    <CodeBlock code={`OPENAI_API_KEY=sk-proj-your-api-key-here`} />
                    <p className="text-xs text-slate-300 mt-2">Make sure to add this for Production, Preview, and Development environments.</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-2">Why Vercel?</h4>
                    <div className="grid md:grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 text-sm text-slate-200">
                        <span className="text-green-400">✅</span>
                        <span>Automatic HTTPS</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-200">
                        <span className="text-green-400">✅</span>
                        <span>Edge network (low latency)</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-200">
                        <span className="text-green-400">✅</span>
                        <span>Serverless API routes</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-200">
                        <span className="text-green-400">✅</span>
                        <span>Zero configuration</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-200">
                        <span className="text-green-400">✅</span>
                        <span>Automatic Git deployments</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-200">
                        <span className="text-green-400">✅</span>
                        <span>Preview deployments</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-slate-200">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Other Deployment Options</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-semibold text-slate-800 mb-2">Docker</h4>
                    <p className="text-sm text-slate-600 mb-2">Deploy using Docker containers on any cloud provider.</p>
                    <CodeBlock code={`# Create Dockerfile (Next.js provides standalone build)
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.js"]`} />
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-semibold text-slate-800 mb-2">Self-Hosted (VPS)</h4>
                    <p className="text-sm text-slate-600 mb-2">Deploy to any VPS (DigitalOcean, AWS EC2, etc.) with Node.js.</p>
                    <CodeBlock code={`# Build the app
npm run build

# Start with PM2 (process manager)
npm install -g pm2
pm2 start npm --name "slideshow-ai" -- start

# Or use a service like systemd
sudo systemctl enable slideshow-ai`} />
                  </div>
                </div>
              </Card>
            </section>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-slate-200 text-center">
              <p className="text-slate-600 mb-4">
                Built with Next.js, OpenAI Realtime API, and shadcn/ui
              </p>
              <Link href="/dev-portal">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Developer Portal
                </Button>
              </Link>
            </div>
          </main>
        </div>
      </div>

      {/* Floating Docs Chat Button */}
      <DocsChatButton />
    </div>
  )
}
