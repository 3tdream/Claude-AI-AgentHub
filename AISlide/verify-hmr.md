# Verify Hot Module Replacement (HMR)

## Quick Test
1. Start dev server: `npm run dev`
2. Open browser to http://localhost:3000
3. Edit any component (e.g., change text in `components/header.tsx`)
4. Save file
5. Browser should auto-update without manual refresh

## If HMR isn't working:

### 1. Clear build cache
```bash
rm -rf .next
npm run dev
```

### 2. Check for syntax errors
- Look at terminal for TypeScript/ESLint errors
- Fast Refresh will disable itself if there are errors

### 3. Ensure named exports
```tsx
// ✅ Good - Named export
export function MyComponent() { ... }

// ❌ Bad - Anonymous
export default () => { ... }
```

### 4. Check browser console
- Look for Fast Refresh warnings
- Open DevTools > Console while developing

### 5. Verify file watching (macOS)
```bash
# Check current limits
sysctl kern.maxfiles
sysctl kern.maxfilesperproc

# If too low, increase:
sudo sysctl -w kern.maxfiles=65536
sudo sysctl -w kern.maxfilesperproc=65536
```

## Force polling (last resort)
Add to `next.config.ts` if file watching fails:
```typescript
const nextConfig: NextConfig = {
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    }
    return config
  },
}
```
