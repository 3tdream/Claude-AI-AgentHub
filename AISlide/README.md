# Realtime Slideshow AI

An AI-powered presentation system using OpenAI's Realtime API and WebRTC. This Next.js application provides an interactive slideshow experience where AI can dynamically update and manage presentation content through voice interaction.

> **Note**: This project originated from [cameronking4/openai-realtime-api-nextjs](https://github.com/cameronking4/openai-realtime-api-nextjs), a WebRTC-based Voice AI starter template. It has been significantly modified and enhanced to become a specialized AI presentation system with multi-language support, slideshow management, and a developer portal.

## Features

### Core Functionality
- **Real-time AI Presentations**: Voice-controlled slideshow with AI assistant
- **Interactive Slides**: Dynamic content that updates based on AI conversation
- **Multi-language Support**: English, Hebrew (RTL), and Arabic with i18n
- **Smart Navigation**: Voice commands and traditional controls for slide management
- **State Persistence**: Slides saved to localStorage with language-specific storage

### Technical Features
- **Next.js 15.1.1**: Modern App Router architecture with React Server Components
- **OpenAI Realtime API**: WebRTC-based voice interaction
- **Zustand State Management**: Global state for slides and language
- **Responsive Design**: Mobile and desktop layouts with Tailwind CSS
- **Developer Portal**: Built-in documentation, task tracking, and analytics

### Developer Tools
- **Comprehensive Documentation**: In-app docs at `/dev-portal/docs`
- **Claude Code Integration**: Specialized agents for QA, UI/UX, and development
- **TypeScript**: Full type safety throughout the application
- **shadcn/ui Components**: Modern, accessible UI components

## Prerequisites

- **Node.js 18.17** or later
- **OpenAI API Key** with Realtime API access
- Modern web browser with microphone support

## Installation

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd sb-realtime-slideshow-ai
```

### 2. Environment Setup
Create a `.env.local` file in the root directory:
```env
OPENAI_API_KEY=your-openai-api-key
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run the Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Usage

### Basic Operations
1. Open the app: `http://localhost:3000`
2. Click the broadcast button to start the AI session
3. Grant microphone permissions when prompted
4. Speak naturally to interact with the AI
5. Use navigation controls or voice commands to move between slides

### Language Switching
- Click the language icon to switch between English, Hebrew, and Arabic
- Each language has its own slide set stored independently
- Hebrew automatically enables RTL (right-to-left) layout

### Developer Portal
Access the developer portal at `http://localhost:3000/dev-portal` for:
- **Documentation**: Complete architecture and API reference
- **Tasks**: Development task tracking
- **Analytics**: Usage metrics and performance data
- **Settings**: Configuration management

## Project Structure

```
/app                    # Next.js App Router pages
  /dev-portal          # Developer portal pages
    /docs              # Documentation page
    /tasks             # Task management
    /analytics         # Analytics dashboard
    /settings          # Settings page
/components            # React components
  /layouts             # Layout components (mobile/desktop)
  /ui                  # shadcn/ui components
/hooks                 # Custom React hooks
  use-slides-store.ts  # Slide state management
  use-language-store.ts # Language state management
  use-mobile.ts        # Mobile detection
/lib                   # Utility libraries
  translations.ts      # i18n translations
/public                # Static assets
  /avatars            # AI avatar images
/.claude               # Claude Code agent configurations
  /agents            # Specialized sub-agents
```

## Data Management

### Architecture
- **Source of Truth**: Static translations in `/lib/translations.ts`
- **State Management**: Zustand stores for slides and language
- **Persistence**: localStorage with language-specific keys (`slides_en`, `slides_he`, `slides_ar`)
- **No Backend**: Fully client-side data management

### Data Flow
1. Component loads slides from localStorage (language-specific)
2. Falls back to default translations if no stored data
3. AI updates slides through Zustand store actions
4. Changes automatically persist to localStorage
5. Next session loads modified slides

## Claude Code Agents

This project uses specialized Claude Code agents for development:

- **nextjs-qa-tester**: Comprehensive QA testing for Next.js components
- **ui-ux-guru**: UI/UX design and styling improvements
- **design-asset-generator**: Image and asset generation
- **workspace-agent**: Workspace and project management

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Deployment

### Vercel (Recommended)

#### Via GitHub
1. Push your code to GitHub
2. Import project in Vercel dashboard
3. Add environment variable: `OPENAI_API_KEY`
4. Deploy

#### Via CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables
Ensure `OPENAI_API_KEY` is set in your deployment environment.

## Tech Stack

- **Framework**: Next.js 15.1.1
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Animation**: Framer Motion
- **Icons**: Heroicons, Lucide React
- **AI**: OpenAI Realtime API (WebRTC)

## Troubleshooting

### Microphone Issues
- Ensure browser has microphone permissions
- Check that HTTPS is enabled (required for mic access)
- Try different browsers (Chrome/Edge recommended)

### API Connection Errors
- Verify `OPENAI_API_KEY` is set correctly
- Confirm you have Realtime API access
- Check API key has not expired

### Hydration Errors
- Clear browser cache and localStorage
- Restart development server
- Check for browser extensions (Grammarly can cause issues)

### Build Errors
- Delete `.next` folder and rebuild
- Clear `node_modules` and reinstall dependencies
- Check Node.js version (18.17+ required)

## Contributing

This is a personal project by Avi Osipov. Contributions, issues, and feature requests are welcome.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgements

- [OpenAI](https://openai.com/) for the Realtime API
- [Next.js](https://nextjs.org/) for the framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [skrivov](https://github.com/skrivov/openai-voice-webrtc-next) for the original WebRTC template
- [Simon Willison](https://simonwillison.net/2024/Dec/17/openai-webrtc/) for inspiration

---

**Built with ❤️ by Avi Osipov**
