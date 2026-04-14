import type { Meeting } from '../../types'

export const meeting07: Meeting = {
  id: '7',
  number: 7,
  title: 'Typography and Grids',
  description:
    'Fundamentals of typography: font anatomy, selecting and pairing typefaces, typographic scale. Modular grids: the 8px system, 12-column grids, responsive breakpoints, and real-world examples from Apple, Google, and Microsoft design systems.',
  icon: 'Type',
  color: 'bg-pink-500/10 text-pink-600',
  parts: [
    // =============================================
    // PART 1 — Typography (45 min)
    // =============================================
    {
      id: 'part-1',
      title: 'Typography',
      subtitle:
        'Font anatomy, classification, pairing typefaces, typographic scale, and web fonts',
      duration: '45 min',
      sections: [
        // === INTRODUCTION ===
        {
          type: 'heading' as const,
          content: 'Why designers need to understand typography',
        },
        {
          type: 'text' as const,
          content:
            'Text accounts for **up to 95% of content** on the web. Typography is not just about choosing a "pretty font." It is a system of visual communication that determines how easily a user can read, understand, and remember information. Poor typography can ruin even the most thoughtfully designed UX.',
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'The 95% rule: if 95% of your interface is text, then 95% of your design is typography. Master it, and the quality of your projects will improve dramatically.',
        },
        {
          type: 'quote' as const,
          text: 'Typography is what language looks like.',
          author: 'Ellen Lupton',
          role: 'Author of "Thinking with Type"',
        },
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=QrNi9FmdlxY',
          title: 'Typography fundamentals for web design',
          caption:
            'Introduction to typography: why a font is the voice of your product',
        },
        {
          type: 'divider' as const,
        },

        // === FONT ANATOMY ===
        {
          type: 'heading' as const,
          content: 'Font anatomy',
        },
        {
          type: 'text' as const,
          content:
            'Before choosing fonts, you need to understand their structure. Every character is made up of many elements, and knowing these elements helps you make informed typeface choices and spot typographic issues.',
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            {
              term: 'Baseline',
              definition:
                'The invisible line on which letters "sit." All characters are aligned to this line.',
            },
            {
              term: 'X-height',
              definition:
                'The height of the lowercase letter "x." It affects readability — the taller the x-height, the more legible the font is at small sizes.',
            },
            {
              term: 'Ascender',
              definition:
                'The part of a letter that extends above the x-height (e.g., "b," "d," "h").',
            },
            {
              term: 'Descender',
              definition:
                'The part of a letter that drops below the baseline (e.g., "g," "p," "y").',
            },
            {
              term: 'Cap height',
              definition: 'The height of uppercase letters from the baseline to the top edge.',
            },
            {
              term: 'Serif',
              definition:
                'A small stroke or flare at the ends of a letter\'s main strokes.',
            },
            {
              term: 'Kerning',
              definition:
                'The spacing between a specific pair of characters. Poor kerning creates visual "holes" or "collisions" in text.',
            },
            {
              term: 'Leading',
              definition:
                'The distance between the baselines of adjacent lines. In CSS this is line-height.',
            },
            {
              term: 'Tracking',
              definition:
                'Uniform adjustment of spacing between all characters in a word or block. In CSS this is letter-spacing.',
            },
          ],
        },
        {
          type: 'diagram' as const,
          title: 'Anatomy of the word "Typography"',
          description:
            'Key metrics and elements that define the structure of any font',
          items: [
            'Cap height — the top boundary of uppercase letters',
            'X-height — the height of lowercase letters (excluding extenders)',
            'Baseline — the line on which letters sit',
            'Ascender line — the upper boundary of ascending elements',
            'Descender line — the lower boundary of descending elements',
            'Counter — the enclosed space inside a letter (o, e, d)',
            'Stem — the main vertical stroke of a letter',
            'Bowl — the rounded part of a letter (b, d, p)',
            'Serif — the decorative stroke at the ends of letter strokes',
          ],
        },
        {
          type: 'image' as const,
          src: '/images/meeting-07-font-anatomy.webp',
          alt: 'Font anatomy diagram: baseline, x-height, ascenders, descenders, serifs',
          caption:
            'Visual guide to font anatomy — memorize these terms',
        },
        {
          type: 'divider' as const,
        },

        // === FONT CLASSIFICATION ===
        {
          type: 'heading' as const,
          content: 'Font classification',
        },
        {
          type: 'text' as const,
          content:
            'All fonts fall into several main categories. Each category carries its own character, mood, and is better suited to certain tasks.',
        },
        {
          type: 'comparison' as const,
          title: 'Serif vs Sans-serif vs Monospace',
          items: [
            {
              label: 'Strokes',
              ux: 'Serif: has serifs (Times New Roman, Georgia, Playfair Display)',
              ui: 'Sans-serif: no serifs (Inter, Roboto, Helvetica)',
            },
            {
              label: 'Character',
              ux: 'Serif: classic, elegant, authoritative, traditional',
              ui: 'Sans-serif: modern, clean, minimalist',
            },
            {
              label: 'Best for',
              ux: 'Serif: long-form text (books, articles), premium branding',
              ui: 'Sans-serif: interfaces, mobile apps, dashboards',
            },
            {
              label: 'On-screen readability',
              ux: 'Serif: good at large sizes, worse on small screens',
              ui: 'Sans-serif: excellent at any size and resolution',
            },
            {
              label: 'Monospace',
              ux: 'All characters are the same width (Fira Code, JetBrains Mono)',
              ui: 'Ideal for code, numeric tables, terminals',
            },
          ],
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'Serif (with serifs)',
              items: [
                'Times New Roman — a print classic',
                'Georgia — optimized for screens',
                'Playfair Display — elegant headings',
                'Merriweather — excellent on-screen readability',
                'Lora — soft, friendly style',
              ],
            },
            {
              title: 'Sans-serif (without serifs)',
              items: [
                'Inter — the standard for interfaces',
                'Roboto — Android and Material Design',
                'SF Pro — Apple (iOS, macOS)',
                'Helvetica Neue — a timeless classic',
                'Open Sans — a versatile web font',
              ],
            },
            {
              title: 'Monospace',
              items: [
                'JetBrains Mono — popular among developers',
                'Fira Code — ligatures for code',
                'Source Code Pro — Adobe, great readability',
                'Cascadia Code — Microsoft, VS Code',
                'IBM Plex Mono — strict, technical style',
              ],
            },
          ],
        },
        {
          type: 'callout' as const,
          variant: 'example' as const,
          content:
            'Additional categories: **Display/Decorative** — for large headings and logos (Lobster, Pacifico). **Handwritten** — script fonts for accents (Caveat, Dancing Script). Use them very sparingly in interfaces and only for decoration!',
        },
        {
          type: 'divider' as const,
        },

        // === FONT PAIRING RULES ===
        {
          type: 'heading' as const,
          content: 'Rules for pairing typefaces',
        },
        {
          type: 'text' as const,
          content:
            'One of the most challenging skills in typography is choosing two fonts that work well together. A good pair creates contrast and hierarchy; a bad one creates chaos and visual noise.',
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            {
              term: 'The two-font rule',
              definition:
                'For most projects, two fonts are enough: one for headings, one for body text. Three is the absolute maximum.',
            },
            {
              term: 'Contrast, not conflict',
              definition:
                'Fonts should differ but not clash. Serif + Sans-serif is a classic, reliable pairing.',
            },
            {
              term: 'Matching x-height',
              definition:
                'When combining fonts, choose pairs with a similar x-height so the text looks harmonious.',
            },
            {
              term: 'One family, different weights',
              definition:
                'The safest approach: use one font with Bold for headings and Regular for body text (e.g., Inter Bold + Inter Regular).',
            },
          ],
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'Effective pairings',
              items: [
                'Playfair Display + Source Sans Pro — classic + modern',
                'Montserrat + Merriweather — geometric + soft',
                'Roboto + Roboto Slab — same style, different character',
                'Oswald + Lato — expressive + neutral',
                'Inter + Playfair Display — interface with elegant accents',
              ],
            },
            {
              title: 'Poor pairings',
              items: [
                'Times New Roman + Georgia — too similar, no contrast',
                'Comic Sans + Papyrus — both decorative, they clash',
                'Lobster + Pacifico — two "loud" fonts',
                'Arial + Helvetica — impossible to tell apart',
                '5+ different fonts on one page — visual chaos',
              ],
            },
          ],
        },
        {
          type: 'before-after' as const,
          title: 'Font pairing',
          before: {
            label: 'Poor',
            description:
              'Heading: Comic Sans MS, Body: Papyrus, Captions: Lobster. Three decorative fonts that clash with each other. No hierarchy, the text is hard to read, and it looks unprofessional.',
          },
          after: {
            label: 'Good',
            description:
              'Heading: Playfair Display Bold, Body: Source Sans Pro Regular. Two fonts with clear contrast — serif for emphasis, sans-serif for readability. Clear hierarchy, professional appearance.',
          },
        },
        {
          type: 'divider' as const,
        },

        // === TYPE SCALE ===
        {
          type: 'heading' as const,
          content: 'Typographic scale (Type Scale)',
        },
        {
          type: 'text' as const,
          content:
            'A typographic scale is a **system of font sizes** based on a mathematical ratio. Instead of arbitrary sizes (13px, 17px, 21px), it uses a sequence where each subsequent size is multiplied by a specific factor.',
        },
        {
          type: 'diagram' as const,
          title: 'Modular typographic scale (ratio 1.250 — Major Third)',
          description:
            'Each size = previous size x 1.250. Base size: 16px',
          items: [
            'xs: 12px (0.75rem) — meta information, captions',
            'sm: 14px (0.875rem) — helper text, form labels',
            'base: 16px (1rem) — body text, paragraphs',
            'lg: 20px (1.25rem) — subheadings, emphasized text',
            'xl: 25px (1.563rem) — section headings (H3)',
            '2xl: 31px (1.953rem) — page headings (H2)',
            '3xl: 39px (2.441rem) — large headings (H1)',
            '4xl: 49px (3.052rem) — hero sections, promo blocks',
          ],
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'Popular scale ratios: **1.067** (Minor Second) — minimal contrast, **1.200** (Minor Third) — gentle, **1.250** (Major Third) — balanced, **1.333** (Perfect Fourth) — expressive, **1.618** (Golden Ratio) — maximum contrast. For interfaces, 1.200-1.333 is typically used.',
        },
        {
          type: 'text' as const,
          content:
            'The tool **typescale.com** lets you interactively configure a scale and copy the CSS. In Tailwind CSS, the scale is already built in: text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, and so on.',
        },
        {
          type: 'divider' as const,
        },

        // === LINE HEIGHT AND SPACING ===
        {
          type: 'subheading' as const,
          content: 'Line height (Leading)',
        },
        {
          type: 'text' as const,
          content:
            '**Line-height** is the distance between the baselines of adjacent lines. Proper leading is critically important for the readability of long texts. Too tight and the lines merge together; too loose and the text "falls apart."',
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            {
              term: 'Body text: 1.5-1.75',
              definition:
                'For body paragraphs, the optimal line-height is 1.5-1.75 times the font size. For 16px, that is 24-28px.',
            },
            {
              term: 'Headings: 1.1-1.3',
              definition:
                'Large headings need tighter leading, otherwise the lines look disconnected.',
            },
            {
              term: 'Line length: 45-75 characters',
              definition:
                'The optimal line length for comfortable reading is 45-75 characters. Lines that are too long cause eye fatigue.',
            },
            {
              term: 'Letter-spacing for uppercase',
              definition:
                'UPPERCASE text needs increased letter-spacing (0.05-0.1em), otherwise the letters appear to "stick together."',
            },
          ],
        },
        {
          type: 'before-after' as const,
          title: 'Line-height in body text',
          before: {
            label: 'Poor: line-height 1.0',
            description:
              'Lines merge into each other, and the text looks like a solid wall. The eye gets lost when moving to the next line. Reading more than two sentences is physically uncomfortable.',
          },
          after: {
            label: 'Good: line-height 1.6',
            description:
              'There is enough breathing room between lines. The eye easily transitions from line to line. The text "breathes," and even long paragraphs are comfortable to read. A professional, polished look.',
          },
        },
        {
          type: 'before-after' as const,
          title: 'Line length',
          before: {
            label: 'Poor: 120+ characters per line',
            description:
              'Text stretches across the full screen width (1920px). The eye cannot track where the next line begins. The user loses their place and re-reads lines.',
          },
          after: {
            label: 'Good: 60-70 characters per line',
            description:
              'The text block is limited to max-width: 680px. Lines are of optimal length. The eye naturally moves to the next line. Reading becomes comfortable and fast.',
          },
        },
        {
          type: 'divider' as const,
        },

        // === WEB FONTS ===
        {
          type: 'heading' as const,
          content: 'Web fonts: loading and performance',
        },
        {
          type: 'text' as const,
          content:
            'On the web, fonts need to be loaded explicitly. There are several approaches, each with its own pros and cons for loading speed and user experience.',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'Google Fonts',
              items: [
                'Free, 1500+ fonts',
                'CDN — fast delivery',
                'Simple setup via <link> or @import',
                'Downside: dependency on an external service',
                'Downside: can block page rendering',
              ],
            },
            {
              title: 'Self-hosted (local)',
              items: [
                'Full control over loading',
                'No dependency on external CDNs',
                'Can use font-display: swap',
                'Optimal for performance',
                'In Next.js — next/font automates this',
              ],
            },
            {
              title: 'System Fonts',
              items: [
                'Instant loading — already on the device',
                'Zero weight — 0 KB of additional data',
                '-apple-system, BlinkMacSystemFont, Segoe UI...',
                'GitHub, Medium, Bootstrap use this approach',
                'Downside: different appearance on different OSes',
              ],
            },
          ],
        },
        {
          type: 'callout' as const,
          variant: 'warning' as const,
          content:
            'FOUT vs FOIT: **FOUT** (Flash of Unstyled Text) — text appears in a system font, then "jumps" when the web font loads. **FOIT** (Flash of Invisible Text) — text is invisible until the font loads. Use `font-display: swap` for the FOUT strategy — it is better for the user.',
        },
        {
          type: 'text' as const,
          content:
            'In **Next.js 15**, use `next/font` — it automatically downloads fonts at build time and serves them locally, with no requests to Google. This is the best solution for both performance and privacy.',
        },
        {
          type: 'divider' as const,
        },

        // === READABILITY vs LEGIBILITY ===
        {
          type: 'subheading' as const,
          content: 'Readability vs Legibility',
        },
        {
          type: 'text' as const,
          content:
            'Two terms that are often confused. **Legibility** refers to whether individual letters can be distinguished. **Readability** refers to whether blocks of text are comfortable to read. A font can be legible but unreadable (e.g., small size with tight line-height).',
        },
        {
          type: 'comparison' as const,
          title: 'Readability vs Legibility',
          items: [
            {
              label: 'Definition',
              ux: 'Legibility: how easily individual characters can be distinguished from one another',
              ui: 'Readability: how comfortably blocks of text can be read',
            },
            {
              label: 'What affects it',
              ux: 'Legibility: the font design itself, contrast, character size',
              ui: 'Readability: line-height, line length, font size, contrast',
            },
            {
              label: 'Example problem',
              ux: 'Legibility: a font where "l," "1," and "I" are indistinguishable',
              ui: 'Readability: 10px text, line-height 1.0 spanning the full screen width',
            },
            {
              label: 'How to test',
              ux: 'Legibility: the "Il1" test — can you tell these characters apart?',
              ui: 'Readability: can you read a 5-line paragraph without straining?',
            },
          ],
        },
        {
          type: 'divider' as const,
        },

        // === BEFORE/AFTER: TYPOGRAPHY IN REAL PRODUCTS ===
        {
          type: 'heading' as const,
          content: 'Before and after: typography in real products',
        },
        {
          type: 'before-after' as const,
          title: 'Typography in a mobile app',
          before: {
            label: 'Poor',
            description:
              'Everything in one size (14px), one weight (Regular), no hierarchy. Headings are indistinguishable from body text. Buttons blend into the content. The user cannot tell what is most important on the screen.',
          },
          after: {
            label: 'Good',
            description:
              'Clear hierarchy: heading 24px Bold, subheading 18px Medium, body 16px Regular, metadata 12px in a muted color. The eye instantly reads the structure of the screen.',
          },
        },
        {
          type: 'before-after' as const,
          title: 'Typography in a dashboard',
          before: {
            label: 'Poor',
            description:
              'Numbers in the table are set in a proportional font — columns "jump." Table headers are styled the same as data. There is no visual separation between sections.',
          },
          after: {
            label: 'Good',
            description:
              'Numbers are set in a font with tabular figures (font-variant-numeric: tabular-nums). Table headers are uppercase, reduced in size, with increased letter-spacing. Sections are clearly separated by typographic hierarchy.',
          },
        },
        {
          type: 'before-after' as const,
          title: 'Typography on a SaaS landing page',
          before: {
            label: 'Poor',
            description:
              'The hero section heading is 18px, the same size as the body text. There is no visual "hook." The CTA button gets lost among the text. A Light weight on a light background produces low contrast.',
          },
          after: {
            label: 'Good',
            description:
              'Hero heading: 56px Bold, subtitle: 20px Regular in a muted color, CTA button: 18px Medium. A clear visual funnel: heading -> subtitle -> action.',
          },
        },
        {
          type: 'divider' as const,
        },

        // === CASE STUDY ===
        {
          type: 'case-study' as const,
          title: 'Airbnb typography rebrand',
          company: 'Airbnb',
          problem:
            'Airbnb used several different fonts across different platforms (web, iOS, Android). The visual identity was fragmented, and font loading was slowing down the site.',
          solution:
            'They created a custom font called **Cereal** (later updated) that works consistently across all platforms. A unified typographic system with a clear size scale.',
          result:
            'A consistent brand across all platforms. Reduced load times thanks to an optimized font. Improved readability on mobile devices.',
          steps: [
            {
              title: 'Audit of existing typography',
              description:
                'Conducted an inventory of all fonts across all platforms',
            },
            {
              title: 'Custom font development',
              description:
                'Created Cereal — a friendly, readable, multilingual font',
            },
            {
              title: 'Building a typographic system',
              description:
                'Defined a scale of 8 sizes with specific usage rules',
            },
            {
              title: 'Rollout across all platforms',
              description:
                'Phased transition: web -> iOS -> Android with quality control',
            },
          ],
        },
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=wJEBA_3ZPhQ',
          title: 'Typography in UI design: rules and examples',
          caption:
            'Practical typography tips for interfaces',
        },
        {
          type: 'divider' as const,
        },

        // === CHECKLIST ===
        {
          type: 'checklist' as const,
          title: 'Checklist: good typography in a product',
          items: [
            'No more than 2-3 fonts in the project',
            'Clear size hierarchy (type scale)',
            'Line-height of 1.5-1.75 for body text',
            'Line length of 45-75 characters',
            'Text-to-background contrast ratio of at least 4.5:1 (WCAG AA)',
            'Tabular figures for numbers in tables',
            'Letter-spacing for UPPERCASE text',
            'font-display: swap or next/font for web fonts',
            'A font pair with clear contrast (serif + sans-serif)',
            'Testing on real devices and screen sizes',
          ],
        },
      ],
      quiz: [
        {
          question: 'What is x-height in typography?',
          options: [
            { id: 'a', text: 'The height of uppercase letters' },
            {
              id: 'b',
              text: 'The height of the lowercase letter "x" — it determines the visual size of the font',
            },
            { id: 'c', text: 'The distance between lines of text' },
            { id: 'd', text: 'The width of the character "x" in pixels' },
          ],
          correctId: 'b',
          explanation:
            'X-height is the height of lowercase letters without ascenders or descenders. Fonts with a larger x-height appear bigger and more legible at the same pixel size.',
        },
        {
          question:
            'What is the optimal line-height for body text in an interface?',
          options: [
            { id: 'a', text: '1.0 — to keep the text compact' },
            { id: 'b', text: '1.5-1.75 — comfortable reading' },
            { id: 'c', text: '2.5-3.0 — maximum breathing room' },
            { id: 'd', text: 'Line-height does not matter for interfaces' },
          ],
          correctId: 'b',
          explanation:
            'A line-height of 1.5-1.75 ensures comfortable reading: lines neither merge together nor "fall apart." This is the WCAG standard for accessibility.',
        },
        {
          question: 'Which font pairing is the most effective combination?',
          options: [
            {
              id: 'a',
              text: 'Comic Sans + Papyrus — both decorative, creating contrast',
            },
            {
              id: 'b',
              text: 'Arial + Helvetica — similar fonts mean harmony',
            },
            {
              id: 'c',
              text: 'Playfair Display + Source Sans Pro — serif + sans-serif with contrast',
            },
            {
              id: 'd',
              text: 'Times New Roman + Georgia — both serif means consistency',
            },
          ],
          correctId: 'c',
          explanation:
            'A serif (for headings) + sans-serif (for body text) combination creates contrast and clear hierarchy. Two similar fonts from the same category do not provide enough contrast.',
        },
        {
          question: 'What is FOUT and how do you address it?',
          options: [
            {
              id: 'a',
              text: 'A font loading error — you need to add more fonts',
            },
            {
              id: 'b',
              text: 'Flash of Unstyled Text — the text "jumps" when the font loads. Solution: font-display: swap or next/font',
            },
            {
              id: 'c',
              text: 'A kerning issue — you need to increase letter-spacing',
            },
            {
              id: 'd',
              text: 'A CSS font conflict — you need to use !important',
            },
          ],
          correctId: 'b',
          explanation:
            'FOUT (Flash of Unstyled Text) — text initially renders in a system font, then "jumps" to the loaded web font. font-display: swap makes this predictable, while next/font eliminates the problem entirely.',
        },
      ],
    },

    // =============================================
    // PART 2 — Grids and Spacing (45 min)
    // =============================================
    {
      id: 'part-2',
      title: 'Grids and Spacing',
      subtitle:
        'Modular grids, the 8px system, the 12-column grid, responsive breakpoints, and design system examples',
      duration: '45 min',
      sections: [
        // === INTRODUCTION ===
        {
          type: 'heading' as const,
          content: 'Why grids matter in design',
        },
        {
          type: 'text' as const,
          content:
            'A grid is an **invisible structure** that organizes content on a page. Without a grid, elements are placed chaotically; with one, you create visual order, rhythm, and predictability. Grids are the foundation of any professional design.',
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'Grids do not limit creativity — they provide a **foundation**. Even breaking the grid only works when the grid exists in the first place.',
        },
        {
          type: 'quote' as const,
          text: 'The grid is like a musical staff for a musician. It does not hinder creativity; it helps you play in tune.',
          author: 'Josef Muller-Brockmann',
          role: 'Author of "Grid Systems in Graphic Design"',
        },
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=YqRZJmJA_SQ',
          title: 'Grids in web design: a complete guide',
          caption:
            'How modular grids create order in interfaces',
        },
        {
          type: 'divider' as const,
        },

        // === 8PX GRID SYSTEM ===
        {
          type: 'heading' as const,
          content: 'The 8px system (8-point Grid)',
        },
        {
          type: 'text' as const,
          content:
            'The 8px system is an approach where **all sizes and spacing are multiples of 8 pixels**. This creates visual rhythm and consistency. Why 8? Because 8 divides evenly by 2 and 4, providing flexibility, and most screen resolutions are multiples of 8.',
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            {
              term: 'Base unit: 8px',
              definition:
                'All padding, component sizes, and distances should be multiples of 8: 8, 16, 24, 32, 40, 48, 56, 64...',
            },
            {
              term: 'Tolerance: 4px',
              definition:
                'For small elements (icons, button padding), a 4px step is acceptable: 4, 8, 12, 16, 20, 24...',
            },
            {
              term: 'Soft grid vs Hard grid',
              definition:
                'Soft grid — elements are multiples of 8px but not locked to strict columns. Hard grid — a strict columnar structure.',
            },
            {
              term: 'Why not 10px?',
              definition:
                '10 does not divide evenly by 4, but 8 does. On screens with 2x and 3x density, 8px always produces whole numbers.',
            },
          ],
        },
        {
          type: 'diagram' as const,
          title: 'Spacing scale in the 8px system',
          description:
            'All values are multiples of 8 (with a 4px tolerance for small elements)',
          items: [
            '4px (0.25rem) — minimum gap, icon padding',
            '8px (0.5rem) — compact padding, gap between small elements',
            '16px (1rem) — standard card padding, gap in lists',
            '24px (1.5rem) — section padding, gap between groups',
            '32px (2rem) — spacing between sections',
            '48px (3rem) — container padding, gap between large blocks',
            '64px (4rem) — vertical rhythm between page sections',
            '96px (6rem) — hero section padding, large vertical spacing',
          ],
        },
        {
          type: 'before-after' as const,
          title: 'Spacing without a system vs with the 8px system',
          before: {
            label: 'Without a system',
            description:
              'Card padding: 13px, gap: 7px, section margin: 23px, button padding: 11px 19px. All values are arbitrary, with no rhythm. Each component "lives" by its own rules, and the design looks sloppy.',
          },
          after: {
            label: 'With the 8px system',
            description:
              'Card padding: 16px, gap: 8px, section margin: 24px, button padding: 12px 24px. All values are multiples of 4/8. Elements align with each other, creating visual rhythm and order.',
          },
        },
        {
          type: 'callout' as const,
          variant: 'example' as const,
          content:
            'Tailwind CSS already has a built-in 4px/8px system: p-1=4px, p-2=8px, p-3=12px, p-4=16px, p-6=24px, p-8=32px. This is not a coincidence — Tailwind was designed with the 8-point grid in mind!',
        },
        {
          type: 'divider' as const,
        },

        // === 12-COLUMN GRID ===
        {
          type: 'heading' as const,
          content: 'The 12-column grid',
        },
        {
          type: 'text' as const,
          content:
            'The 12-column grid is the **industry standard** in web design. The number 12 was chosen because it divides by 2, 3, 4, and 6 — giving maximum flexibility for content layout.',
        },
        {
          type: 'diagram' as const,
          title: '12-column grid layout variations',
          description:
            '12 columns can be combined in many ways',
          items: [
            '12 columns: [1][1][1][1][1][1][1][1][1][1][1][1] — rarely used',
            '6+6: [  6  ][  6  ] — two-column layout (50/50)',
            '4+8: [4 ][ 8      ] — sidebar + content',
            '3+9: [3][  9        ] — narrow sidebar + wide content',
            '4+4+4: [ 4 ][ 4 ][ 4 ] — three equal columns',
            '3+3+3+3: [3][3][3][3] — four equal columns',
            '2+8+2: [2][   8   ][2] — centered content with margins',
            '3+6+3: [3][ 6   ][3] — classic centered layout',
          ],
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            {
              term: 'Column',
              definition:
                'A vertical strip along which content is aligned. In a 12-column grid, there are 12 of them.',
            },
            {
              term: 'Gutter',
              definition:
                'The space between columns. Typically 16px, 24px, or 32px. It creates "air" between content.',
            },
            {
              term: 'Margin',
              definition:
                'The padding on the edges of the grid from the screen edge. On mobile: 16px, on desktop: 24-48px or auto (centering).',
            },
            {
              term: 'Container',
              definition:
                'The outer block containing the grid. It has a max-width (typically 1200px-1440px) and is centered on the page.',
            },
          ],
        },
        {
          type: 'text' as const,
          content:
            'In CSS, grids are implemented using **CSS Grid** or **Flexbox**. In Tailwind CSS: `grid grid-cols-12 gap-6` creates a 12-column grid with a 24px gap. Bootstrap, Material Design, and all major frameworks use a 12-column system.',
        },
        {
          type: 'image' as const,
          src: '/images/meeting-07-12col-grid.webp',
          alt: 'Visualization of a 12-column grid with gutters and margins on a desktop screen',
          caption:
            'The 12-column grid — the foundation of web design. Columns + Gutters + Margins.',
        },
        {
          type: 'divider' as const,
        },

        // === FIXED vs FLUID GRIDS ===
        {
          type: 'subheading' as const,
          content: 'Fixed vs Fluid grids',
        },
        {
          type: 'comparison' as const,
          title: 'Fixed Grid vs Fluid Grid',
          items: [
            {
              label: 'Width',
              ux: 'Fixed: columns have a fixed width in px',
              ui: 'Fluid: columns stretch as a % of the container',
            },
            {
              label: 'Behavior on resize',
              ux: 'Fixed: content does not change, horizontal scroll or empty space appears',
              ui: 'Fluid: content adapts smoothly to the screen width',
            },
            {
              label: 'When to use',
              ux: 'Fixed: desktop apps with a fixed window, email templates',
              ui: 'Fluid: responsive websites, mobile apps',
            },
            {
              label: 'Examples',
              ux: 'Fixed: email campaigns (600px), PDF reports',
              ui: 'Fluid: most modern websites, Tailwind grid',
            },
          ],
        },
        {
          type: 'divider' as const,
        },

        // === RESPONSIVE BREAKPOINTS ===
        {
          type: 'heading' as const,
          content: 'Responsive breakpoints',
        },
        {
          type: 'text' as const,
          content:
            'Breakpoints are the points at which a layout **restructures** for different screen sizes. Instead of creating a separate design for every device, we define 3-5 key transition points.',
        },
        {
          type: 'diagram' as const,
          title: 'Standard breakpoints (Tailwind CSS)',
          description:
            'Mobile-first approach: default styles for mobile, then scale up',
          items: [
            'sm: 640px — large phones, small tablets',
            'md: 768px — tablets in portrait orientation',
            'lg: 1024px — tablets in landscape, small laptops',
            'xl: 1280px — laptops, monitors',
            '2xl: 1536px — large monitors, ultra-wide',
          ],
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            {
              term: 'Mobile First',
              definition:
                'An approach where design starts with the mobile version and then expands for larger screens. This is the standard in 2024+.',
            },
            {
              term: 'Columns by breakpoint',
              definition:
                'Mobile: 4 columns (or 1 stack). Tablet: 8 columns. Desktop: 12 columns. Material Design uses this exact model.',
            },
            {
              term: 'Content-first breakpoints',
              definition:
                'Best practice is to set breakpoints where the content starts to "break," rather than tying them to specific devices.',
            },
          ],
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'Mobile (up to 640px)',
              items: [
                '4 columns or stack (everything stacked vertically)',
                'Margins: 16px',
                'Gutters: 16px',
                'Cards in 1 column',
                'Navigation — hamburger menu',
                'Slightly smaller fonts',
              ],
            },
            {
              title: 'Tablet (640-1024px)',
              items: [
                '8 columns',
                'Margins: 24px',
                'Gutters: 24px',
                'Cards in 2 columns',
                'Navigation — sidebar or tab bar',
                'More breathing room between elements',
              ],
            },
            {
              title: 'Desktop (1024px+)',
              items: [
                '12 columns',
                'Margins: auto (centering) or 48px',
                'Gutters: 24-32px',
                'Cards in 3-4 columns',
                'Navigation — horizontal menu',
                'Container max-width: 1200-1440px',
              ],
            },
          ],
        },
        {
          type: 'before-after' as const,
          title: 'Responsiveness: without breakpoints vs with breakpoints',
          before: {
            label: 'Without responsiveness',
            description:
              'The desktop version is shown on mobile: tiny text, tiny buttons, horizontal scrolling. The user zooms and scrolls in every direction. Mobile conversion is close to zero.',
          },
          after: {
            label: 'With responsive breakpoints',
            description:
              'On mobile: cards in 1 column, full-width buttons, comfortable text size. On tablet: 2 columns. On desktop: 3-4 columns with a sidebar. Each screen size is optimized.',
          },
        },
        {
          type: 'divider' as const,
        },

        // === GUTTERS AND MARGINS ===
        {
          type: 'subheading' as const,
          content: 'Gutters and Margins: breathing room in design',
        },
        {
          type: 'text' as const,
          content:
            'White space is not "empty space" — it is an **active design element**. Proper spacing creates visual hierarchy, groups related elements, and gives the eyes room to breathe.',
        },
        {
          type: 'callout' as const,
          variant: 'example' as const,
          content:
            '**Law of Proximity (Gestalt)**: elements placed closer together are perceived as a group. If the spacing between a heading and its text (8px) is smaller than the spacing before the next section (32px), the hierarchy is understood automatically.',
        },
        {
          type: 'before-after' as const,
          title: 'Grouping through spacing',
          before: {
            label: 'Poor: uniform spacing',
            description:
              'Heading — 16px — text — 16px — heading — 16px — text. All spacing is the same. It is unclear which heading belongs to which text. Visual hierarchy is absent.',
          },
          after: {
            label: 'Good: hierarchical spacing',
            description:
              'Heading — 8px — text — 32px — heading — 8px — text. Small spacing within a group, large spacing between groups. It is instantly clear what belongs to what.',
          },
        },
        {
          type: 'divider' as const,
        },

        // === CASE STUDY: DESIGN SYSTEMS ===
        {
          type: 'heading' as const,
          content: 'Grids in real-world design systems',
        },
        {
          type: 'case-study' as const,
          title: 'Material Design 3 (Google)',
          company: 'Google',
          problem:
            'A universal grid was needed that works across thousands of devices with different screen sizes — from watches to TVs.',
          solution:
            'An adaptive system with 4/8/12 columns. Mobile: 4 columns, margins 16px. Tablet: 8 columns, margins 24px. Desktop: 12 columns, margins 24px. All spacing is a multiple of 8px.',
          result:
            'A unified system that works across Gmail, Google Maps, YouTube, Android, and thousands of apps. Designers and developers speak the same language.',
          steps: [
            {
              title: 'Defining breakpoints',
              description:
                'Compact (up to 600px), Medium (600-840px), Expanded (840+)',
            },
            {
              title: 'Configuring columns',
              description:
                '4 -> 8 -> 12 columns with automatic switching',
            },
            {
              title: 'Spacing system',
              description: 'All margins and gutters are multiples of 8px',
            },
            {
              title: 'Component adaptation',
              description:
                'Each component knows how to behave at each breakpoint',
            },
          ],
        },
        {
          type: 'case-study' as const,
          title: 'Apple Human Interface Guidelines',
          company: 'Apple',
          problem:
            'The Apple ecosystem includes iPhone, iPad, Mac, Apple Watch, and Apple TV — a grid is needed for each form factor while maintaining a unified visual language.',
          solution:
            'Different grids for different devices but unified principles. iPhone: margins 16px, recommended content width. iPad: sidebar + content. Mac: flexible layout with min/max constraints.',
          result:
            'Every Apple app looks "native" on its device while maintaining the recognizable Apple style. The design system is used by millions of developers.',
          steps: [
            {
              title: 'Safe Areas',
              description:
                'Defined safe zones for content accounting for notch, Dynamic Island, and home indicator',
            },
            {
              title: 'Layout Margins',
              description:
                'Standard margins: 16px on iPhone, 20px on iPad, adaptive on Mac',
            },
            {
              title: 'Readable Content Guide',
              description:
                'Automatic text width restriction for comfortable reading on large screens',
            },
          ],
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            '**Microsoft Fluent Design** uses a similar approach: 8px grid, adaptive breakpoints, but with an emphasis on "depth" and "material." Three systems (Material, HIG, Fluent) represent three approaches to the same principles.',
        },
        {
          type: 'divider' as const,
        },

        // === BEFORE/AFTER: GRID ALIGNMENT ===
        {
          type: 'heading' as const,
          content: 'Before and after: grid alignment',
        },
        {
          type: 'before-after' as const,
          title: 'Product cards',
          before: {
            label: 'Without a grid',
            description:
              'Cards of varying widths, heights, and spacing. Images of different proportions. Text starts at different levels. "Buy" buttons jump up and down. The page looks like a chaotic flea market.',
          },
          after: {
            label: 'On a 12-column grid',
            description:
              'Each card occupies exactly 3 columns (4 per row). Uniform image height (aspect-ratio: 4/3). Text and buttons are baseline-aligned. A clean, professional look with clear rhythm.',
          },
        },
        {
          type: 'before-after' as const,
          title: 'Metrics dashboard',
          before: {
            label: 'Chaotic layout',
            description:
              'KPI cards are placed arbitrarily, with varying sizes, and charts are not aligned. The table overflows the container. The sidebar is a different width on different pages. Visual disorder.',
          },
          after: {
            label: '12-column grid + 8px system',
            description:
              'KPI cards: 3 columns each (4 per row). Charts: 6+6 or 8+4. Sidebar: fixed 3 columns. Table: 9 columns of content. All spacing is a multiple of 8px. The dashboard "breathes" and is easy to scan.',
          },
        },
        {
          type: 'before-after' as const,
          title: 'Registration form',
          before: {
            label: 'Without a grid',
            description:
              'Fields of varying widths, labels are not aligned, the button is off-center, spacing between fields is arbitrary (10px, 15px, 22px). The form looks hastily assembled.',
          },
          after: {
            label: 'With a grid',
            description:
              'Fields are aligned to a 6-column sub-grid (6 of 12 columns, centered). Uniform spacing between fields (16px). Labels are left-aligned. The button spans the full width of the form. Clean and professional.',
          },
        },
        {
          type: 'divider' as const,
        },

        // === PRACTICAL TIPS ===
        {
          type: 'subheading' as const,
          content: 'Practical tips for working with grids',
        },
        {
          type: 'text' as const,
          content:
            'Knowing grid theory is useless without the ability to apply it in practice. Here are specific recommendations you can use right away.',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'In Figma',
              items: [
                'Enable Layout Grid on the frame',
                '12 columns, Type: Stretch',
                'Gutter: 24px, Margin: auto or 48px',
                'Add a second 8x8px grid for vertical rhythm',
                'Use Auto Layout for components',
              ],
            },
            {
              title: 'In CSS / Tailwind',
              items: [
                'grid grid-cols-12 gap-6 — basic grid',
                'col-span-4, col-span-6, col-span-8 — column spans',
                'container mx-auto px-4 — container',
                'Responsive: grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
                'gap-4 (16px), gap-6 (24px), gap-8 (32px)',
              ],
            },
          ],
        },
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=7kVeCqQCxlk',
          title: 'CSS Grid Layout: a complete guide',
          caption:
            'How to implement a 12-column grid in CSS Grid',
        },
        {
          type: 'divider' as const,
        },

        // === CHECKLIST ===
        {
          type: 'checklist' as const,
          title: 'Checklist: grids and spacing in your project',
          items: [
            'A base unit is defined (4px or 8px)',
            'All spacing is a multiple of the base unit',
            'A 12-column grid is used (or a justified alternative)',
            'Gutters and margins are defined for each breakpoint',
            'At least 3 breakpoints: mobile, tablet, desktop',
            'Cards and components are aligned to columns',
            'Vertical rhythm is maintained (spacing scale)',
            'Container has a max-width and is centered',
            'Testing on real devices or in DevTools',
            'The grid is documented in the team design system',
          ],
        },
        {
          type: 'divider' as const,
        },

        // === SUMMARY ===
        {
          type: 'heading' as const,
          content: 'Summary: typography + grids = the foundation of design',
        },
        {
          type: 'text' as const,
          content:
            'Typography and grids are the **two pillars of visual design**. Typography determines how content is read. Grids determine how content is organized in space. Together, they create order, rhythm, and a professional appearance in any interface.',
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'Homework: open 3 of your favorite websites or apps and try to "see" their grid. How many columns? What spacing? Which fonts and what sizes? Use DevTools (F12 -> Elements) for analysis.',
        },
      ],
      quiz: [
        {
          question: 'Why is the base unit in the 8px system specifically 8, and not 10?',
          options: [
            { id: 'a', text: '8 is a nice-looking number' },
            {
              id: 'b',
              text: '8 divides evenly by 2 and 4, and screens with 2x and 3x density produce whole numbers',
            },
            { id: 'c', text: 'Apple patented the 10px system' },
            { id: 'd', text: 'CSS does not support values that are multiples of 10' },
          ],
          correctId: 'b',
          explanation:
            '8 divides evenly by 2 and 4, which is important for screens with double (2x) and triple (3x) pixel density. This ensures crisp rendering on all devices.',
        },
        {
          question: 'How many columns does the standard Material Design grid use on a mobile device?',
          options: [
            { id: 'a', text: '12 columns' },
            { id: 'b', text: '8 columns' },
            { id: 'c', text: '4 columns' },
            { id: 'd', text: '6 columns' },
          ],
          correctId: 'c',
          explanation:
            'Material Design uses 4 columns on mobile (Compact), 8 on tablets (Medium), and 12 on desktop (Expanded). This ensures an optimal layout for each form factor.',
        },
        {
          question:
            'What is a Gutter in the context of a grid?',
          options: [
            { id: 'a', text: 'The outer margin from the screen edge' },
            {
              id: 'b',
              text: 'The space between grid columns',
            },
            { id: 'c', text: 'The width of a single column' },
            { id: 'd', text: 'The maximum width of the container' },
          ],
          correctId: 'b',
          explanation:
            'A gutter is the space between grid columns. Margins are the spacing from the screen edges. A column is the column itself. A container is the outer wrapper with a max-width.',
        },
        {
          question:
            'Which approach to responsive design is the standard in 2024+?',
          options: [
            {
              id: 'a',
              text: 'Desktop First — start with desktop, then scale down',
            },
            {
              id: 'b',
              text: 'Mobile First — start with mobile, then scale up',
            },
            {
              id: 'c',
              text: 'Tablet First — start with tablet as the middle ground',
            },
            {
              id: 'd',
              text: 'There is no standard — every project is unique',
            },
          ],
          correctId: 'b',
          explanation:
            'Mobile First is the standard approach: default styles are written for mobile, and then expanded for larger screens via media queries (or Tailwind md:, lg:). This ensures better performance and UX on mobile devices.',
        },
      ],
    },
  ],
}
