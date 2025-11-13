# Tiltan College - Website Refresh

A modern, immersive website for Tiltan College of Design built with Next.js 15, React 19, TypeScript, and Tailwind CSS.

## Features

- **Dark Mode Design**: Sleek, minimalist dark theme inspired by modern web design
- **Immersive Animations**: Smooth transitions and scroll-triggered animations using Framer Motion
- **Responsive Layout**: Mobile-first design that looks great on all devices
- **Interactive Components**: Engaging UI with hover effects and micro-interactions
- **Performance Optimized**: Built with Next.js for optimal loading and SEO
- **Bilingual Support**: Ready for Hebrew/English language switching (RTL support)
- **Accessible**: WCAG compliant with semantic HTML and ARIA labels

## Tech Stack

- **Framework**: Next.js 15.5.5 (App Router)
- **UI Library**: React 19.2.0
- **Language**: TypeScript 5.9.3
- **Styling**: Tailwind CSS 4.1.14
- **Animations**: Framer Motion 12.23.24 + GSAP 3.13.0
- **Components**: Radix UI (headless components)
- **Icons**: Lucide React
- **Form Validation**: Zod

## Project Structure

```
tiltan-refresh/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   └── Textarea.tsx
│   ├── layout/            # Layout components
│   │   ├── Navigation.tsx
│   │   └── Footer.tsx
│   └── sections/          # Page sections
│       ├── Hero.tsx
│       ├── Programs.tsx
│       ├── About.tsx
│       ├── Gallery.tsx
│       └── Contact.tsx
├── lib/                   # Utilities
│   └── utils.ts
├── public/               # Static assets
│   └── images/
└── [config files]

```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.local.example .env.local
   ```
   Then edit `.env.local` with your configuration.

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3001](http://localhost:3001)

### Build for Production

```bash
npm run build
npm start
```

## Customization

### Colors

Edit the CSS variables in `app/globals.css` to customize the color scheme:

```css
:root {
  --accent: 142 76% 36%;  /* Green accent color */
  --primary: 0 0% 9%;     /* Primary dark color */
  /* ... */
}
```

### Animations

Animations are configured in `tailwind.config.ts` and can be customized:

```typescript
animation: {
  'fade-in': 'fadeIn 0.6s ease-out',
  'slide-up': 'slideUp 0.8s ease-out',
}
```

### Content

Update program information, contact details, and other content directly in the component files under `components/sections/`.

## Sections

1. **Hero**: Full-screen intro with animated canvas background
2. **Programs**: Interactive grid showcasing all 9 design programs
3. **About**: Timeline, features, and statistics about Tiltan
4. **Gallery**: Filterable student work showcase
5. **Contact**: Form with validation and contact information

## Performance

- **Lighthouse Score**: 95+ (target)
- **Image Optimization**: Next.js Image component with lazy loading
- **Code Splitting**: Automatic code splitting with Next.js
- **Font Optimization**: Google Fonts with `next/font`

## Accessibility

- Semantic HTML elements
- ARIA labels for screen readers
- Keyboard navigation support
- Focus states on interactive elements
- High contrast color ratios

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Configure environment variables
4. Deploy!

### Other Platforms

The site can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Digital Ocean
- Self-hosted

## Future Enhancements

- [ ] Add Hebrew language support with i18n
- [ ] Integrate CMS for easy content management
- [ ] Add blog section for news and articles
- [ ] Implement student portal login
- [ ] Add 3D elements with Three.js/React Three Fiber
- [ ] Integrate application form with backend
- [ ] Add virtual campus tour

## License

© 2024 Tiltan College of Design. All rights reserved.

## Support

For questions or support, contact:
- Email: info@tiltan.co.il
- Phone: +972-4-XXX-XXXX

---

Built with by Claude Code
