import type { Meeting } from '../../types'

export const meeting01: Meeting = {
  id: '1',
  number: 1,
  title: 'Introduction to UX/UI',
  description: 'Getting acquainted with the world of UX/UI design: definitions, differences, examples of good and bad design, business value, and real-world case studies.',
  icon: 'BookOpen',
  color: 'bg-blue-500/10 text-blue-600',
  parts: [
    {
      id: 'part-1',
      title: 'What is UX and UI',
      subtitle: 'Definitions, differences, and examples of good and bad design',
      duration: '45 min',
      sections: [
        // === INTRODUCTION ===
        {
          type: 'heading' as const,
          content: 'Welcome to the world of UX/UI design',
        },
        {
          type: 'text' as const,
          content:
            'Every day we interact with dozens of digital products — apps, websites, terminals. Some are a pleasure to use, others are frustrating. The difference between them is **UX/UI design**. In this lesson, we will explore what lies behind these concepts and why they matter so much.',
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'UX/UI design is not just about "making things pretty." It is the science of how people think, act, and feel when using a product.',
        },
        {
          type: 'image' as const,
          src: '/images/meeting-01-user-devices.webp',
          alt: 'Illustration: a user interacting with various digital devices',
          caption: 'We are surrounded by design — both good and bad',
        },
        {
          type: 'divider' as const,
        },

        // === UX ===
        {
          type: 'heading' as const,
          content: 'What is UX (User Experience)',
        },
        {
          type: 'text' as const,
          content:
            '**UX (User Experience)** is the overall set of feelings, emotions, and impressions a person has when interacting with a product. UX encompasses the **entire journey** of the user: from the first encounter to regular use.',
        },
        {
          type: 'text' as const,
          content:
            'Imagine walking into a restaurant. UX is the **entire experience**: how you were greeted, how comfortable the seating is, how quickly the menu arrived, how easy it is to read, how good the food tastes, and how pleasant it was to pay. It is not just the food (the product), but everything around it.',
        },
        {
          type: 'callout' as const,
          variant: 'example' as const,
          content:
            'Real-life analogy: UX is like the commute from home to work. Even if the office is stunning (UI), but the commute takes 3 hours in traffic — the overall experience (UX) will be terrible.',
        },
        {
          type: 'quote' as const,
          text: 'Design is not just what it looks like and feels like. Design is how it works.',
          author: 'Steve Jobs',
          role: 'Co-founder of Apple',
        },
        {
          type: 'diagram' as const,
          title: 'Components of UX',
          description: 'UX encompasses many disciplines and aspects',
          items: [
            'User Research',
            'Information Architecture (IA)',
            'Interaction Design',
            'Usability',
            'Accessibility',
            'Content Strategy',
            'Usability Testing',
          ],
        },
        {
          type: 'divider' as const,
        },

        // === UI ===
        {
          type: 'heading' as const,
          content: 'What is UI (User Interface)',
        },
        {
          type: 'text' as const,
          content:
            '**UI (User Interface)** is the **visual part** of a product that the user directly interacts with. Buttons, colors, fonts, icons, animations — all of these are UI elements.',
        },
        {
          type: 'text' as const,
          content:
            'Going back to the restaurant analogy: UI is the **interior design**, the menu layout, the plating of dishes, the beautiful tableware. It is what you **see and touch**.',
        },
        {
          type: 'callout' as const,
          variant: 'example' as const,
          content:
            'Analogy: UI is like the cover of a book. It catches your attention and creates a first impression, but it does not determine the quality of the content.',
        },
        {
          type: 'diagram' as const,
          title: 'UI Elements',
          description: 'Core visual components of a user interface',
          items: [
            'Typography (fonts, sizes, hierarchy)',
            'Color palette (primary, accent, background)',
            'Icons and illustrations',
            'Buttons and controls',
            'Forms and input fields',
            'Layout and grid',
            'Animations and micro-interactions',
          ],
        },
        {
          type: 'divider' as const,
        },

        // === UX vs UI ===
        {
          type: 'heading' as const,
          content: 'UX vs UI: what is the difference?',
        },
        {
          type: 'text' as const,
          content:
            'UX and UI are often confused, but they are **different disciplines** that work together. UX is about **logic and feelings**, UI is about **visuals and aesthetics**. A product can have a beautiful UI but a terrible UX — and vice versa.',
        },
        {
          type: 'comparison' as const,
          title: 'Comparing UX and UI',
          items: [
            {
              label: 'Focus',
              ux: 'How the product works and feels',
              ui: 'How the product looks',
            },
            {
              label: 'Tools',
              ux: 'Research, wireframes, prototypes, tests',
              ui: 'Figma, colors, fonts, icons',
            },
            {
              label: 'Analogy',
              ux: 'Architect of a house (floor plan)',
              ui: 'Interior designer (finishes)',
            },
            {
              label: 'Question',
              ux: 'Is it convenient for the user?',
              ui: 'Does it look good?',
            },
            {
              label: 'Outcome',
              ux: 'The user easily achieves their goal',
              ui: 'The user enjoys the visual experience',
            },
            {
              label: 'Failure',
              ux: 'The user cannot find the payment button',
              ui: 'The payment button exists but is gray on a gray background',
            },
          ],
        },
        {
          type: 'image' as const,
          src: '/images/meeting-01-ux-ui-venn.webp',
          alt: 'Venn diagram: the overlap of UX and UI',
          caption: 'UX and UI overlap but are not the same',
        },
        {
          type: 'divider' as const,
        },

        // === EXAMPLES OF GOOD AND BAD DESIGN ===
        {
          type: 'heading' as const,
          content: 'Examples of good and bad design',
        },
        {
          type: 'text' as const,
          content:
            'The best way to understand UX/UI is to see **specific examples**. Let us look at real cases where design either helped or hindered users.',
        },
        {
          type: 'subheading' as const,
          content: 'Example 1: Registration Form',
        },
        {
          type: 'before-after' as const,
          title: 'Website registration form',
          before: {
            label: 'Bad UX/UI',
            description:
              '20 required fields, tiny text, no hints, an 8-character captcha, and all fields clear after an error. The user abandons registration.',
          },
          after: {
            label: 'Good UX/UI',
            description:
              '3-4 fields, sign in via Google/Apple, auto-suggestions, live validation, progress bar. Registration in 30 seconds.',
          },
        },
        {
          type: 'subheading' as const,
          content: 'Example 2: Mobile Banking App',
        },
        {
          type: 'before-after' as const,
          title: 'Banking application',
          before: {
            label: 'Bad UX',
            description:
              'To transfer money you must go through 7 screens, manually enter a 16-digit card number, confirm via SMS, and press "Confirm" once more. Time: 5 minutes.',
          },
          after: {
            label: 'Good UX',
            description:
              'Transfer by phone number in 2 taps. Contact auto-fill, biometrics instead of SMS, recipient history. Time: 15 seconds.',
          },
        },
        {
          type: 'subheading' as const,
          content: 'Example 3: Website Navigation',
        },
        {
          type: 'before-after' as const,
          title: 'Online store navigation',
          before: {
            label: 'Bad UI',
            description:
              'A menu with 50 items and no categories, 10px gray text on a white background, no search, icons without labels. The user gets lost.',
          },
          after: {
            label: 'Good UI',
            description:
              'Clear categories with icons, dropdown submenus, a visible search bar, breadcrumbs, contrasting colors. The user finds the product in seconds.',
          },
        },
        {
          type: 'callout' as const,
          variant: 'warning' as const,
          content:
            'Important: beautiful design does not equal good design. A site can look stylish but be completely unusable. UX always matters more than UI.',
        },
        {
          type: 'divider' as const,
        },

        // === REAL-WORLD ANALOGIES ===
        {
          type: 'heading' as const,
          content: 'Real-world analogies',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'UX (experience)',
              items: [
                'Apartment layout — is it comfortable to live in',
                'Bus route — is the commute fast',
                'Recipe — is it easy to cook',
                'IKEA instructions — is it clear how to assemble',
                'Queue at a clinic — how long is the wait',
              ],
            },
            {
              title: 'UI (interface)',
              items: [
                'Wallpaper and furniture — does the apartment look nice',
                'Color and design of the bus — is the ride pleasant',
                'Food plating — does the dish look appetizing',
                'Illustrations in the manual — are they clear',
                'Display board with ticket numbers — is the info visible',
              ],
            },
          ],
        },
        {
          type: 'quote' as const,
          text: 'If the user needs a manual, you have failed at design.',
          author: 'Steve Krug',
          role: 'Author of "Don\'t Make Me Think"',
        },
        {
          type: 'divider' as const,
        },

        // === HISTORY OF UX/UI ===
        {
          type: 'heading' as const,
          content: 'A brief history of UX/UI design',
        },
        {
          type: 'text' as const,
          content:
            'The term **User Experience** was coined by **Don Norman** in 1993 while he was working at Apple. However, concepts of usability existed long before that — from industrial design to ergonomics.',
        },
        {
          type: 'diagram' as const,
          title: 'Evolution of UX/UI',
          description: 'Key milestones in the development of the discipline',
          items: [
            '1940s: Ergonomics — adapting machines to humans',
            '1970s: Xerox PARC — the first graphical user interface',
            '1984: Apple Macintosh — GUI for the mass consumer',
            '1993: Don Norman coins the term "User Experience"',
            '2007: iPhone — a revolution in mobile UX',
            '2010s: Google Material Design, Apple Human Interface',
            '2020s: AI-driven UX, voice interfaces, AR/VR',
          ],
        },
        {
          type: 'quote' as const,
          text: 'I invented the term because I thought "human-computer interaction" and "usability" were too narrow. I wanted to cover all aspects of a person\'s experience with a system.',
          author: 'Don Norman',
          role: 'Creator of the term UX, author of "The Design of Everyday Things"',
        },
        {
          type: 'divider' as const,
        },

        // === VIDEO ===
        {
          type: 'heading' as const,
          content: 'Video: what is UX design?',
        },
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=ziQEqGZB8GE',
          title: 'What is UX Design? — A Simple Explanation',
          caption: 'A clear explanation of UX design in 5 minutes (English with subtitles)',
        },
        {
          type: 'divider' as const,
        },

        // === WHO IS A UX/UI DESIGNER ===
        {
          type: 'heading' as const,
          content: 'Who is a UX/UI designer?',
        },
        {
          type: 'text' as const,
          content:
            'A UX/UI designer is a specialist who **combines** the skills of a researcher, an interaction designer, and a visual designer. In smaller companies, one person often fills both roles. In larger ones, these are separate specialists.',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'UX Designer Tasks',
              items: [
                'Researching user needs',
                'Creating personas and customer journey maps (CJM)',
                'Designing information architecture',
                'Creating wireframes and prototypes',
                'Conducting usability tests',
                'Analyzing metrics and A/B tests',
              ],
            },
            {
              title: 'UI Designer Tasks',
              items: [
                'Developing the visual style',
                'Building a design system',
                'Selecting typography and colors',
                'Designing icons and illustrations',
                'Creating mockups in Figma/Sketch',
                'Working with animations and micro-interactions',
              ],
            },
          ],
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'The job market most often seeks a "UX/UI designer" — a specialist proficient in both areas. This is exactly what we will be learning in this course.',
        },
        {
          type: 'divider' as const,
        },

        // === KEY CONCEPTS ===
        {
          type: 'heading' as const,
          content: 'Key concepts',
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            {
              term: 'UX (User Experience)',
              definition: 'The overall experience and feelings of a user when interacting with a product',
            },
            {
              term: 'UI (User Interface)',
              definition: 'The visual part of the product: buttons, colors, fonts, icons',
            },
            {
              term: 'Usability',
              definition: 'The degree of ease and simplicity of using a product',
            },
            {
              term: 'Wireframe',
              definition: 'A schematic sketch of an interface without visual styling',
            },
            {
              term: 'Prototype',
              definition: 'An interactive model of a product for testing before development',
            },
            {
              term: 'Design System',
              definition: 'A set of ready-made components and guidelines for consistent design',
            },
          ],
        },
        {
          type: 'divider' as const,
        },

        // === CHECKLIST ===
        {
          type: 'checklist' as const,
          title: 'Checklist: signs of good UX/UI',
          items: [
            'The user achieves their goal without instructions',
            'Navigation is intuitive',
            'Text is readable and has good contrast',
            'Buttons and controls are clearly visible',
            'Feedback is provided for every action (loading, error, success)',
            'Works equally well on mobile and desktop',
            'Task completion time is minimal',
            'The design conveys trust and professionalism',
          ],
        },
      ],
      quiz: [
        {
          question: 'What is UX?',
          options: [
            { id: 'a', text: 'The visual styling of an interface' },
            { id: 'b', text: 'The overall user experience when interacting with a product' },
            { id: 'c', text: 'Website programming' },
            { id: 'd', text: 'A marketing strategy' },
          ],
          correctId: 'b',
          explanation:
            'UX (User Experience) is the sum of feelings and impressions a user has when interacting with a product, including convenience, emotions, and effectiveness.',
        },
        {
          question: 'Which analogy best describes the difference between UX and UI?',
          options: [
            { id: 'a', text: 'UX is the car engine, UI is the steering wheel' },
            { id: 'b', text: 'UX is the floor plan of a house, UI is the interior design' },
            { id: 'c', text: 'UX is the book cover, UI is the content' },
            { id: 'd', text: 'UX and UI are the same thing' },
          ],
          correctId: 'b',
          explanation:
            'UX is like the architect (floor plan, convenience), UI is like the interior designer (visuals, aesthetics). Both are important but solve different problems.',
        },
        {
          question: 'Who coined the term "User Experience"?',
          options: [
            { id: 'a', text: 'Steve Jobs' },
            { id: 'b', text: 'Bill Gates' },
            { id: 'c', text: 'Don Norman' },
            { id: 'd', text: 'Steve Krug' },
          ],
          correctId: 'c',
          explanation:
            'Don Norman coined the term "User Experience" in 1993 while working at Apple. He felt that existing terms were too narrow to describe the full experience of a person interacting with a system.',
        },
        {
          question: 'Which example describes a UI problem rather than a UX problem?',
          options: [
            { id: 'a', text: 'Registration requires filling in 20 fields' },
            { id: 'b', text: 'The "Buy" button is gray on a gray background and invisible' },
            { id: 'c', text: 'Payment requires 7 confirmation steps' },
            { id: 'd', text: 'There is no way to cancel an order' },
          ],
          correctId: 'b',
          explanation:
            'The button visibility issue is a UI problem (visual design). The other options are UX problems (interaction logic, processes).',
        },
      ],
    },
    {
      id: 'part-2',
      title: 'Why UX/UI design matters',
      subtitle: 'Business value, ROI, Amazon and Google case studies, the cost of bad UX',
      duration: '45 min',
      sections: [
        // === INTRODUCTION ===
        {
          type: 'heading' as const,
          content: 'Why businesses need UX/UI design',
        },
        {
          type: 'text' as const,
          content:
            'UX/UI design is not a luxury or a designer\'s whim. It is an **investment with measurable returns**. Companies that invest in UX gain more customers, increase sales, and spend less on support. In this part, we will look at specific numbers and case studies.',
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'According to Forrester Research, every $1 invested in UX returns $100. That is an ROI of 9,900%.',
        },
        {
          type: 'image' as const,
          src: '/images/meeting-01-ux-roi-graph.webp',
          alt: 'Graph of ROI from UX design investments',
          caption: 'The return on UX investment significantly exceeds other business investments',
        },
        {
          type: 'divider' as const,
        },

        // === ROI ===
        {
          type: 'heading' as const,
          content: 'Design ROI: numbers and facts',
        },
        {
          type: 'text' as const,
          content:
            'Business speaks the language of numbers. Here are specific data points on the impact of UX/UI on key business metrics:',
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            {
              term: 'Conversion',
              definition: 'Good UX increases conversion by 200-400% (Forrester)',
            },
            {
              term: 'Retention',
              definition: '88% of users will not return to a site after a bad experience (Amazon)',
            },
            {
              term: 'Mobile UX',
              definition: '53% of users leave if a site takes longer than 3 seconds to load (Google)',
            },
            {
              term: 'Support',
              definition: 'Good UX reduces support requests by 15-20%',
            },
            {
              term: 'Development',
              definition: 'Fixing a UX issue after launch costs 100 times more than during the design phase',
            },
          ],
        },
        {
          type: 'callout' as const,
          variant: 'warning' as const,
          content:
            'McKinsey: design-leading companies grow revenue 32% faster than competitors and see 56% higher shareholder returns.',
        },
        {
          type: 'divider' as const,
        },

        // === THE COST OF BAD UX ===
        {
          type: 'heading' as const,
          content: 'The cost of bad UX',
        },
        {
          type: 'text' as const,
          content:
            'Bad UX is not just an inconvenience. It means **direct financial losses**. Let us look at what neglecting UX design actually costs.',
        },
        {
          type: 'diagram' as const,
          title: 'The cascade of losses from bad UX',
          description: 'How bad UX leads to losses at every stage',
          items: [
            '1. The user cannot find what they need and leaves for a competitor',
            '2. A complicated checkout form leads to 70% abandoned carts',
            '3. A confusing interface increases support requests (+30%)',
            '4. Mobile version bugs cause the loss of 50% of mobile users',
            '5. Negative reviews lower ratings and trust',
            '6. Reworking after launch costs 100x compared to the design phase',
          ],
        },
        {
          type: 'before-after' as const,
          title: 'Online store shopping cart',
          before: {
            label: 'Without UX design',
            description:
              'A complex 5-step checkout, mandatory registration, hidden shipping costs. Cart conversion: 1.8%. Loss: $2.5M/year for an average store.',
          },
          after: {
            label: 'After UX redesign',
            description:
              'A single-page checkout, guest purchase option, transparent pricing. Cart conversion: 5.2%. Revenue increase: +$4M/year.',
          },
        },
        {
          type: 'callout' as const,
          variant: 'example' as const,
          content:
            'Famous story: the $300 million button. An online store replaced the "Register" button with "Continue" and removed mandatory registration. Result: +$300M in revenue in the first year.',
        },
        {
          type: 'divider' as const,
        },

        // === AMAZON CASE STUDY ===
        {
          type: 'heading' as const,
          content: 'Case study: Amazon',
        },
        {
          type: 'case-study' as const,
          title: 'Amazon: page load speed and billions',
          company: 'Amazon',
          problem:
            'Amazon discovered that every 100 milliseconds of page load delay reduced sales by 1%. With revenues in the hundreds of billions, even fractions of a second cost enormous amounts of money.',
          solution:
            'Amazon invested in UX optimization: faster loading, 1-Click purchasing, personalized recommendations, and simplified returns. Every decision was driven by A/B testing data.',
          result:
            'Amazon became the world\'s largest online retailer. 1-Click purchasing increased sales by 5%. Recommendations generate 35% of all sales. Fast delivery and easy returns built loyalty among millions.',
          steps: [
            {
              title: 'Research',
              description: 'Analyzing the behavior of millions of users, A/B testing every element',
            },
            {
              title: '1-Click purchasing',
              description: 'A patent on one-tap purchasing — a radical simplification of checkout',
            },
            {
              title: 'Personalization',
              description: 'AI-powered recommendations based on purchase and browsing history',
            },
            {
              title: 'Continuous optimization',
              description: 'Thousands of simultaneous A/B tests, data-driven design decisions',
            },
          ],
        },
        {
          type: 'quote' as const,
          text: 'We see our customers as guests at a party and we are the hosts. It is our job every day to make every important aspect of the customer experience a little bit better.',
          author: 'Jeff Bezos',
          role: 'Founder of Amazon',
        },
        {
          type: 'divider' as const,
        },

        // === GOOGLE CASE STUDY ===
        {
          type: 'heading' as const,
          content: 'Case study: Google',
        },
        {
          type: 'case-study' as const,
          title: 'Google: simplicity as a competitive advantage',
          company: 'Google',
          problem:
            'In the late 1990s, search engines (Yahoo, AltaVista) were overloaded: banners, news, directories, ads. It was difficult for users to simply start searching.',
          solution:
            'Google offered a radically simple interface: a white page, a logo, and a search bar. Nothing extra. Focus on a single task — finding information.',
          result:
            'Google captured 92% of the global search market. Simplicity became the company\'s signature style. Material Design is one of the most influential design systems in the world.',
          steps: [
            {
              title: 'Minimalism',
              description: 'Remove everything unnecessary, keep only the search',
            },
            {
              title: 'Speed',
              description: 'Results in 0.2 seconds — faster than all competitors',
            },
            {
              title: 'Material Design',
              description: 'Creating a unified design system for all Google products',
            },
            {
              title: 'Accessibility',
              description: 'An interface understandable to anyone in the world without training',
            },
          ],
        },
        {
          type: 'before-after' as const,
          title: 'Search engines: before and after Google',
          before: {
            label: 'Yahoo (1999)',
            description:
              'An overloaded homepage: directories, news, banners, links, ads. The search bar is lost among the content. The user does not know where to look.',
          },
          after: {
            label: 'Google (1999)',
            description:
              'A white page, a logo, a search bar, two buttons. Instantly clear what to do. Minimal distractions, maximum focus.',
          },
        },
        {
          type: 'divider' as const,
        },

        // === 5 REASONS TO INVEST ===
        {
          type: 'heading' as const,
          content: '5 reasons to invest in UX/UI design',
        },
        {
          type: 'text' as const,
          content:
            'Let us summarize: why **every** business — from startups to corporations — should invest in UX/UI design.',
        },
        {
          type: 'subheading' as const,
          content: '1. Increased conversion and sales',
        },
        {
          type: 'text' as const,
          content:
            'A user-friendly interface **lowers the barriers** to purchase. A simple order form, intuitive navigation, fast loading — all of this directly impacts revenue. Each percent of conversion improvement can mean millions.',
        },
        {
          type: 'subheading' as const,
          content: '2. Reduced support costs',
        },
        {
          type: 'text' as const,
          content:
            'If the interface is **intuitive**, users call support less often, submit fewer complaints, and return products less frequently. This translates to direct savings on staff and infrastructure.',
        },
        {
          type: 'subheading' as const,
          content: '3. Competitive advantage',
        },
        {
          type: 'text' as const,
          content:
            'When competitors offer the same functionality, the winner is the one whose product is **more pleasant to use**. Apple proved this with the iPhone — the technologies were not new, but the UX was revolutionary.',
        },
        {
          type: 'subheading' as const,
          content: '4. Customer loyalty and retention',
        },
        {
          type: 'text' as const,
          content:
            'Good UX creates an **emotional connection** with the product. Users do not just come back — they **recommend** the product to friends. NPS (Net Promoter Score) directly depends on UX quality.',
        },
        {
          type: 'subheading' as const,
          content: '5. Development cost savings',
        },
        {
          type: 'text' as const,
          content:
            'Designing UX **before development begins** allows you to find and fix problems on paper rather than in code. The "1:10:100" rule: fixing at the design stage costs 1 unit, during development — 10, after launch — 100.',
        },
        {
          type: 'diagram' as const,
          title: 'The 1:10:100 Rule',
          description: 'The cost of fixing errors grows exponentially',
          items: [
            'Design phase (wireframe) — $1 (a fix in minutes)',
            'Development phase (code) — $10 (hours of developer work)',
            'After launch (production) — $100 (lost customers + rework + testing)',
          ],
        },
        {
          type: 'divider' as const,
        },

        // === DESIGN THINKING ===
        {
          type: 'heading' as const,
          content: 'Design thinking: the foundation of the UX process',
        },
        {
          type: 'text' as const,
          content:
            '**Design thinking** is a problem-solving methodology centered on the user. It consists of 5 stages and is used at Google, Apple, IBM, SAP, and thousands of other companies.',
        },
        {
          type: 'diagram' as const,
          title: '5 stages of design thinking',
          description: 'An iterative process from problem to solution',
          items: [
            '1. Empathize — understand the user, their pain points and needs',
            '2. Define — formulate the core problem',
            '3. Ideate — generate solution ideas (brainstorming)',
            '4. Prototype — create a quick prototype of the solution',
            '5. Test — validate with real users',
          ],
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'Design thinking is not a linear process. After testing, you often return to empathize or ideate. This is normal — this is how the best solutions are born.',
        },
        {
          type: 'divider' as const,
        },

        // === VIDEO ===
        {
          type: 'heading' as const,
          content: 'Video: the business value of UX',
        },
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=a5syEhMqMKk',
          title: 'The Business Value of UX Design',
          caption: 'How UX design impacts business metrics (English with subtitles)',
        },
        {
          type: 'divider' as const,
        },

        // === INDUSTRIES ===
        {
          type: 'heading' as const,
          content: 'UX/UI across industries',
        },
        {
          type: 'text' as const,
          content:
            'UX/UI design is important not only for tech companies. It is applied **everywhere** there is interaction between a person and a product or service.',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'Digital Products',
              items: [
                'Mobile applications',
                'Websites and SaaS',
                'E-commerce stores',
                'Banking applications',
                'Educational platforms',
              ],
            },
            {
              title: 'Physical World',
              items: [
                'Self-service terminals',
                'Car dashboards',
                'Medical equipment',
                'Airport navigation',
                'Smart home and IoT',
              ],
            },
          ],
        },
        {
          type: 'divider' as const,
        },

        // === CAREER ===
        {
          type: 'heading' as const,
          content: 'Career prospects in UX/UI',
        },
        {
          type: 'text' as const,
          content:
            'Demand for UX/UI designers is **steadily growing**. According to LinkedIn, UX design is among the top 10 most in-demand skills. The average UX/UI designer salary globally is $70,000-$120,000/year.',
        },
        {
          type: 'checklist' as const,
          title: 'Skills for a successful UX/UI career',
          items: [
            'Empathy — the ability to understand the user',
            'Analytical thinking — working with data',
            'Visual literacy — a sense of composition and color',
            'Communication — presenting and defending decisions',
            'Tool proficiency (Figma, FigJam, testing protocols)',
            'Understanding business metrics (conversion, retention, NPS)',
            'Basic knowledge of HTML/CSS (not required but helpful)',
          ],
        },
        {
          type: 'quote' as const,
          text: "Don't make me think.",
          author: 'Steve Krug',
          role: 'The core usability principle, title of a bestselling book',
        },
        {
          type: 'divider' as const,
        },

        // === SUMMARY ===
        {
          type: 'heading' as const,
          content: 'Lesson summary',
        },
        {
          type: 'text' as const,
          content:
            'Today we learned what UX and UI are, how they differ, and why they matter for business. Here are the key takeaways:',
        },
        {
          type: 'checklist' as const,
          title: 'What we learned',
          items: [
            'UX is the experience, UI is the appearance. Both are important.',
            'Good UX/UI = more sales, lower costs, loyal customers',
            'Every $1 in UX returns $100 (ROI 9,900%)',
            'Amazon and Google are examples of companies built on UX',
            'Bad UX costs 100x more if fixed after launch',
            'Design thinking is a 5-stage methodology',
            'UX/UI is a high-demand profession with strong salaries',
          ],
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'Homework: find 1 app with good UX and 1 with bad UX. Write down what exactly is good or bad — we will discuss it in the next lesson.',
        },
      ],
      quiz: [
        {
          question: 'What ROI does every $1 invested in UX return (according to Forrester)?',
          options: [
            { id: 'a', text: '$10' },
            { id: 'b', text: '$50' },
            { id: 'c', text: '$100' },
            { id: 'd', text: '$500' },
          ],
          correctId: 'c',
          explanation:
            'According to Forrester Research, every $1 invested in UX returns $100. This is one of the highest ROI figures among business investments.',
        },
        {
          question: 'What did Amazon discover about the relationship between page load speed and sales?',
          options: [
            { id: 'a', text: 'Speed does not affect sales' },
            { id: 'b', text: 'Every 100ms of delay reduces sales by 1%' },
            { id: 'c', text: 'Slow pages increase trust' },
            { id: 'd', text: 'Fast loading increases bounce rates' },
          ],
          correctId: 'b',
          explanation:
            'Amazon found that every 100 milliseconds of loading delay leads to a 1% drop in sales. At their scale, this means billions of dollars.',
        },
        {
          question: 'Why did Google win the search engine war against Yahoo?',
          options: [
            { id: 'a', text: 'Google had more advertising' },
            { id: 'b', text: 'Google offered a simple interface focused on search' },
            { id: 'c', text: 'Google was cheaper' },
            { id: 'd', text: 'Yahoo shut down' },
          ],
          correctId: 'b',
          explanation:
            'Google offered a radically simple interface — a white page and a search bar. Yahoo was overloaded with content. The simplicity of UX became Google\'s competitive advantage.',
        },
        {
          question: 'What does the "1:10:100" rule mean in UX?',
          options: [
            { id: 'a', text: '1 designer replaces 10 developers and 100 testers' },
            { id: 'b', text: 'You need 1 day for design, 10 for development, 100 for testing' },
            { id: 'c', text: 'Fixing a problem costs 1 at the design stage, 10 during development, 100 after launch' },
            { id: 'd', text: '1% of users find 10% of bugs that cost 100% of the budget' },
          ],
          correctId: 'c',
          explanation:
            'The 1:10:100 rule shows the exponential growth in the cost of fixing an error: at the design stage — 1 unit, during development — 10, after launch — 100.',
        },
      ],
    },
  ],
}
