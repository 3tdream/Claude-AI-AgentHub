import type { Meeting } from '../../types'

export const meeting12: Meeting = {
  id: '12',
  number: 12,
  title: 'Platforms: Web/Mobile/SaaS/Data',
  description:
    'Design patterns for web and mobile applications, SaaS products, and data dashboards. Adaptive and responsive design, iOS HIG vs Material Design, WCAG 2.1 AA accessibility, internationalization, and dark mode.',
  icon: 'Monitor',
  color: 'bg-violet-500/10 text-violet-600',
  parts: [
    // =============================================
    // PART 1 — Web and Mobile Patterns (45 min)
    // =============================================
    {
      id: 'part-1',
      title: 'Web and Mobile Patterns',
      subtitle:
        'Responsive web design, mobile patterns, iOS HIG vs Material Design, adaptive vs responsive design, PWA',
      duration: '45 min',
      sections: [
        {
          type: 'heading' as const,
          content: 'Why the Platform Defines the Design',
        },
        {
          type: 'text' as const,
          content:
            'The same product on a **desktop**, **tablet**, and **smartphone** represents three different experiences. A user at a laptop sits in a chair with a mouse and keyboard. A user with a phone stands on the subway, holding the screen with one hand and navigating with their thumb. Designing the same way for both means **failing both**.',
        },
        {
          type: 'quote' as const,
          text: 'Content is like water. You pour water into a cup — it becomes the cup. You pour it into a bottle — it becomes the bottle. You pour it into a teapot — it becomes the teapot.',
          author: 'Josh Clark',
          role: 'Author of "Tapworthy: Designing Great iPhone Apps"',
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'According to Statcounter (2025), **59% of global web traffic** comes from mobile devices. Mobile-first is not a trend — it is a **mathematical necessity**.',
        },
        {
          type: 'divider' as const,
        },
        // --- WEB PATTERNS ---
        {
          type: 'heading' as const,
          content: 'Web Design Patterns',
        },
        {
          type: 'subheading' as const,
          content: 'Navigation',
        },
        {
          type: 'text' as const,
          content:
            'Navigation is the **skeleton** of any website. It determines how quickly users find what they need. The main desktop navigation patterns are: **horizontal bar** (top bar), **sidebar**, **mega menu** for complex catalogs, and **breadcrumbs** for deep hierarchies.',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'Horizontal Navigation (Top Bar)',
              items: [
                'Up to 7\u00B12 menu items',
                'Logo on the left, CTA on the right',
                'Sticky header for long pages',
                'Suited for sites with shallow structure',
                'Example: Apple, Stripe, Notion',
              ],
            },
            {
              title: 'Sidebar Navigation',
              items: [
                'Unlimited number of items',
                'Hierarchy with collapsible sections',
                'Collapses to icons on small screens',
                'Suited for SaaS, admin panels, dashboards',
                'Example: Figma, Slack, Jira',
              ],
            },
          ],
        },
        {
          type: 'subheading' as const,
          content: 'Hero Section',
        },
        {
          type: 'text' as const,
          content:
            'The hero is the first screen the user sees. You have **3-5 seconds** to communicate the product\'s value. An effective hero contains: a **headline** (what it is), a **subheadline** (why I need it), a **CTA button** (what to do next), and **visual proof** (screenshot, video, animation).',
        },
        {
          type: 'before-after' as const,
          title: 'Landing Page Hero Section',
          before: {
            label: 'Weak hero',
            description:
              'Headline "Welcome to our website", blurry background slider, 3 CTA buttons of the same size, no subheadline. The user doesn\'t understand what the product is or what to do.',
          },
          after: {
            label: 'Strong hero',
            description:
              'Headline "Manage projects without the chaos" + subheadline "One tool for tasks, deadlines, and your team" + single CTA "Try for free" + interface screenshot. Within 3 seconds the user understands everything.',
          },
        },
        {
          type: 'subheading' as const,
          content: 'Cards',
        },
        {
          type: 'text' as const,
          content:
            'Cards are a **universal container** for grouping related information. Their power lies in **uniformity**: each card in a grid has the same structure (image \u2192 title \u2192 description \u2192 action), allowing users to quickly scan content.',
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            {
              term: 'Card grid',
              definition:
                'A grid of cards (2-4 columns) for catalogs, blogs, portfolios. Use CSS Grid with auto-fit and minmax for responsiveness.',
            },
            {
              term: 'Card carousel',
              definition:
                'Horizontal card scrolling — for recommendations, related items. On desktop — arrows, on mobile — swipe.',
            },
            {
              term: 'Elevated card',
              definition:
                'A card with a shadow (box-shadow) to create depth. The shadow intensifies on hover for feedback.',
            },
          ],
        },
        {
          type: 'subheading' as const,
          content: 'Forms',
        },
        {
          type: 'text' as const,
          content:
            'Forms are the **conversion point**. Every extra field reduces completion rates by roughly **7%** (according to Baymard Institute). Best practices: **single column** (not two), **inline validation** (not after submission), **autofill**, **progress indicators** for multi-step forms.',
        },
        {
          type: 'checklist' as const,
          title: 'Ideal Web Form Checklist',
          items: [
            'Minimum fields — remove everything that can be collected later',
            'Single column — two-column forms confuse the fill order',
            'Labels on top, not beside — scanned faster',
            'Inline validation on blur (onBlur)',
            'Error messages next to the field, not at the top of the form',
            'Submit button describes the action: "Create account", not "Submit"',
            'Autofill (autocomplete="email") for standard fields',
            'Loading indicator on the button after clicking',
          ],
        },
        {
          type: 'subheading' as const,
          content: 'Footer',
        },
        {
          type: 'text' as const,
          content:
            'The footer is **navigation of last resort**. If the user scrolled to the bottom and didn\'t find what they needed — the footer saves the day. Classic structure: columns with link groups (Product, Company, Resources, Legal), social media, language switcher, copyright.',
        },
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=qEKOBdV_ZJY',
          title: 'Responsive Web Design — Fundamentals',
          caption: 'Kevin Powell — leading expert on CSS and responsive design',
        },
        {
          type: 'divider' as const,
        },
        // --- MOBILE PATTERNS ---
        {
          type: 'heading' as const,
          content: 'Mobile Design Patterns',
        },
        {
          type: 'text' as const,
          content:
            'Mobile design is not a shrunken copy of desktop. It is a **separate discipline** with its own rules: finger instead of cursor, small screen, interruptions, poor connectivity, gestures instead of clicks.',
        },
        {
          type: 'subheading' as const,
          content: 'Tab Bar (Bottom Navigation)',
        },
        {
          type: 'text' as const,
          content:
            'The tab bar is the **primary navigation pattern** of mobile apps. It sits at the bottom of the screen within thumb reach. It contains **3-5 tabs** (no more!) with an icon and a label. The active tab is highlighted with color.',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'Tab Bar — Best Practices',
              items: [
                'Maximum 5 tabs',
                'Icon + text label',
                'Active tab highlighted with color',
                'Badge for notifications (red dot)',
                'Height: 49pt (iOS) / 56dp (Android)',
              ],
            },
            {
              title: 'Tab Bar — Mistakes',
              items: [
                'More than 5 tabs — too small and unreadable',
                'Icons only without labels — unclear',
                'Hiding tab bar on scroll — navigation is lost',
                '"More" tab with a list — sign of poor IA',
                'Identical icons for different tabs',
              ],
            },
          ],
        },
        {
          type: 'subheading' as const,
          content: 'Bottom Sheet',
        },
        {
          type: 'text' as const,
          content:
            'A bottom sheet is a **modal panel** that slides up from the bottom of the screen. It is convenient for contextual actions, filters, and details. It can be **partially** visible (peek state) with the ability to expand to full screen (expanded state).',
        },
        {
          type: 'callout' as const,
          variant: 'example' as const,
          content:
            '**Google Maps** uses bottom sheets masterfully: when searching for a place, a peek appears first (name + rating), swiping up reveals details (photos, reviews, hours), swiping down closes it. Three states — **peek, half, full** — give the user control.',
        },
        {
          type: 'subheading' as const,
          content: 'Gestures: Swipes, Pull-to-Refresh, Haptics',
        },
        {
          type: 'text' as const,
          content:
            'Gestures are the **superpower** of mobile interfaces, unavailable on desktop. But gestures are **invisible** — users must know they exist. The rule: gestures **accelerate**, but should never be the **only** way to perform an action.',
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            {
              term: 'Swipe-to-delete / Swipe-to-archive',
              definition:
                'A horizontal swipe on a list item reveals actions (delete, archive). Example: Mail on iOS, Gmail.',
            },
            {
              term: 'Pull-to-refresh',
              definition:
                'Pull down to refresh content. A loading indicator confirms the action. A pattern from Twitter/Instagram.',
            },
            {
              term: 'Pinch-to-zoom',
              definition:
                'Use two fingers to zoom in/out on an image or map. Standard for photos and maps.',
            },
            {
              term: 'Haptic feedback',
              definition:
                'Device vibration on action: light when toggling a switch, strong when deleting. Creates a sense of "physicality" in the interface.',
            },
          ],
        },
        {
          type: 'callout' as const,
          variant: 'warning' as const,
          content:
            '**Gesture trap:** Instagram removed the swipe to switch between tabs and replaced it with Reels. Millions of users accidentally ended up in Reels instead of messages. **A gesture that conflicts with an established habit is a UX catastrophe.**',
        },
        {
          type: 'divider' as const,
        },
        // --- IOS vs ANDROID ---
        {
          type: 'heading' as const,
          content: 'iOS HIG vs Material Design',
        },
        {
          type: 'text' as const,
          content:
            'Apple and Google have **their own design systems** with different philosophies. iOS Human Interface Guidelines (HIG) focuses on **clarity, deference, and depth**. Google\'s Material Design focuses on a **material metaphor, motion, and adaptability**.',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'iOS Human Interface Guidelines',
              items: [
                'Navigation: tab bar at the bottom + navigation bar on top',
                'Back button — top left',
                'Modal windows — sheet from the bottom (iOS 16+)',
                'Typography: San Francisco (SF Pro)',
                'Border radius: 12-20pt',
                'Blur effects (vibrancy) for depth',
                'Tap target size: minimum 44\u00D744pt',
                'Back gesture — swipe from the left edge',
              ],
            },
            {
              title: 'Material Design 3 (Google)',
              items: [
                'Navigation: Navigation Bar at the bottom + Top App Bar',
                'Back button — arrow on the left or system gesture',
                'Modal windows — centered dialog or bottom sheet',
                'Typography: Roboto / Product Sans',
                'Border radius: 8-28dp (dynamic rounding)',
                'Elevation (shadows) for hierarchy',
                'Tap target size: minimum 48\u00D748dp',
                'FAB (Floating Action Button) for the primary action',
              ],
            },
          ],
        },
        {
          type: 'before-after' as const,
          title: 'Delete Dialog — iOS vs Android',
          before: {
            label: 'iOS Alert',
            description:
              'A centered alert with the title "Delete photo?", text "This action cannot be undone", and two buttons: "Cancel" (default style) and "Delete" (red, destructive). The confirm button always has emphasis.',
          },
          after: {
            label: 'Material Dialog',
            description:
              'A centered dialog with title, text, and text buttons at the bottom right: "CANCEL" and "DELETE". Buttons are text-only (not filled). Material prefers less visual weight on actions.',
          },
        },
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=uxmABSrzGsw',
          title: 'Material Design 3 — What\'s New',
          caption: 'Google Design — overview of Material You and Dynamic Color',
        },
        {
          type: 'divider' as const,
        },
        // --- ADAPTIVE vs RESPONSIVE ---
        {
          type: 'subheading' as const,
          content: 'Adaptive vs Responsive Design',
        },
        {
          type: 'text' as const,
          content:
            'These terms are often confused. **Responsive design** uses a single layout that **fluidly rearranges** through media queries and fluid grids. **Adaptive design** uses multiple **fixed layouts** for specific breakpoints (320px, 768px, 1024px, 1440px). In 2025, the standard is **responsive** with elements of an adaptive approach for critical components.',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'Responsive Design',
              items: [
                'Fluid grids: % and fr instead of px',
                'Flexible images: max-width: 100%',
                'Media queries for breakpoints',
                'One HTML document for all devices',
                'Container queries (CSS 2024+) for components',
                'Pro: cheaper to develop and maintain',
              ],
            },
            {
              title: 'Adaptive Design',
              items: [
                'Fixed layouts for each breakpoint',
                'Server detects device (User-Agent)',
                'Different templates for mobile/desktop',
                'Precise pixel-level control',
                'Harder to maintain (N layouts)',
                'Pro: perfect experience on each device',
              ],
            },
          ],
        },
        {
          type: 'subheading' as const,
          content: 'PWA — Progressive Web Apps',
        },
        {
          type: 'text' as const,
          content:
            'PWAs are web applications with **native capabilities**: install to home screen, push notifications, offline mode, camera and geolocation access. PWAs combine the **reach of the web** (URLs, SEO, instant access) with the **capabilities of native apps**.',
        },
        {
          type: 'diagram' as const,
          title: 'Platform Spectrum: From Website to Native App',
          description:
            'Each step to the right provides more capabilities but increases development cost and requires installation.',
          items: [
            'Static site \u2192 Minimum capabilities, maximum reach',
            'SPA (React/Vue) \u2192 Interactivity, but no offline',
            'PWA \u2192 Installation, offline, push notifications',
            'Hybrid (Capacitor/Ionic) \u2192 Native APIs + web code',
            'React Native / Flutter \u2192 Close to native, single codebase',
            'Native (Swift/Kotlin) \u2192 Maximum capabilities, maximum cost',
          ],
        },
        {
          type: 'callout' as const,
          variant: 'example' as const,
          content:
            '**Starbucks PWA** loads in 2 seconds, works offline, lets users browse the menu and add items to the cart without internet. Result: **2x increase in daily orders** via web compared to the old mobile site.',
        },
        {
          type: 'before-after' as const,
          title: 'Navigation — Desktop vs Mobile',
          before: {
            label: 'Desktop',
            description:
              'Horizontal navigation with 7 menu items, dropdown submenus, search in the header, CTA button "Try for free". All elements are visible at once — there is enough space.',
          },
          after: {
            label: 'Mobile',
            description:
              'Hamburger menu (\u2630) on the left, logo centered, search icon and profile on the right. Tapping \u2630 opens a full-screen overlay with a vertical list. CTA button is fixed at the bottom of the screen.',
          },
        },
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=K2Zk0PbFYqs',
          title: 'iOS Design Guidelines — Human Interface Guidelines',
          caption: 'Overview of key Apple HIG principles for mobile applications',
        },
      ],
      quiz: [
        {
          question: 'How many tabs are recommended for a mobile app Tab Bar?',
          options: [
            { id: 'a', text: '2-3 tabs' },
            { id: 'b', text: '3-5 tabs' },
            { id: 'c', text: '5-8 tabs' },
            { id: 'd', text: 'No limit' },
          ],
          correctId: 'b',
          explanation:
            'A tab bar should contain 3-5 tabs. Fewer than 3 — a tab bar is unnecessary; more than 5 — elements become too small and the information architecture needs rethinking.',
        },
        {
          question: 'What is the main difference between responsive design and adaptive design?',
          options: [
            { id: 'a', text: 'Responsive is faster, adaptive is prettier' },
            { id: 'b', text: 'Responsive uses a single fluidly rearranging layout, adaptive uses multiple fixed layouts' },
            { id: 'c', text: 'Responsive is only for mobile, adaptive is for desktop' },
            { id: 'd', text: 'They are synonyms — there is no difference' },
          ],
          correctId: 'b',
          explanation:
            'Responsive design uses fluid grids and media queries to fluidly rearrange a single layout. Adaptive design creates separate fixed layouts for specific breakpoints.',
        },
        {
          question: 'What is the minimum tap target size recommended by Apple HIG for iOS?',
          options: [
            { id: 'a', text: '32\u00D732pt' },
            { id: 'b', text: '44\u00D744pt' },
            { id: 'c', text: '48\u00D748dp' },
            { id: 'd', text: '56\u00D756pt' },
          ],
          correctId: 'b',
          explanation:
            'Apple recommends a minimum of 44\u00D744pt for tap targets in iOS. Google Material Design recommends 48\u00D748dp. Both sizes ensure comfortable finger targeting.',
        },
        {
          question: 'Which gesture in a mobile interface should NOT be the only way to perform an action?',
          options: [
            { id: 'a', text: 'Tap on a button' },
            { id: 'b', text: 'Scroll down' },
            { id: 'c', text: 'Swipe-to-delete' },
            { id: 'd', text: 'All gestures should have an alternative' },
          ],
          correctId: 'd',
          explanation:
            'All gestures are invisible — users must know they exist. Gestures should accelerate actions but never be the only path. Always provide a visual alternative (button, menu).',
        },
      ],
    },

    // =============================================
    // PART 2 — SaaS and Data Dashboards (45 min)
    // =============================================
    {
      id: 'part-2',
      title: 'SaaS and Data Dashboards',
      subtitle:
        'Onboarding, pricing, empty states, KPI cards, charts, filters, WCAG accessibility, dark mode, i18n',
      duration: '45 min',
      sections: [
        {
          type: 'heading' as const,
          content: 'SaaS Patterns: From First Visit to Power User',
        },
        {
          type: 'text' as const,
          content:
            'SaaS (Software as a Service) is not just an application — it is a **business model** where design directly affects revenue. Every screen solves a business problem: onboarding reduces churn, the pricing page increases ARPU, empty states prevent new user drop-off.',
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'In SaaS, the **40-20-10 rule** applies: 40% of users leave during onboarding, 20% — in the first week, 10% — in the first month. Your design must retain them at **every** stage.',
        },
        {
          type: 'divider' as const,
        },
        // --- ONBOARDING ---
        {
          type: 'subheading' as const,
          content: 'Onboarding Flow',
        },
        {
          type: 'text' as const,
          content:
            'Onboarding is the user\'s **first date** with the product. The goal is to reach the **"aha moment"** (when the user understands the value) in minimum time. Bad onboarding is 5 screens with screenshots that everyone skips. Good onboarding is **interactive learning through action**.',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'Onboarding Patterns',
              items: [
                'Welcome wizard: 3-5 setup steps (Notion)',
                'Product tour: element highlighting with tooltips (Intercom)',
                'Progressive disclosure: features unlock gradually (Figma)',
                'Empty state CTA: empty list with a "Create first" button',
                'Checklist: progress bar with tasks for the new user',
                'Sample data: example project for exploration (Airtable)',
              ],
            },
            {
              title: 'Onboarding Anti-patterns',
              items: [
                'Screenshot carousel — everyone skips it',
                'Mandatory registration before viewing the product',
                '20 fields during registration',
                'Video tour without skip (5+ minutes)',
                'Text tooltips over every element',
                'No way to go back or skip',
              ],
            },
          ],
        },
        {
          type: 'case-study' as const,
          title: 'Notion Onboarding',
          company: 'Notion',
          problem:
            'Notion is a powerful tool, but newcomers get lost in its capabilities. An empty workspace is intimidating.',
          solution:
            'Notion uses **templates** during onboarding: it offers a use case choice (notes, project, wiki), automatically creates structure from templates, and adds sample data. The user sees a **ready-made** workspace, not a blank page.',
          result:
            'Time-to-value decreased from 15 minutes to 3 minutes. First-week retention increased by 30%.',
          steps: [
            { title: 'Use case selection', description: 'Personal / Team / Education' },
            { title: 'Template selection', description: '5-6 templates for the chosen use case' },
            { title: 'Workspace auto-generation', description: 'Structure with examples is created' },
            { title: 'Interactive tour', description: 'Key features highlighted on real data' },
          ],
        },
        {
          type: 'divider' as const,
        },
        // --- SETTINGS & PRICING ---
        {
          type: 'subheading' as const,
          content: 'Settings',
        },
        {
          type: 'text' as const,
          content:
            'The settings page is the most **underrated** part of SaaS. Bad settings = frustrated power users = churn. Best practices: **grouping by category** (Profile, Billing, Notifications, Integrations), **instant saving** (no "Save" button), **search** within settings for large configurations.',
        },
        {
          type: 'subheading' as const,
          content: 'Pricing Page',
        },
        {
          type: 'text' as const,
          content:
            'The pricing page is the **highest-converting page** of a SaaS product. The standard: **3 tiers** (good-better-best), the middle tier **highlighted** as "Most Popular", a **Monthly/Yearly** toggle (with a discount badge), and a **comparison table** below.',
        },
        {
          type: 'before-after' as const,
          title: 'Pricing Page — Structure',
          before: {
            label: 'Weak pricing',
            description:
              '7 tiers in a single row, small text, confusing names (Alpha, Beta, Gamma), no comparison table, "Buy" CTA of the same size everywhere.',
          },
          after: {
            label: 'Strong pricing',
            description:
              '3 tiers (Free, Pro, Enterprise), the middle one highlighted with a border and "Most Popular" badge, Monthly/Yearly toggle with a "Save 20%" note, CTAs: "Start free" on Free, "Choose Pro" on Pro (primary emphasis), "Contact us" on Enterprise.',
          },
        },
        {
          type: 'subheading' as const,
          content: 'Empty States',
        },
        {
          type: 'text' as const,
          content:
            'An empty state is the screen users see when there is **no data yet**: an empty project list, an empty folder, no notifications. This is **not an error** — it is an **opportunity** to guide the user. A good empty state contains: an illustration, an explanation of "what will appear here", and a **CTA for the first action**.',
        },
        {
          type: 'before-after' as const,
          title: 'Empty State — Project List',
          before: {
            label: 'Bad empty state',
            description:
              'A gray table with column headers, text "No data" in the center. The user feels something is broken.',
          },
          after: {
            label: 'Good empty state',
            description:
              'An illustration (rocket/coffee), headline "Nothing here yet", text "Create your first project to get started", a "+ Create project" button, and a "Browse templates" link.',
          },
        },
        {
          type: 'subheading' as const,
          content: 'Feature Discovery',
        },
        {
          type: 'text' as const,
          content:
            'In a typical SaaS product, users only use **20-30% of features**. Feature discovery is a strategy for revealing capabilities: **contextual tips** (hints when approaching a feature), **what\'s new** modals, **upgrade nudges** (show a premium feature with blur and an upgrade button).',
        },
        {
          type: 'case-study' as const,
          title: 'Feature Discovery in Figma',
          company: 'Figma',
          problem:
            'Figma adds dozens of features monthly. Users don\'t notice new capabilities and continue using old methods.',
          solution:
            'Figma uses **3 levels** of discovery: (1) Blue dot — a blue dot on new menu items, (2) What\'s new panel — an update panel upon opening, (3) Contextual tips — a "Try auto layout" hint when manually positioning elements.',
          result:
            'New feature adoption increased by 40%. Support tickets about "how to do X" decreased by 25%.',
        },
        {
          type: 'divider' as const,
        },
        // --- DATA DASHBOARDS ---
        {
          type: 'heading' as const,
          content: 'Data Dashboard Patterns',
        },
        {
          type: 'text' as const,
          content:
            'A data dashboard is an interface for **decision-making**. Every element should answer: "What is happening?", "Is this good or bad?", "What should I do?". Data visualization is not decoration — it is a **thinking tool**.',
        },
        {
          type: 'quote' as const,
          text: 'The purpose of visualization is not to create pretty pictures, but to gain insight.',
          author: 'Ben Shneiderman',
          role: 'Professor of Computer Science, University of Maryland',
        },
        {
          type: 'subheading' as const,
          content: 'KPI Cards',
        },
        {
          type: 'text' as const,
          content:
            'KPI cards are the **first thing** a user sees on a dashboard. Each card shows: the **current value** (large), the **change** over a period (\u219112% in green or \u21935% in red), and a **miniature trend** (sparkline). They are arranged in a row of **3-5 cards** at the top of the screen.',
        },
        {
          type: 'diagram' as const,
          title: 'Anatomy of a KPI Card',
          description:
            'Each element of a KPI card has a clear function — from label to trend.',
          items: [
            'Label \u2014 what we measure (Revenue, Users, Churn)',
            'Value \u2014 current value in large font ($142K)',
            'Change \u2014 percentage change with arrow icon (\u219112.5%)',
            'Color \u2014 green = growth, red = decline',
            'Sparkline \u2014 miniature trend chart over 30 days',
            'Period \u2014 time range for the data (vs last month)',
          ],
        },
        {
          type: 'subheading' as const,
          content: 'Charts: Choosing the Right Type',
        },
        {
          type: 'text' as const,
          content:
            'Choosing the chart type is a **critical** decision. The wrong type is not just unattractive — it **distorts** data and leads to incorrect decisions.',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'Data Type \u2192 Chart Type',
              items: [
                'Trend over time \u2192 Line chart',
                'Category comparison \u2192 Bar chart (vertical)',
                'Ranking \u2192 Bar chart (horizontal)',
                'Parts of a whole (up to 6 segments) \u2192 Pie / Donut chart',
                'Correlation of two metrics \u2192 Scatter plot',
                'Value distribution \u2192 Histogram',
              ],
            },
            {
              title: 'Visualization Anti-patterns',
              items: [
                '3D charts — distort proportions',
                'Pie chart with 10+ segments — unreadable',
                'Dual Y-axis — confuses the user',
                'Truncated Y-axis (not from zero) — exaggerates changes',
                'Rainbow palette — impossible to distinguish colors',
                'Missing legend and axis labels',
              ],
            },
          ],
        },
        {
          type: 'subheading' as const,
          content: 'Filters and Drill-down',
        },
        {
          type: 'text' as const,
          content:
            'A dashboard without filters is like a map without scale. **Filters** let you narrow data (period, region, product), and **drill-down** lets you go deeper into details (click on a chart bar \u2192 table of transactions). The principle: **Overview first, zoom and filter, details on demand** (Shneiderman).',
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            {
              term: 'Global filters',
              definition:
                'Filters in the dashboard header: date range picker, region dropdown. They affect all widgets simultaneously.',
            },
            {
              term: 'Local filters',
              definition:
                'Filters within a specific widget: table search, column sorting. They do not affect other widgets.',
            },
            {
              term: 'Drill-down',
              definition:
                'Transition from aggregated data to detailed data: click on "Revenue: $142K" \u2192 table with each transaction.',
            },
            {
              term: 'Cross-filtering',
              definition:
                'Clicking an element in one widget filters the rest: click on the "USA" segment in a pie chart \u2192 all charts show only USA.',
            },
          ],
        },
        {
          type: 'subheading' as const,
          content: 'Data Tables',
        },
        {
          type: 'text' as const,
          content:
            'The table is the **workhorse** of any dashboard. Best practices: **sticky header** (fixed header on scroll), **right-align numbers**, **zebra striping** or hover row highlighting, **pagination** or infinite scroll, **export to CSV/Excel**.',
        },
        {
          type: 'case-study' as const,
          title: 'Dashboard Design in Tableau',
          company: 'Tableau',
          problem:
            'Business analysts spent hours creating reports in Excel. Management wanted to see data in real time.',
          solution:
            'Tableau implemented **drag-and-drop** chart building: select a metric, drag it to the canvas, choose a visualization type. Automatic selection of the best chart type based on data. Cross-filtering between widgets with a single click.',
          result:
            'Report creation time decreased from 4 hours to 15 minutes. Decisions became data-driven instead of intuitive.',
          steps: [
            { title: 'Data connection', description: 'Drag-and-drop a file or enter a database URL' },
            { title: 'Automatic profiling', description: 'Tableau identifies data types and suggests visualizations' },
            { title: 'Dashboard construction', description: 'Drag widgets to canvas, configure filters' },
            { title: 'Publishing', description: 'One click — the dashboard is accessible to the whole team via browser' },
          ],
        },
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=Eoah0RikIEk',
          title: 'Dashboard Design — Best Practices',
          caption: 'Data visualization for analytical interfaces',
        },
        {
          type: 'divider' as const,
        },
        // --- ACCESSIBILITY ---
        {
          type: 'heading' as const,
          content: 'Accessibility',
        },
        {
          type: 'text' as const,
          content:
            '**15% of the world\'s population** are people with disabilities (WHO). Accessible design is not "an option for 15%" — it is **good design for 100%**: high contrast helps everyone in sunlight, keyboard navigation speeds up power users, captions are useful on a noisy subway.',
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            {
              term: 'WCAG 2.1 AA',
              definition:
                'Web Content Accessibility Guidelines — the international accessibility standard. Level AA is the mandatory minimum for most products and legislation.',
            },
            {
              term: 'Text contrast',
              definition:
                'Minimum 4.5:1 for normal text, 3:1 for large text (18pt+ or 14pt bold). Check with WebAIM Contrast Checker.',
            },
            {
              term: 'Screen reader',
              definition:
                'Software that reads the interface aloud. For support: semantic HTML, aria-labels, alt text, proper heading hierarchy.',
            },
            {
              term: 'Keyboard navigation',
              definition:
                'All interactive elements must be accessible via Tab, Enter, Escape, Arrow keys. Focus ring is mandatory.',
            },
          ],
        },
        {
          type: 'checklist' as const,
          title: 'WCAG 2.1 AA Accessibility Checklist',
          items: [
            'Text contrast minimum 4.5:1 (3:1 for large text)',
            'All images have alt text',
            'Forms: every field has an associated <label>',
            'Icon buttons have aria-label',
            'Keyboard navigation: Tab, Enter, Escape work everywhere',
            'Focus ring is visible and not hidden by CSS (outline: none is harmful)',
            'Heading hierarchy: h1 \u2192 h2 \u2192 h3, no skips',
            'Color is not the only indicator (+ icon or text)',
            'Videos have captions',
            'Animations can be disabled (prefers-reduced-motion)',
            'Zoom to 200% does not break layout',
            'Page language is specified in <html lang="en">',
          ],
        },
        {
          type: 'callout' as const,
          variant: 'warning' as const,
          content:
            '**Legal risk:** In 2025, the European Accessibility Act came into force in the EU, requiring all digital services to meet accessibility standards. In the US — the ADA. An inaccessible site = **a lawsuit**.',
        },
        {
          type: 'divider' as const,
        },
        // --- RESPONSIVE AUDIT, DARK MODE, i18n ---
        {
          type: 'subheading' as const,
          content: 'Responsive Audit — Checklist',
        },
        {
          type: 'checklist' as const,
          title: 'Responsive Audit Checklist',
          items: [
            'Test at 5 breakpoints: 320px, 375px, 768px, 1024px, 1440px',
            'Text is not clipped and does not overflow its container',
            'Images scale proportionally',
            'Navigation adapts (top bar \u2192 hamburger menu)',
            'Tap targets on mobile are at least 44\u00D744pt',
            'Forms are comfortable to fill on mobile (input type)',
            'Tables scroll horizontally or transform into cards',
            'Modal windows do not overflow the screen',
            'Font is readable without zoom (min 16px for body)',
            'No horizontal scroll on mobile',
          ],
        },
        {
          type: 'subheading' as const,
          content: 'Dark Mode',
        },
        {
          type: 'text' as const,
          content:
            'Dark mode is **not color inversion**. It is a separate color system. Key rules: the background is not pure black (#000) but dark gray (#121212 or #1a1a1a), text is not pure white (#fff) but slightly muted (#e0e0e0), accent colors are **less saturated** (desaturated), shadows are replaced with **glow** (elevation through background color).',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'Light Mode',
              items: [
                'Background: #FFFFFF',
                'Text: #1A1A1A',
                'Secondary text: #666666',
                'Border: #E5E5E5',
                'Accent: #2563EB (saturated blue)',
                'Shadows for depth',
                'Elevation via box-shadow',
              ],
            },
            {
              title: 'Dark Mode',
              items: [
                'Background: #121212 (not pure black)',
                'Text: #E0E0E0 (not pure white)',
                'Secondary text: #9E9E9E',
                'Border: #2C2C2C',
                'Accent: #60A5FA (desaturated blue)',
                'No shadows — glow via surface color',
                'Elevation via lightened background',
              ],
            },
          ],
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'Use CSS variables for themes: `--background`, `--foreground`, `--primary`. When switching themes, change only the variable values, not each component. In Tailwind — `dark:` prefix + `prefers-color-scheme`.',
        },
        {
          type: 'subheading' as const,
          content: 'Internationalization (i18n): RTL and LTR',
        },
        {
          type: 'text' as const,
          content:
            'If your product operates in international markets, you need **RTL** (right-to-left) support for Arabic, Hebrew, and Persian. This is not just "mirroring" the layout — it is a **rethinking** of element placement, icon direction, and text alignment.',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'LTR (Left-to-Right)',
              items: [
                'Logo on the left, actions on the right',
                'Sidebar on the left',
                'Reading: left \u2192 right, top \u2192 bottom',
                'Back arrow \u2192 \u2190',
                'Progress bar: left to right',
                'Numbers: unchanged (1, 2, 3)',
              ],
            },
            {
              title: 'RTL (Right-to-Left)',
              items: [
                'Logo on the right, actions on the left',
                'Sidebar on the right',
                'Reading: right \u2192 left, top \u2192 bottom',
                'Back arrow \u2192 \u2192',
                'Progress bar: right to left',
                'Numbers: same (Arabic numerals are LTR within RTL text)',
              ],
            },
          ],
        },
        {
          type: 'callout' as const,
          variant: 'example' as const,
          content:
            '**CSS Logical Properties** — a modern solution for RTL: instead of `margin-left`, write `margin-inline-start`; instead of `padding-right` — `padding-inline-end`. The browser automatically applies the correct side depending on `dir="rtl"` or `dir="ltr"`.',
        },
        {
          type: 'divider' as const,
        },
        // --- REAL EXAMPLES ---
        {
          type: 'heading' as const,
          content: 'Real Product Analysis',
        },
        {
          type: 'case-study' as const,
          title: 'Metabase — Open-Source BI Dashboard',
          company: 'Metabase',
          problem:
            'Teams without an analyst cannot build dashboards — SQL is too complex for managers and marketers.',
          solution:
            'Metabase created a **visual query builder**: select a table \u2192 add a filter \u2192 choose a metric \u2192 get a chart. Without a single line of SQL. For advanced users — SQL mode with autocomplete.',
          result:
            'Over 50,000 companies use Metabase. Time from question to answer — 2 minutes instead of an hour.',
          steps: [
            { title: 'Source selection', description: 'Connect to PostgreSQL, MySQL, BigQuery via UI' },
            { title: 'Visual query builder', description: 'Drag-and-drop query building without SQL' },
            { title: 'Auto-visualization', description: 'Metabase selects the best chart type automatically' },
            { title: 'Dashboard assembly', description: 'Drag widgets, configure cross-filtering' },
          ],
        },
        {
          type: 'image' as const,
          src: '/images/meeting-12-dashboards-comparison.webp',
          alt: 'Comparison of Tableau, Metabase, and Grafana dashboards',
          caption: 'Three approaches to data visualization: enterprise, open-source, DevOps-oriented',
        },
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=RGMItjHBMko',
          title: 'Web Accessibility — WCAG 2.1 in Practice',
          caption: 'How to check and improve the accessibility of your product',
        },
        {
          type: 'before-after' as const,
          title: 'KPI Dashboard — Before and After Redesign',
          before: {
            label: 'Before redesign',
            description:
              '12 KPI cards of the same size in 4 rows, all numbers in the same font, no color indicators, no sparklines. Information noise — the eye doesn\'t know where to look.',
          },
          after: {
            label: 'After redesign',
            description:
              '4 main KPIs displayed prominently in the top row with sparklines and colored arrows. Below — 2 charts (trend + breakdown). At the bottom — a table with drill-down. Hierarchy: overview first, then details.',
          },
        },
        {
          type: 'diagram' as const,
          title: 'Dashboard Information Hierarchy',
          description:
            'Shneiderman\'s principle: Overview \u2192 Zoom \u2192 Filter \u2192 Details on Demand',
          items: [
            'Level 1 \u2014 KPI cards: answer "How are we doing?" in 3 seconds',
            'Level 2 \u2014 Charts: trends and comparisons over a period',
            'Level 3 \u2014 Filters: narrow data to the needed segment',
            'Level 4 \u2014 Tables: each record with drill-down capability',
            'Level 5 \u2014 Detail view: full record card',
          ],
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            '**The 5-second dashboard test rule:** Show the dashboard to a colleague for 5 seconds, close it, and ask: "How are we doing?" If they can answer — the dashboard works. If not — redesign the hierarchy.',
        },
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          title: 'Dark Mode Design — How to Do It Right',
          caption: 'Principles of dark theme design: contrasts, elevation, colors',
        },
      ],
      quiz: [
        {
          question: 'What is the minimum text contrast ratio required by WCAG 2.1 Level AA?',
          options: [
            { id: 'a', text: '2:1' },
            { id: 'b', text: '3:1' },
            { id: 'c', text: '4.5:1' },
            { id: 'd', text: '7:1' },
          ],
          correctId: 'c',
          explanation:
            'WCAG 2.1 AA requires a minimum of 4.5:1 for normal text and 3:1 for large text (18pt+ or 14pt bold). Level AAA requires 7:1.',
        },
        {
          question: 'What background color is recommended for dark mode instead of pure black (#000)?',
          options: [
            { id: 'a', text: '#000000 — pure black' },
            { id: 'b', text: '#121212 — dark gray' },
            { id: 'c', text: '#333333 — medium gray' },
            { id: 'd', text: '#1a1a2e — dark blue' },
          ],
          correctId: 'b',
          explanation:
            'Material Design recommends #121212 for dark mode. Pure black (#000) creates too harsh a contrast with text and causes the "halation effect" — white text appears to bleed on a black background.',
        },
        {
          question: 'What data visualization principle did Ben Shneiderman formulate?',
          options: [
            { id: 'a', text: 'Less is more — fewer elements, better design' },
            { id: 'b', text: 'Overview first, zoom and filter, details on demand' },
            { id: 'c', text: 'Form follows function' },
            { id: 'd', text: 'Show, don\'t tell' },
          ],
          correctId: 'b',
          explanation:
            'Shneiderman\'s visual information-seeking mantra: "Overview first, zoom and filter, details on demand" — first an overview, then zoom and filter, details on demand. This is the foundation of dashboard design.',
        },
        {
          question: 'Which of the following is NOT a best practice for RTL (right-to-left) interfaces?',
          options: [
            { id: 'a', text: 'Use CSS Logical Properties (margin-inline-start)' },
            { id: 'b', text: 'Mirror all arrow icons' },
            { id: 'c', text: 'Move sidebar to the right' },
            { id: 'd', text: 'Mirror progress bar direction' },
          ],
          correctId: 'b',
          explanation:
            'Not all icons should be mirrored! Navigation arrows — yes, but icons like checkmarks, search, and hearts — no. Only icons that indicate reading direction or movement should be mirrored.',
        },
      ],
    },
  ],
}
