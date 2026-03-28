// Add interface for tools
interface Tool {
    type: 'function';
    name: string;
    description: string;
    parameters?: {
      type: string;
      properties: Record<string, {
        type: string;
        description: string;
      }>;
    };
}

const toolDefinitions = {
    getCurrentSlide: {
        description: 'Gets the content of the current slide including title, description, and key points',
        parameters: {}
    },
    updateCurrentSlideTitle: {
        description: 'Updates the title of the current slide',
        parameters: {
            title: {
                type: 'string',
                description: 'The new title for the current slide'
            }
        }
    },
    updateCurrentSlideDescription: {
        description: 'Updates the description of the current slide',
        parameters: {
            description: {
                type: 'string',
                description: 'The new description for the current slide'
            }
        }
    },
    updateSlideBlock: {
        description: 'Updates a block in the current slide',
        parameters: {
            blockId: {
                type: 'string',
                description: 'The ID of the block to update'
            },
            title: {
                type: 'string',
                description: 'The new title for the block (optional)',
                optional: true
            },
            content: {
                type: 'string',
                description: 'The new content for the block (optional)',
                optional: true
            }
        }
    },
    nextSlide: {
        description: 'Moves to the next slide in the presentation. Returns an error if already at the last slide.',
        parameters: {}
    },
    prevSlide: {
        description: 'Moves to the previous slide in the presentation. Returns an error if already at the first slide.',
        parameters: {}
    },
    getCurrentTime: {
        description: 'Gets the current time in the user\'s timezone',
        parameters: {}
    }
} as const;

const tools: Tool[] = Object.entries(toolDefinitions).map(([name, config]) => ({
    type: "function",
    name,
    description: config.description,
    parameters: {
    type: 'object',
    properties: config.parameters
    }
}));


export type { Tool };
export { tools };
