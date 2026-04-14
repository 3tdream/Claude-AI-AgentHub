import type { Meeting } from '../../types'

export const meeting08: Meeting = {
  id: '8',
  number: 8,
  title: 'Visual Hierarchy',
  description:
    'Principles of visual hierarchy: contrast, size, scanning patterns, Gestalt principles, icons, illustrations, and composition in interfaces.',
  icon: 'Eye',
  color: 'bg-orange-500/10 text-orange-600',
  parts: [
    // =============================================
    // PART 1: Contrast, Size, and Patterns
    // =============================================
    {
      id: 'part-1',
      title: 'Contrast, Size, and Patterns',
      subtitle: 'Principles of visual hierarchy, F/Z-patterns, and Gestalt principles',
      duration: '45 min',
      sections: [
        // === INTRODUCTION ===
        {
          type: 'heading' as const,
          content: 'What Is Visual Hierarchy',
        },
        {
          type: 'text' as const,
          content:
            'Every time you open a website or app, your brain decides where to look first in a **split second**. This is not random — it is the result of **visual hierarchy**. A designer controls the user\'s attention by arranging elements in order of importance using contrast, size, color, and placement.',
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'Visual hierarchy is a "roadmap" for the user\'s eyes. Without it, the interface turns into chaos where everything screams equally loud.',
        },
        {
          type: 'quote' as const,
          text: 'Design is not decoration. Design is communication.',
          author: 'Mike Monteiro',
          role: 'Author of "Design Is a Job"',
        },
        {
          type: 'image' as const,
          src: '/images/meeting-08-visual-hierarchy.webp',
          alt: 'Example: the same page with and without visual hierarchy',
          caption: 'Left — chaos without hierarchy. Right — a clearly structured interface.',
        },
        {
          type: 'divider' as const,
        },

        // === SIZE CONTRAST ===
        {
          type: 'heading' as const,
          content: 'Tool #1: Size Contrast',
        },
        {
          type: 'text' as const,
          content:
            '**Size** is the most powerful hierarchy tool. Larger elements attract attention first. A 48px heading always "shouts" louder than 14px body text. The difference between levels should be **noticeable** — at least a 1.5x difference for clear separation.',
        },
        {
          type: 'before-after' as const,
          title: 'Size contrast in headings',
          before: {
            label: 'No contrast',
            description:
              'Heading 18px, subheading 16px, body 15px — all elements are nearly the same size, the user cannot tell what is more important.',
          },
          after: {
            label: 'With contrast',
            description:
              'Heading 36px bold, subheading 20px medium, body 16px regular — three clear levels, the eye instantly reads the structure.',
          },
        },
        {
          type: 'callout' as const,
          variant: 'example' as const,
          content:
            'Apple.com is a master of size contrast. On the iPhone page, the heading "iPhone 16 Pro" takes up enormous space, while technical details are set in small type. You **first** see the name, **then** read the details.',
        },
        {
          type: 'divider' as const,
        },

        // === COLOR CONTRAST ===
        {
          type: 'heading' as const,
          content: 'Tool #2: Color Contrast',
        },
        {
          type: 'text' as const,
          content:
            '**Color** attracts attention instantly. A bright accent element on a neutral background immediately becomes the focal point. But color contrast works not only through brightness — **saturation** and **temperature** (warm vs cool) also create hierarchy.',
        },
        {
          type: 'before-after' as const,
          title: 'Color accent in a CTA button',
          before: {
            label: 'Weak contrast',
            description:
              'A gray "Buy" button on a gray background — it blends in with the surroundings, the user does not notice the call to action.',
          },
          after: {
            label: 'Strong contrast',
            description:
              'A bright blue "Buy" button on a white background — it instantly attracts the eye, conversion increases by 20-30%.',
          },
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            {
              term: 'Accent color',
              definition: 'A single bright color that highlights key actions (CTA, links, notifications).',
            },
            {
              term: 'Contrast ratio',
              definition: 'WCAG requires a minimum of 4.5:1 for text and 3:1 for large text (18px+). This is not just about accessibility — it is about readability.',
            },
            {
              term: 'Color temperature',
              definition: 'Warm colors (red, orange) appear closer and more active. Cool colors (blue, green) recede into the background.',
            },
          ],
        },
        {
          type: 'divider' as const,
        },

        // === WEIGHT AND SPACE CONTRAST ===
        {
          type: 'heading' as const,
          content: 'Tool #3: Weight and Whitespace Contrast',
        },
        {
          type: 'text' as const,
          content:
            'Font **weight** creates hierarchy without changing size. Bold, semibold, regular, light — four levels of text "loudness." And **whitespace** around an element increases its perceived importance: the more "air," the more important the element.',
        },
        {
          type: 'before-after' as const,
          title: 'Whitespace as a hierarchy tool',
          before: {
            label: 'Everything crammed together',
            description:
              'Heading, text, button, and image with no spacing — visual clutter, the eye does not know where to stop.',
          },
          after: {
            label: 'Generous spacing',
            description:
              'Heading with 48px top margin, text with 24px, button with 32px — each element "breathes," the hierarchy is obvious.',
          },
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'The Stripe designers\' rule: "When in doubt — add more whitespace." Space is a free resource that makes an interface feel premium.',
        },
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=286eSSiMGKg',
          title: 'Visual Hierarchy in Design — Juxtopposed',
          caption: 'A detailed breakdown of visual hierarchy tools with real product examples.',
        },
        {
          type: 'divider' as const,
        },

        // === F-PATTERN ===
        {
          type: 'heading' as const,
          content: 'F-Pattern and Z-Pattern: How Eyes Move',
        },
        {
          type: 'text' as const,
          content:
            '**Eye-tracking** research has shown that users scan pages in predictable patterns. The two main ones are the **F-pattern** for text-heavy pages and the **Z-pattern** for landing pages and advertisements.',
        },
        {
          type: 'subheading' as const,
          content: 'F-Pattern (text content)',
        },
        {
          type: 'text' as const,
          content:
            'When reading text-heavy pages (articles, search results), the eye moves in an **F** shape: a horizontal line at the top, a second horizontal line slightly below, then a vertical scan down the left edge. This means the **first words of each paragraph** are critically important — the user may not read a line to the end.',
        },
        {
          type: 'diagram' as const,
          title: 'F-pattern scanning',
          description: 'How the user\'s eyes move across a text page',
          items: [
            '-> Horizontal line at the top (heading, first line)',
            '-> Second horizontal line (subheading, start of second paragraph)',
            'v Vertical scan of the left edge (line beginnings, lists)',
            'x Bottom-right corner — "dead zone," the eye rarely reaches here',
          ],
        },
        {
          type: 'case-study' as const,
          title: 'F-Pattern in Google search results',
          company: 'Google',
          problem: 'How to arrange 10 search results so the user quickly finds the right one?',
          solution:
            'Google leverages the F-pattern: link headings (blue) form the first "horizontal," descriptions form the second, and the vertical scan lets users quickly skim all results.',
          result: 'Average time to click is under 8 seconds. Users scan 3-5 results within seconds.',
        },
        {
          type: 'subheading' as const,
          content: 'Z-Pattern (visual content)',
        },
        {
          type: 'text' as const,
          content:
            'On pages with minimal text (landing pages, ads, hero sections), the eye moves in a **Z** shape: top-left corner, top-right, diagonal down, bottom-left, bottom-right. This is why the **logo** goes in the top left and the **CTA button** in the bottom right.',
        },
        {
          type: 'before-after' as const,
          title: 'Landing page using the Z-pattern',
          before: {
            label: 'Against the pattern',
            description:
              'Logo in the bottom right, CTA button in the top left, heading in the center — the user is disoriented, conversion drops.',
          },
          after: {
            label: 'Following the Z-pattern',
            description:
              'Logo top-left -> navigation top-right -> heading center -> CTA button bottom-right — natural eye movement, conversion +35%.',
          },
        },
        {
          type: 'divider' as const,
        },

        // === GESTALT PRINCIPLES ===
        {
          type: 'heading' as const,
          content: 'Gestalt Principles of Perception',
        },
        {
          type: 'text' as const,
          content:
            '**Gestalt psychology** (from the German Gestalt — "form, shape") studies how the brain groups individual elements into coherent wholes. Designers use these principles to create intuitively understandable interfaces **without a single word of explanation**.',
        },
        {
          type: 'diagram' as const,
          title: 'Gestalt principles in interface design',
          description: 'Five key principles and how they work in UI',
          items: [
            'Proximity — elements placed close together are perceived as a group. Example: form fields with labels.',
            'Similarity — identical elements are perceived as related. Example: all buttons in the same style.',
            'Closure — the brain fills in missing parts. Example: the IBM logo made of stripes.',
            'Continuity — the eye follows lines and curves. Example: horizontal card scroll.',
            'Figure-Ground — the brain separates an object from its background. Example: a modal window over a dimmed background.',
          ],
        },
        {
          type: 'subheading' as const,
          content: 'Principle of Proximity',
        },
        {
          type: 'text' as const,
          content:
            'Elements placed **close to each other** are automatically perceived as a group. This is the most important Gestalt principle for UI: it determines which form fields belong to one block and which cards belong to one category.',
        },
        {
          type: 'before-after' as const,
          title: 'Proximity in a registration form',
          before: {
            label: 'Equal spacing',
            description:
              'All form fields (name, email, password, city, phone) are placed with equal 16px spacing — it is unclear that "Name + Email" are personal data and "Password" is security.',
          },
          after: {
            label: 'Grouping through spacing',
            description:
              '"Personal Data" group (name, email) with 8px between fields. 32px gap. "Security" group (password, confirmation). 32px gap. "Contacts" group (phone, city). The structure is obvious.',
          },
        },
        {
          type: 'subheading' as const,
          content: 'Principle of Similarity',
        },
        {
          type: 'text' as const,
          content:
            'Elements of the same **color, shape, or size** are perceived as related. In interfaces, this means: all clickable elements are the same color, all headings share the same style, all cards follow the same format.',
        },
        {
          type: 'before-after' as const,
          title: 'Similarity in product cards',
          before: {
            label: 'Mixed styles',
            description:
              'One card with a shadow, another with a border, a third with no frame. One with a round image, another with a square. The user does not perceive them as a unified catalog.',
          },
          after: {
            label: 'Consistent style',
            description:
              'All cards: white background, shadow-md, rounded-xl, 1:1 image, 18px semibold title, 24px bold price. Instantly reads as a catalog.',
          },
        },
        {
          type: 'subheading' as const,
          content: 'Figure-Ground Principle',
        },
        {
          type: 'text' as const,
          content:
            'The brain **automatically** separates an image into "figure" (the main object) and "ground." In UI this is critical for **modal windows**, **dropdown menus**, and **tooltips** — they must clearly "stand out" above the rest of the content.',
        },
        {
          type: 'before-after' as const,
          title: 'Figure-ground in a modal window',
          before: {
            label: 'Weak separation',
            description:
              'A modal window without a dimmed background, thin border — it blends with the page, the user does not realize it is layered above the main content.',
          },
          after: {
            label: 'Clear separation',
            description:
              'A modal window with a bg-black/50 backdrop, shadow-2xl, rounded-2xl — it instantly "pops" to the foreground, the background recedes.',
          },
        },
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=FQnmIm6lds4',
          title: 'Gestalt Principles for UI Design — DesignCourse',
          caption: 'Practical application of Gestalt principles in web design.',
        },
        {
          type: 'divider' as const,
        },

        // === CASE STUDIES ===
        {
          type: 'heading' as const,
          content: 'Case Studies: Visual Hierarchy in Real Products',
        },
        {
          type: 'case-study' as const,
          title: 'Airbnb — hierarchy in a listing card',
          company: 'Airbnb',
          problem: 'How to fit a photo, title, rating, price, and location into one card — without overwhelming the user?',
          solution:
            'Airbnb uses strict hierarchy: 1) photo (60% of the card) — attracts attention; 2) title — bold 16px; 3) rating — star + number; 4) distance — gray 14px; 5) price — bold 16px bottom-right.',
          result: 'The user reads key information in 2-3 seconds. Card conversion is 40% higher than competitors with "flat" listings.',
          steps: [
            { title: 'Photo', description: 'Takes up 60% of the card — the main "hook"' },
            { title: 'Title', description: 'Bold, short, directly below the photo' },
            { title: 'Metadata', description: 'Rating and distance — small gray text' },
            { title: 'Price', description: 'Bold, color-highlighted, in the bottom-right corner — Z-pattern' },
          ],
        },
        {
          type: 'case-study' as const,
          title: 'Notion — hierarchy through typography',
          company: 'Notion',
          problem: 'How to create a readable document without rigid visual frames and borders?',
          solution:
            'Notion relies on pure typography: H1 (40px bold) -> H2 (30px semibold) -> H3 (24px medium) -> body (16px regular). Hierarchy is created exclusively through font size and weight.',
          result: 'Notion became the documentation standard in IT. Users intuitively create structured documents thanks to the built-in visual hierarchy.',
        },
        {
          type: 'divider' as const,
        },

        // === CHECKLIST ===
        {
          type: 'checklist' as const,
          title: 'Checklist: visual hierarchy review',
          items: [
            'Is there one main element (focal point) on the page?',
            'Can you understand what the page is about within 5 seconds?',
            'Are heading sizes at least 1.5x larger than body text?',
            'Is the CTA button the most contrasting element on screen?',
            'Are elements grouped by meaning (proximity principle)?',
            'Do similar elements look the same (similarity principle)?',
            'Are there no more than 3-4 hierarchy levels on the page?',
          ],
        },
      ],
      quiz: [
        {
          question: 'Which scanning pattern is typical for text-heavy pages (articles, search results)?',
          options: [
            { id: 'a', text: 'Z-pattern' },
            { id: 'b', text: 'F-pattern' },
            { id: 'c', text: 'Circular pattern' },
            { id: 'd', text: 'Diagonal pattern' },
          ],
          correctId: 'b',
          explanation:
            'The F-pattern is characteristic of text content: two horizontal lines at the top and a vertical scan down the left edge. The Z-pattern is used for visual landing pages.',
        },
        {
          question: 'Which Gestalt principle explains why a modal window with a dimmed background is perceived as being "on top of" the page?',
          options: [
            { id: 'a', text: 'Proximity' },
            { id: 'b', text: 'Similarity' },
            { id: 'c', text: 'Figure-Ground' },
            { id: 'd', text: 'Closure' },
          ],
          correctId: 'c',
          explanation:
            'The figure-ground principle: the brain automatically separates an image into the main object (modal window) and the background (dimmed page). Dimming the background reinforces this effect.',
        },
        {
          question: 'What is the minimum text contrast ratio required by WCAG 2.1 Level AA for regular text?',
          options: [
            { id: 'a', text: '2:1' },
            { id: 'b', text: '3:1' },
            { id: 'c', text: '4.5:1' },
            { id: 'd', text: '7:1' },
          ],
          correctId: 'c',
          explanation:
            'WCAG 2.1 AA requires a minimum contrast ratio of 4.5:1 for regular text and 3:1 for large text (18px+ or 14px bold). Level AAA requires 7:1.',
        },
        {
          question: 'Why do Stripe designers recommend "when in doubt — add more whitespace"?',
          options: [
            { id: 'a', text: 'White space saves bandwidth' },
            { id: 'b', text: 'Space around an element increases its perceived importance and creates a premium feel' },
            { id: 'c', text: 'Users prefer empty pages' },
            { id: 'd', text: 'It reduces load time' },
          ],
          correctId: 'b',
          explanation:
            'Whitespace is a powerful visual hierarchy tool. Space around an element highlights it, creates "breathing room," and a sense of quality. Premium brands always use generous spacing.',
        },
      ],
    },

    // =============================================
    // PART 2: Icons, Illustrations, and Composition
    // =============================================
    {
      id: 'part-2',
      title: 'Icons, Illustrations, and Composition',
      subtitle: 'Icon systems, illustration styles, and composition principles in interfaces',
      duration: '45 min',
      sections: [
        // === INTRODUCTION ===
        {
          type: 'heading' as const,
          content: 'Icons in Interfaces: Small but Powerful',
        },
        {
          type: 'text' as const,
          content:
            'Icons are **visual shortcuts**. They save space, speed up recognition, and give the interface personality. But a bad icon is worse than no icon at all — it confuses the user and slows them down.',
        },
        {
          type: 'callout' as const,
          variant: 'warning' as const,
          content:
            'An icon without a label is only clear if it is **universally recognizable**: magnifying glass = search, trash can = delete, house = home. For everything else — always add a text label.',
        },
        {
          type: 'divider' as const,
        },

        // === ICON STYLES ===
        {
          type: 'heading' as const,
          content: 'Three Icon Styles: Line, Filled, Duotone',
        },
        {
          type: 'text' as const,
          content:
            'Modern UI design distinguishes three main icon styles. Each style creates a different mood and is suited for different contexts. The key rule is to **never mix styles** within one interface.',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'Line (outline)',
              items: [
                'Thin lines without fill',
                'Light, airy feel',
                'Great for light themes',
                'Examples: Lucide, Feather, Phosphor Light',
                'Best for: SaaS, dashboards, minimalism',
              ],
            },
            {
              title: 'Filled (solid)',
              items: [
                'Solid shape fill',
                'Heavy, "weighty" icons',
                'Highly visible on bright backgrounds',
                'Examples: Material Filled, Font Awesome Solid',
                'Best for: mobile apps, navigation bars',
              ],
            },
            {
              title: 'Duotone (two-tone)',
              items: [
                'Two colors/shades in one icon',
                'Modern, stylish look',
                'Add depth and character',
                'Examples: Phosphor Duotone, Hero Icons',
                'Best for: landing pages, marketing, features',
              ],
            },
          ],
        },
        {
          type: 'before-after' as const,
          title: 'Mixing icon styles',
          before: {
            label: 'Mixed styles',
            description:
              'In navigation: "Home" — line, "Search" — filled, "Profile" — duotone, "Cart" — line with a different stroke width. Chaotic and unprofessional.',
          },
          after: {
            label: 'Consistent style',
            description:
              'All navigation icons — line, stroke-width 1.5, size 24px, color gray-600 (active: blue-600). A cohesive, professional look.',
          },
        },
        {
          type: 'divider' as const,
        },

        // === ICON CONSISTENCY ===
        {
          type: 'heading' as const,
          content: 'Icon Consistency: 5 Rules',
        },
        {
          type: 'text' as const,
          content:
            'Even after choosing a single style, you can still break consistency. Here are **5 rules** that guarantee your icons will look like a unified system rather than a random collection.',
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            {
              term: 'Uniform grid size',
              definition: 'All icons are drawn on the same grid (typically 24x24 or 20x20 px). Even if the visual size differs, the bounding box stays the same.',
            },
            {
              term: 'Consistent stroke width',
              definition: 'Stroke width of 1.5px or 2px for all icons. Mixing 1px and 3px icons destroys unity.',
            },
            {
              term: 'Uniform corner style',
              definition: 'If corners are rounded — all icons are rounded. If sharp — all sharp. Do not mix.',
            },
            {
              term: 'Optical balance',
              definition: 'Triangular icons (play) should be slightly larger than square ones (stop) so they appear the same size.',
            },
            {
              term: 'One library',
              definition: 'Use icons from a single set (Lucide, Phosphor, Material). Do not mix Font Awesome with Feather.',
            },
          ],
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'Lucide Icons is the recommended library for React projects. 1400+ icons, consistent style, tree-shakable, MIT license. Install: npm install lucide-react.',
        },
        {
          type: 'divider' as const,
        },

        // === ILLUSTRATIONS ===
        {
          type: 'heading' as const,
          content: 'Illustrations: When Icons Are Not Enough',
        },
        {
          type: 'text' as const,
          content:
            '**Illustrations** convey emotions, tell stories, and create brand identity. They appear on empty states, onboarding screens, error pages, and marketing pages. Unlike icons, illustrations are **unique** to the brand.',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'When to use icons',
              items: [
                'Navigation and actions (menus, buttons)',
                'Status and states (success, error)',
                'Lists and categories',
                'Inputs and forms',
                'When compactness is needed',
              ],
            },
            {
              title: 'When to use illustrations',
              items: [
                'Empty states',
                'Onboarding and tutorials',
                'Error pages (404, 500)',
                'Marketing landing pages',
                'When an emotional connection is needed',
              ],
            },
          ],
        },
        {
          type: 'case-study' as const,
          title: 'Slack — illustrations for emotional connection',
          company: 'Slack',
          problem: 'How to make a corporate messenger feel "human" and friendly?',
          solution:
            'Slack uses unique illustrations with soft lines, pastel colors, and "lively" characters. Every empty state is accompanied by an illustration with a positive message.',
          result: 'Slack became one of the most "loved" corporate tools. The illustrations are part of the brand, recognizable even without the logo.',
          steps: [
            { title: 'Empty channel', description: 'Illustration with a cheerful character + "This is the beginning of something wonderful"' },
            { title: 'No search results', description: 'A sad but cute character + a constructive hint' },
            { title: 'Onboarding', description: 'Step-by-step illustrations — each step with a unique character' },
          ],
        },
        {
          type: 'before-after' as const,
          title: 'Empty state: icon vs illustration',
          before: {
            label: 'Icon only',
            description:
              'A gray Inbox icon at 48px + "No messages" text — cold, formal, evokes no emotions.',
          },
          after: {
            label: 'With illustration',
            description:
              'A colorful illustration (person checking mail) + "All caught up! Time for coffee" — warm, friendly, memorable.',
          },
        },
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=pSGFKBBRWao',
          title: 'Icon Design — The Futur',
          caption: 'A masterclass on icon design: grid, consistency, optical balance.',
        },
        {
          type: 'divider' as const,
        },

        // === COMPOSITION ===
        {
          type: 'heading' as const,
          content: 'Composition: How to Arrange Elements Harmoniously',
        },
        {
          type: 'text' as const,
          content:
            '**Composition** is the art of arranging elements on a canvas (screen) to create a harmonious, balanced, and purposeful impression. In UI design, composition determines where the user looks and in what order.',
        },
        {
          type: 'subheading' as const,
          content: 'Rule of Thirds',
        },
        {
          type: 'text' as const,
          content:
            'Divide the screen into **9 equal parts** with two horizontal and two vertical lines. Place key elements at the **intersections** of these lines — these points naturally attract the eye. A hero image with text on the left at the 1/3 intersection is a classic landing page technique.',
        },
        {
          type: 'diagram' as const,
          title: 'Rule of Thirds in UI',
          description: 'Four "power points" at line intersections — ideal placement for key elements',
          items: [
            '┌───────┬───────┬───────┐',
            '│       │       │       │',
            '│   ●   │       │   ●   │  <- top points: logo, CTA',
            '├───────┼───────┼───────┤',
            '│       │       │       │',
            '├───────┼───────┼───────┤',
            '│   ●   │       │   ●   │  <- bottom points: navigation, price',
            '└───────┴───────┴───────┘',
          ],
        },
        {
          type: 'subheading' as const,
          content: 'Golden Ratio',
        },
        {
          type: 'text' as const,
          content:
            'The **golden ratio** (1:1.618) is a proportion found in nature and perceived as harmonious. In UI it is used to determine column ratios (e.g., content 62% + sidebar 38%), font sizes, and spacing.',
        },
        {
          type: 'callout' as const,
          variant: 'example' as const,
          content:
            'Twitter (X) uses the golden ratio in its desktop layout: main feed ~62%, trends sidebar ~38%. This creates a natural balance — content dominates, but the sidebar is not lost.',
        },
        {
          type: 'divider' as const,
        },

        // === VISUAL WEIGHT ===
        {
          type: 'heading' as const,
          content: 'Visual Weight and Balance',
        },
        {
          type: 'text' as const,
          content:
            'Every element on screen has a **visual weight** — a subjective "heaviness" determined by size, color, contrast, and density. A large dark block "weighs" more than a small light one. The designer\'s task is to **balance** these weights so the interface does not "tip" to one side.',
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            {
              term: 'Symmetrical balance',
              definition: 'Elements are mirrored along an axis. Creates a sense of stability and formality. Example: corporate websites, forms.',
            },
            {
              term: 'Asymmetrical balance',
              definition: 'Different elements counterbalance each other (large photo on the left + several text blocks on the right). Creates dynamics and interest.',
            },
            {
              term: 'Radial balance',
              definition: 'Elements radiate from a central point. Rare in UI, but used in dashboards with circular charts.',
            },
          ],
        },
        {
          type: 'before-after' as const,
          title: 'Balance in a landing page hero section',
          before: {
            label: 'Imbalance',
            description:
              'A huge photo on the left (70% width) + a small heading on the right (30%). The page "tips" to the left, the text gets lost.',
          },
          after: {
            label: 'Asymmetrical balance',
            description:
              'Photo on the left (55%) + large heading, subheading, and CTA button on the right (45%). The photo is "heavier," but three text elements compensate for its weight.',
          },
        },
        {
          type: 'divider' as const,
        },

        // === COMPOSITION — EXAMPLES ===
        {
          type: 'heading' as const,
          content: 'Composition in Real Products',
        },
        {
          type: 'case-study' as const,
          title: 'Spotify — playlist card composition',
          company: 'Spotify',
          problem: 'How to display hundreds of playlists so each one draws attention without overwhelming the user?',
          solution:
            'Spotify uses a grid with identical cards (similarity principle), horizontal scrolling (continuity principle), and large cover art with minimal text. Each row is a thematic group (proximity principle).',
          result: 'Users find the right playlist in seconds. Average session time is 26 minutes — one of the best metrics among streaming services.',
        },
        {
          type: 'before-after' as const,
          title: 'Dashboard composition',
          before: {
            label: 'No structure',
            description:
              'All widgets are the same size, placed in random order. Key metrics (revenue, users) get lost among secondary charts.',
          },
          after: {
            label: 'With visual hierarchy',
            description:
              'Main KPIs — large cards at the top (rule of thirds). Charts — middle block. Detailed tables — at the bottom. Z-pattern from KPIs to actions.',
          },
        },
        {
          type: 'case-study' as const,
          title: 'Apple — golden ratio in product design',
          company: 'Apple',
          problem: 'How to create a sense of perfection and harmony on every page of apple.com?',
          solution:
            'Apple applies the golden ratio in hero section proportions, typography sizing (heading/subheading ratio of approximately 1.618), and CTA button placement. Each section is a complete composition.',
          result: 'Apple.com is considered the gold standard of web design. Online sales conversion is among the highest in e-commerce ($394 billion revenue in 2022).',
        },
        {
          type: 'divider' as const,
        },

        // === PRACTICAL TIPS ===
        {
          type: 'heading' as const,
          content: 'Practical Composition Tips',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'Do',
              items: [
                'Define one focal point per screen',
                'Use a grid (8px or 4px base)',
                'Group related elements together',
                'Leave "breathing room" between groups',
                'Check balance by squinting your eyes',
              ],
            },
            {
              title: 'Avoid',
              items: [
                'Multiple competing focal points',
                'Chaotic layout without a grid',
                'Equal spacing everywhere',
                'Content-packed screens with no pauses',
                'Centering everything "just in case"',
              ],
            },
          ],
        },
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=a5KYlHNKQB8',
          title: 'Composition in Design — The Futur',
          caption: 'Composition principles by Chris Do: balance, contrast, rhythm, movement.',
        },
        {
          type: 'divider' as const,
        },

        // === FINAL CHECKLIST ===
        {
          type: 'heading' as const,
          content: 'Lesson Summary Checklist',
        },
        {
          type: 'checklist' as const,
          title: 'Visual hierarchy: what to check in your design',
          items: [
            'All icons are from a single library and style',
            'Unlabeled icons are only universally understood ones (magnifying glass, house, trash can)',
            'Illustrations are used for emotional moments (empty state, onboarding)',
            'The rule of thirds or golden ratio is applied to key screens',
            'Visual weight is balanced (does not "tip" to one side)',
            'There is a clear focal point on every screen',
            'A 4px or 8px grid is applied to all spacing',
          ],
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'The "squint test": squint while looking at your design. If you see blurred shapes of roughly the same size and brightness — there is no hierarchy. If one shape clearly dominates — the hierarchy works.',
        },
      ],
      quiz: [
        {
          question: 'Why should you not mix icon styles (line + filled + duotone) in one interface?',
          options: [
            { id: 'a', text: 'It increases the bundle size' },
            { id: 'b', text: 'It violates the similarity principle — icons stop being perceived as a unified system' },
            { id: 'c', text: 'Browsers do not support mixing' },
            { id: 'd', text: 'It is prohibited by icon licenses' },
          ],
          correctId: 'b',
          explanation:
            'The Gestalt principle of similarity: identical elements are perceived as related. If icons look different, the brain does not group them into a system, and the interface looks unprofessional.',
        },
        {
          question: 'When is it better to use an illustration instead of an icon?',
          options: [
            { id: 'a', text: 'In a navigation menu' },
            { id: 'b', text: 'On action buttons' },
            { id: 'c', text: 'On empty states and onboarding screens' },
            { id: 'd', text: 'In data tables' },
          ],
          correctId: 'c',
          explanation:
            'Illustrations create an emotional connection and work best in moments where the interface needs to feel "human": empty states, onboarding, error pages, marketing pages.',
        },
        {
          question: 'What is the "rule of thirds" in the context of UI design?',
          options: [
            { id: 'a', text: 'A maximum of three colors in the palette' },
            { id: 'b', text: 'The screen is divided into 9 parts, and key elements are placed at line intersections' },
            { id: 'c', text: 'Each element is repeated three times' },
            { id: 'd', text: 'A maximum of three navigation levels' },
          ],
          correctId: 'b',
          explanation:
            'The rule of thirds: the screen is divided by two horizontal and two vertical lines into 9 parts. The four intersection points are "power points" that naturally attract the eye.',
        },
      ],
    },
  ],
}
