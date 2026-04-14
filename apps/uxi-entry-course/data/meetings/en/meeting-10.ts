import type { Meeting } from '../../types'

export const meeting10: Meeting = {
  id: '10',
  number: 10,
  title: 'Prototyping',
  description:
    'Hi-fi prototypes with micro-interactions and animations in Figma, as well as design systems based on the Atomic Design methodology — from tokens to component libraries.',
  icon: 'Layers',
  color: 'bg-lime-500/10 text-lime-600',
  parts: [
    // ========================================
    // PART 1 — Interactive Prototypes
    // ========================================
    {
      id: 'part-1',
      title: 'Interactive Prototypes',
      subtitle:
        'Hi-fi prototypes, micro-interactions, animations, and prototyping tools',
      duration: '45 min',
      sections: [
        // === INTRODUCTION ===
        {
          type: 'heading' as const,
          content: 'Why Interactive Prototypes Matter',
        },
        {
          type: 'text' as const,
          content:
            'Static mockups show **what** the user sees, but not **how** they interact with the product. An interactive prototype is a clickable model of the interface that simulates real application behavior: transitions, animations, button states, and feedback.',
        },
        {
          type: 'text' as const,
          content:
            'Prototyping is the **bridge between design and development**. It allows you to test ideas with users, show stakeholders a living product, and give developers a precise understanding of interface behavior — all before writing a single line of code.',
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'A prototype is not the final product. Its purpose is to validate a hypothesis and gather feedback as quickly and cheaply as possible.',
        },
        {
          type: 'image' as const,
          src: '/images/meeting-10-prototype-fidelity.webp',
          alt: 'Prototype fidelity spectrum: from paper sketch to clickable hi-fi',
          caption:
            'Prototypes vary in fidelity — from paper sketches to near-finished applications',
        },
        {
          type: 'divider' as const,
        },

        // === FIDELITY LEVELS ===
        {
          type: 'heading' as const,
          content: 'Prototype Fidelity Levels',
        },
        {
          type: 'text' as const,
          content:
            'Prototypes are divided into **three fidelity levels**. The choice of level depends on the goal: lo-fi is sufficient for early stages, mid-fi is needed for usability tests, and hi-fi is required for stakeholder presentations and developer handoff.',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'Lo-fi (low fidelity)',
              items: [
                'Paper sketches or wireframes',
                'Black and white, no styling',
                'Focus on structure and flow',
                'Quick to create, easy to discard',
                'Ideal for brainstorming sessions',
              ],
            },
            {
              title: 'Mid-fi (medium fidelity)',
              items: [
                'Clickable wireframes',
                'Basic navigation works',
                'Real content, but no styling',
                'For usability testing',
                'Balsamiq, Figma wireframes',
              ],
            },
            {
              title: 'Hi-fi (high fidelity)',
              items: [
                'Pixel-perfect design with animations',
                'Real data and content',
                'Micro-interactions and transitions',
                'For stakeholders and development',
                'Figma, Principle, ProtoPie',
              ],
            },
          ],
        },
        {
          type: 'callout' as const,
          variant: 'warning' as const,
          content:
            'A common mistake is starting with a hi-fi prototype right away. It is expensive and time-consuming. Validate the structure with lo-fi first, then increase fidelity.',
        },
        {
          type: 'divider' as const,
        },

        // === MICRO-INTERACTIONS ===
        {
          type: 'heading' as const,
          content: 'Micro-interactions: The Details That Make All the Difference',
        },
        {
          type: 'text' as const,
          content:
            '**Micro-interactions** are small animated responses of the interface to user actions. They make the product feel alive, intuitive, and pleasant. Pressing a button, swiping a card, confirming a form submission — these are all micro-interactions.',
        },
        {
          type: 'text' as const,
          content:
            'Dan Saffer, author of the book "Microinteractions," identifies **4 components** of a micro-interaction: **Trigger** (what initiates it), **Rules** (what happens), **Feedback** (what the user sees), and **Loops/Modes** (how it changes over time).',
        },
        {
          type: 'diagram' as const,
          title: 'Anatomy of a Micro-interaction',
          description:
            '4 components based on Dan Saffer\'s model',
          items: [
            '1. Trigger \u2192 the user presses the "Submit" button',
            '2. Rules \u2192 the system validates data and sends a request',
            '3. Feedback \u2192 the button shows a spinner, then a checkmark',
            '4. Loops \u2192 on repeated submission, the button is disabled for 3 seconds',
          ],
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            {
              term: 'Trigger',
              definition:
                'An event that initiates a micro-interaction: click, swipe, hover, scroll, page load, or a system event',
            },
            {
              term: 'Feedback',
              definition:
                'A visual, auditory, or haptic response confirming the action: color change, animation, vibration',
            },
            {
              term: 'Affordance',
              definition:
                'A visual cue that tells the user an element is interactive: a shadow on a button, an underline on a link',
            },
          ],
        },
        {
          type: 'before-after' as const,
          title: '"Add to Cart" Button',
          before: {
            label: 'Without micro-interaction',
            description:
              'The user presses the button — nothing happens visually. They are unsure whether the item was added and press again. The cart now contains 3 identical items.',
          },
          after: {
            label: 'With micro-interaction',
            description:
              'On press, the button shrinks (scale: 0.95), changes color to green, shows a checkmark with animation, and the cart counter increases with a bounce effect. The user is confident: the item has been added.',
          },
        },
        {
          type: 'divider' as const,
        },

        // === ANIMATION PRINCIPLES ===
        {
          type: 'heading' as const,
          content: 'Animation Principles in Interfaces',
        },
        {
          type: 'text' as const,
          content:
            'Animation in UI is not decoration — it is a **functional tool**. It helps the user understand what happened, where an element moved, and what to do next. But bad animation is worse than no animation at all.',
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            {
              term: 'Easing',
              definition:
                'A function that determines animation speed over time. ease-out — fast start, smooth deceleration (for appearing). ease-in — slow start, fast finish (for disappearing). ease-in-out — smooth in both directions (for movement)',
            },
            {
              term: 'Duration',
              definition:
                'Optimal duration: 200\u2013500 ms. Less than 100 ms is imperceptible. More than 1 second is annoying. Rule: the greater the movement distance, the longer the animation',
            },
            {
              term: 'Stagger',
              definition:
                'Sequential appearance of list elements with a 50\u2013100 ms delay between them. Creates a sense of flow and directs attention',
            },
            {
              term: 'Spring',
              definition:
                'Physically realistic animation with inertia and bounce. Parameters: stiffness, damping, mass. Popular in mobile interfaces',
            },
          ],
        },
        {
          type: 'callout' as const,
          variant: 'example' as const,
          content:
            'The 60 FPS rule: animations should run at 60 frames per second. Use only **transform** and **opacity** properties — they do not cause layout reflow and run on the GPU.',
        },
        {
          type: 'before-after' as const,
          title: 'Screen-to-Screen Transition',
          before: {
            label: 'Instant switch',
            description:
              'The screen changes instantly — the user loses context. It is unclear where the navigation leads and how to go back. It creates a feeling of "teleportation."',
          },
          after: {
            label: 'Smooth contextual transition',
            description:
              'The new screen slides in from the right (slide-in, 300 ms, ease-out), the previous one slightly shrinks. The user understands the hierarchy: the new screen is "on top of" the old one. The "Back" button returns with a reverse animation.',
          },
        },
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=FKGHs5CIViU',
          title: 'UI Animations — Principles & Techniques',
          caption: 'An overview of key UI animation principles with practical examples',
        },
        {
          type: 'divider' as const,
        },

        // === PROTOTYPING IN FIGMA ===
        {
          type: 'heading' as const,
          content: 'Prototyping in Figma',
        },
        {
          type: 'text' as const,
          content:
            'Figma is the primary tool for creating interactive prototypes. Its built-in capabilities allow you to create everything from simple screen-to-screen transitions to complex animations with conditional logic — **without code**.',
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            {
              term: 'Smart Animate',
              definition:
                'Figma automatically animates differences between two frames: position, size, color, opacity. All you need to do is give layers the same names in both frames',
            },
            {
              term: 'Component Variants',
              definition:
                'Component variants (default, hover, pressed, disabled) allow you to prototype element states through Interactive Components without duplicating screens',
            },
            {
              term: 'Overlays',
              definition:
                'Modal windows, popups, tooltips, dropdown menus — all implemented through overlay transitions. You can configure position, background dimming, and close-on-click behavior',
            },
            {
              term: 'Scroll & Overflow',
              definition:
                'Configuration of vertical and horizontal scrolling within a frame. Allows prototyping long pages, carousels, and horizontal feeds',
            },
            {
              term: 'Variables & Conditions',
              definition:
                'Since 2024, Figma supports variables and conditional logic: you can change the screen based on a variable value (e.g., whether the user is authenticated)',
            },
          ],
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'Pro tip: name layers the same across different frames — then Smart Animate will automatically create a smooth transition between them. For example, a layer named "card-image" on both screens will animate as a single element.',
        },
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=yjBAOYMDkLc',
          title: 'Figma Prototyping Tutorial — Complete Guide',
          caption: 'Step-by-step guide to prototyping in Figma: transitions, Smart Animate, overlays',
        },
        {
          type: 'divider' as const,
        },

        // === TOOL COMPARISON ===
        {
          type: 'heading' as const,
          content: 'Prototyping Tools: Comparison',
        },
        {
          type: 'text' as const,
          content:
            'Figma covers 80% of prototyping tasks, but for complex animations and unique interactions, specialized tools exist. The choice depends on **animation complexity**, **platform**, and **budget**.',
        },
        {
          type: 'comparison' as const,
          title: 'Prototyping Tools',
          items: [
            {
              label: 'Figma',
              ux: 'Free, browser-based, team collaboration, Smart Animate, component variants, variables',
              ui: 'Best for 80% of tasks. Limited in complex animations and physics',
            },
            {
              label: 'Principle',
              ux: 'macOS only, timeline animation, drivers, auto-code for iOS',
              ui: 'Ideal for complex screen transitions and scroll animations',
            },
            {
              label: 'ProtoPie',
              ux: 'Cross-platform, phone sensors (gyroscope, camera), conditional logic, API integration',
              ui: 'Best for IoT, multi-device, and sensor-based prototypes',
            },
            {
              label: 'Framer',
              ux: 'Code + visual editor, React components, real data, CMS, publish as website',
              ui: 'Best for prototypes that can become a real product',
            },
          ],
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'Selection rule: start with Figma. If its capabilities fall short, move to ProtoPie (for mobile) or Framer (for web). Principle is the choice if you are on Mac and need timeline animations.',
        },
        {
          type: 'divider' as const,
        },

        // === WHEN TO PROTOTYPE WHAT ===
        {
          type: 'heading' as const,
          content: 'When to Prototype What',
        },
        {
          type: 'text' as const,
          content:
            'Not everything needs to be prototyped in hi-fi. A sensible approach is to **prototype only what carries risk** or raises questions from the team and users.',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'Must prototype',
              items: [
                'Onboarding and first launch',
                'Key user scenarios',
                'Non-standard navigation patterns',
                'Gesture and swipe interactions',
                'Loading and transition animations',
                'Multi-step forms with logic',
              ],
            },
            {
              title: 'A mockup will suffice',
              items: [
                'Standard CRUD pages',
                'Forms with 2\u20133 fields',
                'Static informational pages',
                'Settings with toggle switches',
                'Standard table navigation',
                'Simple modal windows',
              ],
            },
          ],
        },
        {
          type: 'quote' as const,
          text: 'A prototype should be realistic enough to provoke a reaction, yet cheap enough to throw away.',
          author: 'Tom Kelley',
          role: 'Partner at IDEO',
        },
        {
          type: 'checklist' as const,
          title: 'Checklist: Is Your Prototype Ready for Testing',
          items: [
            'The main user scenario can be completed from start to finish',
            'All buttons and links lead where they should (no dead ends)',
            'Error states and empty states are accounted for',
            'Animations are smooth and do not distract from the task',
            'Real (or realistic) content instead of Lorem Ipsum',
            'The prototype has been tested on the target device (mobile / desktop)',
          ],
        },
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=0xGIZg2JT7s',
          title: 'Prototyping in Figma: Advanced Techniques',
          caption: 'Advanced techniques: variables, conditional logic, and multi-level prototypes',
        },
        {
          type: 'divider' as const,
        },

        // === CASE STUDY ===
        {
          type: 'case-study' as const,
          title: 'Airbnb: Prototyping as a Culture',
          company: 'Airbnb',
          problem:
            'The team spent weeks developing features that turned out to be useless for users. Feedback arrived too late.',
          solution:
            'Airbnb adopted a culture of rapid prototyping: every idea is tested on an interactive prototype before development. They use Figma for hi-fi and paper sketches for lo-fi.',
          result:
            'Time from idea to validation was reduced from 6 weeks to 3 days. The number of failed features decreased by 40%.',
          steps: [
            {
              title: 'Paper sketch',
              description: 'The designer draws 3\u20135 solution variants in 30 minutes',
            },
            {
              title: 'Lo-fi in Figma',
              description: 'The best variant is turned into a clickable wireframe in 2 hours',
            },
            {
              title: 'User testing',
              description: '5 users walk through the scenario, feedback is collected',
            },
            {
              title: 'Hi-fi prototype',
              description:
                'After iterations, a final prototype with animations is created for presentation and development',
            },
          ],
        },
      ],
      quiz: [
        {
          question:
            'Which prototype level is best suited for the early stages of design?',
          options: [
            { id: 'a', text: 'Hi-fi with full animation' },
            { id: 'b', text: 'Lo-fi (paper sketches or wireframes)' },
            { id: 'c', text: 'Production code in React' },
            { id: 'd', text: 'A recorded walkthrough video' },
          ],
          correctId: 'b',
          explanation:
            'Lo-fi prototypes are quick to create and easy to discard, which is ideal for early stages when you need to validate structure and flow.',
        },
        {
          question:
            'What are the 4 components of a micro-interaction according to Dan Saffer?',
          options: [
            { id: 'a', text: 'Color, size, position, opacity' },
            { id: 'b', text: 'Trigger, rules, feedback, loops/modes' },
            { id: 'c', text: 'Input, process, output, error' },
            { id: 'd', text: 'Click, hover, swipe, scroll' },
          ],
          correctId: 'b',
          explanation:
            'Saffer\'s model: Trigger (what initiates it), Rules (what happens), Feedback (what the user sees), Loops & Modes (how it changes over time).',
        },
        {
          question:
            'What does Smart Animate do in Figma?',
          options: [
            { id: 'a', text: 'Generates animation code for React' },
            { id: 'b', text: 'Automatically animates differences between two frames based on layer names' },
            { id: 'c', text: 'Creates AI-powered animations based on a description' },
            { id: 'd', text: 'Records the screen and turns the recording into a prototype' },
          ],
          correctId: 'b',
          explanation:
            'Smart Animate finds layers with matching names in two frames and smoothly animates changes in position, size, color, and opacity.',
        },
        {
          question:
            'What is the optimal duration for a UI animation?',
          options: [
            { id: 'a', text: '10\u201350 ms' },
            { id: 'b', text: '200\u2013500 ms' },
            { id: 'c', text: '1\u20132 seconds' },
            { id: 'd', text: '3\u20135 seconds' },
          ],
          correctId: 'b',
          explanation:
            'An animation of 200\u2013500 ms feels smooth and responsive. Less than 100 ms is imperceptible, more than 1 second feels slow and annoying.',
        },
      ],
    },

    // ========================================
    // PART 2 — Design Systems
    // ========================================
    {
      id: 'part-2',
      title: 'Design Systems',
      subtitle:
        'Atomic Design, design tokens, component libraries, and real-world design systems',
      duration: '45 min',
      sections: [
        // === INTRODUCTION ===
        {
          type: 'heading' as const,
          content: 'What Is a Design System and Why Do You Need One',
        },
        {
          type: 'text' as const,
          content:
            'A **design system** is a single source of truth for design and development. It is a set of reusable components, tokens, rules, and documentation that ensures product **consistency** at any team scale.',
        },
        {
          type: 'text' as const,
          content:
            'Without a design system, every designer and developer creates their own version of a button, modal window, or color palette. The result is a product that looks like a patchwork quilt: 12 shades of gray, 5 different button styles, and 3 heading font variants.',
        },
        {
          type: 'callout' as const,
          variant: 'example' as const,
          content:
            'Spotify has a design system called "Encore" used by 200+ designers and 1,000+ developers. Without it, every new screen would breed chaos.',
        },
        {
          type: 'before-after' as const,
          title: 'Building a Button in a Large Team',
          before: {
            label: 'Without a design system',
            description:
              'Every developer creates a button from scratch: 8 color variations, 4 border-radius sizes, different paddings. The product is visual chaos. Auditing and unifying takes 2 sprints.',
          },
          after: {
            label: 'With a design system',
            description:
              'One Button component with 4 variants (primary, secondary, ghost, destructive) and 3 sizes (sm, md, lg). All projects use a single source. A new button is 1 line of code: <Button variant="primary" size="md">.',
          },
        },
        {
          type: 'divider' as const,
        },

        // === ATOMIC DESIGN ===
        {
          type: 'heading' as const,
          content: 'Atomic Design: A Methodology for Building Systems',
        },
        {
          type: 'text' as const,
          content:
            'In 2013, Brad Frost proposed the **Atomic Design** methodology, inspired by chemistry. The idea is simple: interfaces, like matter, consist of the smallest particles that combine into more complex structures.',
        },
        {
          type: 'diagram' as const,
          title: 'Atomic Design Hierarchy',
          description:
            'From the smallest elements to full pages — 5 levels of abstraction',
          items: [
            '\u269b\ufe0f Atoms \u2192 basic indivisible elements: button, input, icon, label, color, font',
            '\U0001f9ec Molecules \u2192 groups of atoms: search field (input + button + icon), product card (image + title + price)',
            '\U0001f9a0 Organisms \u2192 complex blocks of molecules: header (logo + navigation + search + profile), product card with reviews and actions',
            '\U0001f4c4 Templates \u2192 page structure without real content: layout with zones for organisms, wireframe level',
            '\U0001f4f1 Pages \u2192 final screens with real content: specific product, real photos, prices, reviews',
          ],
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'Atomic Design is not a rigid framework but a mental model. You do not have to name your folders "atoms" and "molecules" — what matters is thinking from simple to complex and reusing components.',
        },
        {
          type: 'text' as const,
          content:
            'Example in code: atom `<Icon />` \u2192 molecule `<IconButton icon={} label={} />` \u2192 organism `<Toolbar><IconButton /><IconButton /><SearchInput /></Toolbar>` \u2192 template `<DashboardLayout><Toolbar /><Sidebar /><Content /></DashboardLayout>` \u2192 page with real data.',
        },
        {
          type: 'divider' as const,
        },

        // === DESIGN TOKENS ===
        {
          type: 'heading' as const,
          content: 'Design Tokens: The Foundation of the System',
        },
        {
          type: 'text' as const,
          content:
            '**Design tokens** are named values of design decisions: colors, spacing, font sizes, border radii, shadows. They are the **shared language** between designer and developer. The token `--color-primary` is equally understood in both Figma and CSS.',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'Color tokens',
              items: [
                '--color-primary: hsl(220, 70%, 50%)',
                '--color-secondary: hsl(160, 60%, 45%)',
                '--color-background: hsl(0, 0%, 100%)',
                '--color-foreground: hsl(0, 0%, 4%)',
                '--color-muted: hsl(0, 0%, 96%)',
                '--color-destructive: hsl(0, 84%, 60%)',
                '--color-border: hsl(0, 0%, 90%)',
              ],
            },
            {
              title: 'Size tokens',
              items: [
                '--spacing-xs: 4px',
                '--spacing-sm: 8px',
                '--spacing-md: 16px',
                '--spacing-lg: 24px',
                '--spacing-xl: 32px',
                '--radius-sm: 4px',
                '--radius-md: 8px',
                '--radius-lg: 12px',
              ],
            },
            {
              title: 'Typography',
              items: [
                '--font-family: "Inter", sans-serif',
                '--font-size-xs: 12px',
                '--font-size-sm: 14px',
                '--font-size-base: 16px',
                '--font-size-lg: 20px',
                '--font-size-xl: 24px',
                '--font-weight-normal: 400',
                '--font-weight-semibold: 600',
              ],
            },
          ],
        },
        {
          type: 'text' as const,
          content:
            'Tokens come in **three levels**: **Global** (palette colors: blue-500, gray-100), **Alias** (semantic: color-primary, color-error), and **Component** (component-bound: button-bg, input-border). This allows you to change the theme with a single edit.',
        },
        {
          type: 'callout' as const,
          variant: 'example' as const,
          content:
            'Theme switching: just change the alias tokens. --color-background: white \u2192 black, --color-foreground: black \u2192 white. All components update automatically because they reference alias tokens, not specific colors.',
        },
        {
          type: 'divider' as const,
        },

        // === COMPONENT LIBRARIES ===
        {
          type: 'heading' as const,
          content: 'Component Libraries',
        },
        {
          type: 'text' as const,
          content:
            'A component library is the **implementation** of a design system in code or a design tool. It contains ready-made, tested elements with documentation, variants, and usage examples.',
        },
        {
          type: 'text' as const,
          content:
            'In Figma, a library is a file with components connected to projects via "Team Library." Each component has variants, auto-layout, and token bindings. A change in the library automatically updates all projects.',
        },
        {
          type: 'checklist' as const,
          title: 'What a Component Library Should Contain',
          items: [
            'Buttons: primary, secondary, ghost, destructive \u00d7 3 sizes',
            'Inputs: text, password, search, textarea with states (default, focus, error, disabled)',
            'Typography: headings H1\u2013H6, body, caption, label',
            'Color palette with tokens and contrast ratios',
            'Icons: a unified set (Lucide, Phosphor, Material)',
            'Cards, modal windows, tooltips, dropdown menus',
            'Navigation: header, sidebar, tabs, breadcrumbs',
            'States: loading, empty, error, success',
          ],
        },
        {
          type: 'divider' as const,
        },

        // === REAL-WORLD DESIGN SYSTEMS ===
        {
          type: 'heading' as const,
          content: 'Real-World Design Systems: Learning from the Best',
        },
        {
          type: 'text' as const,
          content:
            'The best way to understand a design system is to study existing ones. Each reflects the **values and needs** of the company, but all follow common principles: tokens, components, documentation, and guidelines.',
        },
        {
          type: 'case-study' as const,
          title: 'Material Design (Google)',
          company: 'Google',
          problem:
            'Google products (Gmail, Maps, Drive, YouTube) looked different and lacked a unified visual language.',
          solution:
            'Material Design is a design system based on the "material" metaphor: surfaces with shadows, elevation, and physics. It includes tokens, components, icons, and animation guidelines.',
          result:
            'A unified visual language for 100+ Google products. It became the standard for Android apps and influenced the entire industry. Material 3 (2021) added dynamic colors.',
        },
        {
          type: 'case-study' as const,
          title: 'Apple Human Interface Guidelines (HIG)',
          company: 'Apple',
          problem:
            'The Apple ecosystem (iOS, macOS, watchOS, tvOS) requires a unified experience across different devices and screen sizes.',
          solution:
            'HIG is not just a set of components but a design philosophy: direct manipulation, feedback, consistency, and real-world metaphors. It includes SF Symbols, San Francisco typography, and navigation patterns.',
          result:
            'iOS apps feel "native" thanks to HIG compliance. Developers get UIKit/SwiftUI with built-in patterns. Users do not have to relearn in each app.',
        },
        {
          type: 'comparison' as const,
          title: 'Design Systems Comparison',
          items: [
            {
              label: 'Material Design',
              ux: 'Open, cross-platform, extensive documentation, Figma files',
              ui: 'Android standard. Can look "generic." Material 3 is more flexible',
            },
            {
              label: 'Apple HIG',
              ux: 'Deep platform integration, SF Symbols, native feel',
              ui: 'Apple ecosystem only. Strict rules, but the result is premium',
            },
            {
              label: 'Ant Design',
              ux: 'For enterprise/B2B, 60+ components, Figma library, table/form support',
              ui: 'Heavy, distinctive style. Ideal for dashboards and admin panels',
            },
            {
              label: 'shadcn/ui',
              ux: 'Copy-paste components, Tailwind CSS, full control, customization',
              ui: 'Minimalist. Not a package — code is copied into the project. Requires Tailwind',
            },
          ],
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'shadcn/ui was a revolution: instead of installing a package, you copy the component source code into your project. Full control, no dependency on library updates, easy to customize for your design system.',
        },
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=wc5krC28ynQ',
          title: 'Design Systems — Complete Guide',
          caption: 'How design systems work: from tokens to documentation and versioning',
        },
        {
          type: 'divider' as const,
        },

        // === VERSIONING AND DOCUMENTATION ===
        {
          type: 'heading' as const,
          content: 'Versioning and Documentation',
        },
        {
          type: 'text' as const,
          content:
            'A design system is a **living product** that evolves alongside the product. Without versioning and documentation, it will quickly become outdated and useless. Two key principles: **Semantic Versioning** and **living documentation**.',
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            {
              term: 'Semantic Versioning (SemVer)',
              definition:
                'Format X.Y.Z: MAJOR (breaking changes) . MINOR (new components) . PATCH (bug fixes). For example: removing a button \u2014 2.0.0, new Tooltip component \u2014 1.3.0, color fix \u2014 1.2.1',
            },
            {
              term: 'Changelog',
              definition:
                'A log of changes for each version: what was added, changed, removed, and fixed. Helps the team understand what was updated and whether migration is needed',
            },
            {
              term: 'Storybook',
              definition:
                'A tool for documenting and visually testing components in isolation. Each component has a "story" with examples of all states and variants',
            },
            {
              term: 'Figma Branching',
              definition:
                'Branches in Figma allow you to make changes to the library without affecting current projects. After review, the branch is merged into the main library',
            },
          ],
        },
        {
          type: 'text' as const,
          content:
            'Documentation should contain **3 layers**: **Principles** (why and for what purpose), **Guidelines** (how to use: DO / DON\'T), and **API documentation** (props, variants, code examples). Without any of these layers, the system loses its value.',
        },
        {
          type: 'callout' as const,
          variant: 'warning' as const,
          content:
            'A design system without documentation is just a folder with files. Without explaining "why" and "how," new team members will reinvent the wheel.',
        },
        {
          type: 'divider' as const,
        },

        // === BUILDING YOUR OWN DS ===
        {
          type: 'heading' as const,
          content: 'Building Your First Design System: A Step-by-Step Plan',
        },
        {
          type: 'text' as const,
          content:
            'You do not need to build Material Design from scratch. Start with a **Minimum Viable Design System** (MVDS) — 10\u201315 components that cover 80% of your product\'s needs.',
        },
        {
          type: 'user-flow' as const,
          title: 'Design System Creation Process',
          steps: [
            { id: 'audit', label: 'UI audit: collect all existing components', type: 'start' as const },
            { id: 'tokens', label: 'Define tokens: colors, typography, spacing', type: 'action' as const },
            { id: 'atoms', label: 'Create atoms: buttons, inputs, icons', type: 'action' as const },
            { id: 'molecules', label: 'Build molecules: forms, cards, navigation', type: 'action' as const },
            { id: 'doc', label: 'Document: principles, guidelines, examples', type: 'action' as const },
            { id: 'publish', label: 'Publish and connect to projects', type: 'end' as const },
          ],
          connections: [
            { from: 'audit', to: 'tokens' },
            { from: 'tokens', to: 'atoms' },
            { from: 'atoms', to: 'molecules' },
            { from: 'molecules', to: 'doc' },
            { from: 'doc', to: 'publish' },
          ],
        },
        {
          type: 'checklist' as const,
          title: 'Minimum Viable Design System (MVDS)',
          items: [
            'Color palette: primary, secondary, neutral, error, success, warning',
            'Typography: 2 fonts maximum, size scale',
            'Grid and spacing: 4px or 8px base module',
            'Buttons: 3\u20134 variants \u00d7 2\u20133 sizes',
            'Inputs: text, select, checkbox, radio',
            'Cards and containers',
            'Modal windows and tooltips',
            'Icons: a unified set, unified size',
            'Documentation for each component',
            'Figma library connected to projects',
          ],
        },
        {
          type: 'quote' as const,
          text: 'The best design system is the one that gets used. Start small and iterate based on feedback.',
          author: 'Brad Frost',
          role: 'Author of Atomic Design',
        },
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=EK-pHkc5EL4',
          title: 'Build a Design System from Scratch',
          caption: 'Practical guide: creating a design system in Figma from scratch — tokens, components, variants',
        },
        {
          type: 'divider' as const,
        },

        // === SUMMARY ===
        {
          type: 'heading' as const,
          content: 'Summary: Prototypes + Design Systems = Scalable Design',
        },
        {
          type: 'text' as const,
          content:
            'Prototypes validate ideas, and design systems scale proven solutions. Together they form a **mature design process**: rapid validation \u2192 consistent implementation \u2192 documented evolution. This is the path from craftsman to systems designer.',
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            {
              term: 'Prototype',
              definition:
                'An interactive model of an interface for validating hypotheses and demonstrating behavior. Comes in lo-fi, mid-fi, and hi-fi',
            },
            {
              term: 'Design System',
              definition:
                'A single source of truth: tokens + components + documentation + rules. Ensures consistency and scalability',
            },
            {
              term: 'Atomic Design',
              definition:
                'A methodology: atoms \u2192 molecules \u2192 organisms \u2192 templates \u2192 pages. Thinking from simple to complex',
            },
            {
              term: 'Design Tokens',
              definition:
                'Named values: colors, spacing, fonts. Three levels: global, alias, component. A shared language for design and development',
            },
          ],
        },
      ],
      quiz: [
        {
          question:
            'Which level in Atomic Design sits between atoms and organisms?',
          options: [
            { id: 'a', text: 'Templates' },
            { id: 'b', text: 'Pages' },
            { id: 'c', text: 'Molecules' },
            { id: 'd', text: 'Tokens' },
          ],
          correctId: 'c',
          explanation:
            'The Atomic Design hierarchy: Atoms \u2192 Molecules \u2192 Organisms \u2192 Templates \u2192 Pages. Molecules are groups of atoms forming a functional block.',
        },
        {
          question:
            'What is an alias token in a design system?',
          options: [
            { id: 'a', text: 'A specific color value: #3B82F6' },
            { id: 'b', text: 'A semantic name referencing a global token: color-primary \u2192 blue-500' },
            { id: 'c', text: 'A token bound to a specific component: button-bg' },
            { id: 'd', text: 'A file name in the Figma library' },
          ],
          correctId: 'b',
          explanation:
            'Alias tokens provide semantic names (color-primary, color-error) and reference global tokens (blue-500, red-500). This allows theme switching by reassigning alias references.',
        },
        {
          question:
            'Which design system uses a "copy-paste" approach instead of an npm package?',
          options: [
            { id: 'a', text: 'Material Design' },
            { id: 'b', text: 'Ant Design' },
            { id: 'c', text: 'shadcn/ui' },
            { id: 'd', text: 'Apple HIG' },
          ],
          correctId: 'c',
          explanation:
            'shadcn/ui is not an npm package. You copy the component source code into your project and get full control over it without dependency on library updates.',
        },
        {
          question:
            'What does version 2.0.0 mean in Semantic Versioning for a design system?',
          options: [
            { id: 'a', text: '2 bugs were fixed' },
            { id: 'b', text: '2 new components were added' },
            { id: 'c', text: 'Breaking changes occurred' },
            { id: 'd', text: 'The system passed 2 reviews' },
          ],
          correctId: 'c',
          explanation:
            'In SemVer: MAJOR (X.0.0) \u2014 breaking changes (component removed, API changed). MINOR (1.X.0) \u2014 new features. PATCH (1.0.X) \u2014 bug fixes. Version 2.0.0 means breaking changes.',
        },
      ],
    },
  ],
}
