const fs = require('fs');

const slideWrapperCode = `// Wrapper component for slides with custom backgrounds and images
interface SlideWrapperProps {
  children: React.ReactNode;
  defaultBg: string;
  slide: Slide;
}

function SlideWrapper({ children, defaultBg, slide }: SlideWrapperProps) {
  const backgroundStyle = slide.customBackground || defaultBg;

  return (
    <div className={\`h-full relative overflow-hidden \${backgroundStyle}\`}>
      {slide.slideImage && slide.imageStyle === 'background' && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: \`url(\${slide.slideImage})\` }}
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

`;

const content = fs.readFileSync('components/SlideRenderer.tsx', 'utf8');
const updated = content.replace('export function SlideRenderer', slideWrapperCode + 'export function SlideRenderer');
fs.writeFileSync('components/SlideRenderer.tsx', updated, 'utf8');
console.log('✓ Added SlideWrapper component');
