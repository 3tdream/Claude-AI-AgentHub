import type { Meeting } from '../../types'

export const meeting05: Meeting = {
  id: '5',
  number: 5,
  title: 'User Research Methods',
  description:
    'User research methods: interviews, surveys, card sorting, as well as Use Cases, User Stories, and requirements prioritization',
  icon: 'ClipboardList',
  color: 'bg-cyan-500/10 text-cyan-600',
  parts: [
    // ═══════════════════════════════════════════════
    // Part 1: Interviews and Surveys (45 min)
    // ═══════════════════════════════════════════════
    {
      id: 'part-1',
      title: 'Interviews and Surveys',
      subtitle:
        'User interview techniques, survey design, Card Sorting and Tree Testing',
      duration: '45 min',
      sections: [
        // ── Introduction ──
        {
          type: 'heading' as const,
          content: 'Why Conduct User Research',
        },
        {
          type: 'text' as const,
          content:
            'User Research is the systematic collection of data about users to make informed design decisions. According to Forrester, every $1 invested in UX research returns $100 during the development phase. Without research, a team designs a product "blindly," relying on guesses instead of facts.',
        },
        {
          type: 'callout' as const,
          variant: 'example' as const,
          content:
            'Before launching, Slack conducted over 200 user interviews. The result: the team discovered that people didn\'t want "yet another messenger" but rather a way to **reduce the amount of email**. This changed the positioning and the entire product design.',
        },
        {
          type: 'user-flow' as const,
          title: 'User Research Process',
          steps: [
            { id: 'goal', label: 'Define the research goal', type: 'start' as const },
            { id: 'method', label: 'Choose a method (interview / survey / sorting)', type: 'action' as const },
            { id: 'recruit', label: 'Recruit participants (5-8 people)', type: 'action' as const },
            { id: 'conduct', label: 'Conduct the research', type: 'action' as const },
            { id: 'analyze', label: 'Analyze the data', type: 'action' as const },
            { id: 'enough', label: 'Is the data sufficient?', type: 'decision' as const },
            { id: 'insights', label: 'Formulate insights', type: 'action' as const },
            { id: 'apply', label: 'Apply to design', type: 'end' as const },
          ],
          connections: [
            { from: 'goal', to: 'method' },
            { from: 'method', to: 'recruit' },
            { from: 'recruit', to: 'conduct' },
            { from: 'conduct', to: 'analyze' },
            { from: 'analyze', to: 'enough' },
            { from: 'enough', to: 'insights', label: 'Yes' },
            { from: 'enough', to: 'recruit', label: 'No — need more' },
            { from: 'insights', to: 'apply' },
          ],
        },
        {
          type: 'divider' as const,
        },

        // ── Interview Types ──
        {
          type: 'heading' as const,
          content: 'User Interviews: Three Approaches',
        },
        {
          type: 'text' as const,
          content:
            'Interviews are the gold standard of qualitative research. A live conversation with a user reveals **motivations, pain points, and context** that are impossible to obtain from analytics alone. There are three interview formats, each suited for different tasks.',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'Structured',
              items: [
                'Fixed list of questions',
                'Same order for all participants',
                'Easy to compare answers',
                'Suitable for hypothesis validation',
                'Example: NPS survey with open-ended questions',
              ],
            },
            {
              title: 'Semi-Structured',
              items: [
                'Guide with key topics',
                'Freedom to ask follow-up questions',
                'Balance of depth and comparability',
                'Most popular format in UX',
                'Example: discovery interview',
              ],
            },
            {
              title: 'Unstructured',
              items: [
                'Free-form conversation on a topic',
                'Maximum depth',
                'Difficult to analyze',
                'Requires an experienced interviewer',
                'Example: ethnographic research',
              ],
            },
          ],
        },
        {
          type: 'subheading' as const,
          content: 'How to Create an Interview Guide',
        },
        {
          type: 'text' as const,
          content:
            'An interview guide is a conversation plan that helps the interviewer remember key topics and keep the discussion on track. A good guide contains:\n\n- **Introduction** (2-3 min) — introduce yourself, explain the purpose, obtain consent for recording\n- **Warm-up** (3-5 min) — easy questions about the person and their context\n- **Main section** (20-30 min) — questions on the research topics\n- **Wrap-up** (3-5 min) — "Is there anything important we haven\'t discussed?", express gratitude',
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'The "5 Whys" rule: when a participant gives a superficial answer, ask "Why?" up to 5 times in a row. This helps get to the true motivation. Example: "I deleted the app" \u2192 "Why?" \u2192 "There were too many notifications" \u2192 "Why did that bother you?" \u2192 "I use my phone during meetings" \u2192 Insight: a "Do Not Disturb" mode is needed.',
        },
        {
          type: 'subheading' as const,
          content: 'Sample Interview Questions',
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            {
              term: 'Open-ended question',
              definition:
                '"Tell me how you usually search for products online?" — encourages a detailed response',
            },
            {
              term: 'Situational question',
              definition:
                '"Think about the last time you placed an order online. What was difficult?"',
            },
            {
              term: 'Behavioral question',
              definition:
                '"How often do you use mobile banking? In what situations?"',
            },
            {
              term: 'Pain point question',
              definition:
                '"What frustrates you the most about the current process of booking a doctor\'s appointment?"',
            },
            {
              term: 'Aspirational question',
              definition:
                '"If you could change one thing about this app, what would it be?"',
            },
          ],
        },
        {
          type: 'callout' as const,
          variant: 'warning' as const,
          content:
            'Avoid leading questions! Bad: "You liked our new search feature, didn\'t you?" Good: "Tell me about your experience using the search." Leading questions produce false-positive data and invalidate the entire study.',
        },
        {
          type: 'divider' as const,
        },

        // ── Surveys ──
        {
          type: 'heading' as const,
          content: 'Survey Design',
        },
        {
          type: 'text' as const,
          content:
            'Surveys are a **quantitative** method: they provide numbers and statistics. They are ideal when you need to validate insights from interviews on a large sample. Popular tools: Google Forms (free), Typeform (beautiful forms), SurveyMonkey (analytics), Hotjar (in-product context).',
        },
        {
          type: 'text' as const,
          content:
            'Rules of a good survey:\n\n- **Brevity** — no more than 10-15 questions (completion rate drops by 20% after 12 questions)\n- **One question — one idea** — avoid "How convenient and fast is...?"\n- **Likert scale** — 5 or 7 points, odd number for a neutral option\n- **Required vs optional** — mark only critical questions with an asterisk\n- **Progress bar** — shows how much is left, reduces drop-off\n- **Logic branching** — if the answer is "No," skip the block of questions',
        },
        {
          type: 'callout' as const,
          variant: 'example' as const,
          content:
            'Example survey questions for e-commerce:\n\n1. How often do you shop online? (Once a month / 2-3 times / Every week / Every day)\n2. Which product categories do you buy most often? (multiple choice)\n3. Rate the convenience of the checkout process from 1 to 5\n4. What prevented you from completing your last purchase? (open-ended question)\n5. Would you recommend our store to friends? (NPS: 0-10)',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'Interviews vs Surveys',
              items: [
                'Interviews: depth, "why"',
                'Surveys: breadth, "how many"',
                'Interviews: 5-15 participants',
                'Surveys: 50-500+ respondents',
                'Interviews: 30-60 min per person',
                'Surveys: 3-5 min per person',
              ],
            },
            {
              title: 'When to Choose Which',
              items: [
                'Discovery phase \u2192 Interviews',
                'Hypothesis validation \u2192 Survey',
                'New product \u2192 Interviews + Survey',
                'A/B test results \u2192 Survey',
                'Usability issues \u2192 Interviews',
                'Feature prioritization \u2192 Survey',
              ],
            },
          ],
        },
        {
          type: 'divider' as const,
        },

        // ── Card Sorting ──
        {
          type: 'heading' as const,
          content: 'Card Sorting',
        },
        {
          type: 'text' as const,
          content:
            'Card Sorting is a method for researching information architecture: participants group content cards into categories. This helps understand the users\' **mental model** — how they expect to see the navigation structure and website sections.',
        },
        {
          type: 'diagram' as const,
          title: 'Card Sorting: Three Types',
          description:
            'Open sorting — participants create their own categories. Closed — categories are predefined. Hybrid — categories are predefined but participants can add their own.',
          items: [
            '\uD83D\uDFE2 Open: participants create their own categories \u2192 for discovering new IA',
            '\uD83D\uDD35 Closed: categories are fixed \u2192 for validating existing IA',
            '\uD83D\uDFE1 Hybrid: base categories + free-form \u2192 best balance',
            '\uD83D\uDCCA Tools: Optimal Workshop, Maze, physical cards on a table (offline)',
            '\uD83D\uDC65 Participants: 15-30 people for statistical significance',
            '\uD83D\uDCC8 Result: dendrogram (similarity matrix) for building navigation',
          ],
        },
        {
          type: 'callout' as const,
          variant: 'example' as const,
          content:
            'Example: you\'re designing the navigation for an electronics online store. You create 40 cards: "Headphones," "iPhone Charger," "Samsung Case," "Bluetooth Speaker," "HDMI Cable"... Participants group them. Result: 80% of people group "Headphones" and "Bluetooth Speaker" under "Audio" rather than "Accessories." This means you need a separate "Audio" category in the navigation.',
        },
        {
          type: 'subheading' as const,
          content: 'Tree Testing — Navigation Testing',
        },
        {
          type: 'text' as const,
          content:
            'Tree Testing is the reverse method to Card Sorting. You give participants a **ready-made navigation structure** (tree) and ask them to find specific information. This tests how well your IA works in practice.\n\n- **Task**: "Find where to change your password"\n- **Participant**: clicks through the navigation tree: Settings \u2192 Security \u2192 Change Password\n- **Metrics**: success rate, directness (found on first try), time to complete\n- **Benchmark**: success rate > 80% \u2014 the structure works',
        },
        {
          type: 'divider' as const,
        },

        // ── Video ──
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=Qq3OiHQ-HCU',
          title: 'How to Conduct User Interviews — NNGroup',
          caption:
            'Nielsen Norman Group explains key user interview techniques (15 min, English)',
        },

        // ── Case Study ──
        {
          type: 'case-study' as const,
          title: 'How Airbnb Rebuilt Search Using Card Sorting',
          company: 'Airbnb',
          problem:
            'Users couldn\'t find the right accommodation type: "entire home," "private room," and "shared room" were confusing. The search results page conversion rate was 12%.',
          solution:
            'The team conducted an open card sorting exercise with 200 participants from 5 countries. They discovered that people think not in terms of accommodation type but in terms of **trip purpose**: "romantic getaway," "family vacation," "business trip." They restructured the filters and categories.',
          result:
            'Conversion increased to 19% (+58%). Search time decreased by 30%. The new IA became the foundation of the 2020 redesign with "flexible travel."',
          steps: [
            { title: 'Open sorting', description: 'Participants grouped 60 accommodation cards into their own categories' },
            { title: 'Dendrogram analysis', description: 'Identified 4 main clusters by trip purpose' },
            { title: 'Tree Testing', description: 'Tested the new navigation — success rate 87%' },
            { title: 'A/B test', description: 'New IA vs old on 5% of traffic over 2 weeks' },
          ],
        },
        {
          type: 'divider' as const,
        },

        // ── Checklist ──
        {
          type: 'checklist' as const,
          title: 'Checklist: Preparing for a User Interview',
          items: [
            'Research goal is defined (1-2 specific questions)',
            'Guide with 8-12 open-ended questions is prepared',
            '5-8 participants from the target audience are recruited',
            'Recording consent is prepared (NDA if needed)',
            'Pilot interview is conducted (guide test)',
            'Recording is enabled (video or audio + notes)',
            'Template for capturing insights is ready (affinity map)',
            'Report format for stakeholders is defined',
          ],
        },
      ],
      quiz: [
        {
          question:
            'Which type of interview provides the best balance between answer depth and data comparability?',
          options: [
            { id: 'a', text: 'Structured interview' },
            { id: 'b', text: 'Semi-structured interview' },
            { id: 'c', text: 'Unstructured interview' },
            { id: 'd', text: 'Focus group' },
          ],
          correctId: 'b',
          explanation:
            'A semi-structured interview uses a guide with key topics but allows follow-up questions. It is the most popular format in UX research because it combines the depth of an unstructured approach with the ability to compare answers using a common framework.',
        },
        {
          question:
            'When conducting Card Sorting, you want to verify whether an existing website navigation works correctly. Which type of sorting is appropriate?',
          options: [
            { id: 'a', text: 'Open — participants create their own categories' },
            { id: 'b', text: 'Closed — categories are predefined' },
            { id: 'c', text: 'Hybrid — base categories + free-form categories' },
            { id: 'd', text: 'Tree Testing — testing by tree' },
          ],
          correctId: 'b',
          explanation:
            'Closed sorting is ideal for validation: you provide existing categories and observe where participants place the cards. If cards end up in unexpected places, the navigation doesn\'t match the users\' mental model.',
        },
        {
          question: 'Which question is leading and NOT suitable for an interview?',
          options: [
            { id: 'a', text: '"Tell me about your experience using the search"' },
            { id: 'b', text: '"You liked our new homepage design, didn\'t you?"' },
            { id: 'c', text: '"What was the most difficult part of placing an order?"' },
            { id: 'd', text: '"How often do you use the mobile app?"' },
          ],
          correctId: 'b',
          explanation:
            'The question "You liked..., didn\'t you?" is leading: it suggests the "correct" answer and creates social pressure. The participant is more likely to agree than to give honest feedback. Always formulate neutral, open-ended questions.',
        },
        {
          question:
            'How many participants are recommended for Card Sorting to achieve statistically significant results?',
          options: [
            { id: 'a', text: '3-5 people' },
            { id: 'b', text: '5-8 people' },
            { id: 'c', text: '15-30 people' },
            { id: 'd', text: '100+ people' },
          ],
          correctId: 'c',
          explanation:
            'For Card Sorting, 15-30 participants are recommended because the method analyzes grouping patterns through a similarity matrix. With fewer participants, the dendrogram will be unreliable. For interviews, 5-8 people are sufficient, but quantitative methods require a larger sample.',
        },
      ],
    },

    // ═══════════════════════════════════════════════
    // Part 2: Use Cases and User Stories (45 min)
    // ═══════════════════════════════════════════════
    {
      id: 'part-2',
      title: 'Use Cases and User Stories',
      subtitle:
        'The difference between Use Cases and User Stories, writing format, acceptance criteria, and MoSCoW prioritization',
      duration: '45 min',
      sections: [
        // ── Introduction ──
        {
          type: 'heading' as const,
          content: 'From Research to Requirements',
        },
        {
          type: 'text' as const,
          content:
            'After conducting interviews and surveys, the question arises: how do you translate insights into clear requirements for the development team? Two tools exist for this: **Use Cases** (usage scenarios) and **User Stories**. Both describe user behavior but from different perspectives.',
        },
        {
          type: 'divider' as const,
        },

        // ── Use Cases ──
        {
          type: 'heading' as const,
          content: 'Use Cases — Usage Scenarios',
        },
        {
          type: 'text' as const,
          content:
            'A Use Case is a detailed description of the interaction between a user (actor) and the system to achieve a specific goal. The format originated in software engineering (Ivar Jacobson, 1992) and describes a **sequence of steps**.\n\nUse Case structure:\n- **Title**: Place an Order\n- **Actor**: Buyer\n- **Precondition**: Item is added to the cart\n- **Main flow**: step 1, step 2, step 3...\n- **Alternative flow**: what if there\'s a payment error?\n- **Postcondition**: Order is created, email is sent',
        },
        {
          type: 'callout' as const,
          variant: 'example' as const,
          content:
            'Use Case: "Book a Doctor\'s Appointment"\n\n1. The patient opens the "Appointments" section in the app\n2. The system displays a list of specialists\n3. The patient selects a doctor and sees available time slots\n4. The patient selects a date and time\n5. The system requests confirmation\n6. The patient confirms the appointment\n7. The system sends an SMS confirmation\n\nAlternative: if no slots are available \u2014 offer to join the waiting list.',
        },
        {
          type: 'divider' as const,
        },

        // ── User Stories ──
        {
          type: 'heading' as const,
          content: 'User Stories',
        },
        {
          type: 'text' as const,
          content:
            'A User Story is a brief description of functionality from the user\'s perspective. The format comes from Agile/Scrum, invented by Kent Beck and popularized by Mike Cohn.\n\nFormula:\n\n**"As a [role], I want [action], so that [value]"**\n\nA User Story focuses not on the interaction steps but on the **value for the user**. This makes the story understandable for the entire team: from the designer to the developer.',
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'The INVEST principle for good User Stories:\n\n- **I**ndependent \u2014 independent from other stories\n- **N**egotiable \u2014 open to discussion\n- **V**aluable \u2014 delivers value to the user\n- **E**stimable \u2014 effort can be estimated\n- **S**mall \u2014 small enough for a single sprint\n- **T**estable \u2014 acceptance criteria can be verified',
        },

        // ── Comparison ──
        {
          type: 'subheading' as const,
          content: 'Use Case vs User Story: Key Differences',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'Use Case',
              items: [
                'Detailed step-by-step scenario',
                'Focus on interaction with the system',
                'Includes alternative flows',
                'Originated from Waterfall / RUP',
                'Suited for complex systems (banking, healthcare)',
                'Written by an analyst or architect',
              ],
            },
            {
              title: 'User Story',
              items: [
                'Brief formula: role + action + value',
                'Focus on value for the user',
                'Supplemented by acceptance criteria',
                'Originated from Agile / Scrum',
                'Suited for iterative development',
                'Written by the Product Owner or designer',
              ],
            },
          ],
        },
        {
          type: 'divider' as const,
        },

        // ── Before-After ──
        {
          type: 'heading' as const,
          content: 'Good vs Bad User Stories',
        },
        {
          type: 'before-after' as const,
          title: 'Example 1: E-commerce — Product Search',
          before: {
            label: 'Bad User Story',
            description:
              '"Build search on the website." No role, no value, no context. The developer doesn\'t understand what kind of search is needed or for whom.',
          },
          after: {
            label: 'Good User Story',
            description:
              '"As a buyer, I want to search for products by name and category so I can quickly find what I need without browsing the entire catalog." Acceptance Criteria: results appear in < 1 sec, autocomplete supported, category filter available.',
          },
        },
        {
          type: 'before-after' as const,
          title: 'Example 2: Fitness App — Workout Tracking',
          before: {
            label: 'Bad User Story',
            description:
              '"As a user, I want to track my workout." Role is too abstract ("user"), no value stated, scope is unclear.',
          },
          after: {
            label: 'Good User Story',
            description:
              '"As a beginner athlete, I want to log completed exercises with weight and reps so I can see my progress over the month and not forget my working weights." AC: adding an exercise in 2 taps, 30-day history, progress chart.',
          },
        },
        {
          type: 'before-after' as const,
          title: 'Example 3: SaaS — Project Management',
          before: {
            label: 'Bad User Story',
            description:
              '"Need a dashboard with tasks." Who will use it? What tasks? Why a dashboard? No answers at all.',
          },
          after: {
            label: 'Good User Story',
            description:
              '"As a team lead, I want to see the status of all sprint tasks on a dashboard with a filter by assignee so I can quickly understand who is blocked during the daily stand-up." AC: loads in < 2 sec, filter by 3+ fields, real-time updates.',
          },
        },
        {
          type: 'divider' as const,
        },

        // ── Acceptance Criteria ──
        {
          type: 'heading' as const,
          content: 'Acceptance Criteria',
        },
        {
          type: 'text' as const,
          content:
            'Acceptance Criteria (AC) are clear conditions that, when met, mean the User Story is considered complete. Without AC, a story remains ambiguous: the developer and designer may interpret it differently.\n\n**Given-When-Then** format (Gherkin):\n\n- **Given**: initial state\n- **When**: user action\n- **Then**: expected result',
        },
        {
          type: 'callout' as const,
          variant: 'example' as const,
          content:
            'User Story: "As a buyer, I want to add products to favorites so I can return to them later."\n\nAC-1: Given I am on the product page, When I click the heart icon, Then the product is added to favorites and the icon turns red.\n\nAC-2: Given I am not logged in, When I click the heart icon, Then the system prompts me to sign in or register.\n\nAC-3: Given there are 50+ products in favorites, When I open the "Favorites" section, Then products load with pagination of 20 items per page.',
        },
        {
          type: 'divider' as const,
        },

        // ── Scenarios for different products ──
        {
          type: 'heading' as const,
          content: 'User Stories for Different Product Types',
        },
        {
          type: 'subheading' as const,
          content: 'Web: E-commerce',
        },
        {
          type: 'text' as const,
          content:
            '- "As a buyer, I want to compare up to 4 products in a table so I can choose the best option by specifications"\n- "As a seller, I want to receive notifications about new reviews so I can quickly respond to negative feedback"\n- "As a guest, I want to place an order without registering so I don\'t waste time creating an account"',
        },
        {
          type: 'subheading' as const,
          content: 'Mobile: Fitness App',
        },
        {
          type: 'text' as const,
          content:
            '- "As a runner, I want to see my route on the map in real time so I don\'t get lost on a new trail"\n- "As an Apple Watch user, I want to receive a vibration when I reach my target heart rate so I don\'t overexert my heart"\n- "As a beginner, I want to receive ready-made workout programs by skill level so I don\'t have to create a plan on my own"',
        },
        {
          type: 'subheading' as const,
          content: 'SaaS: Project Management',
        },
        {
          type: 'text' as const,
          content:
            '- "As a project manager, I want to set dependencies between tasks so I can see the critical path on the Gantt chart"\n- "As a developer, I want to link commits to tasks so the PM can see progress without manual reports"\n- "As a client, I want to see a read-only project dashboard so I can track progress without access to internal discussions"',
        },
        {
          type: 'subheading' as const,
          content: 'Data: Analytics Dashboard',
        },
        {
          type: 'text' as const,
          content:
            '- "As an analyst, I want to build custom reports with drag-and-drop so I don\'t have to write SQL queries for every data slice"\n- "As a CEO, I want to see company KPIs on one screen with 12-month trends so I can make strategic decisions in 30 seconds"\n- "As a marketer, I want to set up automatic email report delivery every Monday so the team can see results without logging into the system"',
        },
        {
          type: 'divider' as const,
        },

        // ── MoSCoW ──
        {
          type: 'heading' as const,
          content: 'MoSCoW Prioritization',
        },
        {
          type: 'text' as const,
          content:
            'Once User Stories are written, they need to be prioritized. MoSCoW is a popular framework where each story falls into one of 4 categories:',
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            {
              term: 'Must have',
              definition:
                'The product doesn\'t work without this. MVP features. Example: registration, payment, product catalog.',
            },
            {
              term: 'Should have',
              definition:
                'Important, but the product can work without it in the first version. Example: filters, favorites, order history.',
            },
            {
              term: 'Could have',
              definition:
                'Nice to have if there\'s time left. Example: dark theme, animations, social login.',
            },
            {
              term: 'Won\'t have',
              definition:
                'Consciously deferred. Not "never," but "not in this release." Example: multi-language support, AI recommendations.',
            },
          ],
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'The 60/20/20 rule: in a sprint, ~60% of tasks should be Must have, ~20% Should have, ~20% Could have. If 100% of tasks are Must have, it means you\'re not prioritizing \u2014 you\'re just throwing everything into one pile.',
        },
        {
          type: 'divider' as const,
        },

        // ── Video ──
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=6q5-cVeNjCE',
          title: 'Writing Great User Stories — Mike Cohn',
          caption:
            'Mike Cohn, author of "User Stories Applied," explains how to write effective user stories (12 min, English)',
        },

        // ── Case Study ──
        {
          type: 'case-study' as const,
          title: 'How Spotify Prioritized Features Through User Stories',
          company: 'Spotify',
          problem:
            'The team was receiving 300+ feature requests monthly. Without a unified prioritization format, developers worked on the "loudest" requests rather than the most important ones.',
          solution:
            'They adopted the User Stories + MoSCoW format for each quarter. All requests were rewritten in the "As a [role], I want..." format. They held Story Mapping sessions with designers, developers, and analysts.',
          result:
            'Time from idea to prototype decreased from 6 to 2 weeks. The number of "abandoned" features dropped by 70%. The team started delivering 40% more Must-have stories per sprint.',
          steps: [
            { title: 'Backlog audit', description: 'Rewrote 300+ requests in User Story format' },
            { title: 'Story Mapping', description: 'Visualized the user journey and organized stories by stages' },
            { title: 'MoSCoW session', description: 'The entire team voted on each story\'s priority' },
            { title: 'Sprint Planning', description: 'Filled sprints using the 60/20/20 rule' },
          ],
        },
        {
          type: 'divider' as const,
        },

        // ── User Persona ──
        {
          type: 'user-persona' as const,
          persona: {
            name: 'Dmitry Volkov',
            age: 34,
            role: 'Product Manager at a SaaS startup',
            bio: 'Manages a team of 8 people. Writes User Stories every week but frequently receives complaints from developers: "it\'s unclear what to do." Wants to learn how to write clear stories with solid AC.',
            goals: [
              'Write User Stories that developers understand on the first read',
              'Reduce the number of follow-up questions by 50%',
              'Prioritize the backlog objectively, not by "who shouts the loudest"',
            ],
            frustrations: [
              'Developers interpret stories in their own way',
              'Stakeholders add Must have tasks mid-sprint',
              'No unified template \u2014 everyone writes differently',
            ],
            traits: [
              { label: 'Product experience', value: '5 years' },
              { label: 'Agile knowledge', value: 'Intermediate' },
              { label: 'Tools', value: 'Jira, Miro, Confluence' },
            ],
            quote: '"I spend more time explaining tasks than coming up with them"',
          },
        },
        {
          type: 'divider' as const,
        },

        // ── Checklist ──
        {
          type: 'checklist' as const,
          title: 'Checklist: Writing a User Story',
          items: [
            'A specific role is stated (not "user" but "buyer," "team lead," "beginner")',
            'The action the user wants to perform is described',
            'The value / goal is stated (why this is needed)',
            'The story passes the INVEST check',
            '2-5 Acceptance Criteria are written in Given-When-Then format',
            'The story is small enough for a single sprint',
            'Priority is set using MoSCoW',
            'The story has been discussed with the team (definition of ready)',
          ],
        },

        // ── Quote ──
        {
          type: 'quote' as const,
          text: 'User stories are not about writing better requirements. They are about having better conversations.',
          author: 'Jeff Patton',
          role: 'Author of "User Story Mapping"',
        },
      ],
      quiz: [
        {
          question:
            'What format is used for writing User Stories in Agile?',
          options: [
            { id: 'a', text: '"The system must allow the user to..."' },
            { id: 'b', text: '"As a [role], I want [action], so that [value]"' },
            { id: 'c', text: '"Step 1: the user clicks... Step 2: the system displays..."' },
            { id: 'd', text: '"Given... When... Then..."' },
          ],
          correctId: 'b',
          explanation:
            'The format "As a [role], I want [action], so that [value]" is the Agile standard for User Stories. Option (c) is a Use Case, option (d) is Acceptance Criteria (Given-When-Then), and option (a) is a formal System Requirement.',
        },
        {
          question:
            'How does a Use Case differ from a User Story?',
          options: [
            { id: 'a', text: 'A Use Case is shorter, while a User Story is longer' },
            { id: 'b', text: 'A Use Case describes a step-by-step scenario, while a User Story describes value for the user' },
            { id: 'c', text: 'A Use Case is used in Agile, while a User Story is used in Waterfall' },
            { id: 'd', text: 'They are the same thing, just different names' },
          ],
          correctId: 'b',
          explanation:
            'A Use Case is a detailed step-by-step scenario of interaction with the system (main and alternative flows). A User Story is a brief formula that focuses on value for the user. Use Cases are more common in Waterfall/RUP, while User Stories are used in Agile.',
        },
        {
          question:
            'According to the MoSCoW method, which tasks should make up approximately 60% of a sprint?',
          options: [
            { id: 'a', text: 'Could have \u2014 nice additions' },
            { id: 'b', text: 'Should have \u2014 important but not critical' },
            { id: 'c', text: 'Must have \u2014 the product doesn\'t work without them' },
            { id: 'd', text: 'Won\'t have \u2014 deferred for the future' },
          ],
          correctId: 'c',
          explanation:
            'The 60/20/20 rule: ~60% of sprint tasks should be Must have (critical for the product to function), ~20% Should have, ~20% Could have. Won\'t have items are not included in the sprint. This ensures a balance between reliable delivery and product growth.',
        },
        {
          question:
            'What does the letter "T" stand for in the INVEST principle for User Stories?',
          options: [
            { id: 'a', text: 'Transferable \u2014 can be handed off to another team' },
            { id: 'b', text: 'Testable \u2014 acceptance criteria can be verified' },
            { id: 'c', text: 'Timeboxed \u2014 limited in time' },
            { id: 'd', text: 'Trackable \u2014 progress can be monitored' },
          ],
          correctId: 'b',
          explanation:
            'T in INVEST stands for Testable \u2014 the story can be verified through acceptance criteria. If clear AC can\'t be written, the story is too abstract and needs to be broken down. INVEST: Independent, Negotiable, Valuable, Estimable, Small, Testable.',
        },
      ],
    },
  ],
}
