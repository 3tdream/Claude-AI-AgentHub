import type { Meeting } from '../../types'

export const meeting02: Meeting = {
  id: '2',
  number: 2,
  title: 'History and Roles',
  description:
    'A journey from the command line to AI interfaces. Key industry figures and roles in modern UX/UI teams.',
  icon: 'History',
  color: 'bg-indigo-500/10 text-indigo-600',
  parts: [
    // ═══════════════════════════════════════
    // Part 1 — History of Interface Design
    // ═══════════════════════════════════════
    {
      id: 'part-1',
      title: 'History of Interface Design',
      subtitle: 'From the command line to AI: 60 years of human-computer interaction evolution',
      duration: '45 min',
      sections: [
        // --- Introduction ---
        {
          type: 'heading' as const,
          content: 'Why should a designer know history?',
        },
        {
          type: 'text' as const,
          content:
            'Before designing the future, you need to understand the past. Every interface you use today is the result of **decades** of experimentation, mistakes, and breakthroughs. Knowing history helps you avoid repeating mistakes and understand **why** solutions work the way they do.',
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'The history of UX/UI is not a boring chronology. It is a detective story: how people learned step by step to communicate with machines.',
        },
        {
          type: 'quote' as const,
          text: 'Design is not just what it looks like and feels like. Design is how it works.',
          author: 'Steve Jobs',
          role: 'Co-founder of Apple',
        },

        { type: 'divider' as const },

        // --- Timeline ---
        {
          type: 'heading' as const,
          content: 'The Grand Timeline: 7 Eras of Interface Design',
        },
        {
          type: 'text' as const,
          content:
            'Let us trace the path from the first computers to modern AI interfaces. Each era brought a fundamental shift in **how** people interact with technology.',
        },
        {
          type: 'timeline' as const,
          events: [
            {
              year: '1960s',
              title: 'The Command Line Era (CLI)',
              description:
                'The only way to communicate with a computer was through text commands. Users had to **memorize** the syntax. The interface existed only for engineers. Douglas Engelbart\'s first mouse appeared (1968).',
            },
            {
              year: '1970s',
              title: 'The Birth of GUI at Xerox PARC',
              description:
                'Alan Kay and the Xerox PARC team created the Xerox Alto — the first computer with a **graphical interface**, windows, and a mouse. The WYSIWYG concept emerged. The world was not yet ready for mass adoption.',
            },
            {
              year: '1984',
              title: 'Apple Macintosh — GUI for Everyone',
              description:
                'Steve Jobs was inspired by Xerox\'s ideas and released the Macintosh — the first mass-market computer with a graphical interface. **The desktop metaphor**: folders, trash can, drag & drop. The interface became intuitive.',
            },
            {
              year: '1990s',
              title: 'Web 1.0 and the Birth of Web Design',
              description:
                'Tim Berners-Lee created the WWW (1991). The first websites were bare HTML. Netscape appeared, along with table-based layouts and GIF animations. **Jakob Nielsen** formulated usability principles. The era of UX as a discipline began.',
            },
            {
              year: '2000s',
              title: 'Web 2.0 and Interactive Interfaces',
              description:
                'Ajax, Flash, dynamic pages. Gmail, Google Maps, and Facebook appeared. The user transformed from a viewer into a **participant**. Don Norman coined the term "User Experience." The UX design profession began to flourish.',
            },
            {
              year: '2007–2015',
              title: 'Mobile First and Touch Interfaces',
              description:
                'The iPhone (2007) changed everything. Swipe, pinch, tap — a new gesture language. **Responsive design** (Ethan Marcotte, 2010). The App Store created a mobile application ecosystem. Material Design and iOS Human Interface Guidelines.',
            },
            {
              year: '2020s',
              title: 'AI, Voice, AR, and Neural Interfaces',
              description:
                'Siri, Alexa, ChatGPT — **conversational interfaces**. AR/VR (Apple Vision Pro). Generative AI helps create interfaces. Design becomes multimodal: voice + gesture + text + gaze.',
            },
          ],
        },

        { type: 'divider' as const },

        // --- CLI Era ---
        {
          type: 'subheading' as const,
          content: 'The CLI Era: When the User Was a Programmer',
        },
        {
          type: 'text' as const,
          content:
            'In the 1960s, computers were the size of a room, and interacting with them required knowledge of special commands. There was no mouse, no icons — just a **text terminal**. A single character error could cost hours of work.',
        },
        {
          type: 'before-after' as const,
          title: 'Evolution: From CLI to GUI',
          before: {
            label: 'CLI (1960s)',
            description:
              'Black screen, green text. The command "rm -rf /" deletes everything. No undo. No hints. You had to memorize hundreds of commands. One typo = catastrophe.',
          },
          after: {
            label: 'GUI (1984+)',
            description:
              'Icons, windows, mouse cursor. You could drag a file to the trash. Undo existed (Ctrl+Z). Visual hints. Real-world metaphors made the interface understandable even to a child.',
          },
        },
        {
          type: 'image-placeholder' as const,
          alt: 'Comparison of a CLI terminal and the 1984 Macintosh GUI',
          caption:
            'Left: Unix terminal (1970s). Right: Macintosh desktop (1984). Two different universes.',
        },

        { type: 'divider' as const },

        // --- Key Figures ---
        {
          type: 'heading' as const,
          content: 'Key Figures: The People Who Changed Interfaces',
        },
        {
          type: 'text' as const,
          content:
            'Behind every breakthrough stands a specific person (or team). Let us meet those without whom modern UX/UI would be impossible.',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'Don Norman',
              items: [
                'Coined the term "User Experience" at Apple (1993)',
                'Book "The Design of Everyday Things" — the UX bible',
                'Concepts of affordance and signifier',
                'Cognitive science professor turned designer',
              ],
            },
            {
              title: 'Jakob Nielsen',
              items: [
                '10 usability heuristics (1994) — still in use today',
                'Founder of Nielsen Norman Group',
                'Pioneer of usability testing',
                '"5 users will find 85% of problems"',
              ],
            },
            {
              title: 'Steve Jobs',
              items: [
                'Macintosh (1984) — GUI for the masses',
                'iPod → iPhone → iPad — a gesture ecosystem',
                'Obsession with detail and simplicity',
                '"Design is not how it looks, but how it works"',
              ],
            },
            {
              title: 'Dieter Rams',
              items: [
                '10 principles of good design (Braun)',
                'Inspired Jony Ive (Apple)',
                '"Good design is as little design as possible"',
                'Bridge between industrial and digital design',
              ],
            },
          ],
        },
        {
          type: 'quote' as const,
          text: 'Good design is as little design as possible. Less, but better, because it concentrates on the essential aspects, and the products are not burdened with non-essentials.',
          author: 'Dieter Rams',
          role: 'Chief Designer at Braun',
        },
        {
          type: 'quote' as const,
          text: 'The two most important days in product development are the day you understand why, and the day the user understands how.',
          author: 'Don Norman',
          role: 'Author of "The Design of Everyday Things"',
        },

        { type: 'divider' as const },

        // --- Web Evolution ---
        {
          type: 'heading' as const,
          content: 'Platform Evolution: Web → Mobile → SaaS → Data',
        },
        {
          type: 'subheading' as const,
          content: 'Web 1.0 → Web 2.0 → Web 3.0',
        },
        {
          type: 'text' as const,
          content:
            'The web evolved from static pages (Web 1.0) through interactive services (Web 2.0) to **personalized AI interfaces** (Web 3.0). Each stage required new approaches to design.',
        },
        {
          type: 'before-after' as const,
          title: 'Web Design Evolution',
          before: {
            label: 'Web 1.0 (1995)',
            description:
              'Table-based layouts, GIF animations, visitor counters, Comic Sans, "best viewed at 800×600." Each page was a separate document. No interactivity.',
          },
          after: {
            label: 'Modern Web (2025)',
            description:
              'SPA/SSR, responsive design, design systems, micro-animations, AI-powered personalization. The user does not notice the interface — it simply works.',
          },
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            {
              term: 'Mobile First',
              definition:
                'A design approach where the mobile version is designed first, then expanded for desktop. Introduced by Luke Wroblewski (2009).',
            },
            {
              term: 'SaaS Interfaces',
              definition:
                'Complex dashboards, tables, forms, and settings. Design should simplify complexity, not add beauty.',
            },
            {
              term: 'Data Dashboards',
              definition:
                'Data visualization: charts, metrics, KPIs. Requires an understanding of information architecture and cognitive load.',
            },
            {
              term: 'Design System',
              definition:
                'A set of reusable components and rules: colors, typography, buttons, forms. Examples: Material Design, Ant Design, Apple HIG.',
            },
          ],
        },

        { type: 'divider' as const },

        // --- Video ---
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=r36NNGzNvjo',
          title: 'The History of User Interfaces',
          caption:
            'An overview of user interface history from the first computers to the present day (English)',
        },

        // --- Case Study ---
        {
          type: 'case-study' as const,
          title: 'How the iPhone Changed the Concept of an Interface',
          company: 'Apple',
          problem:
            'In 2006, smartphones had physical keyboards and styluses. Interfaces were complex and required training.',
          solution:
            'Apple removed all buttons except one. A multitouch screen combined with intuitive gestures (pinch, swipe, tap). The metaphor of direct object manipulation.',
          result:
            'The iPhone sold 1.5 billion devices. It created the mobile app industry. It defined the standard for touch interfaces for decades.',
          steps: [
            {
              title: 'Research',
              description:
                'Jobs and his team studied every existing smartphone and realized: the problem was the physical keyboard.',
            },
            {
              title: 'Prototyping',
              description:
                'Hundreds of gesture prototypes. Engineers tested pinch-to-zoom for months.',
            },
            {
              title: 'Launch',
              description:
                'January 9, 2007 — the iPhone presentation. "Today Apple reinvents the phone."',
            },
          ],
        },

        { type: 'divider' as const },

        // --- Rams' 10 Principles ---
        {
          type: 'subheading' as const,
          content: 'Dieter Rams\' 10 Principles of Good Design',
        },
        {
          type: 'text' as const,
          content:
            'Dieter Rams formulated these principles for Braun\'s industrial design, but they are **perfectly** applicable to digital interfaces. Memorize them — they are the foundation of the profession.',
        },
        {
          type: 'checklist' as const,
          title: 'Rams\' 10 Principles',
          items: [
            'Good design is innovative',
            'Good design makes a product useful',
            'Good design is aesthetic',
            'Good design makes a product understandable',
            'Good design is unobtrusive',
            'Good design is honest',
            'Good design is long-lasting',
            'Good design is thorough down to the last detail',
            'Good design is environmentally friendly',
            'Good design is as little design as possible',
          ],
        },
        {
          type: 'callout' as const,
          variant: 'example' as const,
          content:
            'Compare the Braun ET66 calculator (1987) and the iOS Calculator app. The similarity is no coincidence — Jony Ive was a devoted admirer of Rams.',
        },

        // --- Part 1 Summary ---
        {
          type: 'heading' as const,
          content: 'Part 1 Summary',
        },
        {
          type: 'diagram' as const,
          title: 'Key Milestones',
          description: 'From CLI to AI — each era expanded the user audience',
          items: [
            'CLI (1960s) → user = programmer',
            'GUI (1984) → user = ordinary person',
            'Web (1990s) → user = anyone with internet',
            'Mobile (2007+) → user = anyone with a phone',
            'AI (2020s) → user = anyone who can speak',
          ],
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'The main trend in UX history: **lowering the barrier to entry**. Each era made technology accessible to an ever-growing number of people.',
        },
      ],

      quiz: [
        {
          question: 'Who coined the term "User Experience"?',
          options: [
            { id: 'a', text: 'Jakob Nielsen' },
            { id: 'b', text: 'Steve Jobs' },
            { id: 'c', text: 'Don Norman' },
            { id: 'd', text: 'Dieter Rams' },
          ],
          correctId: 'c',
          explanation:
            'Don Norman coined the term "User Experience" while working at Apple in 1993. The discipline existed before that, but it did not have a common name.',
        },
        {
          question: 'Which company created the first GUI computer (Xerox Alto)?',
          options: [
            { id: 'a', text: 'Apple' },
            { id: 'b', text: 'IBM' },
            { id: 'c', text: 'Microsoft' },
            { id: 'd', text: 'Xerox PARC' },
          ],
          correctId: 'd',
          explanation:
            'Xerox PARC created the Xerox Alto in 1973 — the first computer with a graphical interface, windows, and a mouse. Apple later drew inspiration from these ideas for the Macintosh.',
        },
        {
          question: 'What does the "Mobile First" principle mean?',
          options: [
            { id: 'a', text: 'First build a mobile app, then a website' },
            { id: 'b', text: 'Design for mobile devices first, then expand for desktop' },
            { id: 'c', text: 'The mobile version is more important than the desktop version' },
            { id: 'd', text: 'All users browse from their phones' },
          ],
          correctId: 'b',
          explanation:
            'Mobile First is an approach where design starts with the mobile version (the smallest screen) and gradually expands for tablets and desktop.',
        },
        {
          question: 'Which year is considered the turning point for touch interfaces?',
          options: [
            { id: 'a', text: '2001 — iPod release' },
            { id: 'b', text: '2004 — Facebook launch' },
            { id: 'c', text: '2007 — iPhone presentation' },
            { id: 'd', text: '2010 — iPad release' },
          ],
          correctId: 'c',
          explanation:
            'The iPhone presentation on January 9, 2007 was the turning point. Apple demonstrated that a multitouch screen could completely replace a physical keyboard.',
        },
      ],
    },

    // ═══════════════════════════════════════
    // Part 2 — Roles in a UX/UI Team
    // ═══════════════════════════════════════
    {
      id: 'part-2',
      title: 'Roles in a UX/UI Team',
      subtitle: 'Who does what, how the team is structured, and which path to choose',
      duration: '45 min',
      sections: [
        // --- Introduction ---
        {
          type: 'heading' as const,
          content: 'The World of UX/UI Is Not a One-Person Show',
        },
        {
          type: 'text' as const,
          content:
            'Many people think that a "designer" is one person who draws pictures. In reality, behind every modern product stands a **whole team** with different specializations. Understanding roles will help you choose your own path and work effectively within a team.',
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'In small startups, one person may combine several roles. In large companies (Google, Meta, Amazon), each role is a separate position with a clear focus.',
        },
        {
          type: 'quote' as const,
          text: 'If you think good design is expensive, you should look at the cost of bad design.',
          author: 'Ralf Speth',
          role: 'CEO of Jaguar Land Rover',
        },

        { type: 'divider' as const },

        // --- 6 Key Roles ---
        {
          type: 'heading' as const,
          content: '6 Key Roles in a UX/UI Team',
        },
        {
          type: 'subheading' as const,
          content: '1. UX Researcher',
        },
        {
          type: 'text' as const,
          content:
            'The UX Researcher is the "ears and eyes" of the team. They **talk to users**, conduct tests, gather data, and turn it into insights upon which design is built.',
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            {
              term: 'In-Depth Interviews',
              definition:
                'One-on-one sessions with users: understanding their tasks, pain points, and the context in which they use the product.',
            },
            {
              term: 'Usability Testing',
              definition:
                'Observing how a real user completes a task within the interface. Finds problems before launch.',
            },
            {
              term: 'A/B Tests',
              definition:
                'Comparing two interface variants with real users. Data decides which variant is better.',
            },
          ],
        },

        {
          type: 'subheading' as const,
          content: '2. UX Designer',
        },
        {
          type: 'text' as const,
          content:
            'The UX Designer is responsible for the **logic and structure** of the product. They design user scenarios, information architecture, and wireframes. Their main goal is to make the product **convenient and intuitive**.',
        },
        {
          type: 'checklist' as const,
          title: 'UX Designer Artifacts',
          items: [
            'User Flow — the user journey map',
            'Wireframes — schematic layouts without visuals',
            'Information Architecture (IA)',
            'User Story Map',
            'Prototypes for testing',
          ],
        },

        {
          type: 'subheading' as const,
          content: '3. UI Designer',
        },
        {
          type: 'text' as const,
          content:
            'The UI Designer transforms wireframes into **beautiful visual design**. Colors, fonts, icons, animations — all of this is the UI Designer\'s domain. They create what the user sees and admires.',
        },
        {
          type: 'comparison' as const,
          title: 'UX Designer vs UI Designer',
          items: [
            {
              label: 'Focus',
              ux: 'How the product works',
              ui: 'How the product looks',
            },
            {
              label: 'Artifacts',
              ux: 'Wireframes, flows, prototypes',
              ui: 'Mockups, design system, icons',
            },
            {
              label: 'Tools',
              ux: 'Figma (wireframes), Miro, FigJam',
              ui: 'Figma (hi-fi), Illustrator, After Effects',
            },
            {
              label: 'Success Metric',
              ux: 'Task completed quickly and without errors',
              ui: 'Visually appealing and consistent',
            },
            {
              label: 'Analogy',
              ux: 'Building architect (floor plan)',
              ui: 'Interior designer (decor)',
            },
          ],
        },

        { type: 'divider' as const },

        {
          type: 'subheading' as const,
          content: '4. Product Designer',
        },
        {
          type: 'text' as const,
          content:
            'The Product Designer is a **generalist** who combines UX and UI. They think not only about design but also about business metrics: conversion, retention, revenue. In startups and product teams, this is the most in-demand role.',
        },
        {
          type: 'callout' as const,
          variant: 'example' as const,
          content:
            'At companies like Google, Spotify, and Airbnb, a Product Designer works in the same team as the product manager and developers. They participate in every stage — from research to feature launch.',
        },

        {
          type: 'subheading' as const,
          content: '5. Design System Lead',
        },
        {
          type: 'text' as const,
          content:
            'This specialist creates and maintains the **design system** — a set of reusable components, tokens, and rules. The design system ensures product consistency as the team scales.',
        },
        {
          type: 'diagram' as const,
          title: 'Design System Structure',
          description: 'Design system components from base tokens to ready-made patterns',
          items: [
            'Tokens (colors, fonts, spacing, shadows)',
            'Atoms (button, input, icon, checkbox)',
            'Molecules (search field, card, header)',
            'Organisms (registration form, navigation)',
            'Templates (page layout, grid)',
            'Pages (complete screens built from components)',
          ],
        },

        {
          type: 'subheading' as const,
          content: '6. UX Writer',
        },
        {
          type: 'text' as const,
          content:
            'The UX Writer is responsible for **all text in the interface**: buttons, notifications, errors, tooltips, onboarding. Good copy is invisible. Bad copy is the reason for 80% of support tickets.',
        },
        {
          type: 'before-after' as const,
          title: 'The Power of UX Copy',
          before: {
            label: 'Bad UX Copy',
            description:
              '"Error 403: Forbidden. Access denied." — the user does not understand what to do. Panic and abandonment.',
          },
          after: {
            label: 'Good UX Copy',
            description:
              '"You do not have access to this page. Contact your administrator or return to the homepage." — clear and actionable.',
          },
        },

        { type: 'divider' as const },

        // --- Double Diamond ---
        {
          type: 'heading' as const,
          content: 'Double Diamond: The Design Process',
        },
        {
          type: 'text' as const,
          content:
            'The Double Diamond is a design process model developed by the **British Design Council** in 2005. It describes four phases of work that every project goes through.',
        },
        {
          type: 'diagram' as const,
          title: 'The Four Phases of the Double Diamond',
          description: 'Diverge → Converge → Diverge → Converge',
          items: [
            '1. Discover — understand the problem, gather data, interviews, observations',
            '2. Define — formulate the exact problem, prioritize',
            '3. Develop — generate ideas, prototype, test',
            '4. Deliver — final design, handoff to development, launch',
          ],
        },
        {
          type: 'callout' as const,
          variant: 'warning' as const,
          content:
            'A common junior mistake: jumping straight to Deliver (drawing mockups), skipping Discover and Define. The result is beautiful design that does not solve the real problem.',
        },
        {
          type: 'text' as const,
          content:
            'Each role is especially active during certain phases: **Researcher** — during Discover, **UX Designer** — during Define and Develop, **UI Designer** — during Develop and Deliver, **Product Designer** — during all four.',
        },

        { type: 'divider' as const },

        // --- Video ---
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=_r0VX-aU_T8',
          title: 'What is UX Design? (2024)',
          caption:
            'An overview of roles in a UX/UI team and the design process (English, with subtitles)',
        },

        // --- Career Paths ---
        {
          type: 'heading' as const,
          content: 'Career Paths in UX/UI',
        },
        {
          type: 'text' as const,
          content:
            'A career in design is not a single straight line. There are **several directions**, and you can switch between them at different stages of your career.',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'IC Track (Individual Contributor)',
              items: [
                'Junior Designer → Middle → Senior → Staff → Principal',
                'Deep expertise in one area',
                'Seniors can earn as much as managers',
                'Focus on craft and mentorship',
              ],
            },
            {
              title: 'Management Track',
              items: [
                'Senior → Design Lead → Head of Design → VP/CDO',
                'Managing teams and processes',
                'Design strategy at the company level',
                'Less hands-on design, more communication',
              ],
            },
            {
              title: 'Specialization',
              items: [
                'UX Research → Research Lead',
                'Design Systems → DS Architect',
                'UX Writing → Content Design Lead',
                'Motion Design → Creative Director',
              ],
            },
          ],
        },

        { type: 'divider' as const },

        // --- Team Structures ---
        {
          type: 'heading' as const,
          content: 'How Teams Differ by Product Type',
        },
        {
          type: 'text' as const,
          content:
            'Team structure depends on **what** you are designing. A web studio, a mobile app, a SaaS platform, and a data product each require different team compositions and processes.',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'Web / Marketing',
              items: [
                'UI Designer (visuals, landing pages)',
                'UX Writer (content, CTAs)',
                'Motion Designer (animations)',
                'Fast iterations, A/B tests',
              ],
            },
            {
              title: 'Mobile App',
              items: [
                'Product Designer (UX+UI)',
                'UX Researcher (usability)',
                'Knowledge of iOS HIG / Material Design',
                'Platform patterns and gestures',
              ],
            },
            {
              title: 'SaaS / B2B',
              items: [
                'UX Designer (complex scenarios)',
                'DS Lead (design system)',
                'UX Researcher (enterprise interviews)',
                'Long cycles, complex IA',
              ],
            },
            {
              title: 'Data / Dashboard',
              items: [
                'UX Designer + Data Viz specialist',
                'Understanding of statistics and metrics',
                'Working with Recharts, D3, Tableau',
                'Cognitive load — the main challenge',
              ],
            },
          ],
        },

        { type: 'divider' as const },

        // --- Persona ---
        {
          type: 'subheading' as const,
          content: 'Example: What a Designer\'s Journey Looks Like',
        },
        {
          type: 'user-persona' as const,
          persona: {
            name: 'Anna Parker',
            age: 28,
            role: 'Middle Product Designer @ Spotify',
            bio: 'Completed a UX/UI course 3 years ago. Started as a junior UI designer at a small agency. After 1.5 years, transitioned to a product company. Now leads the design of a mobile banking experience.',
            goals: [
              'Grow into a Senior Product Designer',
              'Learn to conduct research independently',
              'Deepen prototyping skills',
              'Start mentoring juniors',
            ],
            frustrations: [
              'Does not always understand how to measure design impact on business metrics',
              'Finds it difficult to justify design decisions to stakeholders',
              'Wants more research but has no UX researcher on the team',
            ],
            traits: [
              { label: 'Figma', value: '9/10' },
              { label: 'Research', value: '5/10' },
              { label: 'Prototyping', value: '7/10' },
              { label: 'Presenting Ideas', value: '6/10' },
            ],
            quote: 'The best design is the one the user does not notice.',
          },
        },

        { type: 'divider' as const },

        // --- Tools ---
        {
          type: 'subheading' as const,
          content: 'Tools by Role',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'UX Research',
              items: ['Maze', 'Hotjar', 'Lookback', 'Google Analytics', 'Dovetail'],
            },
            {
              title: 'UX/UI Design',
              items: ['Figma', 'Sketch', 'Adobe XD', 'Framer', 'Principle'],
            },
            {
              title: 'Design Systems',
              items: ['Figma Libraries', 'Storybook', 'ZeroHeight', 'Supernova'],
            },
            {
              title: 'UX Writing',
              items: ['Frontitude', 'Writer', 'Figma (text layers)', 'Notion'],
            },
          ],
        },

        // --- Summary ---
        {
          type: 'heading' as const,
          content: 'Part 2 Summary',
        },
        {
          type: 'text' as const,
          content:
            'You learned about the **6 key roles** in a UX/UI team, understood the Double Diamond process, and saw how teams differ across product types. The main takeaway: **design is teamwork**, and every role makes a unique contribution.',
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'Tip: at the start of your career, it is better to try the Product Designer role — it will give you a broad perspective. You can specialize later, once you understand what resonates with you most.',
        },
        {
          type: 'checklist' as const,
          title: 'Homework',
          items: [
            'Choose 2-3 roles that appeal to you',
            'Find 3 job listings for each role on LinkedIn — compare the requirements',
            'Read 1 article by Jakob Nielsen on nngroup.com',
            'Try to describe the Double Diamond in your own words',
          ],
        },
      ],

      quiz: [
        {
          question: 'Which role is responsible for interface text (buttons, errors, tooltips)?',
          options: [
            { id: 'a', text: 'UI Designer' },
            { id: 'b', text: 'UX Writer' },
            { id: 'c', text: 'Product Manager' },
            { id: 'd', text: 'Frontend Developer' },
          ],
          correctId: 'b',
          explanation:
            'The UX Writer specializes in all interface text: buttons, notifications, errors, and onboarding tooltips.',
        },
        {
          question: 'How many phases are there in the Double Diamond model?',
          options: [
            { id: 'a', text: '2' },
            { id: 'b', text: '3' },
            { id: 'c', text: '4' },
            { id: 'd', text: '5' },
          ],
          correctId: 'c',
          explanation:
            'The Double Diamond consists of 4 phases: Discover, Define, Develop, and Deliver.',
        },
        {
          question: 'How does a Product Designer differ from a UI Designer?',
          options: [
            { id: 'a', text: 'A Product Designer only creates mockups' },
            { id: 'b', text: 'A Product Designer combines UX and UI and focuses on business metrics' },
            { id: 'c', text: 'A Product Designer manages the team' },
            { id: 'd', text: 'They are the same thing' },
          ],
          correctId: 'b',
          explanation:
            'A Product Designer is a generalist who combines UX and UI design skills. Unlike a UI Designer, they also focus on business metrics: conversion, retention, and revenue.',
        },
        {
          question: 'Which product type requires the most attention to cognitive load?',
          options: [
            { id: 'a', text: 'Landing page' },
            { id: 'b', text: 'Mobile app' },
            { id: 'c', text: 'Data dashboard' },
            { id: 'd', text: 'Blog' },
          ],
          correctId: 'c',
          explanation:
            'Data dashboards contain large amounts of data, charts, and metrics. Cognitive load is the primary design challenge.',
        },
      ],
    },
  ],
}
