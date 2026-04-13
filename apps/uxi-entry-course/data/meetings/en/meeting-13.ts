import type { Meeting } from '../../types'

export const meeting13: Meeting = {
  id: '13',
  number: 13,
  title: 'Final Project',
  description:
    'Overview of all UX/UI designer tools, career paths, industry trends for 2025-2026, and the final project: designing a product from scratch, from research to presentation.',
  icon: 'Trophy',
  color: 'bg-rose-500/10 text-rose-600',
  parts: [
    // =============================================
    // PART 1 — Tools Overview and Checklist (45 min)
    // =============================================
    {
      id: 'part-1',
      title: 'Tools Overview and Checklist',
      subtitle:
        'The complete UX/UI designer toolkit, career paths, industry trends, and resources for continued growth',
      duration: '45 min',
      sections: [
        {
          type: 'heading' as const,
          content: 'The Journey You Have Completed: 12 Meetings to 1 Profession',
        },
        {
          type: 'text' as const,
          content:
            'Over 12 meetings, you have gone from basic UX and UI concepts to the full cycle of digital product design. Let us look back at this journey, organize our knowledge, and turn it into a **practical toolkit** that you will take with you into your career.',
        },
        {
          type: 'quote' as const,
          text: 'Design is not just what it looks like and feels like. Design is how it works.',
          author: 'Steve Jobs',
          role: 'Co-founder of Apple',
        },
        {
          type: 'divider' as const,
        },
        {
          type: 'subheading' as const,
          content: 'Structured Course Overview',
        },
        {
          type: 'text' as const,
          content:
            'The course was built on the **Double Diamond** principle — from research to solution, from abstract to concrete. Each meeting added a new layer of competencies.',
        },
        {
          type: 'diagram' as const,
          title: 'Course Map: 12 Meetings in 4 Blocks',
          description:
            'The complete path from fundamentals to advanced UX/UI design techniques.',
          items: [
            'BLOCK 1 — FUNDAMENTALS: Meeting 1 (Introduction to UX/UI) > Meeting 2 (Design Principles) > Meeting 3 (Typography and Color)',
            'BLOCK 2 — RESEARCH: Meeting 4 (UX Research) > Meeting 5 (Personas and CJM) > Meeting 6 (Information Architecture)',
            'BLOCK 3 — DESIGN: Meeting 7 (Wireframes) > Meeting 8 (UI Components) > Meeting 9 (Prototyping) > Meeting 10 (Animation and Micro-interactions)',
            'BLOCK 4 — PROFESSION: Meeting 11 (Design Systems) > Meeting 12 (Handoff and Working with Development)',
          ],
        },
        {
          type: 'divider' as const,
        },
        {
          type: 'subheading' as const,
          content: 'The Complete UX/UI Designer Toolkit',
        },
        {
          type: 'text' as const,
          content:
            'A professional UX/UI designer commands tools at **every stage** of product creation. Here is your complete arsenal — from research to developer handoff.',
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            {
              term: 'Research',
              definition:
                'Interviews, surveys, usability tests, competitor analysis, card sorting, A/B tests. Tools: Google Forms, Typeform, Maze, Hotjar, Lookback.',
            },
            {
              term: 'Define',
              definition:
                'Personas, Jobs-to-be-Done, Customer Journey Map, Empathy Map, Problem Statement. Tools: FigJam, Miro, Notion.',
            },
            {
              term: 'Design',
              definition:
                'Wireframes, moodboards, UI components, design systems, responsive layouts. Tools: Figma, Sketch, Adobe XD.',
            },
            {
              term: 'Prototype',
              definition:
                'Interactive prototypes, micro-interactions, animations, user flows. Tools: Figma Prototyping, ProtoPie, Principle.',
            },
            {
              term: 'Test',
              definition:
                'Usability tests, heuristic evaluation, SUS/NPS/CSAT metrics, task trees. Tools: Maze, UserTesting, Optimal Workshop.',
            },
            {
              term: 'Handoff',
              definition:
                'Specifications, tokens, component documentation, Dev Mode, inspection. Tools: Figma Dev Mode, Zeplin, Storybook.',
            },
          ],
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'You do not need to master **all** tools at once. Start with **Figma** as your primary tool and gradually add research and testing tools as you grow.',
        },
        {
          type: 'divider' as const,
        },
        {
          type: 'subheading' as const,
          content: 'Skills Checklist: Self-Assessment',
        },
        {
          type: 'text' as const,
          content:
            'Go through this checklist and honestly assess your level for each skill. Items where you feel uncertain are your **growth areas** after the course.',
        },
        {
          type: 'checklist' as const,
          title: 'UX/UI Designer Skills After the Course',
          items: [
            'I understand the difference between UX and UI and can explain both disciplines',
            'I know the principles of Gestalt, hierarchy, contrast, and balance',
            'I can select a typographic pairing and color palette',
            'I can conduct interviews and usability tests',
            'I create personas and Customer Journey Maps',
            'I build information architecture and navigation',
            'I draw wireframes at various levels of fidelity',
            'I work with UI components and states',
            'I create interactive prototypes in Figma',
            'I understand animation principles and micro-interactions',
            'I know design system structure and tokens',
            'I can hand off designs to development via Dev Mode',
          ],
        },
        {
          type: 'divider' as const,
        },
        {
          type: 'subheading' as const,
          content: 'Portfolio Tips',
        },
        {
          type: 'text' as const,
          content:
            'Your portfolio is your **primary tool for getting hired**. Recruiters spend an average of **3-5 minutes** reviewing a single portfolio, so every case study must be well-structured and visually compelling.',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'What to Include in a Case Study',
              items: [
                'Project context: client, task, constraints',
                'Your role and area of responsibility',
                'Process: research > design > testing',
                'Key decisions and their rationale',
                'Results: metrics, feedback, before/after',
                'Lessons and takeaways',
              ],
            },
            {
              title: 'Common Mistakes',
              items: [
                'Only final screens without showing the process',
                'No explanation of design decisions',
                'Too many projects (3-5 is enough)',
                'No mobile version of the portfolio',
                'Copying other people\'s Dribbble shots',
                'Missing UX artifacts (only UI)',
              ],
            },
          ],
        },
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=cVtBSTC_P_Y',
          title: 'How to Create a UX Portfolio That Gets Noticed',
          caption:
            'Practical tips on case study structure and portfolio platforms.',
        },
        {
          type: 'callout' as const,
          variant: 'example' as const,
          content:
            '**Case Study Structure:** 1) Cover with title and role > 2) Problem and context > 3) Research (interviews, competitors) > 4) Definition (personas, CJM) > 5) Design (wireframes > UI) > 6) Prototype and tests > 7) Results and metrics > 8) Takeaways.',
        },
        {
          type: 'divider' as const,
        },
        {
          type: 'subheading' as const,
          content: 'Career Paths in UX/UI Design',
        },
        {
          type: 'text' as const,
          content:
            'UX/UI design is a broad field with many specializations. Your career path depends on what appeals to you most: **research**, **visual design**, **strategy**, or **management**.',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'Junior (0-2 years)',
              items: [
                'Completing tasks under senior guidance',
                'Working with wireframes and simple screens',
                'Participating in usability tests',
                'Learning the company\'s design system',
                'Salary: ₪8,000-14,000 / $40-60K',
              ],
            },
            {
              title: 'Middle (2-5 years)',
              items: [
                'Independently owning features end to end',
                'Conducting research and tests',
                'Creating and maintaining components',
                'Mentoring juniors',
                'Salary: ₪14,000-22,000 / $60-100K',
              ],
            },
            {
              title: 'Senior (5-8 years)',
              items: [
                'Strategic design decisions',
                'Influencing product strategy',
                'Design system architecture',
                'Cross-team collaboration',
                'Salary: ₪22,000-35,000 / $100-150K',
              ],
            },
            {
              title: 'Lead / Director (8+ years)',
              items: [
                'Managing the design team',
                'Defining the company\'s design culture',
                'Budgeting and hiring',
                'Working with C-level leadership',
                'Salary: ₪35,000+ / $150K+',
              ],
            },
          ],
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            '**Alternative Career Tracks:** UX Research (research only), UX Writing (interface copy), Product Design (design + product), Design Engineering (design + code), DesignOps (design team processes).',
        },
        {
          type: 'divider' as const,
        },
        {
          type: 'subheading' as const,
          content: 'Preparing for Interviews',
        },
        {
          type: 'text' as const,
          content:
            'A UX/UI designer interview typically includes **3 stages**: HR screening, portfolio presentation, and a design challenge (whiteboard challenge). Preparation for each stage is different.',
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            {
              term: 'Screening (HR)',
              definition:
                'Tell about yourself in 2 minutes, explain your motivation, and show knowledge of the company. Prepare answers for: "Why design?", "Your best project?", "How do you work with developers?"',
            },
            {
              term: 'Portfolio Review',
              definition:
                'Present 2-3 case studies, 10-15 minutes each. Focus on the **process**, not the pixels. Show how you think, how you make decisions, and how you respond to feedback.',
            },
            {
              term: 'Whiteboard Challenge',
              definition:
                'A 30-60 minute task: design a solution from scratch. They evaluate not the final result, but your **thinking process**: do you ask questions, consider alternatives, and think about the user.',
            },
          ],
        },
        {
          type: 'callout' as const,
          variant: 'warning' as const,
          content:
            '**Red Flags in Interviews:** "I have no questions" (shows lack of interest), "I did everything myself" (lack of teamwork), "I didn\'t like the design, so I redid everything" (disregard for context).',
        },
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=SbJ3yVQ8E_E',
          title: 'How to Pass a UX Designer Interview',
          caption:
            'Real examples of questions and answer strategies for design interviews.',
        },
        {
          type: 'divider' as const,
        },
        {
          type: 'subheading' as const,
          content: 'Industry Trends 2025-2026',
        },
        {
          type: 'text' as const,
          content:
            'The UX/UI industry is changing rapidly. Understanding trends helps you stay **in demand** and find your niche in the market.',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'AI in Design',
              items: [
                'AI-generated layouts and variations',
                'Automation of routine tasks (resizing, localization)',
                'AI assistants for research (interview analysis)',
                'Real-time interface personalization',
                'Designer as "AI director" rather than "pixel pusher"',
              ],
            },
            {
              title: 'Voice UI and Multimodality',
              items: [
                'Voice interfaces extend beyond smart speakers',
                'Combining voice, gestures, and visuals',
                'Conversational UX — dialog design',
                'New navigation patterns without a screen',
                'Growing demand for UX writers',
              ],
            },
            {
              title: 'Spatial Computing',
              items: [
                'Apple Vision Pro and Meta Quest are changing the rules',
                'Designing in 3D space',
                'New interaction model: gaze + gesture + voice',
                'Spatial UI — buttons and panels in space',
                'Enormous demand for specialists',
              ],
            },
            {
              title: 'Inclusive Design',
              items: [
                'Accessibility as a mandatory requirement (WCAG 2.2)',
                'Designing for neurodivergent users',
                'Cultural adaptation of interfaces',
                'Ethical design — fighting dark patterns',
                'ESG requirements influencing design',
              ],
            },
          ],
        },
        {
          type: 'quote' as const,
          text: 'The best way to predict the future is to create it.',
          author: 'Alan Kay',
          role: 'Computer science pioneer, Xerox PARC',
        },
        {
          type: 'divider' as const,
        },
        {
          type: 'subheading' as const,
          content: 'Resources for Continued Learning',
        },
        {
          type: 'text' as const,
          content:
            'Learning design is a **continuous process**. Here are proven resources that will help you grow after the course.',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'Books',
              items: [
                '"Don\'t Make Me Think" — Steve Krug',
                '"The Design of Everyday Things" — Don Norman',
                '"Sprint" — Jake Knapp (Google Ventures)',
                '"Lean UX" — Jeff Gothelf',
                '"Refactoring UI" — Adam Wathan, Steve Schoger',
              ],
            },
            {
              title: 'Online Platforms',
              items: [
                'Interaction Design Foundation (IxDF)',
                'Nielsen Norman Group (nngroup.com)',
                'Coursera — Google UX Design Certificate',
                'Designlab, Springboard',
                'YouTube: NNgroup, Flux, Jesse Showalter',
              ],
            },
            {
              title: 'Communities',
              items: [
                'Dribbble, Behance — inspiration and portfolios',
                'Figma Community — free files and plugins',
                'ADPList — free mentorship',
                'UX Collective (Medium) — articles',
                'Telegram/Slack designer chats',
              ],
            },
          ],
        },
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=t0aCoqXKFOU',
          title: 'How to Continue Learning UX/UI After the Course',
          caption:
            'Self-education strategies and building a career in design.',
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            '**The 20 Minutes a Day Rule:** Read one UX article, analyze one interface, or practice one skill in Figma every day. In a year, that adds up to 120+ hours of additional practice.',
        },
      ],
      quiz: [
        {
          question:
            'Which UX research method is best suited for validating a prototype before development?',
          options: [
            { id: 'a', text: 'Card sorting' },
            { id: 'b', text: 'Usability testing' },
            { id: 'c', text: 'Competitor analysis' },
            { id: 'd', text: 'Surveys' },
          ],
          correctId: 'b',
          explanation:
            'Usability testing allows you to observe how real users interact with a prototype, identifying problems before development begins. Card sorting is for IA, competitor analysis is for strategy, and surveys are for quantitative data.',
        },
        {
          question:
            'What are design tokens in the context of a design system?',
          options: [
            { id: 'a', text: 'Icons and illustrations' },
            { id: 'b', text: 'Atomic values (color, font, spacing) shared between design and code' },
            { id: 'c', text: 'Ready-made page templates' },
            { id: 'd', text: 'A set of Figma plugins' },
          ],
          correctId: 'b',
          explanation:
            'Design tokens are atomic, named values (colors, sizes, spacing, radii) that serve as a single source of truth between design and development. They ensure product consistency.',
        },
        {
          question:
            'Which Gestalt principle explains why we perceive elements within a single border as a group?',
          options: [
            { id: 'a', text: 'Proximity' },
            { id: 'b', text: 'Similarity' },
            { id: 'c', text: 'Closure' },
            { id: 'd', text: 'Common Region' },
          ],
          correctId: 'd',
          explanation:
            'The Common Region principle states that elements within a single visual boundary are perceived as a group. This is the foundation of cards, sections, and panels in UI.',
        },
        {
          question:
            'At which stage of the design process is the Customer Journey Map created?',
          options: [
            { id: 'a', text: 'Design' },
            { id: 'b', text: 'Define (problem definition)' },
            { id: 'c', text: 'Prototype' },
            { id: 'd', text: 'Handoff (developer handoff)' },
          ],
          correctId: 'b',
          explanation:
            'The CJM is created at the Define stage, when we define the problem, study the user journey, and identify pain points. This happens before the Design stage and helps guide the design process.',
        },
      ],
    },

    // =============================================
    // PART 2 — Final Project (45 min)
    // =============================================
    {
      id: 'part-2',
      title: 'Final Project',
      subtitle:
        'Designing a product from scratch: from research to presentation, evaluation criteria, and peer review',
      duration: '45 min',
      sections: [
        {
          type: 'heading' as const,
          content: 'Final Project: Time to Apply Everything',
        },
        {
          type: 'text' as const,
          content:
            'The final project is your opportunity to demonstrate **all the skills** you have acquired over 12 meetings. You will go through the full product design cycle — from research to an interactive prototype — and present the results at a defense.',
        },
        {
          type: 'quote' as const,
          text: 'The only way to learn design is to do design.',
          author: 'John Maeda',
          role: 'Designer, technologist, author of "Laws of Simplicity"',
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'The final project is not an exam, but an **opportunity**. This is your first full case study for your portfolio. Treat it as a real project for a client.',
        },
        {
          type: 'divider' as const,
        },
        {
          type: 'subheading' as const,
          content: 'Project Brief',
        },
        {
          type: 'text' as const,
          content:
            'Choose **one** of the suggested topics or propose your own (with instructor approval). Each topic includes a target audience, key problem, and constraints.',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'Topic A: Meditation App',
              items: [
                'Target audience: beginners, 25-40 years old, work-related stress',
                'Problem: difficulty starting a practice and sticking with it',
                'Key screens: onboarding, home, timer, progress',
                'Constraints: iOS, minimal design, no subscription',
              ],
            },
            {
              title: 'Topic B: Food Delivery Service',
              items: [
                'Target audience: students, 18-25 years old, limited budget',
                'Problem: finding affordable and fast delivery nearby',
                'Key screens: catalog, filters, cart, order',
                'Constraints: mobile version, fast checkout',
              ],
            },
            {
              title: 'Topic C: Learning Platform',
              items: [
                'Target audience: professionals, 30-50 years old, career change',
                'Problem: not enough time and motivation to learn',
                'Key screens: courses, lesson, tracker, community',
                'Constraints: desktop + mobile, gamification',
              ],
            },
          ],
        },
        {
          type: 'divider' as const,
        },
        {
          type: 'subheading' as const,
          content: 'Step-by-Step Project Guide',
        },
        {
          type: 'text' as const,
          content:
            'Follow this plan to go through **all stages** of the design process. Each step corresponds to a skill you learned in the course.',
        },
        {
          type: 'user-flow' as const,
          title: 'Final Project Process',
          steps: [
            { id: 'research', label: 'Research (Meetings 4-5)', type: 'start' as const },
            { id: 'personas', label: 'Personas and CJM (Meeting 5)', type: 'action' as const },
            { id: 'ia', label: 'Information Architecture (Meeting 6)', type: 'action' as const },
            { id: 'wireframes', label: 'Wireframes (Meeting 7)', type: 'action' as const },
            { id: 'ui', label: 'UI Design (Meetings 3, 8)', type: 'action' as const },
            { id: 'prototype', label: 'Prototype (Meeting 9)', type: 'action' as const },
            { id: 'test', label: 'Testing (Meeting 4)', type: 'decision' as const },
            { id: 'iterate', label: 'Iteration and Refinement', type: 'action' as const },
            { id: 'present', label: 'Presentation', type: 'end' as const },
          ],
          connections: [
            { from: 'research', to: 'personas' },
            { from: 'personas', to: 'ia' },
            { from: 'ia', to: 'wireframes' },
            { from: 'wireframes', to: 'ui' },
            { from: 'ui', to: 'prototype' },
            { from: 'prototype', to: 'test' },
            { from: 'test', to: 'iterate', label: 'Issues found' },
            { from: 'test', to: 'present', label: 'All good' },
            { from: 'iterate', to: 'prototype' },
          ],
        },
        {
          type: 'divider' as const,
        },
        {
          type: 'subheading' as const,
          content: 'Step 1: Research',
        },
        {
          type: 'text' as const,
          content:
            'Conduct a **mini-research** in 60-90 minutes. You do not need a full-scale UX study — basic data to justify your decisions is enough.',
        },
        {
          type: 'checklist' as const,
          title: 'Research Stage Checklist',
          items: [
            'Conduct 2-3 short interviews (friends, colleagues) or a survey with 5-10 questions',
            'Analyze 3-5 competitors: strengths and weaknesses',
            'Identify 3-5 key needs of the target audience',
            'Document 2-3 main user pain points',
            'Formulate a Problem Statement in the format: "[User] wants [goal], but faces [problem]"',
          ],
        },
        {
          type: 'divider' as const,
        },
        {
          type: 'subheading' as const,
          content: 'Step 2: Personas and Customer Journey Map',
        },
        {
          type: 'text' as const,
          content:
            'Create **one primary persona** and **one simplified CJM**. The persona is a portrait of your key user, and the CJM is a map of their journey from problem to solution.',
        },
        {
          type: 'callout' as const,
          variant: 'example' as const,
          content:
            '**Persona (example):** Anna, 32, marketer. Works 50+ hours a week, wants to start meditating, but forgets and does not feel progress. Goal: incorporate meditation into her morning routine. Frustration: apps are too complex and require a subscription.',
        },
        {
          type: 'divider' as const,
        },
        {
          type: 'subheading' as const,
          content: 'Step 3: Wireframes and UI Design',
        },
        {
          type: 'text' as const,
          content:
            'Draw **5-8 key screens** as wireframes, then translate them into **UI design** with a color palette, typography, and components. Remember the principles you learned in meetings 2, 3, and 8.',
        },
        {
          type: 'checklist' as const,
          title: 'Design Stage Checklist',
          items: [
            'Lo-fi wireframes for all key screens (paper or Figma)',
            'Color palette: primary, secondary, accent, neutrals',
            'Typographic pairing: heading + body',
            'Icons: consistent style (stroke or fill)',
            'UI Kit: buttons, inputs, cards, navigation',
            'Responsiveness: at least 2 screen sizes',
            'Contrast check: WCAG AA minimum',
          ],
        },
        {
          type: 'divider' as const,
        },
        {
          type: 'subheading' as const,
          content: 'Step 4: Prototype and Testing',
        },
        {
          type: 'text' as const,
          content:
            'Create an **interactive prototype** of the main user flow in Figma. Then conduct **mini-testing** with 2-3 people and document any issues found.',
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            {
              term: 'Main Flow',
              definition:
                'Choose one key usage scenario (for example, "user starts a meditation session"). Connect 5-8 screens with interactive transitions.',
            },
            {
              term: 'Mini-Testing',
              definition:
                'Ask 2-3 people to complete a task in the prototype. Do not give hints! Record where they get lost, what they tap incorrectly, and what is unclear.',
            },
            {
              term: 'Iteration',
              definition:
                'Based on testing results, make 3-5 improvements. Show "before" and "after" — this is the most valuable part of a portfolio case study.',
            },
          ],
        },
        {
          type: 'divider' as const,
        },
        {
          type: 'subheading' as const,
          content: 'Project Evaluation Criteria',
        },
        {
          type: 'text' as const,
          content:
            'The project is evaluated across **6 criteria**. Each criterion scores from 1 to 5 points. Maximum score is 30. A **minimum of 18 points** (60%) is required for a successful defense.',
        },
        {
          type: 'diagram' as const,
          title: 'Final Project Evaluation Criteria',
          description:
            'Six evaluation areas, each on a 5-point scale.',
          items: [
            'RESEARCH (1-5): Quality of target audience analysis, competitors, and problem definition. Is the data behind the decisions?',
            'DEFINE (1-5): Persona and CJM. How specific and research-based are they?',
            'DESIGN (1-5): Visual quality, consistency, adherence to design principles.',
            'PROTOTYPE (1-5): Interactivity, flow logic, quality of transitions.',
            'TESTING (1-5): Was testing conducted? Are there iterations based on results?',
            'PRESENTATION (1-5): Story structure, decision rationale, answers to questions.',
          ],
        },
        {
          type: 'callout' as const,
          variant: 'warning' as const,
          content:
            '**Common Mistake:** Students spend 80% of their time on UI and 20% on research. Remember: beautiful design without research is **unfounded assumptions**. Balance: 30% research, 40% design, 30% testing and iteration.',
        },
        {
          type: 'divider' as const,
        },
        {
          type: 'subheading' as const,
          content: 'Presentation Tips',
        },
        {
          type: 'text' as const,
          content:
            'The presentation is a **story**, not a slideshow of screens. Structure your narrative so the audience understands not only **what** you did, but also **why**.',
        },
        {
          type: 'checklist' as const,
          title: 'Presentation Checklist (10-15 minutes)',
          items: [
            'Introduction: who you are, which topic you chose (30 sec)',
            'Problem: show the user\'s pain, statistics, interview quotes (2 min)',
            'Research: competitors, insights, Problem Statement (2 min)',
            'Persona and CJM: who is your user and their journey (2 min)',
            'Design solution: wireframes > UI, rationale for key decisions (3 min)',
            'Prototype: live demo of the main flow (2 min)',
            'Testing: what you found, what you fixed, "before" and "after" (2 min)',
            'Summary: key takeaways and what you learned (1 min)',
            'Audience questions (2-3 min)',
          ],
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            '**Confidence Hack:** Rehearse your presentation 3 times out loud. Record yourself on video and watch it. Prepare answers to 5 typical questions: "Why this color?", "How did you choose the layout?", "What would you change?", "What are the success metrics?", "What was the hardest part?"',
        },
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=LPDlPHzRqHI',
          title: 'How to Present a Design Project',
          caption:
            'Storytelling techniques and presentation structure for designers.',
        },
        {
          type: 'divider' as const,
        },
        {
          type: 'subheading' as const,
          content: 'Peer Review Rules',
        },
        {
          type: 'text' as const,
          content:
            'After each presentation, a **peer review** is conducted — feedback from classmates. This develops the skill of **constructive criticism**, which is essential in a designer\'s work.',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'Feedback Rules',
              items: [
                'Start with what is good (be specific!)',
                'Frame criticism as a question: "Have you considered...?"',
                'Critique the decision, not the person',
                'Suggest an alternative, not just "I don\'t like it"',
                'One comment = one specific recommendation',
              ],
            },
            {
              title: 'What to Avoid',
              items: [
                '"I don\'t like it" without explaining why',
                '"I would do everything differently" without specifics',
                'Criticizing subjective preferences (color, style)',
                'Comparing with other participants',
                'Comments unrelated to UX/UI',
              ],
            },
          ],
        },
        {
          type: 'callout' as const,
          variant: 'example' as const,
          content:
            '**Good Feedback:** "I liked your color palette — it conveys calmness. Question: have you considered increasing the CTA button size? On mobile, it might be difficult to tap per the 44x44px standard." **Bad Feedback:** "The button is small, redo everything."',
        },
        {
          type: 'divider' as const,
        },
        {
          type: 'subheading' as const,
          content: 'Sample Project: Step-by-Step Walkthrough',
        },
        {
          type: 'text' as const,
          content:
            'Let us walk through an **example of a real student project** — a meditation app called "ZenBreath." This example shows what each stage should look like.',
        },
        {
          type: 'case-study' as const,
          title: 'Final Project Example: ZenBreath',
          company: 'Student Project',
          problem:
            'Beginning meditators abandon the practice within the first 2 weeks due to a lack of perceived progress and the complexity of existing apps.',
          solution:
            'A minimalist app with 3-minute sessions, a visual habit tracker, and an adaptive program that adjusts to the user\'s schedule.',
          result:
            'In mini-testing, 3 out of 3 participants successfully completed onboarding and started their first meditation in under 30 seconds. SUS score: 87/100.',
          steps: [
            {
              title: 'Research',
              description:
                'Survey of 15 people: 73% had tried meditating, 80% quit within the first month. Main reasons: "no time" (60%), "don\'t see results" (45%).',
            },
            {
              title: 'Persona',
              description:
                'Anna, 32, marketer, wants to reduce stress but forgets to meditate. Needs short sessions and reminders.',
            },
            {
              title: 'CJM',
              description:
                'Journey: learned about it > downloaded > completed onboarding > first session > second session (critical point) > habit (goal).',
            },
            {
              title: 'Wireframes',
              description:
                '6 screens: splash, onboarding (3 steps), home with timer, statistics.',
            },
            {
              title: 'UI Design',
              description:
                'Palette: dark blue + lavender. Font: Inter. Minimal elements, focus on breathing animation.',
            },
            {
              title: 'Testing',
              description:
                'Problem: users did not notice the "Start" button. Solution: enlarged the button and added a pulsing animation.',
            },
          ],
        },
        {
          type: 'divider' as const,
        },
        {
          type: 'subheading' as const,
          content: 'Complete Final Project Checklist',
        },
        {
          type: 'text' as const,
          content:
            'Use this checklist as a **final review** before submitting the project. Each item corresponds to an evaluation criterion.',
        },
        {
          type: 'checklist' as const,
          title: 'Final Project Checklist',
          items: [
            '[ RESEARCH ] Target audience and their needs are described',
            '[ RESEARCH ] Analysis of 3+ competitors is conducted',
            '[ RESEARCH ] Problem Statement is formulated',
            '[ DEFINE ] At least 1 data-backed persona is created',
            '[ DEFINE ] Customer Journey Map is built',
            '[ DESIGN ] Wireframes are drawn for 5+ screens',
            '[ DESIGN ] Color palette and typography are chosen',
            '[ DESIGN ] UI design with consistent components is created',
            '[ DESIGN ] Accessibility is verified (contrast, tap target size)',
            '[ PROTOTYPE ] Interactive prototype of the main flow is created',
            '[ PROTOTYPE ] Prototype contains realistic transitions',
            '[ TESTING ] Testing is conducted with 2+ participants',
            '[ TESTING ] Found issues are documented',
            '[ TESTING ] "Before/after" iterations are made',
            '[ PRESENTATION ] A structured 10-15 min presentation is prepared',
            '[ PRESENTATION ] Every decision is justified with data or principles',
          ],
        },
        {
          type: 'divider' as const,
        },
        {
          type: 'subheading' as const,
          content: 'Preparing for Q&A',
        },
        {
          type: 'text' as const,
          content:
            'After the presentation, there will be **2-3 minutes of questions**. Prepare for typical questions in advance — this will demonstrate the depth of your understanding.',
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            {
              term: '"Why this particular solution?"',
              definition:
                'Reference research data, design principles, or testing results. Never say "I just liked it."',
            },
            {
              term: '"What would you change if you had more time?"',
              definition:
                'Show that you see beyond: "I would run an A/B test of two navigation options" or "I would add dark mode and an accessibility audit."',
            },
            {
              term: '"What metrics would you track?"',
              definition:
                'Name 2-3 specific metrics: retention rate, task completion rate, SUS score (satisfaction).',
            },
            {
              term: '"What was the hardest part?"',
              definition:
                'Be honest. "The hardest part was choosing what NOT to include. We had 12 ideas for the home screen, but kept only 3, because..."',
            },
          ],
        },
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=7wZ3ON_L-YA',
          title: 'Presentation Skills for Designers',
          caption:
            'How to answer tough questions and demonstrate confidence during a project defense.',
        },
        {
          type: 'divider' as const,
        },
        {
          type: 'heading' as const,
          content: 'Congratulations on Completing the Course!',
        },
        {
          type: 'text' as const,
          content:
            'You have completed **13 meetings**, studied the full UX/UI design cycle, created your first project, and are ready to launch your career. Remember: every great designer was once a beginner. The difference between those who succeed and those who do not is **not talent, but consistent practice**.',
        },
        {
          type: 'quote' as const,
          text: 'Every expert was once a beginner.',
          author: 'Helen Hayes',
          role: 'Actress, winner of Oscar, Grammy, and Tony awards',
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            '**Your Next Steps:** 1) Package the final project as a case study in your portfolio. 2) Create a profile on Behance/Dribbble. 3) Sign up on ADPList for mentorship. 4) Start doing unsolicited redesigns of popular apps — it is the best practice. 5) Join design communities. Good luck!',
        },
      ],
      quiz: [
        {
          question:
            'What is the minimum set of artifacts a final project should contain?',
          options: [
            { id: 'a', text: 'Only final screens in Figma' },
            { id: 'b', text: 'Research, persona, wireframes, UI, prototype, testing results' },
            { id: 'c', text: 'A moodboard and color palette' },
            { id: 'd', text: 'A PowerPoint presentation' },
          ],
          correctId: 'b',
          explanation:
            'A complete UX/UI project includes all stages: from research to testing. Just screens or just a moodboard is only part of the process, not the full product.',
        },
        {
          question:
            'During a peer review, you notice a colleague has buttons that are too small. How is it best to phrase your feedback?',
          options: [
            { id: 'a', text: '"The buttons are too small, redo them"' },
            { id: 'b', text: '"I don\'t like those buttons"' },
            { id: 'c', text: '"Have you considered increasing the tap target to 44x44px per the Apple HIG recommendation?"' },
            { id: 'd', text: '"Another participant\'s buttons are better"' },
          ],
          correctId: 'c',
          explanation:
            'Constructive feedback is a question with a specific recommendation and a reference to a standard. This is a professional approach that helps both participants grow.',
        },
        {
          question:
            'What percentage of time is recommended to spend on research in the final project?',
          options: [
            { id: 'a', text: '10% — research is not that important' },
            { id: 'b', text: '30% — research justifies all decisions' },
            { id: 'c', text: '60% — research is more important than design' },
            { id: 'd', text: '50% — half the project' },
          ],
          correctId: 'b',
          explanation:
            'Recommended distribution: 30% research, 40% design, 30% testing and iteration. This ensures a balance between the validity of decisions and the quality of their execution.',
        },
        {
          question:
            'At the defense, you are asked: "Why did you choose blue for the meditation app?" What is the best answer?',
          options: [
            { id: 'a', text: '"I like the color blue"' },
            { id: 'b', text: '"It was the default in Figma"' },
            { id: 'c', text: '"Research shows that blue is associated with calmness, and in our survey 70% of respondents chose cool tones for a meditation app"' },
            { id: 'd', text: '"All meditation apps are blue"' },
          ],
          correctId: 'c',
          explanation:
            'The best answer is one backed by data. Referencing color psychology research and your own survey shows that the decision was made deliberately, not intuitively.',
        },
      ],
    },
  ],
}
