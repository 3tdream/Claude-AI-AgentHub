import type { Meeting } from '../../types'

export const meeting03: Meeting = {
  id: '3',
  number: 3,
  title: 'UX Research: Fundamentals',
  description:
    'User personas, empathy maps, Jobs to Be Done, and User Journey Maps — tools that help you understand real people and design for them.',
  icon: 'Users',
  color: 'bg-emerald-500/10 text-emerald-600',
  parts: [
    // ============================
    // PART 1 — Personas and Empathy
    // ============================
    {
      id: 'part-1',
      title: 'Personas and Empathy',
      subtitle: 'How to understand the user before the first pixel',
      duration: '45 min',
      sections: [
        // --- Introduction ---
        {
          type: 'heading' as const,
          content: 'Why Do We Need Personas?',
        },
        {
          type: 'text' as const,
          content:
            'When a team says "our user," everyone pictures someone different. A **persona** is a documented portrait of a typical user that keeps the entire team aligned. Without personas, designers design for themselves, developers build for themselves, and marketing writes copy into the void.',
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'A persona is not fiction. It is a **synthesis of data** from interviews, analytics, and observations, packaged into an understandable format.',
        },
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=XnG4c4gXaQY',
          title: 'Introduction to UX Personas',
          caption:
            'How to create personas based on real data — an overview of the method',
        },
        {
          type: 'divider' as const,
        },

        // --- Key Concepts ---
        {
          type: 'heading' as const,
          content: 'Key Concepts',
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            {
              term: 'User Persona',
              definition:
                'A semi-fictional user archetype based on real research data. Includes demographics, goals, pain points, and the context of product usage.',
            },
            {
              term: 'Empathy Map',
              definition:
                'A visual tool with 4 quadrants (Thinks, Feels, Says, Does) plus pains and gains. Helps you "walk in the user\'s shoes."',
            },
            {
              term: 'Jobs to Be Done (JTBD)',
              definition:
                'A framework that focuses not on who the user is, but on the job they "hire" the product to accomplish.',
            },
            {
              term: 'Proto-Persona',
              definition:
                'A quick hypothetical persona created by the team without research. Used as a starting point that is later validated with data.',
            },
            {
              term: 'Behavioral Archetype',
              definition:
                'Grouping users by behavior (usage frequency, scenarios) rather than by demographics.',
            },
          ],
        },
        {
          type: 'divider' as const,
        },

        // --- Empathy Map ---
        {
          type: 'heading' as const,
          content: 'Empathy Map',
        },
        {
          type: 'text' as const,
          content:
            'An empathy map is a structured way to organize knowledge about the user. It consists of **4 main quadrants** and two additional blocks: **Pains** and **Gains**.',
        },
        {
          type: 'diagram' as const,
          title: 'Empathy Map Structure',
          description:
            'Four quadrants plus pains and gains. Filled in based on interviews and observations.',
          items: [
            '🧠 THINKS — Internal thoughts, doubts, hopes. "What if I make a mistake?"',
            '💬 SAYS — Direct quotes from interviews. "I need something simple"',
            '❤️ FEELS — Emotions: fear, joy, frustration, insecurity',
            '👀 DOES — Observable actions and behavior. Clicks, scrolls, compares',
            '⬇️ PAINS — Obstacles, fears, risks, negative experiences',
            '⬆️ GAINS — Desired outcomes, aspirations, success criteria',
          ],
        },
        {
          type: 'callout' as const,
          variant: 'example' as const,
          content:
            '**Example for an online store shopper:**\n— Thinks: "I hope this isn\'t a knockoff"\n— Says: "I need delivery by the end of the week"\n— Feels: excitement and impatience\n— Does: compares prices across 3 websites, reads reviews\n— Pains: fear of getting the wrong size, complicated returns\n— Gains: fast delivery, honest reviews, easy returns',
        },
        {
          type: 'divider' as const,
        },

        // --- Jobs to Be Done ---
        {
          type: 'heading' as const,
          content: 'Jobs to Be Done (JTBD)',
        },
        {
          type: 'text' as const,
          content:
            'JTBD focuses on the **job**, not the person. The formula: **"When [situation], I want [motivation], so that [expected outcome]"**. This approach complements personas and helps avoid fixating on demographics.',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'JTBD Examples for Different Products',
              items: [
                '🌐 Web: "When I\'m looking for a gift, I want to quickly compare options so I can stay within budget"',
                '📱 Mobile: "When I\'m hungry at work, I want to order food in 3 taps so I don\'t waste my lunch break"',
                '💼 SaaS: "When a new lead comes in, I want to see their history so I can prepare for the call"',
                '📊 Data: "When conversion drops, I want to understand the cause in 2 minutes so I can fix it right away"',
              ],
            },
            {
              title: 'JTBD Anti-patterns',
              items: [
                '❌ Too abstract: "I want to be happy"',
                '❌ Tied to a solution: "I want a filter button"',
                '❌ No context: "I want to order food" (when? where? why?)',
                '✅ Specific + context + outcome',
              ],
            },
          ],
        },
        {
          type: 'divider' as const,
        },

        // --- Persona: Web ---
        {
          type: 'subheading' as const,
          content: 'Persona 1: Online Store Shopper (Web)',
        },
        {
          type: 'user-persona' as const,
          persona: {
            name: 'Anna Kovaleva',
            age: 34,
            role: 'Marketing specialist, mother of two',
            bio: 'Works remotely, buys 80% of family essentials online. Values speed, honest reviews, and easy returns. Alternates between laptop and phone.',
            goals: [
              'Find the right product in 5 minutes',
              'Be confident in quality before purchasing',
              'Receive the order on the exact date',
              'Easily return items if they don\'t fit',
            ],
            frustrations: [
              'Fake reviews and inflated ratings',
              'Hidden shipping costs',
              'Complicated return process',
              'Product pages without real photos',
            ],
            traits: [
              { label: 'Technical literacy', value: 'Moderate' },
              { label: 'Online purchase frequency', value: '3-4 times per month' },
              { label: 'Primary device', value: 'Laptop + smartphone' },
              { label: 'Deciding factor', value: 'Reviews and ratings' },
            ],
            quote: 'If I can\'t understand the price in 3 seconds — I leave.',
          },
        },

        // --- Persona: Mobile ---
        {
          type: 'subheading' as const,
          content: 'Persona 2: Mobile App User (Mobile)',
        },
        {
          type: 'user-persona' as const,
          persona: {
            name: 'Dmitry Sergeev',
            age: 27,
            role: 'Developer, freelancer',
            bio: 'Lives in a big city, always on the go. Orders food through apps 5 times a week. Impatient — if an app is slow, he deletes it.',
            goals: [
              'Order food in 2 minutes max',
              'Track delivery in real time',
              'Save favorite orders for reordering',
              'Pay with one tap (Apple Pay / Google Pay)',
            ],
            frustrations: [
              'Slow app loading times',
              'No courier tracking on the map',
              'Mandatory registration before the first order',
              'Notifications about irrelevant discounts',
            ],
            traits: [
              { label: 'Technical literacy', value: 'High' },
              { label: 'Tolerance for UX issues', value: 'Very low' },
              { label: 'Primary device', value: 'iPhone 15' },
              { label: 'Deciding factor', value: 'Speed and convenience' },
            ],
            quote: 'If I can\'t complete an order in 3 taps — the app is bad.',
          },
        },

        // --- Persona: SaaS ---
        {
          type: 'subheading' as const,
          content: 'Persona 3: SaaS Product User (CRM)',
        },
        {
          type: 'user-persona' as const,
          persona: {
            name: 'Elena Petrova',
            age: 41,
            role: 'Head of Sales, B2B',
            bio: 'Manages a team of 12 sales reps. Works in the CRM 4-6 hours every day. Values automation and predictability. Dislikes "pretty but useless" interfaces.',
            goals: [
              'See the pipeline and revenue forecast on one screen',
              'Automate routine tasks for the sales team',
              'Receive alerts about at-risk deals',
              'Quickly generate reports for the director',
            ],
            frustrations: [
              'Too many clicks for simple actions',
              'Data scattered across different screens',
              'Slow dashboard loading',
              'No mobile version for off-site meetings',
            ],
            traits: [
              { label: 'Technical literacy', value: 'Medium-high' },
              { label: 'Hours in CRM per day', value: '4-6 hours' },
              { label: 'Primary device', value: 'Windows laptop' },
              { label: 'Deciding factor', value: 'Time savings for the team' },
            ],
            quote:
              'I don\'t need a beautiful interface — I need an interface that saves my team 2 hours a day.',
          },
        },
        {
          type: 'divider' as const,
        },

        // --- Before/After: good vs bad persona ---
        {
          type: 'heading' as const,
          content: 'Good Persona vs Bad Persona',
        },
        {
          type: 'text' as const,
          content:
            'Not every document with a name and a photo is a useful persona. Let\'s compare two approaches:',
        },
        {
          type: 'before-after' as const,
          title: 'Persona Description Quality',
          before: {
            label: 'Bad Persona',
            description:
              'Name: Ivan. Age: 30. Likes technology. Wants a convenient website. — No specifics, no pain points, no usage context. This persona is impossible to use for decision-making.',
          },
          after: {
            label: 'Good Persona',
            description:
              'Anna, 34, marketing specialist, mother of two. Shops 3-4 times a month from a laptop. Main pain point — fake reviews. If she can\'t see the price in 3 seconds — she leaves. JTBD: "When looking for a gift for my child, I want to find a verified product in 5 minutes." — Specific, actionable, with a quote and JTBD.',
          },
        },
        {
          type: 'before-after' as const,
          title: 'Amount of Data in a Persona',
          before: {
            label: 'Too little data',
            description:
              '"The user is a male, 25-35 years old, who uses the internet." No pain points, no goals, no behavior. This describes half the population, not a persona.',
          },
          after: {
            label: 'Right level of detail',
            description:
              'Dmitry, 27, freelance developer, iPhone 15, orders food 5 times a week. Deletes an app if it takes longer than 3 seconds to load. Favorite pattern — repeat last order. JTBD: "When hungry on a deadline, I want to order food without getting distracted from code."',
          },
        },
        {
          type: 'divider' as const,
        },

        // --- Anti-patterns ---
        {
          type: 'heading' as const,
          content: 'Anti-patterns in Persona Creation',
        },
        {
          type: 'checklist' as const,
          title: 'What to Avoid When Creating Personas',
          items: [
            'Elastic User — a persona that fits any scenario (too vague)',
            'Persona Non Grata — a persona that was created but nobody uses',
            'Self-Referential Design — "I am the user" (projecting yourself)',
            'Demographic Trap — focusing on age/gender instead of behavior and goals',
            'Too Many Personas — more than 4-5 personas = nobody remembers any of them',
            'No Validation — persona based solely on assumptions, without data',
          ],
        },
        {
          type: 'divider' as const,
        },

        // --- Case Study ---
        {
          type: 'heading' as const,
          content: 'Case Study: Spotify and Behavioral Personas',
        },
        {
          type: 'case-study' as const,
          title: 'How Spotify Builds Personas Based on Behavior',
          company: 'Spotify',
          problem:
            'Classic demographic segmentation (age, country) failed to explain why people listen to different music at different times of the day.',
          solution:
            'Spotify switched to behavioral archetypes: "Morning Runner" (upbeat music in the morning), "Background Listener" (ambient at work), "Playlist Curator" (creates and shares playlists). Each archetype represents a usage context, not a demographic.',
          result:
            'Personalized playlists (Discover Weekly, Daily Mix) became the backbone of the product. Retention grew by 30% after implementing behavior-based recommendations.',
          steps: [
            {
              title: 'Data Collection',
              description:
                'Analyzing listening patterns: time of day, genres, skip rate, repeat rate',
            },
            {
              title: 'Clustering',
              description:
                'Identifying 6 behavioral archetypes instead of demographic groups',
            },
            {
              title: 'Validation',
              description:
                'A/B testing recommendations by archetype vs. by demographics',
            },
            {
              title: 'Product Decisions',
              description:
                'Discover Weekly, Daily Mix, contextual playlists for each archetype',
            },
          ],
        },
        {
          type: 'divider' as const,
        },

        // --- User Flow: persona creation ---
        {
          type: 'heading' as const,
          content: 'Persona Creation Process: User Flow',
        },
        {
          type: 'user-flow' as const,
          title: 'Steps to Create a Persona',
          steps: [
            {
              id: 'start',
              label: 'Begin research',
              type: 'start' as const,
            },
            {
              id: 'interviews',
              label: 'Conduct 5-8 interviews',
              type: 'action' as const,
            },
            {
              id: 'analytics',
              label: 'Gather behavioral analytics',
              type: 'action' as const,
            },
            {
              id: 'enough-data',
              label: 'Enough data?',
              type: 'decision' as const,
            },
            {
              id: 'cluster',
              label: 'Identify patterns and clusters',
              type: 'action' as const,
            },
            {
              id: 'draft',
              label: 'Create persona draft',
              type: 'action' as const,
            },
            {
              id: 'validate',
              label: 'Team agrees?',
              type: 'decision' as const,
            },
            {
              id: 'empathy',
              label: 'Fill in the empathy map',
              type: 'action' as const,
            },
            {
              id: 'jtbd',
              label: 'Add JTBD statements',
              type: 'action' as const,
            },
            {
              id: 'finalize',
              label: 'Finalize and distribute',
              type: 'end' as const,
            },
          ],
          connections: [
            { from: 'start', to: 'interviews' },
            { from: 'interviews', to: 'analytics' },
            { from: 'analytics', to: 'enough-data' },
            { from: 'enough-data', to: 'cluster', label: 'Yes' },
            { from: 'enough-data', to: 'interviews', label: 'No' },
            { from: 'cluster', to: 'draft' },
            { from: 'draft', to: 'validate' },
            { from: 'validate', to: 'empathy', label: 'Yes' },
            { from: 'validate', to: 'draft', label: 'No, revise' },
            { from: 'empathy', to: 'jtbd' },
            { from: 'jtbd', to: 'finalize' },
          ],
        },
        {
          type: 'divider' as const,
        },

        // --- Quote ---
        {
          type: 'quote' as const,
          text: 'You are not your user. If you don\'t understand that, you\'re not doing UX.',
          author: 'Alan Cooper',
          role: 'Father of interaction design, creator of the persona concept',
        },

        // --- Practical checklist ---
        {
          type: 'heading' as const,
          content: 'Checklist: Creating a Persona',
        },
        {
          type: 'checklist' as const,
          title: 'Minimum Requirements for a Working Persona',
          items: [
            'Name and photo (increases empathy)',
            'Role and context (not just the job title, but the situation)',
            '3-4 goals (what they want to achieve with the product)',
            '3-4 frustrations (what gets in their way)',
            'A quote from a real user',
            'JTBD statement (When... I want... so that...)',
            'Key behavioral traits (device, frequency, triggers)',
            'Empathy map (Thinks / Says / Feels / Does)',
          ],
        },
      ],

      // --- Quiz Part 1 ---
      quiz: [
        {
          question: 'What is a persona in UX design?',
          options: [
            {
              id: 'a',
              text: 'A real user who tests the product',
            },
            {
              id: 'b',
              text: 'A user archetype based on research data',
            },
            {
              id: 'c',
              text: 'A fictional character for marketing materials',
            },
            {
              id: 'd',
              text: 'A user avatar in the interface',
            },
          ],
          correctId: 'b',
          explanation:
            'A persona is a semi-fictional archetype based on real research data (interviews, analytics, observations). It is neither a real person nor pure fiction.',
        },
        {
          question:
            'What are the 4 quadrants of an Empathy Map?',
          options: [
            { id: 'a', text: 'Goals, Pains, Tasks, Results' },
            { id: 'b', text: 'Thinks, Feels, Says, Does' },
            { id: 'c', text: 'Who, What, Where, When' },
            {
              id: 'd',
              text: 'Awareness, Interest, Decision, Action',
            },
          ],
          correctId: 'b',
          explanation:
            'The Empathy Map consists of four quadrants: Thinks, Feels, Says, and Does. Additionally, Pains and Gains are included.',
        },
        {
          question: 'What format describes Jobs to Be Done?',
          options: [
            {
              id: 'a',
              text: '"As a [role], I want [feature], so that [benefit]"',
            },
            {
              id: 'b',
              text: '"When [situation], I want [motivation], so that [outcome]"',
            },
            {
              id: 'c',
              text: '"If [condition], then [action], else [alternative]"',
            },
            {
              id: 'd',
              text: '"User [name] needs [feature] for [goal]"',
            },
          ],
          correctId: 'b',
          explanation:
            'JTBD uses the formula "When [situation], I want [motivation], so that [expected outcome]." This distinguishes it from User Stories (option A), which are tied to roles.',
        },
        {
          question:
            'Which of the following anti-patterns is the most dangerous when creating personas?',
          options: [
            {
              id: 'a',
              text: 'Self-Referential Design — designing for yourself, not for the user',
            },
            {
              id: 'b',
              text: 'Using photos in personas',
            },
            {
              id: 'c',
              text: 'Including user quotes',
            },
            {
              id: 'd',
              text: 'Limiting the number of personas to 3-5',
            },
          ],
          correctId: 'a',
          explanation:
            'Self-Referential Design is one of the most dangerous anti-patterns: the designer thinks "I am the user" and designs for themselves. Photos, quotes, and limiting the number of personas are, on the contrary, good practices.',
        },
      ],
    },

    // ============================
    // PART 2 — User Journey Map
    // ============================
    {
      id: 'part-2',
      title: 'User Journey Map',
      subtitle: 'The user\'s path from first contact to loyalty',
      duration: '45 min',
      sections: [
        {
          type: 'heading' as const,
          content: 'What Is a User Journey Map?',
        },
        {
          type: 'text' as const,
          content:
            '**User Journey Map (UJM)** is a visualization of the user\'s path through a product or service. It shows all **touchpoints**, **emotions**, **pain points**, and **moments of delight** at each stage. A UJM helps you see the product through the user\'s eyes and find areas for improvement.',
        },
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=mSxpVRo3BLg',
          title: 'How to Create a Customer Journey Map',
          caption: 'A step-by-step process for building a user journey map',
        },
        {
          type: 'divider' as const,
        },

        // --- Key Concepts ---
        {
          type: 'key-concepts' as const,
          concepts: [
            {
              term: 'Touchpoint',
              definition:
                'Any moment of interaction between the user and the product: advertising, website, app, email, support, packaging.',
            },
            {
              term: 'Pain Point',
              definition:
                'A moment where the user experiences frustration, confusion, or disappointment. The main goal of a UJM is to find and eliminate these points.',
            },
            {
              term: 'Moment of Delight',
              definition:
                'A moment that exceeds the user\'s expectations and evokes positive emotions. Creates loyalty.',
            },
            {
              term: 'Emotional Curve',
              definition:
                'A line on the UJM showing fluctuations in user emotions from negative to positive at each stage.',
            },
            {
              term: 'Channel',
              definition:
                'The medium through which a touchpoint occurs: website, mobile app, email, chat, phone, offline.',
            },
          ],
        },
        {
          type: 'divider' as const,
        },

        // --- UJM Structure ---
        {
          type: 'heading' as const,
          content: 'What Makes Up a Journey Map',
        },
        {
          type: 'diagram' as const,
          title: 'User Journey Map Layers',
          description:
            'Each column is a stage of the journey. Each row is a layer of information.',
          items: [
            '📋 STAGES — Awareness → Consideration → Decision → Purchase → Usage → Loyalty',
            '🎯 GOALS — What the user wants at each stage',
            '👆 TOUCHPOINTS — Specific points of contact (ads, website, chat)',
            '💭 THOUGHTS — What the user thinks at each stage',
            '😊😤 EMOTIONS — Emotional curve (from frustration to delight)',
            '🔴 PAIN POINTS — Problems and obstacles at each stage',
            '💡 OPPORTUNITIES — Ideas for improving each stage',
          ],
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            '**Golden rule of UJM:** the map is created for **one persona** and **one scenario**. Don\'t try to fit all users into a single map — it will turn into a mess.',
        },
        {
          type: 'divider' as const,
        },

        // --- How to Build a UJM ---
        {
          type: 'heading' as const,
          content: 'How to Build a Journey Map: Step-by-Step Process',
        },
        {
          type: 'user-flow' as const,
          title: 'User Journey Map Creation Process',
          steps: [
            {
              id: 'choose-persona',
              label: 'Choose a persona and scenario',
              type: 'start' as const,
            },
            {
              id: 'define-stages',
              label: 'Define the journey stages',
              type: 'action' as const,
            },
            {
              id: 'map-touchpoints',
              label: 'List all touchpoints',
              type: 'action' as const,
            },
            {
              id: 'add-emotions',
              label: 'Add emotions at each stage',
              type: 'action' as const,
            },
            {
              id: 'find-pains',
              label: 'Pain points found?',
              type: 'decision' as const,
            },
            {
              id: 'prioritize',
              label: 'Prioritize the issues',
              type: 'action' as const,
            },
            {
              id: 'opportunities',
              label: 'Formulate opportunities',
              type: 'action' as const,
            },
            {
              id: 'validate-map',
              label: 'Validate with users',
              type: 'action' as const,
            },
            {
              id: 'validated',
              label: 'Map validated?',
              type: 'decision' as const,
            },
            {
              id: 'done',
              label: 'Journey Map complete',
              type: 'end' as const,
            },
          ],
          connections: [
            { from: 'choose-persona', to: 'define-stages' },
            { from: 'define-stages', to: 'map-touchpoints' },
            { from: 'map-touchpoints', to: 'add-emotions' },
            { from: 'add-emotions', to: 'find-pains' },
            { from: 'find-pains', to: 'prioritize', label: 'Yes' },
            {
              from: 'find-pains',
              to: 'opportunities',
              label: 'No (rare)',
            },
            { from: 'prioritize', to: 'opportunities' },
            { from: 'opportunities', to: 'validate-map' },
            { from: 'validate-map', to: 'validated' },
            { from: 'validated', to: 'done', label: 'Yes' },
            {
              from: 'validated',
              to: 'map-touchpoints',
              label: 'No, refine',
            },
          ],
        },
        {
          type: 'divider' as const,
        },

        // --- Example 1: E-commerce (Web) ---
        {
          type: 'heading' as const,
          content: 'Journey Map Example: Online Store (Web)',
        },
        {
          type: 'subheading' as const,
          content:
            'Persona: Anna Kovaleva — buying sneakers for her child',
        },
        {
          type: 'timeline' as const,
          events: [
            {
              year: 'Stage 1',
              title: 'Awareness',
              description:
                'Anna sees an ad on Instagram. Touchpoint: targeted ad. Emotion: curiosity. Thought: "Oh, they have kids\' sneakers."',
            },
            {
              year: 'Stage 2',
              title: 'Search and Comparison',
              description:
                'Visits the website, searches for the right size. Touchpoint: catalog + filters. Emotion: neutral → frustration (size filter is hidden). Pain point: non-obvious navigation.',
            },
            {
              year: 'Stage 3',
              title: 'Product Selection',
              description:
                'Reads reviews, looks at photos. Touchpoint: product page. Emotion: doubt → trust (video review from a mother). Moment of Delight: size chart with foot measurement instructions.',
            },
            {
              year: 'Stage 4',
              title: 'Checkout',
              description:
                'Adds to cart, proceeds to payment. Touchpoint: checkout. Emotion: frustration — mandatory registration. Pain point: 5 fields to fill in + email confirmation.',
            },
            {
              year: 'Stage 5',
              title: 'Delivery',
              description:
                'Waits for the order. Touchpoint: SMS tracking. Emotion: impatience → joy (delivered a day early). Moment of Delight: early delivery + a note in the box.',
            },
            {
              year: 'Stage 6',
              title: 'Post-Purchase',
              description:
                'Receives an email asking for a review. Touchpoint: email + website. Emotion: loyalty. Opportunity: 10% discount on the next order for leaving a review.',
            },
          ],
        },
        {
          type: 'callout' as const,
          variant: 'warning' as const,
          content:
            '**Anna\'s pain points:** hidden size filter (stage 2) and mandatory registration (stage 4). Both can be fixed in 1 sprint and significantly improve conversion.',
        },
        {
          type: 'divider' as const,
        },

        // --- Example 2: Food Delivery (Mobile) ---
        {
          type: 'heading' as const,
          content: 'Journey Map Example: Food Delivery (Mobile)',
        },
        {
          type: 'subheading' as const,
          content: 'Persona: Dmitry Sergeev — ordering lunch at work',
        },
        {
          type: 'timeline' as const,
          events: [
            {
              year: 'Stage 1',
              title: 'Trigger',
              description:
                'Dmitry is hungry, 2 hours until deadline. Opens the app. Touchpoint: home screen icon. Emotion: hunger + urgency. Thought: "Order fast and get back to code."',
            },
            {
              year: 'Stage 2',
              title: 'Restaurant Selection',
              description:
                'Sees "Reorder last order" on the first screen. Touchpoint: home screen. Moment of Delight: 1 tap — and the order is in the cart. Emotion: relief.',
            },
            {
              year: 'Stage 3',
              title: 'Payment',
              description:
                'Apple Pay with one tap. Touchpoint: payment screen. Emotion: satisfaction — zero data entry. Thought: "This is how it should be."',
            },
            {
              year: 'Stage 4',
              title: 'Waiting',
              description:
                'Real-time courier tracking on the map. Touchpoint: tracking screen. Emotion: calm → impatience (courier is stuck for 5 minutes). Pain point: courier "frozen" on the map.',
            },
            {
              year: 'Stage 5',
              title: 'Delivery',
              description:
                'Courier arrives, food is hot. Touchpoint: push notification + intercom. Emotion: joy. Thought: "25 minutes from order to food — perfect."',
            },
          ],
        },
        {
          type: 'divider' as const,
        },

        // --- Example 3: CRM (SaaS) ---
        {
          type: 'heading' as const,
          content: 'Journey Map Example: CRM System (SaaS)',
        },
        {
          type: 'subheading' as const,
          content:
            'Persona: Elena Petrova — onboarding a new sales rep',
        },
        {
          type: 'timeline' as const,
          events: [
            {
              year: 'Stage 1',
              title: 'Invitation',
              description:
                'Elena sends an invite link to the new rep. Touchpoint: email invitation. Emotion: hope. Thought: "I hope they can figure it out on their own."',
            },
            {
              year: 'Stage 2',
              title: 'First Login',
              description:
                'The rep opens the CRM and sees an empty dashboard. Touchpoint: main screen. Pain point: no guidance on what to do first. Emotion: confusion.',
            },
            {
              year: 'Stage 3',
              title: 'Training',
              description:
                'Elena spends 2 hours explaining. Touchpoint: live training + documentation. Pain point: no interactive tour. Elena\'s emotion: frustration — "Why can\'t the CRM explain itself?"',
            },
            {
              year: 'Stage 4',
              title: 'First Deal',
              description:
                'The rep creates their first deal. Touchpoint: deal creation form. Moment of Delight: auto-fill of client data from email. Emotion: "Oh, that\'s convenient!"',
            },
            {
              year: 'Stage 5',
              title: 'Regular Usage',
              description:
                'After a week, the rep uses the CRM independently. Touchpoint: daily workflow. Emotion: familiarity. Opportunity: weekly digest with personal KPIs.',
            },
          ],
        },
        {
          type: 'divider' as const,
        },

        // --- Example 4: Analytics Dashboard (Data) ---
        {
          type: 'heading' as const,
          content:
            'Journey Map Example: Analytics Dashboard (Data Product)',
        },
        {
          type: 'subheading' as const,
          content:
            'Persona: Data Analyst — finding the cause of a conversion drop',
        },
        {
          type: 'timeline' as const,
          events: [
            {
              year: 'Stage 1',
              title: 'Alert',
              description:
                'The analyst receives a Slack notification: "Conversion dropped by 15%." Touchpoint: Slack bot. Emotion: anxiety. Thought: "I need to figure this out fast."',
            },
            {
              year: 'Stage 2',
              title: 'Drill-down',
              description:
                'Opens the dashboard, clicks on the conversion chart. Touchpoint: interactive dashboard. Pain point: 8-second data load time. Emotion: impatience.',
            },
            {
              year: 'Stage 3',
              title: 'Filtering',
              description:
                'Filters by segments: mobile vs desktop, new vs returning. Touchpoint: filter system. Moment of Delight: anomaly detection highlights the mobile segment. Emotion: "Aha, there it is!"',
            },
            {
              year: 'Stage 4',
              title: 'Root Cause',
              description:
                'Discovers that the new version of the mobile payment page is broken on Android. Touchpoint: detailed report. Emotion: confidence.',
            },
            {
              year: 'Stage 5',
              title: 'Action',
              description:
                'Creates a Jira ticket directly from the dashboard. Touchpoint: Jira integration. Moment of Delight: automatically attaches screenshot and data. Emotion: satisfaction.',
            },
          ],
        },
        {
          type: 'divider' as const,
        },

        // --- Case Study Part 2 ---
        {
          type: 'heading' as const,
          content: 'Case Study: Airbnb and the Journey Map',
        },
        {
          type: 'case-study' as const,
          title: 'How Airbnb Used a Journey Map to Transform Their Service',
          company: 'Airbnb',
          problem:
            'In 2009, Airbnb was stagnating. Bookings weren\'t growing despite a large catalog. The team didn\'t understand where users were dropping off.',
          solution:
            'The founders created a detailed Journey Map for both guests and hosts. They discovered that the main pain point was poor-quality property photos. Users weren\'t booking because they didn\'t trust dark, grainy snapshots. The solution: free professional photography for hosts.',
          result:
            'After introducing professional photos, bookings increased 2.5x. The Journey Map revealed what analytics couldn\'t — an emotional trust barrier.',
          steps: [
            {
              title: 'Creating the UJM',
              description:
                'Walked through the entire guest journey: from search to post-trip review. 11 stages.',
            },
            {
              title: 'Discovering the Barrier',
              description:
                'The "viewing listing" stage had the highest drop-off. Reason: poor photos.',
            },
            {
              title: 'Hypothesis and Experiment',
              description:
                'Free professional photography for 20 hosts in New York. A/B test.',
            },
            {
              title: 'Scaling',
              description:
                'The results held: +2.5x bookings. The program was rolled out globally.',
            },
          ],
        },
        {
          type: 'divider' as const,
        },

        // --- Approach Comparison ---
        {
          type: 'heading' as const,
          content: 'UJM for Different Product Types: Comparison',
        },
        {
          type: 'comparison' as const,
          title: 'Journey Map Specifics by Product Type',
          items: [
            {
              label: 'Map Focus',
              ux: 'Web/E-commerce: conversion from ad to purchase',
              ui: 'Mobile: speed and minimal taps',
            },
            {
              label: 'Key Pain Point',
              ux: 'SaaS: onboarding and time-to-value',
              ui: 'Data: loading speed and data clarity',
            },
            {
              label: 'Primary Touchpoint',
              ux: 'Web: website pages, email, chat',
              ui: 'Mobile: push notifications, gestures, screens',
            },
            {
              label: 'Moment of Delight',
              ux: 'SaaS: automating routine tasks',
              ui: 'Data: insight in 2 clicks',
            },
          ],
        },
        {
          type: 'divider' as const,
        },

        // --- Practical checklist ---
        {
          type: 'heading' as const,
          content: 'Checklist: Building a Journey Map',
        },
        {
          type: 'checklist' as const,
          title: 'Minimum Steps for a Working UJM',
          items: [
            'One persona and one scenario selected',
            '4-7 journey stages defined',
            'Touchpoints listed for each stage',
            'Emotional curve mapped (positive/neutral/negative)',
            'At least 2-3 pain points identified',
            'Moments of delight identified (or their absence noted)',
            'An improvement idea exists for each pain point',
            'Map validated with real users',
          ],
        },
        {
          type: 'divider' as const,
        },

        // --- Tools ---
        {
          type: 'subheading' as const,
          content: 'Tools for Creating a UJM',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'Free',
              items: [
                'Miro — UJM templates out of the box',
                'FigJam — for teams already using Figma',
                'Google Sheets — a spreadsheet = the simplest UJM',
                'Canva — beautiful visualization for presentations',
              ],
            },
            {
              title: 'Paid / Advanced',
              items: [
                'Smaply — a specialized UJM tool',
                'UXPressia — templates + collaboration',
                'Lucidchart — diagrams + integrations',
                'Notion — for documentation and storage',
              ],
            },
          ],
        },

        // --- Quote ---
        {
          type: 'quote' as const,
          text: 'A customer journey map is not about a pretty picture. It\'s about empathy, data, and action.',
          author: 'Kerry Bodine',
          role: 'Author of "Mapping Experiences," O\'Reilly',
        },

        // --- Final reflection ---
        {
          type: 'heading' as const,
          content: 'Lesson 3 Summary',
        },
        {
          type: 'text' as const,
          content:
            'Today we mastered **three UX researcher tools**: personas, empathy maps, and User Journey Maps. Together they form a complete picture: **who** your user is (persona), **what they feel** (empathy map), and **how they interact** with your product (UJM). In the next lesson, we will move on to wireframing — turning these insights into the first interface sketches.',
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            '**Homework:** Choose a product you use every day. Create: (1) one persona with an empathy map and JTBD, (2) a Journey Map with 5-6 stages including touchpoints, emotions, and pain points.',
        },
      ],

      // --- Quiz Part 2 ---
      quiz: [
        {
          question: 'What is a touchpoint in the context of a User Journey Map?',
          options: [
            {
              id: 'a',
              text: 'The moment a user touches the screen',
            },
            {
              id: 'b',
              text: 'Any moment of interaction between the user and the product or service',
            },
            {
              id: 'c',
              text: 'A Call to Action button',
            },
            {
              id: 'd',
              text: 'The company\'s contact information on the website',
            },
          ],
          correctId: 'b',
          explanation:
            'A touchpoint is any point of contact between the user and the product/service: advertising, website, email, chat, phone call, packaging, push notification, etc.',
        },
        {
          question:
            'For how many personas should a single Journey Map be created?',
          options: [
            { id: 'a', text: 'For all personas at once' },
            { id: 'b', text: 'For one persona and one scenario' },
            { id: 'c', text: 'For 2-3 primary personas' },
            { id: 'd', text: 'Personas are not needed for a Journey Map' },
          ],
          correctId: 'b',
          explanation:
            'The golden rule of UJM: one map = one persona + one scenario. Combining multiple personas dilutes the map and makes it useless.',
        },
        {
          question: 'Which element is NOT a layer of a User Journey Map?',
          options: [
            { id: 'a', text: 'Emotional curve' },
            { id: 'b', text: 'Touchpoints at each stage' },
            { id: 'c', text: 'Business model (unit economics)' },
            { id: 'd', text: 'Pain points and opportunities' },
          ],
          correctId: 'c',
          explanation:
            'A UJM focuses on the user experience: stages, touchpoints, emotions, pain points, and opportunities. Business models and unit economics are separate tools that are not part of a standard Journey Map.',
        },
        {
          question:
            'In the Airbnb case study, what pain point did the Journey Map reveal?',
          options: [
            { id: 'a', text: 'High accommodation prices' },
            {
              id: 'b',
              text: 'Poor property photos that reduced trust',
            },
            { id: 'c', text: 'A complicated registration process' },
            { id: 'd', text: 'Lack of a mobile app' },
          ],
          correctId: 'b',
          explanation:
            'The Journey Map showed that the highest drop-off occurred at the listing viewing stage due to poor photos. Users didn\'t trust dark, amateur snapshots. The solution — free professional photography — led to a 2.5x increase in bookings.',
        },
      ],
    },
  ],
}
