# How to Update SlideRenderer.tsx

## Step 1: Add the SlideWrapper Component

After the `SlideRendererProps` interface (around line 8), add this new component:

```typescript
// Wrapper component for slides with custom backgrounds and images
interface SlideWrapperProps {
  children: React.ReactNode;
  defaultBg: string;
  slide: Slide;
}

function SlideWrapper({ children, defaultBg, slide }: SlideWrapperProps) {
  const backgroundStyle = slide.customBackground || defaultBg;
  
  return (
    <div className={`h-full relative overflow-hidden ${backgroundStyle}`}>
      {slide.slideImage && slide.imageStyle === 'background' && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${slide.slideImage})` }}
        />
      )}
      <div className="relative z-10 h-full">
        {children}
      </div>
      {slide.slideImage && slide.imageStyle === 'corner' && (
        <img 
          src={slide.slideImage} 
          alt="Slide visual"
          className="absolute bottom-8 right-8 w-64 h-64 object-cover rounded-2xl shadow-2xl z-20 border-4 border-white"
        />
      )}
      {slide.slideImage && slide.imageStyle === 'center' && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <img 
            src={slide.slideImage} 
            alt="Slide visual"
            className="max-w-md max-h-96 object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
```

## Step 2: Update Each Slide Case

For each slide type, you need to:
1. Wrap the outer div with `<SlideWrapper>`
2. Remove background-related classes from the outer div
3. Close the `</SlideWrapper>` at the end

### Example for Title Slide:

**BEFORE:**
```typescript
case 'title':
  return (
    <div className={`h-full flex flex-col items-center justify-center ${colorScheme.primary} text-white p-12 relative overflow-hidden`}>
      {/* content */}
    </div>
  );
```

**AFTER:**
```typescript
case 'title':
  return (
    <SlideWrapper slide={slide} defaultBg={`${colorScheme.primary} text-white`}>
      <div className="h-full flex flex-col items-center justify-center p-12">
        {/* content */}
      </div>
    </SlideWrapper>
  );
```

### Mappings for Each Slide Type:

- **title**: `defaultBg={`${colorScheme.primary} text-white`}`
- **problem**: `defaultBg="bg-gradient-to-br from-white to-gray-50"`
- **solution**: `defaultBg="bg-white"`
- **market**: `defaultBg={`${colorScheme.primary} text-white`}`
- **business**: `defaultBg="bg-gradient-to-br from-gray-50 to-white"`
- **traction**: `defaultBg="bg-white"`
- **team**: `defaultBg="bg-gradient-to-br from-white to-gray-50"`
- **ask**: `defaultBg={`${colorScheme.primary} text-white`}`

## Quick Reference

Replace the outer `<div className="h-full ...">` with `<SlideWrapper>` and move background classes to the `defaultBg` prop.
