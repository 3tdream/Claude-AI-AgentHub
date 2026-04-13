import type { Meeting } from '../../types'

export const meeting11: Meeting = {
  id: '11',
  number: 11,
  title: 'Handoff and Iterations',
  description:
    'Delivering designs to developers without loss and iteratively improving the product through A/B testing and data.',
  icon: 'ArrowLeftRight',
  color: 'bg-sky-500/10 text-sky-600',
  parts: [
    // ═══════════════════════════════════════
    // Part 1 — Handoff to Developer
    // ═══════════════════════════════════════
    {
      id: 'part-1',
      title: 'Handoff to Developer',
      subtitle: 'How to deliver designs without loss: specifications, tools, and communication with the development team',
      duration: '45 min',
      sections: [
        // --- Introduction ---
        {
          type: 'heading' as const,
          content: 'What Is Design Handoff?',
        },
        {
          type: 'text' as const,
          content:
            'Design Handoff is the process in which a designer delivers a finished mockup to a developer with **complete documentation**: dimensions, spacing, colors, fonts, animations, and component states. It is the **bridge** between the world of pixels and the world of code.',
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'The quality of handoff determines how closely the final product matches the design. Poor handoff is the primary reason behind the phrase "that\'s not what I designed."',
        },
        {
          type: 'quote' as const,
          text: 'Design is not the final mockup. Design is what the user ultimately sees in the browser.',
          author: 'Brad Frost',
          role: 'Author of Atomic Design',
        },

        { type: 'divider' as const },

        // --- Why handoff breaks ---
        {
          type: 'heading' as const,
          content: 'Why Does Handoff Break?',
        },
        {
          type: 'text' as const,
          content:
            'According to statistics, **60% of design decisions** are lost during the handoff to development. The reasons: incomplete specifications, undocumented states, different "languages" between designers and developers, and the absence of a single source of truth.',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'Designer Issues',
              items: [
                'Did not specify all states (hover, focus, error)',
                'Forgot about responsiveness',
                'Colors not from the token system',
                'No animation documentation',
              ],
            },
            {
              title: 'Developer Issues',
              items: [
                'Interprets the mockup "by eye"',
                'Doesn\'t ask when something is unclear',
                'Uses different fonts/spacing',
                'Ignores edge cases',
              ],
            },
          ],
        },

        { type: 'divider' as const },

        // --- Figma Dev Mode ---
        {
          type: 'heading' as const,
          content: 'Figma Dev Mode: A Tool for Handoff',
        },
        {
          type: 'text' as const,
          content:
            'In 2023, Figma launched **Dev Mode** — a special mode for developers. It allows viewing CSS code for components, copying design system tokens, measuring spacing, and browsing assets — all **without the designer\'s involvement**.',
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            {
              term: 'Dev Mode',
              definition: 'A Figma mode for developers: automatic generation of CSS, Swift, and Android code from mockups.',
            },
            {
              term: 'Inspect Panel',
              definition: 'An element properties panel: dimensions, colors, fonts, spacing in pixels and rem.',
            },
            {
              term: 'Code Snippets',
              definition: 'Ready-made code fragments (CSS, iOS, Android) generated from component properties.',
            },
            {
              term: 'Ready for Dev',
              definition: 'A label that the designer places on a frame when it is ready for handoff.',
            },
          ],
        },
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=FaLJL-K7JJk',
          title: 'Figma Dev Mode — Full Overview',
          caption: 'Official Dev Mode guide from Figma.',
        },

        { type: 'divider' as const },

        // --- Design Specs ---
        {
          type: 'heading' as const,
          content: 'Design Specs: What to Include in Documentation',
        },
        {
          type: 'text' as const,
          content:
            'A good handoff document is a **blueprint** from which a developer can recreate the interface without questions. It includes all parameters: from spacing to micro-animations.',
        },
        {
          type: 'checklist' as const,
          title: 'Handoff Preparation Checklist',
          items: [
            'All colors are set through design system tokens (no hardcoding)',
            'All typographic styles are specified (font-family, size, weight, line-height)',
            'Spacing is documented (padding, margin, gap) in px or rem',
            'All states are documented: default, hover, active, focus, disabled, error, loading',
            'Animations and transitions are described (easing, duration)',
            'Icons are exported in SVG (outline + filled)',
            'Images are prepared in 1x, 2x, WebP',
            'Breakpoints for responsiveness are specified (mobile, tablet, desktop)',
            'Show/hide logic for elements at different resolutions is described',
            'Annotations are added for complex interactions',
            'Components are organized by Atomic Design (atoms \u2192 molecules \u2192 organisms)',
            'Each frame is marked as "Ready for Dev"',
          ],
        },

        { type: 'divider' as const },

        // --- Before/After: bad vs good handoff ---
        {
          type: 'heading' as const,
          content: 'Example: Bad vs Good Handoff',
        },
        {
          type: 'text' as const,
          content:
            'Let\'s compare two approaches to handing off the same screen — a registration form. One designer just dropped a Figma link, while another prepared full documentation.',
        },
        {
          type: 'before-after' as const,
          title: 'Registration Form Handoff',
          before: {
            label: 'Bad Handoff',
            description:
              'A mockup screenshot in Slack. No specifications. Colors are #hex without tokens. Error states not specified. Font — "pick something similar." Responsiveness — "do it the usual way." Result: 3 rounds of revisions, 2-week delay.',
          },
          after: {
            label: 'Good Handoff',
            description:
              'Figma with Dev Mode. All colors via tokens ($color-primary-500). 6 states for each field are documented. Responsive layouts for 320px, 768px, 1440px. Validation annotations. Error animation: shake 300ms ease-out. Result: 1 iteration, delivered on time.',
          },
        },
        {
          type: 'before-after' as const,
          title: 'Button Specification',
          before: {
            label: 'Bad Spec',
            description:
              'Button: blue, with white text, rounded. No dimensions, no padding, no hover state, no disabled, no focus ring. The developer guesses from pixels.',
          },
          after: {
            label: 'Good Spec',
            description:
              'Button/Primary: bg $blue-600, text $white, font-weight 600, font-size 16px, line-height 24px, padding 12px 24px, border-radius 8px, hover: bg $blue-700, active: bg $blue-800, focus: ring 2px $blue-300, disabled: opacity 0.5 cursor not-allowed, transition all 150ms ease.',
          },
        },

        { type: 'divider' as const },

        // --- Asset Export ---
        {
          type: 'heading' as const,
          content: 'Asset Export: Icons, Images, Fonts',
        },
        {
          type: 'text' as const,
          content:
            'Proper asset export is an art in itself. Icons are exported in **SVG** (so color and size can be changed in code). Images go in **WebP** with a PNG fallback. Fonts are loaded via **Google Fonts** or self-hosted woff2.',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'Icons (SVG)',
              items: [
                'Outline and Filled variants',
                'Unified viewBox (24x24 or 20x20)',
                'Remove unnecessary groups and attributes',
                'currentColor for fill',
              ],
            },
            {
              title: 'Images',
              items: [
                'WebP as the primary format',
                'PNG fallback for older browsers',
                '1x and 2x (@2x for Retina)',
                'Maximum width: 1920px',
              ],
            },
            {
              title: 'Fonts',
              items: [
                'woff2 format (maximum compression)',
                'Only required weights (400, 500, 600, 700)',
                'Character subset (latin + cyrillic)',
                'font-display: swap',
              ],
            },
          ],
        },

        { type: 'divider' as const },

        // --- Responsive annotations ---
        {
          type: 'heading' as const,
          content: 'Responsive Annotations',
        },
        {
          type: 'text' as const,
          content:
            'A mockup without responsive annotations is only half the job. The designer must show **exactly how** the interface rearranges on different screens: what hides, what wraps, what resizes.',
        },
        {
          type: 'diagram' as const,
          title: 'Breakpoints and Element Behavior',
          description: 'Standard breakpoints and typical adaptation rules for each.',
          items: [
            '320px (Mobile S) \u2192 1 column, navigation in hamburger menu, large tap targets (44px min)',
            '375px (Mobile M) \u2192 Base mobile layout, stacked elements, horizontal scroll for cards',
            '768px (Tablet) \u2192 2 columns, sidebar appears, font sizes +2px',
            '1024px (Laptop) \u2192 3 columns, full navigation, hover effects active',
            '1440px (Desktop) \u2192 Max-width container, side margins grow, 4-column grids',
          ],
        },
        {
          type: 'callout' as const,
          variant: 'example' as const,
          content:
            'Product card annotation: **Mobile** \u2014 full width, image on top. **Tablet** \u2014 2 in a row, image on the left. **Desktop** \u2014 3\u20134 in a row, scale hover effect.',
        },

        { type: 'divider' as const },

        // --- Code generation ---
        {
          type: 'heading' as const,
          content: 'Code Generation: From Figma to CSS/HTML',
        },
        {
          type: 'text' as const,
          content:
            'Modern tools allow generating code directly from designs. Figma Dev Mode generates **CSS**, plugins like **Anima** and **Locofy** create React components. However, auto-generated code is a **starting point**, not the final code.',
        },
        {
          type: 'callout' as const,
          variant: 'warning' as const,
          content:
            'Never use auto-generated code in production without refactoring. It contains absolute positions, hardcoded values, and does not account for HTML semantics.',
        },
        {
          type: 'comparison' as const,
          title: 'Generated vs Production Code',
          items: [
            {
              label: 'Positioning',
              ux: 'position: absolute; top: 156px; left: 24px',
              ui: 'display: flex; gap: 1rem; padding: 1.5rem',
            },
            {
              label: 'Colors',
              ux: 'color: #3B82F6',
              ui: 'color: var(--color-primary-500)',
            },
            {
              label: 'Fonts',
              ux: 'font-size: 16px; font-weight: 600',
              ui: 'font-size: var(--text-base); font-weight: var(--font-semibold)',
            },
            {
              label: 'Responsiveness',
              ux: 'width: 375px (fixed)',
              ui: 'width: 100%; max-width: 24rem; @media (min-width: 768px)',
            },
          ],
        },
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=B242nuM3y2s',
          title: 'Figma to Code \u2014 The Right Way',
          caption: 'How to turn designs into production code without losing quality.',
        },

        { type: 'divider' as const },

        // --- Communication ---
        {
          type: 'heading' as const,
          content: 'Designer \u2194 Developer Communication',
        },
        {
          type: 'text' as const,
          content:
            'Handoff is not a one-time event but a **continuous dialogue**. The best teams hold joint reviews, paired "designer + developer" sessions, and regular syncs on implementation.',
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            {
              term: 'Design Review',
              definition: 'A meeting where the designer presents mockups to the development team BEFORE implementation begins.',
            },
            {
              term: 'Pair Design-Dev',
              definition: 'Joint work between a designer and developer on a complex component in real time.',
            },
            {
              term: 'Design QA',
              definition: 'A designer\'s review of implementation: do the spacing, colors, and animations match the mockup.',
            },
            {
              term: 'Design Tokens',
              definition: 'A shared language of variables (colors, fonts, spacing) understood by both Figma and code.',
            },
          ],
        },

        { type: 'divider' as const },

        // --- Common mistakes ---
        {
          type: 'heading' as const,
          content: 'Top 10 Handoff Mistakes',
        },
        {
          type: 'text' as const,
          content:
            'These mistakes occur in **90% of teams**, especially in the early stages of designer-developer collaboration.',
        },
        {
          type: 'checklist' as const,
          title: 'What to Check Before Handoff',
          items: [
            'Don\'t forget empty states \u2014 what the user sees when there is no data',
            'Document loading states (skeleton/spinner) for each block',
            'Specify maximum text length and overflow behavior (truncate/wrap)',
            'Describe behavior on slow connections (optimistic UI, retry)',
            'Don\'t forget dark mode if it\'s on the roadmap',
            'Specify z-index strategy for modals and tooltips',
            'Describe keyboard shortcuts and tab order (accessibility)',
            'Document animations with specific parameters (not just "appears smoothly")',
            'Specify which data comes from the server and which is static',
            'Attach a link to the current version of the design system',
          ],
        },

        { type: 'divider' as const },

        // --- Handoff tools ---
        {
          type: 'heading' as const,
          content: 'Handoff Tools',
        },
        {
          type: 'text' as const,
          content:
            'The market for design handoff tools is actively growing. Here are the main players and their strengths.',
        },
        {
          type: 'comparison' as const,
          title: 'Handoff Tools Comparison',
          items: [
            {
              label: 'Figma Dev Mode',
              ux: 'Built into Figma, auto-generates CSS, tokens, Ready for Dev labels',
              ui: 'Paid ($), does not generate React components out of the box',
            },
            {
              label: 'Zeplin',
              ux: 'Automatic specifications, style guide, Sketch/Figma/XD support',
              ui: 'Separate tool, requires export from Figma',
            },
            {
              label: 'Storybook',
              ux: 'Living component documentation in code, state testing',
              ui: 'Requires developer setup, does not replace Figma',
            },
            {
              label: 'Anima / Locofy',
              ux: 'React/HTML code generation from Figma, animation export',
              ui: 'Code requires refactoring, not for complex projects',
            },
          ],
        },
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=pLBbkWWsLaY',
          title: 'Design Handoff Best Practices',
          caption: 'Best practices for delivering designs from designers to developers.',
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            '**The golden rule of handoff**: if a developer asks a question that could have been anticipated \u2014 it means the handoff was incomplete. Every such question should be added to your checklist.',
        },

        { type: 'divider' as const },

        // --- Summary ---
        {
          type: 'heading' as const,
          content: 'Summary: 5 Principles of the Perfect Handoff',
        },
        {
          type: 'diagram' as const,
          title: 'Design Handoff Principles',
          description: 'Five pillars on which effective design handoff is built.',
          items: [
            '1. Completeness \u2014 all states, breakpoints, and animations are documented',
            '2. Tokens \u2014 colors, fonts, and spacing are set through design system variables',
            '3. Context \u2014 annotations explain "why," not just "what"',
            '4. Dialogue \u2014 regular syncs between designer and developer',
            '5. Iteration \u2014 handoff improves from project to project based on retrospectives',
          ],
        },
      ],
      quiz: [
        {
          question: 'What is Design Handoff?',
          options: [
            { id: 'a', text: 'Delivering a design for print' },
            { id: 'b', text: 'The process of transferring mockups and specifications from a designer to a developer' },
            { id: 'c', text: 'Deleting old mockups from Figma' },
            { id: 'd', text: 'A final design presentation to the client' },
          ],
          correctId: 'b',
          explanation:
            'Design Handoff is the process of transferring finished mockups with complete documentation (spacing, colors, states, animations) from a designer to the development team.',
        },
        {
          question: 'What does the "Ready for Dev" label mean in Figma?',
          options: [
            { id: 'a', text: 'The frame is ready for print' },
            { id: 'b', text: 'The frame needs to be deleted' },
            { id: 'c', text: 'The designer has marked the frame as ready for handoff to the developer' },
            { id: 'd', text: 'The developer has already implemented this screen' },
          ],
          correctId: 'c',
          explanation:
            '"Ready for Dev" is a label in Figma Dev Mode that the designer sets when the mockup is fully ready for implementation: all states, tokens, and annotations are in place.',
        },
        {
          question: 'Why can\'t auto-generated code from Figma be used in production?',
          options: [
            { id: 'a', text: 'It contains viruses' },
            { id: 'b', text: 'Figma only generates code in Python' },
            { id: 'c', text: 'It contains absolute positions, hardcoded values, and does not account for HTML semantics' },
            { id: 'd', text: 'Auto-generated code is paid' },
          ],
          correctId: 'c',
          explanation:
            'Auto-generated code uses absolute positions instead of flexbox/grid, hardcoded values instead of variables, and does not follow HTML semantics. It works as a starting point but requires refactoring.',
        },
        {
          question: 'Which format is best for exporting icons?',
          options: [
            { id: 'a', text: 'PNG 72dpi' },
            { id: 'b', text: 'High-quality JPEG' },
            { id: 'c', text: 'SVG with currentColor' },
            { id: 'd', text: 'GIF with transparency' },
          ],
          correctId: 'c',
          explanation:
            'SVG is a vector format that scales without quality loss. Using currentColor for fill allows changing the icon color via CSS, which is critical for design systems.',
        },
      ],
    },

    // ═══════════════════════════════════════
    // Part 2 — A/B Testing and Iterations
    // ═══════════════════════════════════════
    {
      id: 'part-2',
      title: 'A/B Testing and Iterations',
      subtitle: 'How to make data-driven decisions: A/B testing, hypotheses, and continuous UX improvement',
      duration: '45 min',
      sections: [
        // --- Introduction ---
        {
          type: 'heading' as const,
          content: 'Why Test Designs?',
        },
        {
          type: 'text' as const,
          content:
            'Even the best designer cannot predict user behavior 100% of the time. **A/B testing** is a scientific method that replaces "I think" arguments with precise "here are the numbers" data. Every design decision can be validated on real users.',
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'Companies like Google, Amazon, and Netflix run **thousands** of A/B tests simultaneously. Every button, every headline, every color is validated by data.',
        },
        {
          type: 'quote' as const,
          text: 'If you can\'t measure it, you can\'t improve it.',
          author: 'Peter Drucker',
          role: 'Management Theorist',
        },

        { type: 'divider' as const },

        // --- A/B testing fundamentals ---
        {
          type: 'heading' as const,
          content: 'A/B Testing Fundamentals',
        },
        {
          type: 'text' as const,
          content:
            'An A/B test (split test) is an experiment in which **two versions** of the same element are shown to different groups of users simultaneously. Group A sees the current version (control), Group B sees the new one (variant). By comparing metrics, we determine which version performs better.',
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            {
              term: 'Control Group (A)',
              definition: 'Users who see the current (original) version of the interface.',
            },
            {
              term: 'Variant (B)',
              definition: 'Users who see the modified version with the hypothesis being tested.',
            },
            {
              term: 'Conversion',
              definition: 'The target action being measured: click, purchase, sign-up, time on page.',
            },
            {
              term: 'Statistical Significance',
              definition: 'Confidence (usually 95%) that the difference between A and B is not due to chance.',
            },
            {
              term: 'Sample Size',
              definition: 'The minimum number of users in each group needed to obtain reliable results.',
            },
          ],
        },
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=XDoSR2mGMkE',
          title: 'A/B Testing Explained in 5 Minutes',
          caption: 'A quick and clear explanation of A/B testing principles.',
        },

        { type: 'divider' as const },

        // --- Process diagram ---
        {
          type: 'heading' as const,
          content: 'The A/B Testing Process',
        },
        {
          type: 'text' as const,
          content:
            'A/B testing is not just "let\'s change the button color." It is a **structured process** with clear stages, from hypothesis formulation to results analysis.',
        },
        {
          type: 'diagram' as const,
          title: 'Full A/B Test Cycle',
          description: 'Steps from idea to deploying the winning variant.',
          items: [
            '1. Data analysis \u2192 Identify the problem (high bounce rate, low conversion)',
            '2. Hypothesis \u2192 "If we change X, metric Y will increase by Z%, because..."',
            '3. Variant design \u2192 Create version B with one change (only one!)',
            '4. Sample size calculation \u2192 Determine how many users are needed for significant results',
            '5. Launch the test \u2192 Randomized 50/50 traffic split',
            '6. Data collection \u2192 Wait at least 1\u20132 full business cycles (usually 1\u20134 weeks)',
            '7. Results analysis \u2192 Statistical significance \u2265 95%?',
            '8. Decision \u2192 Deploy the winner or launch the next iteration',
          ],
        },
        {
          type: 'user-flow' as const,
          title: 'A/B Test Decision Tree',
          steps: [
            { id: 'start', label: 'Hypothesis formulated', type: 'start' as const },
            { id: 'design', label: 'Design variant B', type: 'action' as const },
            { id: 'launch', label: 'Launch test', type: 'action' as const },
            { id: 'check', label: 'Enough data?', type: 'decision' as const },
            { id: 'wait', label: 'Continue collecting', type: 'action' as const },
            { id: 'analyze', label: 'Significant difference?', type: 'decision' as const },
            { id: 'deploy', label: 'Deploy variant B', type: 'end' as const },
            { id: 'keep', label: 'Keep variant A', type: 'end' as const },
          ],
          connections: [
            { from: 'start', to: 'design' },
            { from: 'design', to: 'launch' },
            { from: 'launch', to: 'check' },
            { from: 'check', to: 'wait', label: 'No' },
            { from: 'wait', to: 'check' },
            { from: 'check', to: 'analyze', label: 'Yes' },
            { from: 'analyze', to: 'deploy', label: 'Yes, B is better' },
            { from: 'analyze', to: 'keep', label: 'No difference' },
          ],
        },

        { type: 'divider' as const },

        // --- Hypothesis formulation ---
        {
          type: 'heading' as const,
          content: 'How to Formulate a Hypothesis',
        },
        {
          type: 'text' as const,
          content:
            'A good hypothesis is the foundation of a successful test. It must be **specific**, **measurable**, and include a **rationale**. Formula: "We believe that [change] will lead to [result], because [rationale]."',
        },
        {
          type: 'before-after' as const,
          title: 'Hypothesis Formulation',
          before: {
            label: 'Bad Hypothesis',
            description:
              '"Let\'s make the button green, maybe conversion will go up." No rationale, no specific metric, no expected result.',
          },
          after: {
            label: 'Good Hypothesis',
            description:
              '"We believe that changing the CTA button from gray to green will increase CTR by 15%, because green is associated with action, and the current gray button blends with the background (per heatmap \u2014 70% of users don\'t notice the CTA)."',
          },
        },
        {
          type: 'callout' as const,
          variant: 'example' as const,
          content:
            '**Hypothesis template:**\n"If we [change], then [metric] will change by [number]%, because [observation/data]."\nExample: "If we reduce the registration form from 7 to 3 fields, then the completion rate will increase by 25%, because analytics show 60% of users abandon the form at the 4th field."',
        },

        { type: 'divider' as const },

        // --- Sample size and significance ---
        {
          type: 'heading' as const,
          content: 'Sample Size and Statistical Significance',
        },
        {
          type: 'text' as const,
          content:
            'One of the biggest mistakes is stopping a test **too early**. If you have 50 users in each group, the result may be random. For reliable conclusions, you need a **sufficient volume of data**.',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'Key Parameters',
              items: [
                'Confidence Level \u2014 usually 95% (p-value < 0.05)',
                'Statistical Power \u2014 usually 80%',
                'MDE (Minimum Detectable Effect) \u2014 the smallest difference you want to detect',
                'Baseline Conversion Rate \u2014 the current conversion of the control version',
              ],
            },
            {
              title: 'Launch Rules',
              items: [
                'Calculate the sample size BEFORE launching the test',
                'Do not stop the test before the calculated deadline',
                'Test full business cycles (including weekends)',
                'Account for seasonality and external events',
              ],
            },
          ],
        },
        {
          type: 'callout' as const,
          variant: 'warning' as const,
          content:
            '**Beginner\'s mistake:** stopping the test on day 3 because "variant B is already leading by 30%." Early results are misleading! Wait for the calculated sample size.',
        },

        { type: 'divider' as const },

        // --- Tools ---
        {
          type: 'heading' as const,
          content: 'A/B Testing Tools',
        },
        {
          type: 'text' as const,
          content:
            'There are many tools \u2014 from free to enterprise-level. The choice depends on traffic volume, budget, and technical stack.',
        },
        {
          type: 'comparison' as const,
          title: 'A/B Testing Tools Comparison',
          items: [
            {
              label: 'Google Optimize (shut down in 2023)',
              ux: 'Was free, GA integration, visual editor',
              ui: 'Shut down. Alternative: Google A/B Testing in GA4 + Optimizely',
            },
            {
              label: 'Optimizely',
              ux: 'Enterprise-class, powerful statistics, feature flags, server-side tests',
              ui: 'Expensive ($$$), complex setup, overkill for small projects',
            },
            {
              label: 'VWO (Visual Website Optimizer)',
              ux: 'Visual editor, heatmaps, session recordings, A/B + multivariate',
              ui: 'Mid-range price, can slow down the page with client-side variant',
            },
            {
              label: 'PostHog',
              ux: 'Open-source, feature flags, A/B tests, analytics in one tool',
              ui: 'Requires self-hosting or a paid cloud plan',
            },
          ],
        },
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=hkLJDYNMbeE',
          title: 'How Booking.com Uses A/B Testing',
          caption: 'How Booking.com became a master of A/B testing and experimentation.',
        },

        { type: 'divider' as const },

        // --- Multivariate testing ---
        {
          type: 'heading' as const,
          content: 'Multivariate Testing (MVT)',
        },
        {
          type: 'text' as const,
          content:
            'A multivariate test is an extension of A/B testing where we test **multiple variables simultaneously**. For example, headline (2 variants) \u00d7 button (3 colors) \u00d7 image (2 variants) = **12 combinations**.',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'When to Use A/B',
              items: [
                'One specific change',
                'Low traffic',
                'Fast results needed',
                'A clear single hypothesis',
              ],
            },
            {
              title: 'When to Use MVT',
              items: [
                'Multiple elements may affect the metric',
                'High traffic (>100K visitors/month)',
                'You want to find the best combination',
                'Willing to wait longer for results',
              ],
            },
          ],
        },
        {
          type: 'callout' as const,
          variant: 'warning' as const,
          content:
            'MVT requires **significantly more traffic** than an A/B test. With 12 combinations, you need roughly 6 times more users than for a simple A/B test.',
        },

        { type: 'divider' as const },

        // --- Case Study ---
        {
          type: 'heading' as const,
          content: 'Case Study: A/B Tests of Great Companies',
        },
        {
          type: 'case-study' as const,
          title: 'Google: 41 Shades of Blue',
          company: 'Google',
          problem:
            'The team couldn\'t decide which shade of blue to use for search result links. Designers were debating between several options.',
          solution:
            'They launched an A/B test with 41 shades of blue for links. Each shade was shown to a random user group. They measured CTR (Click-Through Rate) for each variant.',
          result:
            'The winning shade of blue generated an additional **$200 million** in annual revenue for Google. One color \u2014 $200M difference.',
          steps: [
            { title: 'Problem', description: 'Designers couldn\'t agree on the link color, opinions were divided.' },
            { title: 'Test', description: '41 blue variants, randomized at 1% traffic each.' },
            { title: 'Metric', description: 'CTR (Click-Through Rate) \u2014 percentage of link clicks.' },
            { title: 'Result', description: 'Optimal shade: #1a0dab. +$200M annual revenue.' },
          ],
        },
        {
          type: 'case-study' as const,
          title: 'Booking.com: The "Book Now" Button',
          company: 'Booking.com',
          problem:
            'The booking page conversion was below expectations. Users were browsing hotels but not completing their bookings.',
          solution:
            'They ran a series of A/B tests: changed the CTA text from "Check Availability" to "Book Now," added urgency elements ("Only 2 rooms left!", "12 people are viewing right now"), and changed the button color to a contrasting one.',
          result:
            'The combination of urgency elements and the new CTA increased booking conversion by **25\u201330%**. Booking.com runs over 25,000 A/B tests per year.',
          steps: [
            { title: 'Analysis', description: 'Heatmaps showed that users weren\'t noticing the CTA.' },
            { title: 'Hypothesis', description: 'A more prominent button + urgency will increase conversion.' },
            { title: 'Iterations', description: '12+ tests over 3 months, each based on the results of the previous one.' },
            { title: 'Result', description: '+25\u201330% bookings. Booking runs 25K+ tests/year.' },
          ],
        },

        { type: 'divider' as const },

        // --- Data-driven decisions ---
        {
          type: 'heading' as const,
          content: 'Data-Driven Design: Making Decisions Based on Data',
        },
        {
          type: 'text' as const,
          content:
            'Data-Driven Design is an approach where **every design decision** is backed by data: analytics, research, and test results. It doesn\'t mean "only do what the numbers say," but it means "validate intuition with data."',
        },
        {
          type: 'diagram' as const,
          title: 'Decision-Making Pyramid',
          description: 'From intuition to data: the evolution of design decision-making.',
          items: [
            'Level 1 (Intuition): "I think this is better" \u2014 subjective, no evidence',
            'Level 2 (Expertise): "Based on experience and Nielsen\'s heuristics..." \u2014 knowledge-based, but unverified',
            'Level 3 (Qualitative Data): "Usability tests showed..." \u2014 real users, small sample',
            'Level 4 (Quantitative Data): "An A/B test on 50K users showed +12%" \u2014 statistically significant',
            'Level 5 (ML/AI): "The algorithm personalizes the interface for each user" \u2014 automatic optimization',
          ],
        },

        { type: 'divider' as const },

        // --- Iteration cycles ---
        {
          type: 'heading' as const,
          content: 'Iteration Cycles: Continuous Improvement',
        },
        {
          type: 'text' as const,
          content:
            'Iteration is an **improvement cycle** in which each version of the product becomes better than the previous one based on feedback and data. The best products are the result of **dozens of iterations**, not a single "perfect" design.',
        },
        {
          type: 'diagram' as const,
          title: 'Iterative Design Cycle',
          description: 'A continuous process: design \u2192 development \u2192 launch \u2192 measurement \u2192 analysis \u2192 design.',
          items: [
            'Design \u2192 Create or improve the interface based on a hypothesis',
            'Development \u2192 Implement the changes (handoff from part one!)',
            'Launch \u2192 Roll out to some or all users',
            'Measurement \u2192 Collect quantitative data (metrics, analytics)',
            'Analysis \u2192 Compare with baseline, formulate insights',
            'Decision \u2192 Deploy, roll back, or start a new cycle',
          ],
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            '**The 1-week sprint rule:** one iteration = one week. Monday \u2014 data analysis, Tuesday\u2013Wednesday \u2014 design, Thursday \u2014 handoff, Friday \u2014 review. Rhythm matters more than a perfect result.',
        },

        { type: 'divider' as const },

        // --- Measuring UX ---
        {
          type: 'heading' as const,
          content: 'How to Measure UX Improvement',
        },
        {
          type: 'text' as const,
          content:
            'UX cannot be improved if it cannot be **measured**. Here are the key metrics that will show whether the interface improved after a redesign.',
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            {
              term: 'Task Success Rate',
              definition: 'The percentage of users who successfully completed a task (e.g., placed an order).',
            },
            {
              term: 'Time on Task',
              definition: 'Average time to complete a task. Less = better (for routine tasks).',
            },
            {
              term: 'Error Rate',
              definition: 'Frequency of user errors. A decrease = an interface improvement.',
            },
            {
              term: 'SUS (System Usability Scale)',
              definition: 'A standardized 10-question questionnaire. Scores from 0 to 100. Above 68 = above average.',
            },
            {
              term: 'NPS (Net Promoter Score)',
              definition: 'Willingness to recommend the product (from -100 to +100). Simple yet effective.',
            },
            {
              term: 'CSAT (Customer Satisfaction)',
              definition: 'Satisfaction on a 5-point scale after a specific interaction.',
            },
          ],
        },

        { type: 'divider' as const },

        // --- Before/After iterations ---
        {
          type: 'heading' as const,
          content: 'Before and After: Iterative Redesign Examples',
        },
        {
          type: 'before-after' as const,
          title: 'Online Store Checkout Page',
          before: {
            label: 'Before iterations (v1)',
            description:
              'One long form with 12 fields. Bounce rate 68%. Average conversion 2.1%. Users complain: "Too many fields," "Not clear where I am in the process."',
          },
          after: {
            label: 'After 5 iterations (v6)',
            description:
              'Multi-step form (3 steps with 3\u20134 fields each). Progress bar at the top. Address autofill. Bounce rate 41% (-27%). Conversion 3.8% (+81%). Time on task: from 4.2 min to 1.8 min.',
          },
        },
        {
          type: 'before-after' as const,
          title: 'Mobile App Navigation',
          before: {
            label: 'Before (hamburger menu)',
            description:
              'All navigation hidden in a hamburger menu. Only 27% of users opened the menu. Engagement with sections other than home \u2014 12%.',
          },
          after: {
            label: 'After (tab bar)',
            description:
              'Bottom tab bar with 5 key sections. Engagement rose to 64% (+433%). Session time increased from 2.1 to 4.7 min. Retention +18%.',
          },
        },

        { type: 'divider' as const },

        // --- Continuous improvement ---
        {
          type: 'heading' as const,
          content: 'A Culture of Continuous Improvement',
        },
        {
          type: 'text' as const,
          content:
            'Iterative design is not just a method, it is a **team culture**. The best product teams embed experiments into every sprint and are not afraid to fail.',
        },
        {
          type: 'checklist' as const,
          title: 'Experiment Culture Checklist',
          items: [
            'Each sprint contains at least 1 experiment (A/B test or usability test)',
            'Test results are documented and accessible to the entire team',
            'Failed tests are valued as much as successful ones (it is still knowledge)',
            'Design decisions are justified with data during reviews',
            'There is a dashboard with key UX metrics (SUS, Task Success, Error Rate)',
            'Regular retrospectives: what did we learn this sprint?',
            'The experiment backlog is prioritized by potential impact',
            'Feature flags allow quick enabling/disabling of changes',
          ],
        },

        { type: 'divider' as const },

        // --- Analytics tools ---
        {
          type: 'heading' as const,
          content: 'Tools for Measurement and Analytics',
        },
        {
          type: 'text' as const,
          content:
            'For a full data-driven approach, you need an **analytics tool stack**: from basic web analytics to session recordings.',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'Quantitative',
              items: [
                'Google Analytics 4 \u2014 traffic, conversions, funnels',
                'Mixpanel \u2014 event analytics, cohorts',
                'Amplitude \u2014 product analytics, retention',
                'PostHog \u2014 open-source analytics + A/B tests',
              ],
            },
            {
              title: 'Qualitative',
              items: [
                'Hotjar \u2014 heatmaps, session recordings, surveys',
                'FullStory \u2014 session recordings, frustration signals',
                'Maze \u2014 usability testing on prototypes',
                'UserTesting \u2014 video interviews with real users',
              ],
            },
          ],
        },
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=DREuiYPOB5k',
          title: 'How to Measure UX \u2014 Key Metrics',
          caption: 'Key metrics for measuring user experience quality.',
        },

        { type: 'divider' as const },

        // --- Summary ---
        {
          type: 'heading' as const,
          content: 'Summary: From Intuition to Data',
        },
        {
          type: 'text' as const,
          content:
            'A/B testing and the iterative approach are the **superpowers** of a modern designer. They turn subjective opinions into objective decisions and enable building products that are **proven** to work better.',
        },
        {
          type: 'diagram' as const,
          title: 'Key Takeaways',
          description: 'What to remember from today\'s lesson on A/B testing and iterations.',
          items: [
            'A/B testing is a scientific method for validating design hypotheses on real users',
            'A hypothesis must be specific: what we change, which metric we expect, and why',
            'Do not stop the test before reaching the calculated sample size',
            'Iteration > Perfectionism: 5 small improvements are better than 1 "perfect" redesign',
            'Back every decision with data, but don\'t forget qualitative research',
            'Build a culture of experimentation within the team',
          ],
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            '**Homework:** choose any screen from your course project and formulate 3 hypotheses for A/B tests using the formula: "If we [change], then [metric] will change by [number]%, because [rationale]."',
        },
      ],
      quiz: [
        {
          question: 'What is an A/B test?',
          options: [
            { id: 'a', text: 'Testing an app on two devices' },
            { id: 'b', text: 'Comparing two versions of an interface across different user groups to determine the better one' },
            { id: 'c', text: 'Having designer A and designer B review the design' },
            { id: 'd', text: 'Testing in two browsers simultaneously' },
          ],
          correctId: 'b',
          explanation:
            'An A/B test is an experiment in which two versions of an element are shown to different user groups simultaneously. By comparing metrics (conversion, CTR), we determine which version performs better.',
        },
        {
          question: 'What level of statistical significance is usually considered sufficient?',
          options: [
            { id: 'a', text: '50%' },
            { id: 'b', text: '75%' },
            { id: 'c', text: '95%' },
            { id: 'd', text: '100%' },
          ],
          correctId: 'c',
          explanation:
            'The standard threshold is 95% (p-value < 0.05). This means the probability of the result being due to chance is less than 5%. For critical decisions, 99% is sometimes used.',
        },
        {
          question: 'What did Google\'s famous 41 shades of blue test reveal?',
          options: [
            { id: 'a', text: 'Users prefer green links' },
            { id: 'b', text: 'The optimal shade of blue for links generated $200 million in additional revenue' },
            { id: 'c', text: 'Link color does not affect user behavior' },
            { id: 'd', text: 'Darker shades work better than lighter ones' },
          ],
          correctId: 'b',
          explanation:
            'Google tested 41 shades of blue for search links. The winning shade (#1a0dab) increased CTR so much that it generated an additional $200 million in annual revenue.',
        },
        {
          question: 'What is the biggest mistake when running an A/B test?',
          options: [
            { id: 'a', text: 'Using too large a sample size' },
            { id: 'b', text: 'Stopping the test before the calculated sample size due to early results' },
            { id: 'c', text: 'Testing only one element at a time' },
            { id: 'd', text: 'Documenting the results' },
          ],
          correctId: 'b',
          explanation:
            'Prematurely stopping a test is the most common mistake. Early results are unstable and may be due to chance. You must wait for the calculated sample size to draw reliable conclusions.',
        },
      ],
    },
  ],
}
