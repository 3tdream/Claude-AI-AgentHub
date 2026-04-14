import type { Meeting } from '../../types'

export const meeting09: Meeting = {
  id: '9',
  number: 9,
  title: 'Wireframing',
  description:
    'The art of wireframing: from paper sketches to digital prototypes. Methods, tools, rules, and hands-on practice creating wireframes for web, mobile, and SaaS.',
  icon: 'PenTool',
  color: 'bg-amber-500/10 text-amber-600',
  parts: [
    {
      id: 'part-1',
      title: 'From Idea to Wireframe',
      subtitle: 'What wireframing is, sketching techniques, tools, and rules',
      duration: '45 min',
      sections: [
        // === INTRODUCTION ===
        {
          type: 'heading' as const,
          content: 'Why You Need a Wireframe',
        },
        {
          type: 'text' as const,
          content:
            'Before a designer starts choosing colors and fonts, and a developer begins writing code, the **structure** of the interface must be defined. A wireframe is the skeleton of a future screen: the layout of blocks, content hierarchy, and navigation logic. It is the fastest and cheapest way to validate an idea before it becomes expensive to rework.',
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'A wireframe is not a drawing "for aesthetics." It is a **thinking tool**: it helps the team agree on structure before discussing visuals.',
        },
        {
          type: 'quote' as const,
          text: 'If a picture is worth a thousand words, a prototype is worth a thousand meetings.',
          author: 'Tom Kelley',
          role: 'Partner at IDEO',
        },
        {
          type: 'image' as const,
          src: '/images/meeting-09-wireframe-evolution.webp',
          alt: 'Wireframe example: from pencil sketch to digital mockup',
          caption: 'Evolution of an idea: sketch \u2192 lo-fi wireframe \u2192 hi-fi wireframe',
        },
        {
          type: 'divider' as const,
        },

        // === WHAT IS WIREFRAMING ===
        {
          type: 'heading' as const,
          content: 'What Is a Wireframe',
        },
        {
          type: 'text' as const,
          content:
            'A **wireframe** is a schematic, simplified representation of an interface screen. A wireframe shows **what** will be on the screen and **where** it will be located, but **not** how it will look visually. Colors, images, and final typography come later.',
        },
        {
          type: 'text' as const,
          content:
            'A wireframe solves three key tasks: (1) it defines the **content structure** \u2014 which information blocks are needed on the screen; (2) it establishes the **hierarchy** \u2014 what is more important and what is less important; (3) it shows the **navigation** \u2014 how the user moves between screens.',
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            {
              term: 'Wireframe',
              definition: 'A schematic skeleton of a screen showing the structure and placement of elements without visual styling',
            },
            {
              term: 'Lo-fi wireframe',
              definition: 'A low-fidelity skeleton \u2014 simple shapes, placeholder text, minimal detail',
            },
            {
              term: 'Hi-fi wireframe',
              definition: 'A high-fidelity skeleton \u2014 real content, precise proportions, ready for client review',
            },
            {
              term: 'Wireflow',
              definition: 'A combination of wireframe and user flow \u2014 screen skeletons connected by transition arrows',
            },
            {
              term: 'Content-first design',
              definition: 'An approach where content is defined first, and the screen structure is then built around it',
            },
          ],
        },
        {
          type: 'divider' as const,
        },

        // === SKETCHING TECHNIQUES ===
        {
          type: 'heading' as const,
          content: 'Sketching Techniques',
        },
        {
          type: 'text' as const,
          content:
            'The first stage of wireframing is **paper sketching**. Pencil and paper are the fastest tools for capturing ideas. Sketching allows you to explore dozens of variations in just a few minutes without getting caught up in pixels.',
        },
        {
          type: 'subheading' as const,
          content: 'The Crazy 8s Method',
        },
        {
          type: 'text' as const,
          content:
            '**Crazy 8s** is a popular technique from the Google Design Sprint. A sheet of paper is folded into 8 sections. In **8 minutes** (1 minute per section), you draw **8 different variations** of the same design challenge. The goal is to push past the "first obvious idea" and discover unexpected solutions.',
        },
        {
          type: 'diagram' as const,
          title: 'The Crazy 8s Process',
          description: 'Step-by-step idea generation method in 8 minutes',
          items: [
            '1. Fold an A4 sheet into 8 sections (three folds)',
            '2. Define the challenge (e.g., "Onboarding screen")',
            '3. Timer \u2014 1 minute per section',
            '4. Draw quickly, no perfectionism',
            '5. Don\u2019t evaluate while drawing',
            '6. After 8 minutes \u2014 review all variations',
            '7. Vote: everyone places dots on the best ideas',
            '8. The best variation becomes the wireframe foundation',
          ],
        },
        {
          type: 'callout' as const,
          variant: 'example' as const,
          content:
            'During a Google Design Sprint, a team of 5 generates 40 variations of a single screen in 40 minutes. Typically, 3\u20135 of them contain breakthrough ideas that no one would have proposed in a regular meeting.',
        },
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=yz4g87XNFh0',
          title: 'The Crazy 8s Method \u2014 Google Design Sprint',
          caption: 'How the Crazy 8s method works in practice',
        },
        {
          type: 'divider' as const,
        },

        // === PAPER PROTOTYPING ===
        {
          type: 'subheading' as const,
          content: 'Paper Prototyping Rules',
        },
        {
          type: 'text' as const,
          content:
            'A paper prototype is a wireframe cut from paper and laid out on a table. The user "taps" on elements with their finger, and the moderator swaps in the next screens. This is the fastest way to test navigation before creating a digital prototype.',
        },
        {
          type: 'checklist' as const,
          title: 'Paper Prototyping Checklist',
          items: [
            'Use a thick marker \u2014 fine details are not needed',
            'One screen = one sheet of paper',
            'Label each screen (name and number)',
            'Create cutout elements for popups and modal windows',
            'Prepare "empty" states (loading, error, empty list)',
            'Number the transition order with arrows on a separate sheet',
            'Test with real people, not fellow designers',
            'Record observations immediately \u2014 memory is unreliable',
          ],
        },
        {
          type: 'divider' as const,
        },

        // === LO-FI VS HI-FI ===
        {
          type: 'heading' as const,
          content: 'Lo-fi vs Hi-fi Wireframe',
        },
        {
          type: 'text' as const,
          content:
            'Wireframes come in two levels of detail. **Lo-fi** (low fidelity) \u2014 rough sketches with placeholders: gray rectangles, squiggly lines instead of text, crosses instead of images. **Hi-fi** (high fidelity) \u2014 detailed skeletons with real text, precise proportions, and interactive elements.',
        },
        {
          type: 'before-after' as const,
          title: 'Lo-fi wireframe \u2192 Hi-fi wireframe',
          before: {
            label: 'Lo-fi wireframe',
            description: 'Gray blocks, placeholder text ("Lorem ipsum"), no colors, no images. Creation time: 10\u201330 minutes. Ideal for early iterations and team discussions.',
          },
          after: {
            label: 'Hi-fi wireframe',
            description: 'Real content, precise dimensions, typography, icons, navigation elements. Creation time: 2\u20134 hours. Used for client approval and developer handoff.',
          },
        },
        {
          type: 'comparison' as const,
          title: 'When to Use Lo-fi vs Hi-fi',
          items: [
            {
              label: 'Creation speed',
              ux: 'Lo-fi: 10\u201330 minutes per screen',
              ui: 'Hi-fi: 2\u20134 hours per screen',
            },
            {
              label: 'Cost of changes',
              ux: 'Lo-fi: nearly free',
              ui: 'Hi-fi: significant effort',
            },
            {
              label: 'Feedback focus',
              ux: 'Lo-fi: about structure and navigation',
              ui: 'Hi-fi: about content and details',
            },
            {
              label: 'Audience',
              ux: 'Lo-fi: team, stakeholders',
              ui: 'Hi-fi: client, developers',
            },
            {
              label: 'Attachment risk',
              ux: 'Lo-fi: low \u2014 easy to discard',
              ui: 'Hi-fi: high \u2014 painful to redo',
            },
          ],
        },
        {
          type: 'callout' as const,
          variant: 'warning' as const,
          content:
            'A common mistake is jumping straight to hi-fi wireframes. The team spends hours on details, only to discover that the structure is wrong. **Always start with lo-fi.**',
        },
        {
          type: 'divider' as const,
        },

        // === TOOLS ===
        {
          type: 'heading' as const,
          content: 'Wireframing Tools',
        },
        {
          type: 'text' as const,
          content:
            'The choice of tool depends on the task, team, and project stage. Here are the main tools designers use for wireframing.',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'Balsamiq',
              items: [
                'Specialized wireframing tool',
                'Intentionally "hand-drawn" style',
                'Library of ready-made UI components',
                'Simple drag-and-drop interface',
                'Ideal for lo-fi wireframes',
                'Paid ($9/mo)',
              ],
            },
            {
              title: 'Whimsical',
              items: [
                'Wireframes + flowcharts in one place',
                'Quick component templates',
                'Real-time collaboration',
                'Minimalist interface',
                'Free plan up to 3,000 elements',
                'Web app, nothing to install',
              ],
            },
            {
              title: 'Figma',
              items: [
                'Full-featured design tool',
                'Wireframing via component libraries',
                'Best for hi-fi wireframes',
                'Free for personal use',
                'Collaboration, comments, prototypes',
                'Industry standard for teams',
              ],
            },
            {
              title: 'Excalidraw',
              items: [
                'Open-source, free',
                '"Hand-drawn" style, like on a whiteboard',
                'Instant start, no sign-up required',
                'Export to PNG, SVG',
                'Ideal for quick sketches',
                'Integration with VS Code and Notion',
              ],
            },
          ],
        },
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=6t_dYhXyYjI',
          title: 'Wireframing in Figma \u2014 Tutorial',
          caption: 'How to create wireframes in Figma: a step-by-step guide',
        },
        {
          type: 'divider' as const,
        },

        // === 7 RULES OF A WIREFRAME ===
        {
          type: 'heading' as const,
          content: '7 Rules of a Good Wireframe',
        },
        {
          type: 'text' as const,
          content:
            'Wireframing is not a free-form exercise. There are proven rules that separate a useful skeleton from a useless picture.',
        },
        {
          type: 'diagram' as const,
          title: '7 Wireframe Rules',
          description: 'Principles that make a wireframe a useful design tool',
          items: [
            '1. Content comes first \u2014 determine what goes on the screen, then where',
            '2. Gray only \u2014 use shades of gray only; color distracts from structure',
            '3. Real text \u2014 "Lorem ipsum" hides problems with length and hierarchy',
            '4. Annotations \u2014 label behaviors: "click \u2192 navigate," "scroll \u2192 load more"',
            '5. Consistency \u2014 identical elements look identical across all screens',
            '6. States \u2014 show empty, loading, error, and success \u2014 not just the happy path',
            '7. Numbering \u2014 every screen is numbered and labeled for easy discussion',
          ],
        },
        {
          type: 'before-after' as const,
          title: 'Wireframe Without Rules vs With Rules',
          before: {
            label: 'Bad wireframe',
            description: 'No numbering, Lorem ipsum, no annotations, only the happy path, inconsistent element styles across screens. The team asks: "What is happening here?"',
          },
          after: {
            label: 'Good wireframe',
            description: 'Numbered screens, real text, behavioral annotations, error states shown, consistent component style. The team says: "Clear, let\u2019s start development."',
          },
        },
        {
          type: 'divider' as const,
        },

        // === MOBILE-FIRST ===
        {
          type: 'heading' as const,
          content: 'Mobile-First Approach in Wireframing',
        },
        {
          type: 'text' as const,
          content:
            '**Mobile-first** is a design strategy where the wireframe is created for the mobile screen first, then expanded for tablet and desktop. This approach forces you to prioritize: only the most important content fits on a small screen.',
        },
        {
          type: 'text' as const,
          content:
            'Why does mobile-first work better than desktop-first? Because **shrinking** is harder than **expanding**. If you start with a desktop where there is plenty of space, transitioning to mobile means sacrificing content. But if you start with mobile, desktop gives you room to grow.',
        },
        {
          type: 'user-flow' as const,
          title: 'Mobile-First Wireframing Process',
          steps: [
            { id: 'start', label: 'Define content', type: 'start' as const },
            { id: 'priority', label: 'Prioritize elements', type: 'action' as const },
            { id: 'mobile', label: 'Mobile wireframe (320\u2013375px)', type: 'action' as const },
            { id: 'test-m', label: 'Does everything fit?', type: 'decision' as const },
            { id: 'cut', label: 'Remove extras', type: 'action' as const },
            { id: 'tablet', label: 'Tablet wireframe (768px)', type: 'action' as const },
            { id: 'desktop', label: 'Desktop wireframe (1280px+)', type: 'action' as const },
            { id: 'end', label: 'Complete wireframe set', type: 'end' as const },
          ],
          connections: [
            { from: 'start', to: 'priority' },
            { from: 'priority', to: 'mobile' },
            { from: 'mobile', to: 'test-m' },
            { from: 'test-m', to: 'cut', label: 'No' },
            { from: 'test-m', to: 'tablet', label: 'Yes' },
            { from: 'cut', to: 'mobile' },
            { from: 'tablet', to: 'desktop' },
            { from: 'desktop', to: 'end' },
          ],
        },
        {
          type: 'divider' as const,
        },

        // === CONTENT-FIRST ===
        {
          type: 'subheading' as const,
          content: 'Content-First Design',
        },
        {
          type: 'text' as const,
          content:
            '**Content-first design** is an approach where the screen structure is built **around the content**, not the other way around. Instead of drawing a beautiful layout and then "squeezing in" the text, the designer first determines: what content the user needs, in what order, and in what volume.',
        },
        {
          type: 'callout' as const,
          variant: 'example' as const,
          content:
            'Example: when designing a product card, the content-first approach starts with the question "What does the buyer want to see?": name, price, photo, reviews, buy button. Only after that does the designer compose the wireframe. The result is a structure that **works for the user**, not for the designer.',
        },
        {
          type: 'divider' as const,
        },

        // === WIREFRAMING PROCESS ===
        {
          type: 'heading' as const,
          content: 'The Complete Wireframing Process',
        },
        {
          type: 'diagram' as const,
          title: 'From Task to Finished Wireframe',
          description: 'Step-by-step wireframing process from research to handoff',
          items: [
            '1. Research \u2014 study users, competitors, requirements',
            '2. Content plan \u2014 define what should be on each screen',
            '3. Information architecture \u2014 build a screen map and navigation',
            '4. Paper sketch \u2014 draw 3\u20135 variations on paper (Crazy 8s)',
            '5. Digital lo-fi \u2014 transfer the best variation to Figma/Whimsical',
            '6. Feedback \u2014 show the team, capture comments',
            '7. Iteration \u2014 refine the wireframe based on feedback',
            '8. Hi-fi wireframe \u2014 add real content and details',
            '9. Annotations \u2014 describe element behaviors',
            '10. Handoff \u2014 wireframe is ready for visual design',
          ],
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'The "3 iterations" rule: the first wireframe is a starting point for discussion. The second refines it after feedback. The third is the final version. If you need more than 5 iterations, something is wrong with the process.',
        },

        // === CASE STUDY ===
        {
          type: 'case-study' as const,
          title: 'Wireframing at Airbnb',
          company: 'Airbnb',
          problem: 'In 2009, Airbnb could not attract users \u2014 the conversion rate was under 1%. Pages were overloaded with information, and navigation was confusing.',
          solution: 'The co-founders took paper and sketched the ideal user journey: "I want to find a place \u2192 see photos \u2192 book it." Each step became a separate wireframe. They removed everything unnecessary and focused on property photos.',
          result: 'After the wireframe-based redesign, conversion increased 2.5x. This "wireframe-first" approach became the standard design process at Airbnb.',
          steps: [
            { title: 'Problem analysis', description: 'Studied user behavior: where they drop off, what they search for, what they cannot find' },
            { title: 'Paper sketches', description: 'Drew 50+ variations of the homepage and listing page' },
            { title: 'Testing', description: 'Tested paper prototypes with 10 users' },
            { title: 'Digital wireframe', description: 'Transferred the best ideas to digital format and refined them' },
            { title: 'Result', description: 'A minimalist structure focused on photos and simple booking' },
          ],
        },
        {
          type: 'divider' as const,
        },

        // === FINAL CHECKLIST ===
        {
          type: 'checklist' as const,
          title: 'Checklist: What I Learned in Part 1',
          items: [
            'A wireframe is a screen skeleton, not a visual design',
            'A lo-fi wireframe takes minutes to create; hi-fi takes hours',
            'Crazy 8s helps generate 8 ideas in 8 minutes',
            'A paper prototype is the fastest way to test',
            'The mobile-first approach forces you to prioritize',
            'Content-first: content defines the structure, not the other way around',
            '7 wireframe rules \u2014 from gray-only color to screen numbering',
            'Balsamiq, Whimsical, Figma, Excalidraw \u2014 different tools for different tasks',
          ],
        },
      ],
      quiz: [
        {
          question: 'What is a wireframe?',
          options: [
            { id: 'a', text: 'A finished visual design with colors and images' },
            { id: 'b', text: 'A schematic skeleton of a screen showing the structure and placement of elements' },
            { id: 'c', text: 'Interface code in HTML and CSS' },
            { id: 'd', text: 'A marketing presentation of a product' },
          ],
          correctId: 'b',
          explanation:
            'A wireframe is a schematic representation of a screen focused on structure, content hierarchy, and navigation, without visual styling.',
        },
        {
          question: 'How many variations do you draw in the Crazy 8s method?',
          options: [
            { id: 'a', text: '3 variations in 3 minutes' },
            { id: 'b', text: '5 variations in 10 minutes' },
            { id: 'c', text: '8 variations in 8 minutes' },
            { id: 'd', text: '10 variations in 15 minutes' },
          ],
          correctId: 'c',
          explanation:
            'Crazy 8s means 8 variations in 8 minutes (1 minute each). The goal is to move beyond the first obvious idea and find unconventional solutions.',
        },
        {
          question: 'Why is mobile-first better than desktop-first for wireframing?',
          options: [
            { id: 'a', text: 'Mobile screens look better than desktop ones' },
            { id: 'b', text: 'A small screen forces you to prioritize \u2014 expanding is easier than shrinking' },
            { id: 'c', text: 'Mobile means less work for the designer' },
            { id: 'd', text: 'No one uses desktop sites anymore' },
          ],
          correctId: 'b',
          explanation:
            'Mobile-first forces you to identify what matters most. There is no room for extras on a small screen. Expanding to desktop is easier than cramming a desktop design into mobile.',
        },
        {
          question: 'Which tool is specifically designed for lo-fi wireframes with a "hand-drawn" style?',
          options: [
            { id: 'a', text: 'Figma' },
            { id: 'b', text: 'Photoshop' },
            { id: 'c', text: 'Balsamiq' },
            { id: 'd', text: 'Sketch' },
          ],
          correctId: 'c',
          explanation:
            'Balsamiq is a specialized wireframing tool with an intentionally "hand-drawn" style that emphasizes that it is a skeleton, not a final design.',
        },
      ],
    },
    {
      id: 'part-2',
      title: 'Wireframe Practice',
      subtitle: 'Wireframing for web, mobile, SaaS: patterns, mistakes, accessibility',
      duration: '45 min',
      sections: [
        // === INTRODUCTION ===
        {
          type: 'heading' as const,
          content: 'Wireframing for Real Projects',
        },
        {
          type: 'text' as const,
          content:
            'In the first part, we covered wireframing theory. Now let\u2019s apply that knowledge in practice: we\u2019ll explore wireframing for different project types \u2014 from landing pages to SaaS dashboards. Each type has its own patterns, rules, and common mistakes.',
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'There is no "universal" wireframe. A landing page, e-commerce site, mobile app, and SaaS dashboard are **different tasks** with different patterns. Understanding these differences is the key to effective wireframing.',
        },
        {
          type: 'divider' as const,
        },

        // === WEB: LANDING PAGE ===
        {
          type: 'heading' as const,
          content: 'Wireframe for a Landing Page',
        },
        {
          type: 'text' as const,
          content:
            'A **landing page** is a single-page site with one goal: conversion. A landing page wireframe must clearly guide the user from the headline to the action. The structure follows the "inverted pyramid" principle: the most important content goes at the top.',
        },
        {
          type: 'diagram' as const,
          title: 'Landing Page Wireframe Structure',
          description: 'Typical landing page blocks in top-to-bottom order',
          items: [
            '1. Hero section \u2014 headline, subheadline, CTA button, image',
            '2. Social proof \u2014 client logos or numbers ("10,000+ users")',
            '3. Benefits \u2014 3\u20134 cards with icons',
            '4. How it works \u2014 3 steps with illustrations',
            '5. Testimonials \u2014 2\u20133 quotes with photos',
            '6. Pricing \u2014 comparison table of plans',
            '7. FAQ \u2014 accordion with common questions',
            '8. Final CTA \u2014 repeated call to action',
            '9. Footer \u2014 contacts, links, social media',
          ],
        },
        {
          type: 'before-after' as const,
          title: 'Landing Page Wireframe: Mistakes vs Correct Approach',
          before: {
            label: 'Bad landing page wireframe',
            description: 'Hero without CTA, 8 benefit items (too many), no social proof, pricing hidden at the bottom, 2 different CTAs competing for attention. The user doesn\u2019t know what to do.',
          },
          after: {
            label: 'Good landing page wireframe',
            description: 'Clear headline + one CTA in the hero, 3 benefits, social proof near the CTA, pricing in a prominent position, one repeated CTA. The user\u2019s path is a straight line to conversion.',
          },
        },
        {
          type: 'divider' as const,
        },

        // === WEB: E-COMMERCE ===
        {
          type: 'subheading' as const,
          content: 'Wireframe for E-Commerce',
        },
        {
          type: 'text' as const,
          content:
            'An e-commerce wireframe is more complex than a landing page: you need to design the catalog, product card, cart, and checkout. The key principle is **minimum steps to purchase**. Every extra click reduces conversion by 10\u201315%.',
        },
        {
          type: 'user-flow' as const,
          title: 'E-Commerce User Journey',
          steps: [
            { id: 'home', label: 'Home / Catalog', type: 'start' as const },
            { id: 'search', label: 'Search / Filter', type: 'action' as const },
            { id: 'product', label: 'Product card', type: 'action' as const },
            { id: 'decide', label: 'Add to cart?', type: 'decision' as const },
            { id: 'browse', label: 'Continue browsing', type: 'action' as const },
            { id: 'cart', label: 'Cart', type: 'action' as const },
            { id: 'checkout', label: 'Checkout', type: 'action' as const },
            { id: 'confirm', label: 'Payment confirmation', type: 'action' as const },
            { id: 'success', label: 'Order placed', type: 'end' as const },
          ],
          connections: [
            { from: 'home', to: 'search' },
            { from: 'search', to: 'product' },
            { from: 'product', to: 'decide' },
            { from: 'decide', to: 'browse', label: 'No' },
            { from: 'decide', to: 'cart', label: 'Yes' },
            { from: 'browse', to: 'search' },
            { from: 'cart', to: 'checkout' },
            { from: 'checkout', to: 'confirm' },
            { from: 'confirm', to: 'success' },
          ],
        },
        {
          type: 'divider' as const,
        },

        // === MOBILE: ONBOARDING ===
        {
          type: 'heading' as const,
          content: 'Wireframe for Mobile Apps',
        },
        {
          type: 'text' as const,
          content:
            'A mobile wireframe differs from its web counterpart: less space, navigation via tabs or hamburger menu, gestures instead of clicks. The two most important screens for wireframing are **onboarding** and the **feed**.',
        },
        {
          type: 'subheading' as const,
          content: 'Onboarding: The First 30 Seconds',
        },
        {
          type: 'text' as const,
          content:
            'Onboarding is the user\u2019s first experience in the app. **77% of users delete an app within 3 days** if onboarding doesn\u2019t convince them of its value. An onboarding wireframe should be as simple as possible: 3\u20135 screens with one message on each.',
        },
        {
          type: 'diagram' as const,
          title: 'Onboarding Wireframe Structure',
          description: 'Typical sequence of mobile onboarding screens',
          items: [
            '1. Splash screen \u2014 logo, 1\u20132 seconds',
            '2. Value #1 \u2014 main benefit + illustration',
            '3. Value #2 \u2014 second benefit + illustration',
            '4. Value #3 \u2014 third benefit + illustration',
            '5. Sign up \u2014 email/Google/Apple, minimal fields',
            '6. Personalization \u2014 1\u20132 questions for customization',
            '7. Done \u2014 first useful screen of the app',
          ],
        },
        {
          type: 'callout' as const,
          variant: 'warning' as const,
          content:
            'A common mistake is making onboarding too long. If you have more than 5 screens before the "aha moment" (the moment the user understands the value), cut it down. **The best onboarding is the one that doesn\u2019t exist.**',
        },
        {
          type: 'divider' as const,
        },

        // === MOBILE: FEED ===
        {
          type: 'subheading' as const,
          content: 'Feed: The Infinite Scroll Pattern',
        },
        {
          type: 'text' as const,
          content:
            'A feed wireframe should show: content type (text, photo, video), user actions (like, comment, share), navigation (tabs, search), and **states** \u2014 empty feed, loading, network error.',
        },
        {
          type: 'before-after' as const,
          title: 'Mobile Feed Wireframe',
          before: {
            label: 'Bad feed wireframe',
            description: 'Only one post shown without context, no navigation, no states (empty feed, error), no scroll indicator. The developer doesn\u2019t understand how the feed behaves.',
          },
          after: {
            label: 'Good feed wireframe',
            description: '2\u20133 posts of different types shown (text, photo, video), bottom navigation (tab bar), pull-to-refresh, skeleton loading, empty state with CTA, error with a "Retry" button.',
          },
        },
        {
          type: 'divider' as const,
        },

        // === SAAS: DASHBOARD ===
        {
          type: 'heading' as const,
          content: 'Wireframe for SaaS',
        },
        {
          type: 'text' as const,
          content:
            'A SaaS dashboard is one of the most complex wireframe types. You need to display **a lot of data** simultaneously without overwhelming the user. The two key screens are the **dashboard** (overview panel) and **settings**.',
        },
        {
          type: 'subheading' as const,
          content: 'Dashboard: Key Metrics Overview',
        },
        {
          type: 'text' as const,
          content:
            'A dashboard wireframe follows the "general to specific" principle: KPI cards first (the most important numbers), then charts (trends), then a table (details). The user scans the screen top to bottom, from macro to micro.',
        },
        {
          type: 'diagram' as const,
          title: 'Typical Dashboard Layout',
          description: 'SaaS dashboard wireframe zones',
          items: [
            'Sidebar \u2014 section navigation (left, 240px)',
            'Header \u2014 search, notifications, profile (top)',
            'KPI row \u2014 4 cards with key metrics',
            'Chart area \u2014 1\u20132 charts (line chart, bar chart)',
            'Table \u2014 detailed data table with filters',
            'Action bar \u2014 action buttons (export, filter, add)',
          ],
        },
        {
          type: 'divider' as const,
        },

        // === SAAS: SETTINGS ===
        {
          type: 'subheading' as const,
          content: 'Settings: Structure',
        },
        {
          type: 'text' as const,
          content:
            'The settings page is a frequent source of UX problems in SaaS. The wireframe should account for: grouping settings by category (profile, security, notifications, integrations), saving changes (auto-save vs a "Save" button), and navigation within settings.',
        },
        {
          type: 'callout' as const,
          variant: 'example' as const,
          content:
            'The Stripe/GitHub pattern: vertical tabs on the left (Profile, Security, Notifications...) + content on the right. Each section is a separate form with a "Save" button at the bottom. Simple, proven, familiar to users.',
        },
        {
          type: 'divider' as const,
        },

        // === DATA: CHARTS & FILTERS ===
        {
          type: 'heading' as const,
          content: 'Wireframe for Data: Charts and Filters',
        },
        {
          type: 'text' as const,
          content:
            'Wireframing data pages (analytics, reports) is a separate discipline. The important thing is to show not specific numbers, but **visualization types** and **interactivity**: which filters are available, how the chart changes when the time period is adjusted, what happens when you click on a chart segment.',
        },
        {
          type: 'text' as const,
          content:
            'When wireframing charts, use **placeholder labels**: a rectangle with a caption like "Line chart \u2014 Revenue" instead of trying to draw a realistic chart. The wireframe\u2019s goal is to show **what data** and **in what format**, not how it looks.',
        },
        {
          type: 'before-after' as const,
          title: 'Analytics Page Wireframe',
          before: {
            label: 'Bad analytics wireframe',
            description: 'One large chart taking the entire screen, no filters, no export, no way to change the time period, no axis labels. The user cannot interact with the data.',
          },
          after: {
            label: 'Good analytics wireframe',
            description: 'Period filter (7d/30d/90d/year), 3 KPI cards at the top, line chart + bar chart side by side, table at the bottom with sorting, CSV export button. Every element is annotated.',
          },
        },
        {
          type: 'divider' as const,
        },

        // === PATTERNS ===
        {
          type: 'heading' as const,
          content: 'Common Wireframe Patterns',
        },
        {
          type: 'text' as const,
          content:
            'There is no need to reinvent the wheel. Most interfaces are composed of standard patterns. Knowing these patterns speeds up wireframing by 3\u20135x.',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'Navigation',
              items: [
                'Top bar \u2014 horizontal navigation at the top',
                'Sidebar \u2014 vertical menu on the left',
                'Tab bar \u2014 bottom tabs (mobile)',
                'Hamburger \u2014 hidden side menu',
                'Breadcrumbs \u2014 navigation path',
                'Mega menu \u2014 dropdown menu with groups',
              ],
            },
            {
              title: 'Forms',
              items: [
                'Single-column \u2014 fields in one column',
                'Multi-step \u2014 step-by-step form with progress',
                'Inline validation \u2014 errors next to the field',
                'Floating labels \u2014 label inside the field',
                'Auto-complete \u2014 suggestions while typing',
                'Progressive disclosure \u2014 fields appear as you fill in',
              ],
            },
            {
              title: 'Cards',
              items: [
                'Media card \u2014 image + text',
                'Stat card \u2014 KPI with icon',
                'Profile card \u2014 avatar + name + actions',
                'Action card \u2014 CTA inside the card',
                'List card \u2014 title + description',
                'Pricing card \u2014 plan + features + button',
              ],
            },
            {
              title: 'Tables and Modals',
              items: [
                'Data table \u2014 sorting, filtering, pagination',
                'Responsive table \u2014 horizontal scroll on mobile',
                'Confirmation modal \u2014 "Are you sure?" + 2 buttons',
                'Form modal \u2014 form inside a modal window',
                'Side panel \u2014 slide-out panel from the right',
                'Bottom sheet \u2014 slide-up panel from the bottom (mobile)',
              ],
            },
          ],
        },
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=qpH7-KFWZRI',
          title: 'UI Design Patterns You Should Know',
          caption: 'An overview of key UI design patterns every designer should know',
        },
        {
          type: 'divider' as const,
        },

        // === BEFORE-AFTER IMPROVEMENTS ===
        {
          type: 'heading' as const,
          content: 'Before and After: Improving Wireframes',
        },
        {
          type: 'text' as const,
          content:
            'Let\u2019s look at common wireframe mistakes and how to fix them. Each example is a real-world situation from practice.',
        },
        {
          type: 'before-after' as const,
          title: 'Registration Form Wireframe',
          before: {
            label: 'Before: 12 fields on one screen',
            description: 'First name, last name, email, password, confirm password, phone, date of birth, gender, country, city, zip code, newsletter consent \u2014 all on one screen. The user sees a "wall" of fields and leaves.',
          },
          after: {
            label: 'After: 3-step form',
            description: 'Step 1: Email + password (2 fields). Step 2: Name + phone. Step 3: The rest (optional). Progress bar at the top. The user fills it out easily without feeling overwhelmed.',
          },
        },
        {
          type: 'before-after' as const,
          title: 'SaaS Navigation Wireframe',
          before: {
            label: 'Before: 15 items in the sidebar',
            description: 'All sections in a flat list: Dashboard, Analytics, Users, Settings, Reports, Billing, Integrations, API, Logs, Team, Notifications, Help, Profile, Security, Export. The user gets lost.',
          },
          after: {
            label: 'After: Grouped by category',
            description: 'Groups: "Core" (Dashboard, Analytics, Reports), "Management" (Users, Team, Billing), "Settings" (Settings, Security, Integrations). Dividers and icons help with orientation.',
          },
        },
        {
          type: 'divider' as const,
        },

        // === ACCESSIBILITY IN WIREFRAMES ===
        {
          type: 'heading' as const,
          content: 'Accessibility in Wireframes',
        },
        {
          type: 'text' as const,
          content:
            'Accessibility must be built in **at the wireframe stage**, not "added later." If the wireframe has no space for error text, alt text for images, or focus states, the final design won\u2019t have them either.',
        },
        {
          type: 'text' as const,
          content:
            'Key accessibility principles in wireframes: (1) **Reading order** \u2014 the wireframe should read top to bottom, left to right in a logical sequence. (2) **Touch target size** \u2014 buttons must be at least 44x44px. (3) **Form labels** \u2014 every input field is labeled, not just using a placeholder. (4) **Alternatives** \u2014 every visual element has a text equivalent.',
        },
        {
          type: 'checklist' as const,
          title: 'Wireframe Accessibility Checklist',
          items: [
            'All images have alt text annotations',
            'Buttons and links are labeled with clear actions (not "Click here")',
            'Forms have visible labels (not just placeholders)',
            'Tab order is marked (1, 2, 3...)',
            'Focus states are shown for interactive elements',
            'Touch target sizes are at least 44x44px',
            'Text error messages are provided next to fields',
            'Keyboard navigation is described in annotations',
            'Headings have a clear hierarchy (H1 \u2192 H2 \u2192 H3)',
          ],
        },
        {
          type: 'callout' as const,
          variant: 'warning' as const,
          content:
            '15% of the population has some form of disability. If your wireframe doesn\u2019t account for accessibility, you\u2019re losing 15% of your audience before a single line of code is written.',
        },
        {
          type: 'divider' as const,
        },

        // === CASE STUDY: REAL PROJECT ===
        {
          type: 'case-study' as const,
          title: 'Wireframing the Duolingo App',
          company: 'Duolingo',
          problem: 'Duolingo needed to redesign the app\u2019s main screen \u2014 the lesson tree had become too linear and boring, and users were losing motivation after the first 2 weeks.',
          solution: 'The design team created 200+ wireframes for the new format. They tested variations with paper prototypes, then moved to Figma. The result was "Path" (a non-linear lesson map) with gamification and visual progress.',
          result: 'Day-14 retention increased by 17%. Time spent in the app grew by 22%. The new format became Duolingo\u2019s signature feature.',
          steps: [
            { title: 'Research', description: 'Analyzed data: where users drop off, which lessons they skip, what motivates them' },
            { title: 'Crazy 8s', description: '30 designers ran 5 rounds of Crazy 8s = 1,200 variations' },
            { title: 'Paper testing', description: 'Top 10 variations tested with 50 users' },
            { title: 'Digital wireframe', description: 'Final 3 variations detailed in Figma' },
            { title: 'A/B test', description: 'Final wireframes turned into prototypes and tested in production' },
          ],
        },
        {
          type: 'divider' as const,
        },

        // === VIDEO ===
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=pN92rnO_n5U',
          title: 'Wireframing for UX \u2014 What It Is and How to Get Better at It',
          caption: 'A detailed breakdown of wireframing from NNGroup: methods, tools, and best practices',
        },
        {
          type: 'divider' as const,
        },

        // === COMMON MISTAKES ===
        {
          type: 'heading' as const,
          content: 'Top 7 Wireframing Mistakes',
        },
        {
          type: 'diagram' as const,
          title: 'Mistakes That Kill a Wireframe',
          description: 'The most common mistakes beginner designers make when creating wireframes',
          items: [
            '1. Starting with hi-fi \u2014 spending hours on details before the structure is approved',
            '2. Forgetting states \u2014 showing only the "ideal" scenario',
            '3. Ignoring real content \u2014 "Lorem ipsum" hides problems',
            '4. Not annotating \u2014 a wireframe without explanations = a puzzle',
            '5. Not testing \u2014 "I like it" \u2260 "the user finds it convenient"',
            '6. Blindly copying competitors \u2014 their solutions may not suit your users',
            '7. Not thinking about accessibility \u2014 a wireframe without a11y = design without 15% of the audience',
          ],
        },
        {
          type: 'divider' as const,
        },

        // === FINAL CHECKLIST ===
        {
          type: 'checklist' as const,
          title: 'Checklist: What I Learned in Part 2',
          items: [
            'A landing page follows the "inverted pyramid" principle',
            'E-commerce: minimum steps from catalog to purchase',
            'Mobile onboarding: 3\u20135 screens, one message on each',
            'Feed: show different content types and all states',
            'SaaS dashboard: KPI \u2192 charts \u2192 table (general to specific)',
            'Settings: grouped by category, vertical tabs',
            'Data page: visualization type + filters + interactivity',
            'Standard patterns speed up wireframing by 3\u20135x',
            'Accessibility is built in at the wireframe stage',
            'Wireframe testing is mandatory before moving to visual design',
          ],
        },
      ],
      quiz: [
        {
          question: 'What principle underlies the structure of a landing page wireframe?',
          options: [
            { id: 'a', text: 'Random block placement for a surprise effect' },
            { id: 'b', text: 'Inverted pyramid \u2014 the most important content at the top, details below' },
            { id: 'c', text: 'All blocks the same size for symmetry' },
            { id: 'd', text: 'CTA button only at the bottom of the page' },
          ],
          correctId: 'b',
          explanation:
            'A landing page wireframe follows the "inverted pyramid" principle: the hero with the main message and CTA at the top, supporting content below.',
        },
        {
          question: 'What is the recommended minimum touch target size (buttons) for mobile wireframes?',
          options: [
            { id: 'a', text: '24x24 pixels' },
            { id: 'b', text: '32x32 pixels' },
            { id: 'c', text: '44x44 pixels' },
            { id: 'd', text: '64x64 pixels' },
          ],
          correctId: 'c',
          explanation:
            'WCAG recommends a minimum touch target size of 44x44px. This ensures comfortable tapping for all users, including those with motor impairments.',
        },
        {
          question: 'How should a chart be represented in a wireframe?',
          options: [
            { id: 'a', text: 'Draw a realistic chart with real data' },
            { id: 'b', text: 'Leave an empty space with a note "chart goes here"' },
            { id: 'c', text: 'A rectangle with a label indicating the visualization type and data description' },
            { id: 'd', text: 'Don\u2019t include charts in the wireframe \u2014 that\u2019s a visual design task' },
          ],
          correctId: 'c',
          explanation:
            'In wireframes, charts are represented as placeholders: a rectangle + label (e.g., "Line chart \u2014 Revenue by month"). The goal is to show the data type and format, not the exact appearance.',
        },
        {
          question: 'How many screens are recommended for mobile onboarding before the "aha moment"?',
          options: [
            { id: 'a', text: 'No more than 2 screens' },
            { id: 'b', text: '3\u20135 screens' },
            { id: 'c', text: '7\u201310 screens' },
            { id: 'd', text: 'As many as needed to describe all features' },
          ],
          correctId: 'b',
          explanation:
            'The optimal number is 3\u20135 screens before the moment the user understands the app\u2019s value. A longer onboarding increases the drop-off rate.',
        },
      ],
    },
  ],
}
