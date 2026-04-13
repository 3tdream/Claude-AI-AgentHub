import type { Meeting } from '../../types'

export const meeting04: Meeting = {
  id: '4',
  number: 4,
  title: 'UX Research: Practice',
  description:
    'Usability testing, Nielsen heuristics, and quantitative UX metrics. Learn how to conduct tests, analyze results, and measure user experience quality.',
  icon: 'FlaskConical',
  color: 'bg-teal-500/10 text-teal-600',
  parts: [
    // =============================================
    // PART 1 — Usability Testing (45 min)
    // =============================================
    {
      id: 'part-1',
      title: 'Usability Testing',
      subtitle: 'Moderated and unmoderated testing, think-aloud protocol, the 5-user rule',
      duration: '45 min',
      sections: [
        {
          type: 'heading' as const,
          content: 'What Is Usability Testing?',
        },
        {
          type: 'text' as const,
          content:
            'Usability testing is a UX research method in which **real users** perform tasks within a product while a researcher observes their behavior, difficulties, and reactions. The goal is to find problems **before** thousands of users encounter the product.',
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'Usability testing answers the question: "Can users complete the task?" rather than "Do they like the design?" It is about **effectiveness**, not aesthetics.',
        },
        {
          type: 'quote' as const,
          text: 'If you want a great product, test and revise. If you want an outstanding product, test and revise again.',
          author: 'Steve Krug',
          role: 'Author of "Don\'t Make Me Think"',
        },
        {
          type: 'divider' as const,
        },
        {
          type: 'subheading' as const,
          content: 'Moderated vs Unmoderated Testing',
        },
        {
          type: 'text' as const,
          content:
            'There are two main formats of usability testing. The choice depends on **budget**, **product stage**, and the **depth** of insights required.',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'Moderated Testing',
              items: [
                'A researcher is present in real time',
                'Follow-up questions can be asked',
                'Deep qualitative insights',
                'More expensive and time-consuming',
                'Ideal for early stages and complex flows',
                'Format: in-person meeting or video call',
                'Sample size: 5-8 participants',
              ],
            },
            {
              title: 'Unmoderated Testing',
              items: [
                'The participant works independently',
                'No questions can be asked during the session',
                'Larger samples in less time',
                'Cheaper and scales faster',
                'Ideal for validation and A/B tests',
                'Format: online platform with screen recording',
                'Sample size: 20-100+ participants',
              ],
            },
          ],
        },
        {
          type: 'callout' as const,
          variant: 'example' as const,
          content:
            '**Format selection example:** A startup is developing a new checkout flow. During the prototype phase, they conduct **moderated** testing with 5 participants to understand thinking patterns. After launch, they use **unmoderated** testing with 50 users to measure conversion.',
        },
        {
          type: 'divider' as const,
        },
        {
          type: 'subheading' as const,
          content: 'The Think-Aloud Protocol',
        },
        {
          type: 'text' as const,
          content:
            'Think-aloud is a technique where a participant **verbalizes their thoughts** while performing a task. The researcher hears not only what the user does but also **why** they do it, what they expect, and where they get lost.',
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            {
              term: 'Concurrent think-aloud',
              definition:
                'The participant comments on their actions in real time: "I see a button, but I don\'t understand where it leads..." The most natural format.',
            },
            {
              term: 'Retrospective think-aloud',
              definition:
                'The participant first completes the task, then watches the recording and comments on their actions. Less likely to distort behavior.',
            },
            {
              term: 'Probing questions',
              definition:
                'Questions from the moderator to go deeper: "What did you expect to see?", "Why did you click right there?", "What would you do next?"',
            },
          ],
        },
        {
          type: 'callout' as const,
          variant: 'warning' as const,
          content:
            'Do not prompt the participant! Phrases like "Try clicking this button" completely invalidate the results. If the participant is stuck, ask: "What would you do if you were at home by yourself?"',
        },
        {
          type: 'divider' as const,
        },
        {
          type: 'subheading' as const,
          content: 'The 5-User Rule (Jakob Nielsen)',
        },
        {
          type: 'text' as const,
          content:
            'In 2000, Jakob Nielsen published a study demonstrating that **5 participants** uncover **~85% of usability problems**. This rule became the foundation of iterative testing.',
        },
        {
          type: 'diagram' as const,
          title: 'Testing efficiency: number of participants vs problems found',
          description:
            'The problem discovery curve is logarithmic. After 5 participants, each additional one finds fewer and fewer new problems.',
          items: [
            '1 user → ~31% of problems',
            '2 users → ~52% of problems',
            '3 users → ~68% of problems',
            '4 users → ~78% of problems',
            '5 users → ~85% of problems',
            '10 users → ~95% of problems',
            '15 users → ~99% of problems',
          ],
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            '**Iterative approach:** It is better to run 3 rounds of 5 participants (with fixes between rounds) than one round with 15 participants. Each round of fixes reveals a **new layer** of problems.',
        },
        {
          type: 'divider' as const,
        },
        {
          type: 'subheading' as const,
          content: 'Remote Testing Tools',
        },
        {
          type: 'text' as const,
          content:
            'Modern tools allow you to conduct usability testing **entirely remotely** — with screen recording, click tracking, navigation tracking, and even facial expression capture.',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'Maze',
              items: [
                'Unmoderated prototype testing',
                'Integration with Figma and Sketch',
                'Click heatmaps',
                'Metrics: misclick rate, time on task',
                'Free plan to get started',
              ],
            },
            {
              title: 'Lookback',
              items: [
                'Moderated and unmoderated testing',
                'Screen + participant face video recording',
                'Collaborative team viewing',
                'Tags and notes on the timeline',
                'Ideal for in-depth interviews',
              ],
            },
            {
              title: 'UserTesting',
              items: [
                'Access to a panel of 2M+ testers',
                'Results in 1-2 hours',
                'Video with think-aloud commentary',
                'Test scenario templates',
                'Premium: from $49/video',
              ],
            },
          ],
        },
        {
          type: 'divider' as const,
        },
        {
          type: 'subheading' as const,
          content: 'Writing a Test Scenario',
        },
        {
          type: 'text' as const,
          content:
            'A good test scenario is the **screenplay** of the research. It defines exactly what you are testing, what tasks you will give the participant, and what questions you will ask.',
        },
        {
          type: 'checklist' as const,
          title: 'Usability Test Preparation Checklist',
          items: [
            'Define the goal: what exactly do we want to learn?',
            'Formulate 3-5 tasks for the participant',
            'Tasks should be realistic scenarios, not instructions',
            'Write an introductory text (without hints about the product)',
            'Prepare probing questions for each task',
            'Create a post-test questionnaire (SUS, general impressions)',
            'Verify the prototype / product is functional',
            'Set up screen and audio recording',
            'Run a pilot test with a colleague',
            'Prepare an informed consent form',
            'Plan compensation for participants',
          ],
        },
        {
          type: 'before-after' as const,
          title: 'Task Formulation for Testing',
          before: {
            label: 'Bad task',
            description:
              '"Click the \'Catalog\' button in the top menu, then select the \'Electronics\' category and find the Sony WH-1000XM5 headphones." This is an instruction, not a task — you are testing the ability to follow directions, not usability.',
          },
          after: {
            label: 'Good task',
            description:
              '"Imagine you want to buy wireless noise-canceling headphones. Find a suitable option and add it to your cart." The participant chooses their own path — you observe their natural behavior.',
          },
        },
        {
          type: 'divider' as const,
        },
        {
          type: 'subheading' as const,
          content: 'Analyzing Test Results',
        },
        {
          type: 'text' as const,
          content:
            'After conducting the tests, you need to systematize findings. Use a **prioritization matrix** of problems along two axes: **frequency** (how many participants encountered it) and **severity** (how much it blocks the task).',
        },
        {
          type: 'diagram' as const,
          title: 'Usability testing process from planning to report',
          description:
            'The full testing cycle — from setting goals to implementing fixes.',
          items: [
            '1. Define goals and hypotheses',
            '2. Write the test scenario',
            '3. Recruit participants (screening)',
            '4. Pilot test (1 colleague as participant)',
            '5. Conduct tests (5 participants)',
            '6. Transcribe recordings and notes',
            '7. Group problems by themes',
            '8. Prioritize: frequency x severity',
            '9. Report with recommendations',
            '10. Fix issues and retest',
          ],
        },
        {
          type: 'before-after' as const,
          title: 'Test Results Report',
          before: {
            label: 'Bad report',
            description:
              '"Users find it difficult. Everything needs to be redone. The navigation is confusing." No specifics, no priorities, no recommendations.',
          },
          after: {
            label: 'Good report',
            description:
              '"Issue #1 (critical, 4/5 participants): The \'Place Order\' button is not visible without scrolling. Recommendation: pin the button to the bottom of the screen. Expected impact: 15-20% increase in cart conversion."',
          },
        },
        {
          type: 'divider' as const,
        },
        {
          type: 'subheading' as const,
          content: 'Case Study: Usability Testing at Booking.com',
        },
        {
          type: 'case-study' as const,
          title: 'How Booking.com Optimizes the Booking Form',
          company: 'Booking.com',
          problem:
            'Users were abandoning bookings at the data entry stage. Form conversion was 62%, and the funnel was losing 38% of potential customers.',
          solution:
            'The team conducted a series of moderated usability tests with 5 participants from each region. They discovered: (1) the "Guest Name" field was confused with the booker\'s name, (2) the payment block appeared to be the final step even though another screen followed, (3) the cost calculator updated with a delay.',
          result:
            'After three iterations (test → fix → test): form conversion rose to 78% (+16 pp). Completion time decreased by 40%. Support tickets related to bookings dropped by 25%.',
          steps: [
            {
              title: 'Recruitment',
              description:
                'Selected 15 participants (3 rounds of 5) from different countries with varying online booking experience.',
            },
            {
              title: 'Testing',
              description:
                'Task: "Book a hotel in Barcelona for 3 nights for two people." Think-aloud protocol.',
            },
            {
              title: 'Analysis',
              description:
                '12 problems identified. 3 critical, 5 medium, 4 low. Grouped by category.',
            },
            {
              title: 'Iterations',
              description:
                'Each round addressed critical problems. The third round showed 0 critical problems.',
            },
          ],
        },
        {
          type: 'divider' as const,
        },
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=1UCDUOB_aS8',
          title: 'Usability Testing Tips & Tools: Lessons from Steve Krug',
          caption:
            'Steve Krug demonstrates how to conduct usability testing in a single day on a minimal budget.',
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            '**Homework:** Choose any website or app. Write a test scenario with 3 tasks and conduct a mini-test with one friend or colleague using the think-aloud protocol. Record your 3 main findings.',
        },
      ],
      quiz: [
        {
          question:
            'According to Jakob Nielsen\'s rule, how many participants are enough to discover ~85% of usability problems?',
          options: [
            { id: 'a', text: '3 participants' },
            { id: 'b', text: '5 participants' },
            { id: 'c', text: '10 participants' },
            { id: 'd', text: '20 participants' },
          ],
          correctId: 'b',
          explanation:
            'Jakob Nielsen demonstrated that 5 participants uncover ~85% of usability problems. It is better to run several iterations with 5 people than one test with a large group.',
        },
        {
          question: 'What is the think-aloud protocol?',
          options: [
            { id: 'a', text: 'A method where a designer explains their decisions' },
            { id: 'b', text: 'A technique where the participant verbalizes thoughts while performing a task' },
            { id: 'c', text: 'A post-testing survey' },
            { id: 'd', text: 'A group discussion of testing results' },
          ],
          correctId: 'b',
          explanation:
            'Think-aloud is a technique where the participant verbalizes their thoughts, expectations, and difficulties in real time, allowing the researcher to understand not only WHAT the user does but also WHY.',
        },
        {
          question:
            'Which testing format is best suited for deeply understanding user behavior at early product stages?',
          options: [
            { id: 'a', text: 'Unmoderated testing with 50+ participants' },
            { id: 'b', text: 'A/B testing' },
            { id: 'c', text: 'Moderated testing with 5-8 participants' },
            { id: 'd', text: 'Google Analytics data analysis' },
          ],
          correctId: 'c',
          explanation:
            'Moderated testing allows follow-up questions and provides deep qualitative insights. At early stages, understanding "why" matters more than measuring "how many."',
        },
        {
          question:
            'Which task formulation for a usability test is correct?',
          options: [
            {
              id: 'a',
              text: '"Click on the menu, select \'Catalog\', find the \'Shoes\' section"',
            },
            {
              id: 'b',
              text: '"Find and buy running shoes in your size"',
            },
            {
              id: 'c',
              text: '"Rate the homepage design on a scale from 1 to 10"',
            },
            {
              id: 'd',
              text: '"Tell us what you like about this website"',
            },
          ],
          correctId: 'b',
          explanation:
            'A proper task describes a realistic scenario without navigation hints. The participant chooses their own path, and the researcher observes natural behavior.',
        },
      ],
    },

    // =============================================
    // PART 2 — Nielsen Heuristics and Metrics (45 min)
    // =============================================
    {
      id: 'part-2',
      title: 'Nielsen Heuristics and Metrics',
      subtitle: '10 heuristics with examples, SUS, NPS, CSAT, and analytics tools',
      duration: '45 min',
      sections: [
        {
          type: 'heading' as const,
          content: '10 Nielsen Heuristics',
        },
        {
          type: 'text' as const,
          content:
            'In 1994, Jakob Nielsen formulated **10 usability heuristics** — a set of universal principles for evaluating interfaces. Heuristic evaluation is an **expert method**: no users are needed, just 3-5 evaluators with UX expertise.',
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'Heuristic evaluation is **cheap and fast**. 3 experts in 2 hours can find ~75% of usability problems. It is a great starting point but not a replacement for usability testing with real users.',
        },
        {
          type: 'divider' as const,
        },
        // --- Heuristic 1 ---
        {
          type: 'subheading' as const,
          content: '1. Visibility of System Status',
        },
        {
          type: 'text' as const,
          content:
            'The system should always keep users informed about **what is happening** through appropriate feedback within reasonable time.',
        },
        {
          type: 'before-after' as const,
          title: 'Visibility of System Status',
          before: {
            label: 'Bad: no feedback',
            description:
              'The user clicks "Submit Order" — nothing happens for 5 seconds. No spinner, no message. The user clicks again and creates a duplicate order.',
          },
          after: {
            label: 'Good: clear feedback',
            description:
              'After clicking, a spinner appears with the text "Processing your order...", then a green checkmark and "Order #4521 placed!" The button is disabled to prevent repeated clicks.',
          },
        },
        // --- Heuristic 2 ---
        {
          type: 'subheading' as const,
          content: '2. Match Between System and the Real World',
        },
        {
          type: 'text' as const,
          content:
            'The system should speak the **user\'s language** — familiar words, phrases, and concepts. Information should appear in a natural and logical order.',
        },
        {
          type: 'before-after' as const,
          title: 'Interface Language',
          before: {
            label: 'Bad: technical jargon',
            description:
              'Error message: "Error 500: Internal Server Exception. Stack trace: NullPointerException at OrderService.java:142." The user has no idea what to do.',
          },
          after: {
            label: 'Good: human language',
            description:
              'Message: "We couldn\'t place your order. Please try again in a minute. If the problem persists, reach out to us via chat — we\'ll help!" Clear and provides a path forward.',
          },
        },
        // --- Heuristic 3 ---
        {
          type: 'subheading' as const,
          content: '3. User Control and Freedom',
        },
        {
          type: 'text' as const,
          content:
            'Users often take actions **by mistake**. They need a clear "emergency exit" — the ability to undo, go back, or close a dialog without losing data.',
        },
        {
          type: 'before-after' as const,
          title: 'Control and Freedom',
          before: {
            label: 'Bad: no undo option',
            description:
              'Gmail without an "Undo Send" button. The user accidentally sends an email to the wrong person — there is no going back. Stress and panic.',
          },
          after: {
            label: 'Good: undo action',
            description:
              'Gmail with the "Undo Send" feature (30 seconds). The user sees a toast notification with an "Undo" button. Calm and control.',
          },
        },
        // --- Heuristic 4 ---
        {
          type: 'subheading' as const,
          content: '4. Consistency and Standards',
        },
        {
          type: 'text' as const,
          content:
            'Users should not have to wonder whether **different words, actions, or situations** mean the same thing. Follow platform conventions.',
        },
        {
          type: 'before-after' as const,
          title: 'Interface Consistency',
          before: {
            label: 'Bad: inconsistency',
            description:
              'In one section the "Save" button is green, in another it is blue. The menu says "Settings" on one page and "Preferences" on another. A trash icon means "delete" on some pages and "cart" on others.',
          },
          after: {
            label: 'Good: unified style',
            description:
              'All primary actions use blue buttons. Destructive actions use red. "Settings" is consistent everywhere. Shopify\'s Polaris design system ensures uniformity across 50+ screens.',
          },
        },
        // --- Heuristic 5 ---
        {
          type: 'subheading' as const,
          content: '5. Error Prevention',
        },
        {
          type: 'text' as const,
          content:
            'Even better than good error messages is a design that **prevents** errors in the first place. Eliminate error-prone conditions or ask for confirmation before irreversible actions.',
        },
        {
          type: 'before-after' as const,
          title: 'Error Prevention',
          before: {
            label: 'Bad: error-prone design',
            description:
              'The "Delete Account" and "Save Changes" buttons are side by side, the same size. A free-text date field without validation — the user enters "January 32."',
          },
          after: {
            label: 'Good: safeguards against errors',
            description:
              'To delete an account, the user must type "DELETE" and confirm. A date picker replaces the text field. Address autocomplete replaces manual entry.',
          },
        },
        // --- Heuristic 6 ---
        {
          type: 'subheading' as const,
          content: '6. Recognition Rather Than Recall',
        },
        {
          type: 'text' as const,
          content:
            'Minimize the user\'s memory load. **Objects, actions, and options** should be visible. Users should not have to remember information from one screen to the next.',
        },
        {
          type: 'before-after' as const,
          title: 'Recognition vs Recall',
          before: {
            label: 'Bad: requires memorization',
            description:
              'To apply a discount, the user must remember and type the promo code "SPRING2024SALE15OFF." No browsing history for viewed items. No autocomplete in search.',
          },
          after: {
            label: 'Good: everything in plain sight',
            description:
              'The promo code is automatically applied from the banner. "Recently Viewed" items are visible on the homepage. Search suggests results from history and popular queries.',
          },
        },
        // --- Heuristic 7 ---
        {
          type: 'subheading' as const,
          content: '7. Flexibility and Efficiency of Use',
        },
        {
          type: 'text' as const,
          content:
            'The interface should be comfortable for both **beginners** and **experienced** users. Accelerators (keyboard shortcuts, hotkeys) are invisible to novices but speed up expert workflows.',
        },
        {
          type: 'before-after' as const,
          title: 'Flexibility for Different Levels',
          before: {
            label: 'Bad: one path for everyone',
            description:
              'To create a new document in a text editor: File → New → Choose Template → Confirm. 4 clicks every time. No shortcut available.',
          },
          after: {
            label: 'Good: accelerators for experts',
            description:
              'Ctrl+N instantly creates a document. Command Palette (Ctrl+K) for quick access. The menu is still there for beginners. Notion and VS Code are great examples.',
          },
        },
        // --- Heuristic 8 ---
        {
          type: 'subheading' as const,
          content: '8. Aesthetic and Minimalist Design',
        },
        {
          type: 'text' as const,
          content:
            'Every additional piece of information in the interface **competes** with relevant information and reduces its visibility. Interfaces should not contain irrelevant information.',
        },
        {
          type: 'before-after' as const,
          title: 'Interface Minimalism',
          before: {
            label: 'Bad: information overload',
            description:
              'The online store homepage: 15 banners, a scrolling ticker, a popup, a chat widget, 3 promotional popups. The user cannot focus on finding a product.',
          },
          after: {
            label: 'Good: focus on what matters',
            description:
              'Apple.com: one product per screen, ample whitespace, minimal text. Every element earns its place. Search, navigation, and CTA are instantly visible.',
          },
        },
        // --- Heuristic 9 ---
        {
          type: 'subheading' as const,
          content: '9. Help Users Recognize, Diagnose, and Recover from Errors',
        },
        {
          type: 'text' as const,
          content:
            'Error messages should be in **plain language** (no codes), precisely describe the problem, and suggest a **constructive path** to resolution.',
        },
        {
          type: 'before-after' as const,
          title: 'Error Messages',
          before: {
            label: 'Bad: unclear error',
            description:
              '"Error 403." Or: "Invalid data" — but which data exactly? The email field is highlighted red with no explanation of what is wrong.',
          },
          after: {
            label: 'Good: constructive error',
            description:
              '"This email is already registered. Log in or use a different email." Inline validation in real time. Stripe shows "Invalid card number — check the last 4 digits."',
          },
        },
        // --- Heuristic 10 ---
        {
          type: 'subheading' as const,
          content: '10. Help and Documentation',
        },
        {
          type: 'text' as const,
          content:
            'Ideally, the system should be usable without documentation. But if help is needed, it should be **easy to find**, **task-oriented**, and contain concrete steps.',
        },
        {
          type: 'before-after' as const,
          title: 'Help and Documentation',
          before: {
            label: 'Bad: useless help',
            description:
              'An FAQ with 200 questions and no search. Help opens in a new window and loses context. A chatbot responds "I didn\'t understand your question" to any non-standard query.',
          },
          after: {
            label: 'Good: contextual help',
            description:
              'A tooltip with an explanation next to a confusing field. An onboarding tour for new users. A searchable knowledge base with examples. Notion and Slack are excellent examples.',
          },
        },
        {
          type: 'divider' as const,
        },
        {
          type: 'subheading' as const,
          content: 'Quantitative UX Metrics',
        },
        {
          type: 'text' as const,
          content:
            'Heuristics provide a **qualitative** assessment. But decision-making requires **numbers**. Quantitative metrics allow you to measure UX, compare product versions, and track progress.',
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            {
              term: 'SUS (System Usability Scale)',
              definition:
                'A standardized questionnaire with 10 questions. The result is a score from 0 to 100. Average score: 68. Above 80 — excellent UX. Below 50 — serious problems.',
            },
            {
              term: 'Task Completion Rate',
              definition:
                'The percentage of participants who successfully completed the task. 78% and above is good. Below 60% indicates a critical usability problem in that flow.',
            },
            {
              term: 'Error Rate',
              definition:
                'The average number of errors per task. Includes wrong clicks, back-navigations, and input errors. The goal is to minimize it.',
            },
            {
              term: 'Time on Task',
              definition:
                'The time it takes to complete a task. Compared between versions: if time increases after a redesign, something went wrong.',
            },
            {
              term: 'NPS (Net Promoter Score)',
              definition:
                'One question: "How likely are you to recommend the product?" (0-10). Promoters (9-10) minus detractors (0-6) = NPS. Range from -100 to +100.',
            },
            {
              term: 'CSAT (Customer Satisfaction)',
              definition:
                'A direct satisfaction question on a 1-5 scale. Simple but subjective. Works well as a complement to objective metrics.',
            },
          ],
        },
        {
          type: 'callout' as const,
          variant: 'example' as const,
          content:
            '**NPS formula:** % promoters (9-10) - % detractors (0-6). If out of 100 respondents: 40 are promoters, 30 are passives (7-8), and 30 are detractors, then NPS = 40% - 30% = **+10**. A good NPS in SaaS: above +30.',
        },
        {
          type: 'divider' as const,
        },
        {
          type: 'subheading' as const,
          content: 'UX Analytics Tools',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'Google Analytics',
              items: [
                'Behavioral metrics: bounce rate, session duration',
                'Conversion funnels: where users drop off',
                'Segmentation by device, geography, source',
                'Free but complex to set up',
                'Better for "what is happening," weaker for "why"',
              ],
            },
            {
              title: 'Hotjar',
              items: [
                'Click and scroll heatmaps',
                'Session recordings of real users',
                'Surveys and on-site feedback widgets',
                'Funnels and forms with field-level accuracy',
                'Free plan up to 35 sessions/day',
              ],
            },
            {
              title: 'Mixpanel',
              items: [
                'Event-based analytics (event tracking)',
                'Cohort analysis and retention',
                'A/B tests and funnels',
                'Powerful SQL-like filters',
                'Ideal for SaaS and mobile apps',
              ],
            },
          ],
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            '**Combine quantitative and qualitative data.** Google Analytics will show that 70% leave the payment page. Hotjar will show session recordings — where exactly they get stuck. A usability test will show — **why**.',
        },
        {
          type: 'divider' as const,
        },
        {
          type: 'subheading' as const,
          content: 'Case Study: Heuristic Evaluation of a Mobile Bank',
        },
        {
          type: 'case-study' as const,
          title: 'Heuristic Evaluation of Tinkoff Bank',
          company: 'Tinkoff',
          problem:
            'The mobile app was receiving low ratings on the App Store (3.2/5). Users complained about "complexity" and "clutter," but the specific problems were unclear.',
          solution:
            'The team conducted a heuristic evaluation using Nielsen\'s 10 heuristics. 3 experts independently evaluated 15 key screens. Findings included: violation of heuristic #8 (cluttered home screen), #1 (missing transfer status), #5 (ease of accidental transfers).',
          result:
            'After the redesign: the App Store rating rose to 4.6/5. The SUS score increased from 58 to 82. Transfer completion time dropped from 45 to 18 seconds. NPS grew from +12 to +45.',
          steps: [
            {
              title: 'Preparation',
              description:
                '3 UX experts received a list of 15 screens and a table of 10 heuristics.',
            },
            {
              title: 'Independent evaluation',
              description:
                'Each expert reviewed all screens independently, noting violations and their severity (1-4).',
            },
            {
              title: 'Consolidation',
              description:
                'Findings were combined: 47 problems, 8 of them critical. A priority matrix was built.',
            },
            {
              title: 'Redesign',
              description:
                'Critical issues were resolved: simplified the home screen, added statuses, introduced transfer confirmations.',
            },
          ],
        },
        {
          type: 'divider' as const,
        },
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=6Bw0n6Jvwxk',
          title: '10 Usability Heuristics by Jakob Nielsen — NNgroup',
          caption:
            'Official video from Nielsen Norman Group explaining all 10 heuristics with real-world examples.',
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            '**Homework:** Choose any app on your phone. Conduct a mini heuristic evaluation: go through 5 screens and for each one check whether heuristics #1, #4, #5, and #8 are violated. Record 5 findings.',
        },
      ],
      quiz: [
        {
          question: 'Which Nielsen heuristic relates to the principle that "the system should keep users informed about what is happening"?',
          options: [
            { id: 'a', text: 'Consistency and Standards' },
            { id: 'b', text: 'Visibility of System Status' },
            { id: 'c', text: 'Error Prevention' },
            { id: 'd', text: 'Minimalist Design' },
          ],
          correctId: 'b',
          explanation:
            'Heuristic #1 "Visibility of System Status" states: the system should always keep users informed about the current state through timely feedback.',
        },
        {
          question: 'What is considered a good SUS (System Usability Scale) score?',
          options: [
            { id: 'a', text: 'Above 50' },
            { id: 'b', text: 'Above 68' },
            { id: 'c', text: 'Above 80' },
            { id: 'd', text: 'Exactly 100' },
          ],
          correctId: 'c',
          explanation:
            'The average SUS score is 68. A score above 80 is considered excellent (grade A). Below 50 indicates serious usability problems.',
        },
        {
          question: 'How is NPS (Net Promoter Score) calculated?',
          options: [
            { id: 'a', text: 'Average of all ratings from 0 to 10' },
            { id: 'b', text: '% promoters (9-10) minus % detractors (0-6)' },
            { id: 'c', text: 'Number of positive reviews divided by total' },
            { id: 'd', text: 'Sum of ratings 7-10 divided by number of responses' },
          ],
          correctId: 'b',
          explanation:
            'NPS = % promoters (ratings 9-10) - % detractors (ratings 0-6). Passives (7-8) are not included in the calculation. The result ranges from -100 to +100.',
        },
        {
          question: 'Which tool is best suited for viewing click heatmaps and session recordings?',
          options: [
            { id: 'a', text: 'Google Analytics' },
            { id: 'b', text: 'Mixpanel' },
            { id: 'c', text: 'Hotjar' },
            { id: 'd', text: 'Maze' },
          ],
          correctId: 'c',
          explanation:
            'Hotjar specializes in visual analytics: heatmaps, session recordings, and scroll maps. Google Analytics is stronger in quantitative analytics, while Mixpanel excels at event-based analytics.',
        },
      ],
    },
  ],
}
