/**
 * AI Tool Definitions for Documentation Assistant
 *
 * These tools enable the AI to search, navigate, and provide information about
 * the documentation.
 */

export const docsTools = [
  {
    type: "function" as const,
    name: "searchDocs",
    description: "Search through the documentation using keywords or questions. Returns relevant sections that match the query. Use this when the user asks a question about the project.",
    parameters: {
      type: "object" as const,
      properties: {
        query: {
          type: "string" as const,
          description: "The search query or question from the user. Can be keywords, topics, or natural language questions like 'how to deploy' or 'webrtc setup'."
        }
      },
      required: ["query"]
    }
  },
  {
    type: "function" as const,
    name: "navigateToSection",
    description: "Navigate the user to a specific documentation section. Call this after providing an answer to show the relevant documentation. Always navigate to the most relevant section after answering a question.",
    parameters: {
      type: "object" as const,
      properties: {
        sectionId: {
          type: "string" as const,
          description: "The ID of the section to navigate to. Valid IDs: overview, architecture, claude-agents, components, hooks, api-routes, configuration, local-development, deployment, introduction (handpan intro & posture), hand-techniques, scale-rhythm, breathing-flow, first-melody, advanced-techniques"
        }
      },
      required: ["sectionId"]
    }
  },
  {
    type: "function" as const,
    name: "getCurrentSection",
    description: "Get information about the currently displayed documentation section. Use this to provide context-aware answers.",
    parameters: {
      type: "object" as const,
      properties: {}
    }
  },
  {
    type: "function" as const,
    name: "listAllSections",
    description: "List all available documentation sections. Use this when the user asks what topics are covered or wants an overview of available documentation.",
    parameters: {
      type: "object" as const,
      properties: {}
    }
  }
]

export type DocsToolName = "searchDocs" | "navigateToSection" | "getCurrentSection" | "listAllSections"
