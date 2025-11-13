const fs = require('fs');

let content = fs.readFileSync('components/SlideRenderer.tsx', 'utf8');

// Title slide
content = content.replace(
  /case 'title':\s*return \(\s*<div className={`h-full flex flex-col items-center justify-center \${colorScheme\.primary} text-white p-12 relative overflow-hidden`}>/,
  `case 'title':
      return (
        <SlideWrapper slide={slide} defaultBg={\`\${colorScheme.primary} text-white\`}>
          <div className="h-full flex flex-col items-center justify-center p-12">`
);

content = content.replace(
  /(<p className="text-xl opacity-80 font-light">{slide\.content}<\/p>\s*<\/div>\s*<\/div>\s*)\);(\s*case 'problem':)/,
  '$1</div>\n        </SlideWrapper>\n      );$2'
);

// Problem slide
content = content.replace(
  /case 'problem':\s*return \(\s*<div className="h-full bg-gradient-to-br from-white to-gray-50 p-12">/,
  `case 'problem':
      return (
        <SlideWrapper slide={slide} defaultBg="bg-gradient-to-br from-white to-gray-50">
          <div className="h-full p-12">`
);

content = content.replace(
  /(<\/div>\s*<\/div>\s*<\/div>\s*)\);(\s*case 'solution':)/,
  '$1</div>\n        </SlideWrapper>\n      );$2'
);

// Solution slide
content = content.replace(
  /case 'solution':\s*return \(\s*<div className="h-full bg-white p-12">/,
  `case 'solution':
      return (
        <SlideWrapper slide={slide} defaultBg="bg-white">
          <div className="h-full p-12">`
);

// Market slide
content = content.replace(
  /case 'market':\s*return \(\s*<div className={`h-full \${colorScheme\.primary} text-white p-12 flex flex-col justify-center relative overflow-hidden`}>/,
  `case 'market':
      return (
        <SlideWrapper slide={slide} defaultBg={\`\${colorScheme.primary} text-white\`}>
          <div className="h-full p-12 flex flex-col justify-center">`
);

// Business slide
content = content.replace(
  /case 'business':\s*return \(\s*<div className="h-full bg-gradient-to-br from-gray-50 to-white p-12">/,
  `case 'business':
      return (
        <SlideWrapper slide={slide} defaultBg="bg-gradient-to-br from-gray-50 to-white">
          <div className="h-full p-12">`
);

// Traction slide
content = content.replace(
  /case 'traction':\s*return \(\s*<div className="h-full bg-white p-12">/,
  `case 'traction':
      return (
        <SlideWrapper slide={slide} defaultBg="bg-white">
          <div className="h-full p-12">`
);

// Team slide
content = content.replace(
  /case 'team':\s*return \(\s*<div className="h-full bg-gradient-to-br from-white to-gray-50 p-12">/,
  `case 'team':
      return (
        <SlideWrapper slide={slide} defaultBg="bg-gradient-to-br from-white to-gray-50">
          <div className="h-full p-12">`
);

// Ask slide
content = content.replace(
  /case 'ask':\s*return \(\s*<div className={`h-full \${colorScheme\.primary} text-white p-12 flex flex-col justify-center relative overflow-hidden`}>/,
  `case 'ask':
      return (
        <SlideWrapper slide={slide} defaultBg={\`\${colorScheme.primary} text-white\`}>
          <div className="h-full p-12 flex flex-col justify-center">`
);

// Close all wrapper tags before the next case or default
const lines = content.split('\n');
const newLines = [];
let inCase = false;
let depth = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Close wrapper before next case or default
  if ((line.includes('case \'') && inCase && i > 0) || line.includes('default:')) {
    // Add closing wrapper before this line
    newLines.push('        </SlideWrapper>');
    depth = 0;
    inCase = false;
  }
  
  if (line.includes('SlideWrapper slide={slide}')) {
    inCase = true;
  }
  
  newLines.push(line);
}

fs.writeFileSync('components/SlideRenderer.tsx', newLines.join('\n'), 'utf8');
console.log('✓ Wrapped all slides with SlideWrapper');
