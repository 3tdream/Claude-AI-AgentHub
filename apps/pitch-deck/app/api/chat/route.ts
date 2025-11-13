import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'test-key',
});

// Test mode parser - intelligently handles requests without API
function parseTestModeRequest(message: string, deck: any, currentSlide: number) {
  const lowerMessage = message.toLowerCase();
  const actions: any[] = [];
  let responseMessage = '';

  // Color scheme changes
  if (lowerMessage.includes('color') || lowerMessage.includes('blue') || lowerMessage.includes('purple') ||
      lowerMessage.includes('green') || lowerMessage.includes('warm') || lowerMessage.includes('cool')) {
    let colorSchemeName = 'Indigo-Purple-Pink';

    if (lowerMessage.includes('blue') && lowerMessage.includes('purple')) colorSchemeName = 'Blue-Purple';
    else if (lowerMessage.includes('emerald') || lowerMessage.includes('cyan')) colorSchemeName = 'Emerald-Cyan';
    else if (lowerMessage.includes('green') || lowerMessage.includes('teal')) colorSchemeName = 'Green-Teal';
    else if (lowerMessage.includes('warm') || lowerMessage.includes('amber') || lowerMessage.includes('red')) colorSchemeName = 'Amber-Red';
    else if (lowerMessage.includes('violet') || lowerMessage.includes('fuchsia')) colorSchemeName = 'Violet-Fuchsia';
    else if (lowerMessage.includes('rose') || lowerMessage.includes('orange')) colorSchemeName = 'Rose-Orange';

    actions.push({ type: 'change_color_scheme', colorSchemeName });
    responseMessage = `I've changed the color scheme to ${colorSchemeName}. The deck now has a fresh new look!`;
  }

  // Title changes
  else if (lowerMessage.includes('change') && lowerMessage.includes('title') ||
           lowerMessage.includes('update') && lowerMessage.includes('title')) {
    const titleMatch = message.match(/["']([^"']+)["']/);
    const newTitle = titleMatch ? titleMatch[1] : 'Updated Title';

    actions.push({
      type: 'update_slide',
      slideIndex: currentSlide,
      updates: { title: newTitle }
    });
    responseMessage = `I've updated the title to "${newTitle}". Looking great!`;
  }

  // Subtitle changes
  else if (lowerMessage.includes('subtitle')) {
    const subtitleMatch = message.match(/["']([^"']+)["']/);
    const newSubtitle = subtitleMatch ? subtitleMatch[1] : 'Updated Subtitle';

    actions.push({
      type: 'update_slide',
      slideIndex: currentSlide,
      updates: { subtitle: newSubtitle }
    });
    responseMessage = `I've updated the subtitle to "${newSubtitle}".`;
  }

  // Add bullet point
  else if (lowerMessage.includes('add') && (lowerMessage.includes('bullet') || lowerMessage.includes('point'))) {
    const slide = deck.slides[currentSlide];
    if (slide.points) {
      const newPoint = message.match(/about (.+)/i)?.[1] || 'New important point';
      const updatedPoints = [...slide.points, newPoint];

      actions.push({
        type: 'update_slide',
        slideIndex: currentSlide,
        updates: { points: updatedPoints }
      });
      responseMessage = `I've added the bullet point: "${newPoint}"`;
    } else {
      responseMessage = 'This slide type doesn\'t support bullet points. Try a problem or solution slide.';
    }
  }

  // Add new slide
  else if (lowerMessage.includes('add') && lowerMessage.includes('slide')) {
    let slideType = 'problem';
    if (lowerMessage.includes('problem')) slideType = 'problem';
    else if (lowerMessage.includes('solution')) slideType = 'solution';
    else if (lowerMessage.includes('market')) slideType = 'market';
    else if (lowerMessage.includes('team')) slideType = 'team';
    else if (lowerMessage.includes('traction')) slideType = 'traction';
    else if (lowerMessage.includes('business') || lowerMessage.includes('pricing')) slideType = 'business';
    else if (lowerMessage.includes('ask') || lowerMessage.includes('investment')) slideType = 'ask';

    const content = getDefaultSlideContent(slideType);
    actions.push({
      type: 'add_slide',
      slideType,
      position: -1,
      content
    });
    responseMessage = `I've added a new ${slideType} slide to your deck!`;
  }

  // Remove slide
  else if (lowerMessage.includes('remove') || lowerMessage.includes('delete')) {
    const slideMatch = message.match(/slide (\d+)/i);
    const slideIndex = slideMatch ? parseInt(slideMatch[1]) - 1 : currentSlide;

    actions.push({
      type: 'remove_slide',
      slideIndex
    });
    responseMessage = `I've removed slide ${slideIndex + 1} from your deck.`;
  }

  // Update metrics/data
  else if (lowerMessage.includes('metric') || lowerMessage.includes('revenue') || lowerMessage.includes('users')) {
    const slide = deck.slides[currentSlide];
    if (slide.metrics) {
      const valueMatch = message.match(/(\$?\d+[KMB]?\+?|[\d.]+%)/);
      const labelMatch = message.match(/(revenue|users|growth|nps)/i);

      if (valueMatch && labelMatch) {
        const updatedMetrics = slide.metrics.map((m: any) =>
          m.label.toLowerCase().includes(labelMatch[1].toLowerCase())
            ? { ...m, value: valueMatch[1] }
            : m
        );

        actions.push({
          type: 'update_slide',
          slideIndex: currentSlide,
          updates: { metrics: updatedMetrics }
        });
        responseMessage = `I've updated the ${labelMatch[1]} metric to ${valueMatch[1]}!`;
      }
    } else {
      responseMessage = 'This slide doesn\'t have metrics. Try a traction slide.';
    }
  }

  // Default helpful response
  else {
    responseMessage = `I understand you want to make changes. Here are some things you can try:

• "Change the title to 'New Title'"
• "Make the deck blue and purple"
• "Add a new problem slide"
• "Add a bullet point about cost savings"
• "Update the revenue metric to $1M"
• "Remove slide 3"

What would you like to change?`;
  }

  return { message: responseMessage, actions };
}

function getDefaultSlideContent(slideType: string) {
  switch (slideType) {
    case 'problem':
      return {
        title: 'Key Challenges',
        points: ['Challenge 1', 'Challenge 2', 'Challenge 3']
      };
    case 'solution':
      return {
        title: 'Our Solution',
        description: 'An innovative approach to solving key challenges',
        features: ['Feature 1', 'Feature 2', 'Feature 3']
      };
    case 'market':
      return {
        title: 'Market Opportunity',
        stat: '$XXB',
        description: 'Total Addressable Market',
        details: 'Growing market with significant potential'
      };
    case 'team':
      return {
        title: 'Our Team',
        members: [
          { name: 'Team Member', role: 'CEO', background: 'Industry veteran' }
        ]
      };
    case 'traction':
      return {
        title: 'Traction',
        metrics: [
          { label: 'Metric', value: 'Value' }
        ]
      };
    case 'business':
      return {
        title: 'Pricing',
        tiers: [
          { name: 'Basic', price: '$XX', users: 'Small teams' }
        ]
      };
    case 'ask':
      return {
        title: 'The Ask',
        amount: '$X Million',
        usage: 'Product • Marketing • Team',
        goal: 'Achieve key milestones'
      };
    default:
      return { title: 'New Slide' };
  }
}

// Define tools for Claude to use
const tools: Anthropic.Tool[] = [
  {
    name: 'update_slide_content',
    description: 'Update the content of a specific slide. Use this when the user wants to change text, titles, descriptions, bullet points, or any textual content on a slide.',
    input_schema: {
      type: 'object',
      properties: {
        slideIndex: {
          type: 'number',
          description: 'The index of the slide to update (0-based)',
        },
        updates: {
          type: 'object',
          description: 'Object containing the fields to update. Can include: title, subtitle, content, description, points (array), features (array), stat, details, amount, usage, goal, etc.',
        },
      },
      required: ['slideIndex', 'updates'],
    },
  },
  {
    name: 'change_color_scheme',
    description: 'Change the color scheme of the entire deck. Use this when the user wants to change colors, make it warmer/cooler, or switch to a different palette.',
    input_schema: {
      type: 'object',
      properties: {
        colorSchemeName: {
          type: 'string',
          description: 'The name of the color scheme to apply. Options: "Indigo-Purple-Pink" (default, vibrant), "Emerald-Cyan" (fresh, tech), "Amber-Red" (warm, energetic), "Violet-Fuchsia" (creative, bold), "Blue-Purple" (professional, trustworthy), "Green-Teal" (nature, growth), "Rose-Orange" (vibrant, friendly)',
        },
      },
      required: ['colorSchemeName'],
    },
  },
  {
    name: 'add_new_slide',
    description: 'Add a new slide to the deck. Use this when the user wants to create or add a new slide.',
    input_schema: {
      type: 'object',
      properties: {
        slideType: {
          type: 'string',
          description: 'Type of slide to add. Options: "title", "problem", "solution", "market", "business", "traction", "team", "ask"',
        },
        position: {
          type: 'number',
          description: 'Position to insert the slide (0-based index). Use -1 to add at the end.',
        },
        content: {
          type: 'object',
          description: 'Initial content for the slide based on type',
        },
      },
      required: ['slideType', 'position', 'content'],
    },
  },
  {
    name: 'remove_slide',
    description: 'Remove a slide from the deck. Use this when the user wants to delete or remove a slide.',
    input_schema: {
      type: 'object',
      properties: {
        slideIndex: {
          type: 'number',
          description: 'The index of the slide to remove (0-based)',
        },
      },
      required: ['slideIndex'],
    },
  },
  {
    name: 'update_slide_data',
    description: 'Update data-driven content like metrics, pricing tiers, or team members. Use this for numerical data or structured information.',
    input_schema: {
      type: 'object',
      properties: {
        slideIndex: {
          type: 'number',
          description: 'The index of the slide to update (0-based)',
        },
        dataType: {
          type: 'string',
          description: 'Type of data to update: "metrics", "pricing", "team"',
        },
        data: {
          type: 'object',
          description: 'The data to update. For metrics: {label, value}[]. For pricing: {name, price, users}[]. For team: {name, role, background}[]',
        },
      },
      required: ['slideIndex', 'dataType', 'data'],
    },
  },
  {
    name: 'add_slide_image',
    description: 'Add or update an image on a slide. Can generate an image description for AI generation or accept an image URL.',
    input_schema: {
      type: 'object',
      properties: {
        slideIndex: {
          type: 'number',
          description: 'The index of the slide to add an image to (0-based)',
        },
        imageDescription: {
          type: 'string',
          description: 'Description of the image to generate (will be used with image generation API)',
        },
        imageStyle: {
          type: 'string',
          description: 'How to display the image: "background" (full slide), "corner" (top-right corner), "center" (centered)',
        },
        imageUrl: {
          type: 'string',
          description: 'Optional: Direct URL to an image if not generating',
        },
      },
      required: ['slideIndex', 'imageStyle'],
    },
  },
  {
    name: 'reorder_slides',
    description: 'Reorder slides in the deck. Use this when the user wants to move slides around or change the order.',
    input_schema: {
      type: 'object',
      properties: {
        fromIndex: {
          type: 'number',
          description: 'The current index of the slide to move (0-based)',
        },
        toIndex: {
          type: 'number',
          description: 'The new index position for the slide (0-based)',
        },
      },
      required: ['fromIndex', 'toIndex'],
    },
  },
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message: string = body.message;
    const deck: any = body.deck;
    const currentSlide: number = body.currentSlide;
    const conversationHistory: any[] = body.conversationHistory || [];

    // Check if API key is valid - use test mode if not
    const useTestMode = !process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'test-key';

    // TEST MODE - No API required
    if (useTestMode) {
      console.log('🧪 Using TEST MODE - No API credits required');
      const testResult = parseTestModeRequest(message, deck, currentSlide);

      return NextResponse.json({
        message: `[TEST MODE] ${testResult.message}`,
        actions: testResult.actions,
        usage: { input_tokens: 0, output_tokens: 0 },
        testMode: true
      });
    }

    // Build context about the current deck
    const deckContext = `
Current Deck Information:
- Title: ${deck.title}
- Description: ${deck.description}
- Number of Slides: ${deck.slides.length}
- Current Slide: ${currentSlide + 1} (index ${currentSlide})
- Color Scheme: ${JSON.stringify(deck.colorScheme)}

Slides Overview:
${deck.slides.map((slide: any, index: number) => {
  return `${index + 1}. ${slide.type.toUpperCase()}: ${slide.title || 'Untitled'}`;
}).join('\n')}

Current Slide Detail (Slide ${currentSlide + 1}):
${JSON.stringify(deck.slides[currentSlide], null, 2)}
`;

    const systemPrompt = `You are an AI assistant helping users edit their pitch deck presentations. You have access to tools that can:

1. Update slide content (text, titles, descriptions, bullet points)
2. Change the deck's color scheme
3. Add new slides with AI-generated content
4. Remove slides
5. Update data (metrics, pricing, team members)
6. Add images to slides
7. Reorder slides

When users ask to make changes:
- Use the appropriate tools to make the requested changes
- Be conversational and helpful in your responses
- Confirm what changes you're making
- If a request is ambiguous, ask clarifying questions
- Provide suggestions for improvements when appropriate

Available color schemes:
- "Indigo-Purple-Pink" - Default, vibrant and modern
- "Emerald-Cyan" - Fresh, tech-focused
- "Amber-Red" - Warm and energetic
- "Violet-Fuchsia" - Creative and bold
- "Blue-Purple" - Professional and trustworthy
- "Green-Teal" - Nature and growth
- "Rose-Orange" - Vibrant and friendly

Slide types and their content structure:
- title: {title, subtitle, content}
- problem: {title, points: string[]}
- solution: {title, description, features: string[]}
- market: {title, stat, description, details}
- business: {title, tiers: [{name, price, users}]}
- traction: {title, metrics: [{label, value}]}
- team: {title, members: [{name, role, background}]}
- ask: {title, amount, usage, goal}

Be helpful, creative, and make sure the changes improve the presentation!`;

    // Build messages array with conversation history
    const messages: Anthropic.MessageParam[] = [
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: 'user',
        content: `${deckContext}\n\nUser request: ${message}`,
      },
    ];

    // Call Claude with tools (with error handling for API issues)
    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: systemPrompt,
        messages,
        tools,
      });

      // Extract text response and tool uses
      let aiMessage = '';
      const toolUses: any[] = [];

      for (const block of response.content) {
        if (block.type === 'text') {
          aiMessage += block.text;
        } else if (block.type === 'tool_use') {
          toolUses.push({
            name: block.name,
            input: block.input,
          });
        }
      }

      // Convert tool uses to action format for frontend
      const actions = toolUses.map((tool) => {
        switch (tool.name) {
          case 'update_slide_content':
            return {
              type: 'update_slide',
              slideIndex: tool.input.slideIndex,
              updates: tool.input.updates,
            };
          case 'change_color_scheme':
            return {
              type: 'change_color_scheme',
              colorSchemeName: tool.input.colorSchemeName,
            };
          case 'add_new_slide':
            return {
              type: 'add_slide',
              slideType: tool.input.slideType,
              position: tool.input.position,
              content: tool.input.content,
            };
          case 'remove_slide':
            return {
              type: 'remove_slide',
              slideIndex: tool.input.slideIndex,
            };
          case 'update_slide_data':
            return {
              type: 'update_data',
              slideIndex: tool.input.slideIndex,
              dataType: tool.input.dataType,
              data: tool.input.data,
            };
          case 'add_slide_image':
            return {
              type: 'add_image',
              slideIndex: tool.input.slideIndex,
              imageDescription: tool.input.imageDescription,
              imageStyle: tool.input.imageStyle,
              imageUrl: tool.input.imageUrl,
            };
          case 'reorder_slides':
            return {
              type: 'reorder',
              fromIndex: tool.input.fromIndex,
              toIndex: tool.input.toIndex,
            };
          default:
            return null;
        }
      }).filter(Boolean);

      return NextResponse.json({
        message: aiMessage || "I've made the requested changes to your deck!",
        actions,
        usage: {
          input_tokens: response.usage.input_tokens,
          output_tokens: response.usage.output_tokens,
        },
      });
    } catch (apiError: any) {
      console.error('API Error:', apiError);

      // If error is due to low credits, fall back to test mode
      if (apiError.message && apiError.message.includes('credit balance')) {
        console.log('⚠️ Low credits detected - falling back to TEST MODE');

        const testResult = parseTestModeRequest(message, deck, currentSlide);

        return NextResponse.json({
          message: `[TEST MODE - No API Credits] ${testResult.message}\n\n💡 Add credits to your Anthropic account to use real AI.`,
          actions: testResult.actions,
          usage: { input_tokens: 0, output_tokens: 0 },
          testMode: true
        });
      }

      if (apiError.status === 401) {
        return NextResponse.json(
          { error: 'Invalid Anthropic API key. Please check your .env.local file.' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: apiError.message || 'An error occurred while processing your request.' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Request Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to parse request body.' },
      { status: 400 }
    );
  }
}
