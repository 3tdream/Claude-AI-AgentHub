# Tiltan Website - Quick Access

## 🌐 Live URLs

### Main Website
**Local**: [http://localhost:3001](http://localhost:3001)
**Network**: http://192.168.56.1:3001

### Demo Pages
**3D Logo Showcase**: [http://localhost:3001/demo-3d](http://localhost:3001/demo-3d)

---

## 🚀 Commands

### Development Server
```bash
cd "C:\Users\Ro050\OneDrive\שולחן העבודה\ai-projects\tiltan-refresh"
npm run dev
```
Server runs on: **http://localhost:3001**

### Build for Production
```bash
npm run build
npm start
```

### Stop Server
Press `Ctrl + C` in the terminal

---

## 📁 Project Location

```
C:\Users\Ro050\OneDrive\שולחן העבודה\ai-projects\tiltan-refresh
```

---

## 📖 Documentation Files

- **README.md** - Complete project documentation
- **QUICK_START.md** - How to run and customize
- **BUILD_NOTES.md** - Technical details and fixes
- **LOGO_GUIDE.md** - 2D SVG logo components
- **3D_LOGO_GUIDE.md** - 3D Three.js logo components
- **ACCESS.md** - This file (quick access)

---

## 🎨 Design Assets

### Logo Files
- **2D SVG Logos**: `components/ui/TiltanLogo.tsx`, `TiltanLogoMark.tsx`
- **3D Logos**: `components/ui/Tiltan3DLogo.tsx`, `Tiltan3DLogoSimple.tsx`
- **Reference Image**: `public/images/clover-logo.jpg`

### Original Reference
- **Clover Image**: `C:\Users\Ro050\OneDrive\שולחן העבודה\ai-projects\tiltan-refresh\Logo\`

---

## 🔧 Tech Stack

- **Framework**: Next.js 15.5.5
- **React**: 19.2.0
- **TypeScript**: 5.9.3
- **Styling**: Tailwind CSS 3.4.18
- **Animations**: Framer Motion 12.23.24 + GSAP 3.13.0
- **3D Graphics**: Three.js 0.180.0 + React Three Fiber 9.4.0
- **Icons**: Lucide React 0.545.0

---

## 🎯 Quick Navigation

### Main Sections
1. **Hero** - `components/sections/Hero.tsx`
2. **Programs** - `components/sections/Programs.tsx`
3. **About** - `components/sections/About.tsx`
4. **Gallery** - `components/sections/Gallery.tsx`
5. **Contact** - `components/sections/Contact.tsx`

### UI Components
- `components/ui/` - Buttons, Cards, Badges, Inputs, Logos
- `components/layout/` - Navigation, Footer

---

## 📊 Current Status

✅ **Server Running**: Port 3001
✅ **All Features Built**: Complete
✅ **Logos Created**: 2D SVG + 3D Three.js
✅ **Mobile Responsive**: Yes
✅ **Dark Theme**: Active
✅ **Animations**: Working

---

## 🔥 Features Highlights

### Completed
- ✅ Dark minimalist design (Alche.studio inspired)
- ✅ Animated hero with particle canvas
- ✅ 9 design programs showcase
- ✅ Interactive student gallery
- ✅ Contact form with validation
- ✅ 2D geometric logo (T shape)
- ✅ 3D clover logo (realistic + geometric)
- ✅ Smooth scroll animations
- ✅ Mobile responsive navigation

### To Add
- ⏳ Hebrew language support (i18n)
- ⏳ Real student work images
- ⏳ Backend API for contact form
- ⏳ Blog/news section
- ⏳ Application form

---

## 🎬 Demo Walkthrough

1. **Homepage** (http://localhost:3001)
   - Animated hero with large logo
   - Stats showcase
   - Programs grid
   - About timeline
   - Student gallery
   - Contact form

2. **3D Demo** (http://localhost:3001/demo-3d)
   - Realistic clover 3D model
   - Geometric style variant
   - Interactive controls
   - Feature descriptions

---

## 💡 Usage Examples

### Start Development
```bash
npm run dev
# Opens on http://localhost:3001
```

### Add New Section
1. Create component in `components/sections/`
2. Import in `app/page.tsx`
3. Add to navigation in `components/layout/Navigation.tsx`

### Use 3D Logo
```tsx
import dynamic from "next/dynamic";

const Logo3D = dynamic(
  () => import("@/components/ui/Tiltan3DLogo"),
  { ssr: false }
);

<div className="w-full h-96">
  <Logo3D autoRotate={true} interactive={true} />
</div>
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3001
npx kill-port 3001

# Or use different port
npm run dev -- -p 3002
```

### 3D Logo Not Loading
- Check browser console
- Ensure dynamic import with `ssr: false`
- Verify WebGL support in browser

### Styles Not Applying
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

---

## 🌟 Inspiration

- **Design**: Alche.studio (https://alche.studio/)
- **Clover Logo**: Minimalistic 3D rendering
- **Color Scheme**: Dark theme with green accent

---

## 📞 Support

For issues or questions:
1. Check documentation files
2. Review browser console
3. Verify all dependencies installed

---

**Last Updated**: October 15, 2025
**Port**: 3001 (fixed)
**Status**: ✅ Production Ready

---

## Quick Links Summary

| Resource | URL |
|----------|-----|
| **Main Site** | http://localhost:3001 |
| **3D Demo** | http://localhost:3001/demo-3d |
| **Project Folder** | C:\Users\Ro050\OneDrive\שולחן העבודה\ai-projects\tiltan-refresh |
| **Lib Folder** | C:\Users\Ro050\OneDrive\שולחן העבודה\ai-projects\Lib |

---

Happy Coding! 🚀
