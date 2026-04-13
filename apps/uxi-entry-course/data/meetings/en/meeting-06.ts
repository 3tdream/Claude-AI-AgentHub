import type { Meeting } from '../../types'

export const meeting06: Meeting = {
  id: '6',
  number: 6,
  title: 'Color Theory',
  description:
    'Itten color wheel, harmonies, color psychology in industries, the 60-30-10 rule, palettes for web, mobile, and SaaS, accessibility and dark theme.',
  icon: 'Palette',
  color: 'bg-purple-500/10 text-purple-600',
  parts: [
    // ========================================================
    // PART 1 — Color Wheel and Harmonies
    // ========================================================
    {
      id: 'part-1',
      title: 'Color Wheel and Harmonies',
      subtitle:
        'Itten color wheel, primary and derived colors, types of harmonies, warm and cool colors, color psychology',
      duration: '45 min',
      sections: [
        // === INTRODUCTION ===
        {
          type: 'heading' as const,
          content: 'Why Color Is a Designer\'s Superpower',
        },
        {
          type: 'text' as const,
          content:
            'Color is the first thing the human brain processes. Research shows that **up to 90% of a first impression** about a product is formed by color alone. The right color choice increases brand recognition by 80%, improves conversion, and influences user emotions.',
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'Color is not a matter of taste. It is a system with clear rules that can be learned and applied consciously. After this lesson, you will see color in a completely different way.',
        },
        {
          type: 'quote' as const,
          text: 'Color is the keyboard, the eyes are the hammers, the soul is the piano with many strings.',
          author: 'Wassily Kandinsky',
          role: 'Artist, art theorist',
        },
        {
          type: 'image-placeholder' as const,
          alt: 'Color spectrum and its influence on user emotions',
          caption: 'Color forms a first impression in 50 milliseconds',
        },
        {
          type: 'divider' as const,
        },

        // === ITTEN COLOR WHEEL ===
        {
          type: 'heading' as const,
          content: 'The Itten Color Wheel',
        },
        {
          type: 'text' as const,
          content:
            '**Johannes Itten** — a Swiss artist and Bauhaus instructor — created the color wheel in 1961, which became the foundation of color theory in design. The wheel systematizes relationships between colors and helps choose harmonious combinations.',
        },
        {
          type: 'timeline' as const,
          events: [
            {
              year: '1666',
              title: 'Newton and the Prism',
              description:
                'Isaac Newton split white light into a spectrum and proposed the first color wheel with 7 colors.',
            },
            {
              year: '1810',
              title: 'Goethe\'s "Theory of Colors"',
              description:
                'Johann Goethe studied the psychological perception of color, linking colors to emotions.',
            },
            {
              year: '1961',
              title: 'Itten\'s Color Wheel',
              description:
                'Johannes Itten published "The Art of Color" — a foundational work on color theory for designers.',
            },
            {
              year: '2000+',
              title: 'Color in Digital Design',
              description:
                'Itten\'s theory adapted for screens: RGB, HSL, color systems like Material Design and Apple HIG.',
            },
          ],
        },
        {
          type: 'diagram' as const,
          title: 'Structure of the Itten Color Wheel (12 Colors)',
          description:
            'The wheel consists of three levels: primary, secondary, and tertiary colors',
          items: [
            'Primary: red, yellow, blue — cannot be created by mixing',
            'Secondary: orange, green, violet — mixing two primaries',
            'Tertiary: red-orange, yellow-orange, yellow-green, blue-green, blue-violet, red-violet',
          ],
        },
        {
          type: 'image-placeholder' as const,
          alt: 'Itten color wheel with 12 colors and three levels',
          caption:
            'The Itten color wheel is your primary tool for selecting color harmonies',
        },
        {
          type: 'callout' as const,
          variant: 'example' as const,
          content:
            'In digital design we work with **RGB** (for screens) and **HSL** (hue, saturation, lightness — convenient for creating palettes). The Itten wheel is based on RYB (red-yellow-blue), but the principles of harmony work the same way.',
        },
        {
          type: 'divider' as const,
        },

        // === COLOR CHARACTERISTICS ===
        {
          type: 'heading' as const,
          content: 'Three Color Characteristics: HSL',
        },
        {
          type: 'text' as const,
          content:
            'Every color is described by three parameters. Understanding these parameters is the key to creating professional palettes.',
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            {
              term: 'Hue',
              definition:
                'The position of a color on the color wheel (0-360\u00B0). Red = 0\u00B0, green = 120\u00B0, blue = 240\u00B0.',
            },
            {
              term: 'Saturation',
              definition:
                'The intensity of a color (0-100%). 0% is gray, 100% is a pure, vivid color.',
            },
            {
              term: 'Lightness',
              definition:
                'The amount of light in a color (0-100%). 0% is black, 50% is the pure color, 100% is white.',
            },
          ],
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'Use HSL instead of HEX when creating palettes. To make variations of a single color, simply adjust Saturation and Lightness while keeping Hue unchanged. Example: `hsl(220, 70%, 50%)` \u2192 `hsl(220, 70%, 30%)` for a darker variant.',
        },
        {
          type: 'divider' as const,
        },

        // === TYPES OF HARMONIES ===
        {
          type: 'heading' as const,
          content: 'Types of Color Harmonies',
        },
        {
          type: 'text' as const,
          content:
            'Color harmony is a combination of colors that is perceived as **pleasant and balanced**. Itten described six main types of harmonies, each suited to different design tasks.',
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            {
              term: 'Complementary',
              definition:
                'Two colors positioned opposite each other on the wheel (180\u00B0). Maximum contrast. Example: blue + orange. Ideal for CTA buttons and accents.',
            },
            {
              term: 'Analogous',
              definition:
                'Three colors positioned next to each other on the wheel (30\u00B0 apart). A calm, harmonious palette. Example: blue, blue-green, green. Suited for natural, tranquil interfaces.',
            },
            {
              term: 'Triadic',
              definition:
                'Three colors equally spaced on the wheel (120\u00B0 apart). A vibrant, energetic palette. Example: red, yellow, blue. Suited for creative and children\'s products.',
            },
            {
              term: 'Split-Complementary',
              definition:
                'One color + two colors flanking its complement. Contrast without aggression. Example: blue + yellow-orange + red-orange.',
            },
            {
              term: 'Tetradic (Rectangle)',
              definition:
                'Four colors forming a rectangle on the wheel. A rich palette that is challenging to balance. Example: blue, orange, red, green.',
            },
            {
              term: 'Square',
              definition:
                'Four colors equally spaced on the wheel (90\u00B0 apart). Example: red, yellow-green, blue, red-violet.',
            },
          ],
        },
        {
          type: 'image-placeholder' as const,
          alt: 'Six types of color harmonies on the color wheel',
          caption:
            'Each type of harmony creates its own mood and is suited for different tasks',
        },
        {
          type: 'before-after' as const,
          title: 'Choosing a Harmony for a Landing Page',
          before: {
            label: 'Random Colors',
            description:
              'The designer picked 5 different colors "by eye": pink, green, brown, teal, purple. The palette is chaotic, there is no visual connection, and the interface looks unprofessional.',
          },
          after: {
            label: 'Analogous Harmony',
            description:
              'The designer chose a base blue (220\u00B0) and added two analogous colors: blue-green (195\u00B0) and blue-violet (245\u00B0). The palette is calm, professional, and elements are visually connected.',
          },
        },
        {
          type: 'divider' as const,
        },

        // === WARM AND COOL ===
        {
          type: 'heading' as const,
          content: 'Warm and Cool Colors',
        },
        {
          type: 'text' as const,
          content:
            'The color wheel is divided in half: **warm colors** (red \u2192 yellow) are associated with energy, warmth, and passion. **Cool colors** (green \u2192 violet) are associated with calmness, professionalism, and reliability.',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'Warm Colors',
              items: [
                'Red \u2014 energy, urgency, passion',
                'Orange \u2014 friendliness, optimism, creativity',
                'Yellow \u2014 joy, attention, warning',
                'Visually "bring elements closer"',
                'Increase heart rate and appetite',
                'Common uses: CTAs, promotions, food, entertainment',
              ],
            },
            {
              title: 'Cool Colors',
              items: [
                'Green \u2014 nature, growth, health, money',
                'Blue \u2014 trust, stability, professionalism',
                'Violet \u2014 luxury, mystique, creativity',
                'Visually "push elements away"',
                'Calm and reduce anxiety',
                'Common uses: finance, health, technology, SaaS',
              ],
            },
          ],
        },
        {
          type: 'divider' as const,
        },

        // === COLOR PSYCHOLOGY ===
        {
          type: 'heading' as const,
          content: 'Color Psychology in Industries',
        },
        {
          type: 'text' as const,
          content:
            'Different industries use specific colors deliberately. Behind this lie decades of consumer behavior research and established associations.',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'Healthcare',
              items: [
                'Dominant: blue, light blue, white',
                'Associations: cleanliness, calmness, trust',
                'Examples: Pfizer, Johnson & Johnson, WebMD',
                'Avoid: bright red (association with blood)',
              ],
            },
            {
              title: 'Food & Restaurants',
              items: [
                'Dominant: red, orange, yellow',
                'Associations: appetite, warmth, pleasure',
                'Examples: McDonald\'s, KFC, Burger King',
                'Avoid: blue (suppresses appetite)',
              ],
            },
            {
              title: 'Finance & Banking',
              items: [
                'Dominant: dark blue, green, gray',
                'Associations: stability, growth, reliability',
                'Examples: PayPal, Chase, Fidelity',
                'Avoid: bright, neon colors',
              ],
            },
            {
              title: 'Entertainment',
              items: [
                'Dominant: bright, saturated, gradients',
                'Associations: joy, energy, dynamism',
                'Examples: Spotify, Netflix, Twitch',
                'Avoid: dull, washed-out palettes',
              ],
            },
          ],
        },
        {
          type: 'case-study' as const,
          title: 'Why Is Facebook Blue?',
          company: 'Facebook (Meta)',
          problem:
            'Mark Zuckerberg has color blindness (protanopia) \u2014 blue is the color he sees best. But the decision turned out to be brilliant.',
          solution:
            'Blue evokes trust, is associated with communication and professionalism. It does not fatigue the eyes during prolonged use and works well as a background.',
          result:
            'Blue became the color of social networks: Twitter, LinkedIn, Telegram, VK \u2014 all chose shades of blue. This color became synonymous with "digital trust."',
        },
        {
          type: 'divider' as const,
        },

        // === TOOLS ===
        {
          type: 'heading' as const,
          content: 'Tools for Working with Color',
        },
        {
          type: 'text' as const,
          content:
            'Modern tools allow you to generate palettes, check contrast, and select harmonies in seconds. Here are three must-have tools for a UI designer.',
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            {
              term: 'Coolors.co',
              definition:
                'A palette generator activated by pressing the spacebar. You can lock colors, adjust shades, and export to CSS/Figma. Free.',
            },
            {
              term: 'Adobe Color (color.adobe.com)',
              definition:
                'A color wheel with harmony type selection. Shows palettes from photos, has a library of trending palettes. Integration with Adobe CC.',
            },
            {
              term: 'Realtime Colors (realtimecolors.com)',
              definition:
                'Displays a palette directly on a website mockup in real time. You can change primary, secondary, accent and immediately see the result.',
            },
          ],
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'Start with Realtime Colors \u2014 it best demonstrates how a palette looks on a real interface. Then use Coolors for fine-tuning and Adobe Color for verifying harmonies.',
        },
        {
          type: 'divider' as const,
        },

        // === VIDEOS ===
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=KMS3VwGh3HY',
          title: 'Color Theory for Designers \u2014 The Futur',
          caption:
            'A detailed breakdown of color theory with practical examples',
        },
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=QkCVrNoqcBU',
          title: 'Color in UI Design \u2014 A Practical Framework',
          caption:
            'A practical framework for working with color in interfaces',
        },
        {
          type: 'divider' as const,
        },

        // === SPOTIFY CASE ===
        {
          type: 'case-study' as const,
          title: 'Color as Part of a Brand',
          company: 'Spotify',
          problem:
            'In 2013, Spotify needed to stand out among competitors (Apple Music, Deezer) and create a memorable identity.',
          solution:
            'Spotify chose a vibrant green (#1DB954) \u2014 a color of energy, freshness, and growth. Combined with a black background, it creates a sense of premium quality and modernity. The green stands out among "blue" competitors.',
          result:
            'Spotify green became one of the most recognizable colors in the tech industry. The brand is associated with music, youth, and innovation.',
        },
      ],
      quiz: [
        {
          question: 'Which colors are primary in the Itten color wheel?',
          options: [
            { id: 'a', text: 'Red, green, blue (RGB)' },
            { id: 'b', text: 'Red, yellow, blue (RYB)' },
            { id: 'c', text: 'Cyan, magenta, yellow (CMY)' },
            { id: 'd', text: 'Orange, green, violet' },
          ],
          correctId: 'b',
          explanation:
            'The Itten wheel is based on the RYB system: red, yellow, blue are the three primary colors that cannot be created by mixing.',
        },
        {
          question: 'What is complementary harmony?',
          options: [
            { id: 'a', text: 'Three colors next to each other on the wheel' },
            { id: 'b', text: 'Two colors opposite each other on the wheel (180\u00B0)' },
            { id: 'c', text: 'Three colors 120\u00B0 apart' },
            { id: 'd', text: 'One color at different saturation levels' },
          ],
          correctId: 'b',
          explanation:
            'Complementary harmony consists of two colors positioned opposite each other on the color wheel. They create maximum contrast.',
        },
        {
          question:
            'Why do fast food chains (McDonald\'s, KFC) use red and yellow?',
          options: [
            { id: 'a', text: 'These colors are cheaper to print' },
            {
              id: 'b',
              text: 'Red and yellow stimulate appetite and attract attention',
            },
            { id: 'c', text: 'It is simply tradition with no scientific basis' },
            { id: 'd', text: 'These colors are more visible at night' },
          ],
          correctId: 'b',
          explanation:
            'Red increases heart rate and stimulates appetite, yellow attracts attention and is associated with joy. Together they create a feeling of energy and the desire to eat.',
        },
        {
          question: 'What does the letter H stand for in the HSL model?',
          options: [
            { id: 'a', text: 'Height' },
            { id: 'b', text: 'Harmony' },
            { id: 'c', text: 'Hue' },
            { id: 'd', text: 'Highlight' },
          ],
          correctId: 'c',
          explanation:
            'H stands for Hue \u2014 the position of a color on the wheel from 0\u00B0 to 360\u00B0. S is Saturation, L is Lightness.',
        },
      ],
    },

    // ========================================================
    // PART 2 — Color in Practice
    // ========================================================
    {
      id: 'part-2',
      title: 'Color in Practice',
      subtitle:
        'The 60-30-10 rule, color in UI, palettes for different products, accessibility and dark theme',
      duration: '45 min',
      sections: [
        // === THE 60-30-10 RULE ===
        {
          type: 'heading' as const,
          content: 'The 60-30-10 Rule',
        },
        {
          type: 'text' as const,
          content:
            'The **60-30-10** rule originated from interior design and has become the gold standard in UI design. It defines the proportions of color usage in an interface to create visual balance.',
        },
        {
          type: 'diagram' as const,
          title: 'The 60-30-10 Color Distribution',
          description:
            'Three color levels form the visual hierarchy of an interface',
          items: [
            '60% \u2014 Dominant color (background, large surfaces). Usually neutral: white, light gray, dark gray.',
            '30% \u2014 Secondary color (cards, navigation, sections). Supports the dominant, adds depth.',
            '10% \u2014 Accent color (CTA buttons, links, indicator icons). Draws attention to key actions.',
          ],
        },
        {
          type: 'before-after' as const,
          title: 'Applying the 60-30-10 Rule',
          before: {
            label: 'Without the Rule',
            description:
              'All interface elements are painted in bright colors in roughly equal proportions. Blue background, red buttons, green navigation, orange cards. The eye has nothing to focus on, everything screams, the CTA gets lost.',
          },
          after: {
            label: 'With the 60-30-10 Rule',
            description:
              'White background (60%), light gray cards and navigation (30%), blue CTA buttons and accents (10%). The eye immediately finds the main action, the interface breathes.',
          },
        },
        {
          type: 'callout' as const,
          variant: 'example' as const,
          content:
            'Notion example: white background (60%), light gray sidebar and dividers (30%), black text + blue links as accents (10%). Minimalism that works.',
        },
        {
          type: 'divider' as const,
        },

        // === COLOR IN UI ===
        {
          type: 'heading' as const,
          content: 'Color Roles in an Interface',
        },
        {
          type: 'text' as const,
          content:
            'In UI design, every color serves a specific **function**. A designer doesn\'t just "paint" elements \u2014 they create a system where color conveys information.',
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            {
              term: 'Background',
              definition:
                'Main background: white / off-white (#FAFAFA) in light theme, dark gray (#121212) in dark theme. Not pure white or pure black \u2014 this reduces eye strain.',
            },
            {
              term: 'Text',
              definition:
                'Primary text: dark gray (#1A1A1A) on light background, light gray (#E0E0E0) on dark background. Secondary text is 40\u201350% less contrasting.',
            },
            {
              term: 'Primary (Main Brand Color)',
              definition:
                'The main accent color: CTA buttons, active states, links. There should be one \u2014 two at most.',
            },
            {
              term: 'States',
              definition:
                'Hover: primary + 10% darker. Active: primary + 20% darker. Disabled: 40% opacity. Focus: ring / outline in primary color.',
            },
            {
              term: 'Feedback Colors',
              definition:
                'Success \u2014 green (#22C55E). Error \u2014 red (#EF4444). Warning \u2014 yellow (#EAB308). Info \u2014 blue (#3B82F6). These colors are universal.',
            },
          ],
        },
        {
          type: 'before-after' as const,
          title: 'Feedback Colors in Forms',
          before: {
            label: 'Without a Feedback System',
            description:
              'All form fields look the same: gray border. On error \u2014 gray-colored text saying "Error." The user doesn\'t understand what exactly is wrong or where.',
          },
          after: {
            label: 'With a Color Feedback System',
            description:
              'Invalid field \u2014 red border + red error text + red icon. Successfully filled \u2014 green checkmark. Warning \u2014 yellow icon. The user instantly reads the status of each field.',
          },
        },
        {
          type: 'divider' as const,
        },

        // === PALETTES FOR DIFFERENT PRODUCTS ===
        {
          type: 'heading' as const,
          content: 'Creating Palettes for Different Product Types',
        },
        {
          type: 'text' as const,
          content:
            'Different product types require different approaches to color. Let\'s compare palettes for four typical UI designer tasks.',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'Web Landing Page',
              items: [
                'Primary: bright, saturated (to attract attention)',
                'Background: white or off-white',
                'Accent: contrasting to primary for CTA',
                'Text: dark gray (#1A1A1A)',
                'Few colors: 2\u20133 + neutrals',
                'Gradients are acceptable for hero sections',
              ],
            },
            {
              title: 'Mobile App',
              items: [
                'Primary: medium saturation (comfortable for eyes)',
                'Background: pure white or system default',
                'Navigation: neutral, non-distracting',
                'Accent: one bright color for main actions',
                'Consider system dark mode',
                'Minimum colors: 1 primary + 1 accent',
              ],
            },
            {
              title: 'SaaS Dashboard',
              items: [
                'Primary: calm, professional (blue, indigo)',
                'Sidebar: dark or gray',
                'Content area: light, airy',
                'Many neutral grays for data',
                'Accent only for actions and alerts',
                'Color hierarchy is critical: lots of data',
              ],
            },
            {
              title: 'Data Visualization',
              items: [
                'A set of 6\u20138 distinguishable colors',
                'Colors must differ in grayscale too (for print)',
                'Avoid red-green pairs (color blindness)',
                'Sequential scales: from light to dark',
                'Categorical: maximally different hues',
                'Tool: ColorBrewer2.org',
              ],
            },
          ],
        },
        {
          type: 'divider' as const,
        },

        // === AIRBNB CASE ===
        {
          type: 'case-study' as const,
          title: 'Color Palette Rebrand',
          company: 'Airbnb',
          problem:
            'In 2014, Airbnb looked like a typical startup with a blue color \u2014 it blended in among competitors (Booking, Expedia). It needed its own color identity.',
          solution:
            'The team chose "Rausch Pink" (#FF5A5F) \u2014 a warm coral associated with hospitality, the warmth of home, and humanity. They complemented it with dark gray for text and white for the background.',
          result:
            'Airbnb became instantly recognizable. The coral color set the brand apart from the "blue sea" of competitors and conveyed the core idea \u2014 a warm welcome and belonging.',
          steps: [
            {
              title: 'Audit',
              description: 'Analyzed the colors of all competitors in the travel industry \u2014 90% used blue.',
            },
            {
              title: 'Hypothesis',
              description: 'A warm color would better convey the idea of "belong anywhere" (feel at home).',
            },
            {
              title: 'Testing',
              description: 'Tested 5 shades of pink/coral with focus groups.',
            },
            {
              title: 'Implementation',
              description: 'Rausch Pink became the primary color for the logo, buttons, and key elements.',
            },
          ],
        },
        {
          type: 'divider' as const,
        },

        // === NOTION ===
        {
          type: 'case-study' as const,
          title: 'A Minimalist Palette as a Competitive Advantage',
          company: 'Notion',
          problem:
            'Notion is a tool for notes, databases, and project management. Users spend hours in it daily. How do you create an interface that doesn\'t cause fatigue?',
          solution:
            'A nearly colorless interface: white background, black text, gray dividers. Color is used minimally \u2014 only for page icons and user labels. This allows content to be the center of attention.',
          result:
            'Notion became the standard of "quiet design." Users describe it as a "blank canvas" that doesn\'t impose a style. Minimalism of color is a competitive advantage.',
        },
        {
          type: 'divider' as const,
        },

        // === ACCESSIBILITY ===
        {
          type: 'heading' as const,
          content: 'Color Accessibility (WCAG)',
        },
        {
          type: 'text' as const,
          content:
            'Approximately **8% of men and 0.5% of women** have color vision deficiencies. The **WCAG 2.1** standard defines minimum contrast requirements so that interfaces are readable for everyone.',
        },
        {
          type: 'key-concepts' as const,
          concepts: [
            {
              term: 'Contrast Ratio',
              definition:
                'The brightness ratio between two colors. For example, black on white = 21:1 (maximum). WCAG AA requires a minimum of 4.5:1 for text, 3:1 for large text.',
            },
            {
              term: 'WCAG AA',
              definition:
                'Minimum standard: text contrast \u2265 4.5:1, large text \u2265 3:1. Required for most products.',
            },
            {
              term: 'WCAG AAA',
              definition:
                'Enhanced standard: text contrast \u2265 7:1, large text \u2265 4.5:1. Recommended for healthcare, government, and education.',
            },
            {
              term: 'Not Just Color',
              definition:
                'Information must not be conveyed by color alone. Use icons, text, and patterns. Example: error = red + \u2715 icon + "Error" text.',
            },
          ],
        },
        {
          type: 'before-after' as const,
          title: 'Text Contrast on a Colored Background',
          before: {
            label: 'Insufficient Contrast',
            description:
              'Light gray text (#999) on a white background (#FFF). Contrast 2.85:1 \u2014 doesn\'t even pass AA. A thin font makes the problem worse. Text is virtually unreadable for users with impaired vision.',
          },
          after: {
            label: 'Sufficient Contrast',
            description:
              'Dark gray text (#4A4A4A) on a white background (#FFF). Contrast 7.73:1 \u2014 passes even AAA. Text is comfortably readable by all users under any lighting conditions.',
          },
        },
        {
          type: 'before-after' as const,
          title: 'Color as the Only Indicator',
          before: {
            label: 'Color Only',
            description:
              'Required form fields are marked only by a red border. A colorblind person cannot distinguish a red border from a gray one. No text hint is provided.',
          },
          after: {
            label: 'Color + Text + Icon',
            description:
              'Required fields are marked with an asterisk (*), a red border, and the text "Required field." Three channels of information \u2014 color, text, symbol.',
          },
        },
        {
          type: 'callout' as const,
          variant: 'warning' as const,
          content:
            'Never use red and green as the only way to distinguish "error" and "success." Approximately 4.5% of men cannot tell these colors apart (protanopia and deuteranopia). Always add text or an icon.',
        },
        {
          type: 'divider' as const,
        },

        // === DARK THEME ===
        {
          type: 'heading' as const,
          content: 'Dark Theme: Color Adaptation',
        },
        {
          type: 'text' as const,
          content:
            'A dark theme is not an inversion of the light one. It is a **separate color system** with its own rules. The main mistake is using pure black (#000) as the background and simply inverting colors.',
        },
        {
          type: 'columns' as const,
          columns: [
            {
              title: 'Dark Theme Rules',
              items: [
                'Background: dark gray (#121212, #1E1E1E), NOT black',
                'Layers: each level 1\u20133% lighter than the previous one',
                'Text: #E0E0E0 (87% opacity), not pure white',
                'Secondary text: #A0A0A0 (60% opacity)',
                'Primary color: reduce saturation by 10\u201320%',
                'Replace shadows with lighter borders',
              ],
            },
            {
              title: 'Common Mistakes',
              items: [
                'Black background (#000) \u2014 too much contrast, causes fatigue',
                'Pure white text (#FFF) \u2014 hard on the eyes',
                'Same saturated colors \u2014 they vibrate on a dark background',
                'Inverting all colors \u2014 breaks the hierarchy',
                'Forgetting about shadows \u2014 elements "sink" into the background',
                'Not testing in real conditions (at night)',
              ],
            },
          ],
        },
        {
          type: 'before-after' as const,
          title: 'Adapting the Primary Color for Dark Theme',
          before: {
            label: 'Same Color',
            description:
              'Primary blue (#2563EB) on a dark background (#121212). The saturated blue "vibrates," creates discomfort, and text on the button is hard to read.',
          },
          after: {
            label: 'Adapted Color',
            description:
              'Primary blue desaturated (#60A5FA) on a dark background (#121212). Soft, comfortable for the eyes, text on the button reads well. Saturation reduced, lightness increased.',
          },
        },
        {
          type: 'divider' as const,
        },

        // === CHECKLIST ===
        {
          type: 'heading' as const,
          content: 'Checklist: Creating an Accessible Color Palette',
        },
        {
          type: 'checklist' as const,
          title: 'Checklist for Creating an Accessible Color Palette',
          items: [
            'Choose a primary color that matches the industry and target audience',
            'Build a palette based on a harmony type (analogous for calm, complementary for contrast)',
            'Verify 60-30-10 proportions on main screens',
            'Define feedback colors: success, error, warning, info',
            'Check text contrast against WCAG AA (\u2265 4.5:1) \u2014 use WebAIM Contrast Checker',
            'Ensure information is not conveyed by color alone (+ text, icons)',
            'Test the palette through a color blindness simulator (Stark, Figma plugin)',
            'Create dark theme variants: reduce saturation, increase lightness',
            'Do not use pure black (#000) or pure white (#FFF)',
            'Test the palette on a real device under different lighting conditions',
            'Document the palette: CSS variables / Design Tokens in Figma',
            'Get a review from a colleague or mentor before finalizing',
          ],
        },
        {
          type: 'divider' as const,
        },

        // === VIDEOS ===
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=9S8LGdpNh4Q',
          title: 'How to Choose Colors \u2014 Design Course',
          caption:
            'A step-by-step process for creating a UI color palette',
        },
        {
          type: 'video' as const,
          src: 'https://www.youtube.com/watch?v=eqZqx6lRPe0',
          title: 'Dark Mode Design \u2014 Tips & Tricks',
          caption:
            'How to properly adapt a palette for dark theme',
        },
        {
          type: 'divider' as const,
        },

        // === BEFORE-AFTER FULL EXAMPLE ===
        {
          type: 'heading' as const,
          content: 'Before and After: A Complete Palette Redesign',
        },
        {
          type: 'before-after' as const,
          title: 'Dental Clinic Landing Page',
          before: {
            label: 'Unprofessional Palette',
            description:
              'Bright red background (#FF0000), yellow text, green buttons. Associations: anxiety, blood, cheapness. Contrast of yellow text on red \u2014 1.5:1 (unreadable). Patients leave the site.',
          },
          after: {
            label: 'Professional Palette',
            description:
              'White background, dark blue text (#1E3A5F), light blue primary (#4A90D9), soft mint accent. Associations: cleanliness, calmness, trust. Text contrast 12.5:1 (AAA). Patients book appointments.',
          },
        },
        {
          type: 'before-after' as const,
          title: 'Analytics Dashboard',
          before: {
            label: 'Color Overload',
            description:
              'Each widget has its own bright background (red, blue, green, orange). Charts in neon colors. 12+ colors with no system. Eyes fatigue within 5 minutes.',
          },
          after: {
            label: 'Systematized Palette',
            description:
              'Neutral background, cards with subtle shadow. One primary (indigo) for actions. Charts in a sequential scale of a single hue (from light blue to dark blue). 5 colors + neutrals.',
          },
        },
        {
          type: 'divider' as const,
        },

        // === SUMMARY ===
        {
          type: 'heading' as const,
          content: 'Summary: Key Principles of Working with Color',
        },
        {
          type: 'diagram' as const,
          title: 'The Formula for a Successful Color Palette',
          description:
            'Five steps from idea to finished palette',
          items: [
            '1. Determine the mood and industry \u2192 choose a hue range',
            '2. Select a harmony type \u2192 build a palette of 3\u20135 colors',
            '3. Apply the 60-30-10 rule \u2192 distribute across the interface',
            '4. Add feedback colors \u2192 success, error, warning, info',
            '5. Verify accessibility \u2192 contrast, color blindness, dark theme',
          ],
        },
        {
          type: 'callout' as const,
          variant: 'tip' as const,
          content:
            'The best way to learn to work with color is to analyze palettes of real products. Install the ColorZilla extension for Chrome and start "deconstructing" the colors of your favorite websites and apps.',
        },
      ],
      quiz: [
        {
          question: 'What does the 60-30-10 rule mean?',
          options: [
            {
              id: 'a',
              text: '60% animations, 30% static, 10% video',
            },
            {
              id: 'b',
              text: '60% dominant color, 30% secondary, 10% accent',
            },
            {
              id: 'c',
              text: '60px heading, 30px subheading, 10px text',
            },
            {
              id: 'd',
              text: '60 colors in a palette, 30 in light theme, 10 in dark theme',
            },
          ],
          correctId: 'b',
          explanation:
            'The 60-30-10 rule defines proportions: 60% is the dominant color (usually background), 30% is secondary (navigation, cards), 10% is accent (buttons, links).',
        },
        {
          question:
            'What is the minimum text contrast required by WCAG AA?',
          options: [
            { id: 'a', text: '2:1' },
            { id: 'b', text: '3:1' },
            { id: 'c', text: '4.5:1' },
            { id: 'd', text: '7:1' },
          ],
          correctId: 'c',
          explanation:
            'WCAG AA requires a contrast of \u2265 4.5:1 for regular text and \u2265 3:1 for large text (\u2265 18pt). WCAG AAA requires \u2265 7:1 for regular text.',
        },
        {
          question: 'What background is recommended for dark theme?',
          options: [
            { id: 'a', text: 'Pure black (#000000)' },
            {
              id: 'b',
              text: 'Dark gray (#121212 or #1E1E1E)',
            },
            { id: 'c', text: 'Dark blue (#000033)' },
            { id: 'd', text: 'Any dark color \u2014 it makes no difference' },
          ],
          correctId: 'b',
          explanation:
            'A pure black background (#000) creates too much contrast with white text \u2014 the eyes fatigue. Dark gray (#121212) is softer and allows building hierarchy through "elevation" of layers.',
        },
        {
          question:
            'Why can\'t information be conveyed by color alone?',
          options: [
            { id: 'a', text: 'It looks unattractive' },
            {
              id: 'b',
              text: 'About 8% of men have color vision deficiencies',
            },
            { id: 'c', text: 'Colors look different on different monitors' },
            { id: 'd', text: 'WCAG prohibits the use of color entirely' },
          ],
          correctId: 'b',
          explanation:
            'About 8% of men and 0.5% of women have color vision deficiencies (color blindness). If information is conveyed only by color, these users will not receive it. Always supplement color with text or an icon.',
        },
      ],
    },
  ],
}
