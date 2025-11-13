# AI Pitch Deck Generator

A powerful, AI-driven pitch deck creation tool built with Next.js 15, TypeScript, React 18, Tailwind CSS, and Lucide icons. Create stunning investor presentations in seconds with multiple professional templates and an interactive AI editing interface.

![AI Pitch Deck Generator](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8) ![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 🎨 **Three Interactive Views**
- **Home View**: Beautiful deck library with grid layout and search
- **Deck View**: Full-screen presentation mode with navigation
- **Edit View**: AI-powered chat interface for real-time editing

### 📊 **8 Professional Slide Types**
1. **Title Slide**: Eye-catching opening with gradient backgrounds
2. **Problem Slide**: Numbered list of challenges
3. **Solution Slide**: Feature grid with icons
4. **Market Slide**: Large market statistics with visual impact
5. **Business Model**: 3-tier pricing comparison
6. **Traction Slide**: Metrics grid with key performance indicators
7. **Team Slide**: Member profiles with avatars
8. **Ask Slide**: Investment amount with detailed usage breakdown

### 🤖 **AI-Powered Features**
- **Instant Generation**: Create complete 7-slide decks in 3 seconds
- **Smart Templates**: Multiple color schemes with gradient styles
- **Chat Editing**: Natural language AI assistant for modifications
- **Auto-Layout**: Professional designs with responsive layouts

### 🎨 **Design System**
- **7 Color Schemes**: Professionally designed gradient combinations
- **Smooth Animations**: Framer Motion-style transitions
- **Glassmorphism**: Modern backdrop blur effects
- **Dark Backgrounds**: Premium presentation aesthetic
- **Responsive Design**: Works on all screen sizes

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd ai-pitch-deck-generator

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## 📁 Project Structure

```
ai-pitch-deck-generator/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main app with state management
│   └── globals.css         # Global styles + animations
├── components/
│   ├── HomeView.tsx        # Deck library view
│   ├── DeckView.tsx        # Presentation viewer
│   ├── EditView.tsx        # AI chat editor
│   ├── SlideRenderer.tsx   # Dynamic slide renderer
│   └── NewDeckModal.tsx    # Deck creation modal
├── data/
│   ├── initialDecks.ts     # Sample pitch deck data
│   └── colorSchemes.ts     # Color scheme definitions
├── types/
│   └── deck.ts             # TypeScript interfaces
├── lib/
│   └── utils.ts            # Utility functions
└── public/
    └── assets/             # Images and assets
```

## 🎯 Usage

### Creating a New Deck

1. Click **"Create New Pitch Deck"** on the home screen
2. Enter your pitch deck title and description
3. Click **"Generate Pitch Deck"** to let AI create your presentation
4. Wait 3 seconds for AI generation

### Viewing a Deck

1. Click on any deck card in the home view
2. Use **Previous/Next** buttons or **arrow keys** to navigate
3. Click on **dot indicators** to jump to specific slides
4. Click **"Edit with AI"** to modify the deck

### Editing with AI

1. In deck view, click **"Edit with AI"**
2. Type natural language commands in the chat:
   - "Change the title color to blue"
   - "Make slide 2 more impactful"
   - "Add a new metric to traction slide"
3. AI responds with simulated edits
4. Click **"Back to Presentation"** when done

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.9
- **UI Library**: React 18.3
- **Styling**: Tailwind CSS 4.0
- **Icons**: Lucide React
- **Utilities**: clsx, tailwind-merge
- **Dev Tools**: ESLint, TypeScript strict mode

## 🎨 Color Schemes

The app includes 7 professionally designed color schemes:

1. **Indigo-Purple-Pink**: Classic startup gradient
2. **Emerald-Cyan**: Fresh, eco-friendly vibe
3. **Amber-Red**: Bold, energetic style
4. **Violet-Fuchsia**: Creative, artistic feel
5. **Blue-Purple**: Tech-focused gradient
6. **Green-Teal**: Sustainability theme
7. **Rose-Orange**: Healthcare/wellness aesthetic

## 📝 Slide Type Reference

### Title Slide
```typescript
{
  type: "title",
  title: "Your Company Name",
  subtitle: "Tagline",
  content: "Mission statement"
}
```

### Problem Slide
```typescript
{
  type: "problem",
  title: "The Problem",
  points: ["Pain point 1", "Pain point 2", ...]
}
```

### Solution Slide
```typescript
{
  type: "solution",
  title: "Our Solution",
  description: "Description text",
  features: ["Feature 1", "Feature 2", ...]
}
```

### Market Slide
```typescript
{
  type: "market",
  title: "Market Opportunity",
  stat: "$50B",
  description: "TAM Description",
  details: "Growth details"
}
```

### Business Model Slide
```typescript
{
  type: "business",
  title: "Business Model",
  tiers: [
    { name: "Starter", price: "$99/mo", users: "Up to 10 users" },
    ...
  ]
}
```

### Traction Slide
```typescript
{
  type: "traction",
  title: "Traction",
  metrics: [
    { label: "Users", value: "10K+" },
    ...
  ]
}
```

### Team Slide
```typescript
{
  type: "team",
  title: "Team",
  members: [
    { name: "Name", role: "CEO", background: "Experience" },
    ...
  ]
}
```

### Ask Slide
```typescript
{
  type: "ask",
  title: "The Ask",
  amount: "$5M Series A",
  usage: "Use of funds",
  goal: "Goal statement"
}
```

## 🔧 Configuration

### Adding New Color Schemes

Edit `data/colorSchemes.ts`:

```typescript
{
  primary: "bg-gradient-to-br from-color1 to-color2",
  secondary: "bg-color-50",
  accent: "text-color-600",
  button: "bg-color-600 hover:bg-color-700"
}
```

### Customizing Animations

Edit `app/globals.css` to modify animation timings and effects.

## 📦 Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Icons by [Lucide](https://lucide.dev/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Made with ❤️ using AI-powered development**
