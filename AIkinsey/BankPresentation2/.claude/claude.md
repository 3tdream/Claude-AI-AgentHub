# Claude Configuration for BankPresentation2

## Git Workflow Instructions

**IMPORTANT: Do NOT auto-commit or auto-push changes**

- Wait for explicit user instruction before committing
- Wait for explicit user instruction before pushing to GitHub
- When user asks to commit, show them what will be committed first
- When user asks to push, confirm before executing

## Project Overview

This is the AIkinsey Bank Presentation project - a React-based slideshow presentation built with:
- Vite
- React 18
- Motion (Framer Motion)
- Radix UI components
- Tailwind CSS

## Development Commands

```bash
npm run dev   # Start development server
npm run build # Build for production
```

## Repository

- GitHub: https://github.com/3tdream/ai-slideshow
- Deployed: https://bank-presentation-2025.vercel.app/

## File Structure

- `src/components/` - Individual slide components
- `src/App.tsx` - Main slideshow controller
- `slideshow-json-demo.html` - Standalone demo showing JSON-driven slideshow generation

## Notes

- Port 3001 is typically used (3000 often in use)
- Project uses component-based slides (not JSON-driven in production)
- Demo file shows how JSON could be used for slide generation
