# Tiltan College Website - Quick Start Guide

## Project Location
```
C:\Users\Ro050\OneDrive\שולחן העבודה\ai-projects\tiltan-refresh
```

## What's Been Built

A modern, immersive website for Tiltan College featuring:

### Design Features
- **Dark Mode Aesthetic**: Sleek black background with high-contrast white text and green accents
- **Smooth Animations**: Framer Motion-powered transitions and scroll effects
- **Particle Canvas**: Animated background in hero section
- **Interactive Components**: Hover effects, scale transforms, and smooth transitions
- **Mobile-First**: Fully responsive design that works on all devices

### Sections Implemented

1. **Hero Section** (`components/sections/Hero.tsx`)
   - Full-screen intro with animated particle background
   - Large impactful typography
   - Stats showcase (30+ years, 5000+ alumni, etc.)
   - Smooth scroll indicator

2. **Programs Section** (`components/sections/Programs.tsx`)
   - Interactive grid of 9 design programs
   - Color-coded cards with icons
   - Badges for duration and certification level
   - Hover animations

3. **About Section** (`components/sections/About.tsx`)
   - Feature cards (excellence, industry experts, accreditation, etc.)
   - Visual timeline of milestones (1994-2024)
   - Stats banner with gradient background
   - Parallax scroll effects

4. **Gallery Section** (`components/sections/Gallery.tsx`)
   - Filterable student work showcase
   - Category filters (Graphic Design, Interior, 3D, Animation, Game Dev)
   - Hover overlays showing project details
   - Color-coded gradient placeholders

5. **Contact Section** (`components/sections/Contact.tsx`)
   - Multi-field form with validation
   - Contact information cards (address, phone, email)
   - Open day registration CTA
   - Form submission ready

### UI Components Library

Located in `components/ui/`:
- **Button**: Multiple variants (default, accent, outline, ghost, link)
- **Card**: Flexible card system with header, content, footer
- **Badge**: Labels and tags for categories
- **Input**: Styled form inputs
- **Textarea**: Multi-line text inputs

### Layout Components

- **Navigation** (`components/layout/Navigation.tsx`)
  - Sticky header with blur backdrop
  - Smooth anchor scrolling
  - Mobile menu with hamburger icon
  - Logo and CTA button

- **Footer** (`components/layout/Footer.tsx`)
  - Multi-column layout
  - Quick links, contact info, social media
  - Responsive grid design

## Running the Project

### Development Server

The server is currently running at:
- **Local**: http://localhost:3001
- **Network**: http://192.168.56.1:3001

To start it manually in the future:
```bash
cd "C:\Users\Ro050\OneDrive\שולחן העבודה\ai-projects\tiltan-refresh"
npm run dev
```

**Note**: If port 3000 is in use, Next.js will automatically use the next available port (3001, 3002, etc.)

### Build for Production
```bash
npm run build
npm start
```

## Tech Stack

- **Framework**: Next.js 15.5.5 (App Router)
- **React**: 19.2.0
- **TypeScript**: 5.9.3
- **Styling**: Tailwind CSS 3.4.18
- **Animations**: Framer Motion 12.23.24 + GSAP 3.13.0
- **Icons**: Lucide React 0.545.0
- **Components**: Radix UI (headless accessible components)

## Project Structure

```
tiltan-refresh/
├── app/
│   ├── layout.tsx          # Root layout with fonts and metadata
│   ├── page.tsx            # Home page composition
│   └── globals.css         # Global styles and CSS variables
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── layout/             # Navigation and Footer
│   └── sections/           # Page sections (Hero, Programs, etc.)
├── lib/
│   └── utils.ts            # Utility functions (cn, scrolling, etc.)
├── public/
│   └── images/             # Static assets
├── tailwind.config.ts      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies

```

## Color Palette

The site uses a dark theme with:
- **Background**: Black (#0a0a0a)
- **Foreground**: White (#fafafa)
- **Accent**: Green (#22c55e) - represents creativity and growth
- **Muted**: Grays for secondary text

Edit these in `app/globals.css` under `:root` and `.dark`.

## Customization Guide

### Change Colors
Edit CSS variables in `app/globals.css`:
```css
:root {
  --accent: 142 76% 36%;  /* HSL for green */
}
```

### Update Content
- **Programs**: Edit array in `components/sections/Programs.tsx`
- **About Features**: Edit features array in `components/sections/About.tsx`
- **Contact Info**: Update in `components/sections/Contact.tsx` and `components/layout/Footer.tsx`

### Add New Sections
Create new component in `components/sections/` and import in `app/page.tsx`

## Next Steps / Future Enhancements

### Priority Items
1. **Add Real Images**: Replace placeholder gradients with actual photos
   - Student work samples
   - Campus photos
   - Faculty images

2. **Implement i18n**: Add Hebrew language support
   - Create `app/[locale]` directory structure
   - Add translation files
   - Update navigation for language switcher

3. **Connect Backend**: Wire up contact form
   - Set up API route in `app/api/contact/route.ts`
   - Integrate email service (SendGrid, Resend, etc.)
   - Add form validation with Zod

### Nice-to-Have Features
- Blog/News section with CMS (Contentful, Sanity)
- Student portal login
- Virtual campus tour with 3D elements (Three.js)
- Testimonials slider
- Application form integration
- Video backgrounds or reels
- Dark/light mode toggle
- Advanced animations with GSAP ScrollTrigger

## Deployment Options

### Vercel (Recommended)
1. Push code to GitHub
2. Import to Vercel
3. Auto-deploy on push

### Alternative Platforms
- Netlify
- AWS Amplify
- Digital Ocean
- Self-hosted with Docker

## Troubleshooting

### Port 3000 Already in Use
```bash
# Kill the process
npx kill-port 3000

# Or use a different port
npm run dev -- -p 3001
```

### TypeScript Errors
```bash
# Rebuild types
npm run build
```

### Styling Not Loading
Check that Tailwind is properly configured in `tailwind.config.ts` and imported in `app/globals.css`.

## Support & Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Framer Motion**: https://www.framer.com/motion/
- **Radix UI**: https://www.radix-ui.com/

## Notes

- The site is currently in English only (Hebrew i18n planned)
- All animations respect `prefers-reduced-motion`
- Forms are frontend-only (backend integration needed)
- Uses Next.js App Router (not Pages Router)
- Fully responsive and accessible

---

**Created**: October 15, 2025
**Built with**: Claude Code
**Contact**: info@tiltan.co.il

Happy coding!
