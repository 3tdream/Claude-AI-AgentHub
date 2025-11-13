/**
 * AI Tool Definitions for Handpan Teaching Assistant
 *
 * These tools enable the AI to search, navigate, and provide personalized
 * handpan instruction.
 */

export const handpanTools = [
  {
    type: "function" as const,
    name: "searchLessons",
    description: "Search through handpan lessons using keywords or questions. Returns relevant lessons and techniques that match the query. Use this when the student asks about handpan techniques, scales, or practice methods.",
    parameters: {
      type: "object" as const,
      properties: {
        query: {
          type: "string" as const,
          description: "The search query or question from the student. Can be keywords, techniques, or natural language questions like 'how to play ghost notes' or 'D Kurd scale' or 'breathing exercises'."
        }
      },
      required: ["query"]
    }
  },
  {
    type: "function" as const,
    name: "navigateToLesson",
    description: "Navigate the student to a specific handpan lesson. Call this after providing instruction to show them the relevant lesson content. Always navigate to the most relevant lesson after answering a question.",
    parameters: {
      type: "object" as const,
      properties: {
        lessonId: {
          type: "string" as const,
          description: "The ID of the lesson to navigate to. Valid IDs: introduction (posture & basics), hand-techniques (strikes & touch), scale-rhythm (scales & patterns), breathing-flow (breath & expression), first-melody (composition), advanced-techniques (ghost notes, slaps, etc)"
        }
      },
      required: ["lessonId"]
    }
  },
  {
    type: "function" as const,
    name: "getCurrentLesson",
    description: "Get information about the currently displayed handpan lesson. Use this to provide context-aware teaching based on what the student is viewing.",
    parameters: {
      type: "object" as const,
      properties: {}
    }
  },
  {
    type: "function" as const,
    name: "listAllLessons",
    description: "List all available handpan lessons with difficulty levels. Use this when the student asks what lessons are available or wants an overview of the curriculum.",
    parameters: {
      type: "object" as const,
      properties: {}
    }
  },
  {
    type: "function" as const,
    name: "suggestPracticeRoutine",
    description: "Suggest a personalized practice routine based on the student's current level. Call this when students ask 'what should I practice' or 'how should I practice' or need guidance on their practice schedule.",
    parameters: {
      type: "object" as const,
      properties: {
        level: {
          type: "string" as const,
          description: "Student's current level: 'absolute-beginner' (never played), 'beginner' (first week-month), 'intermediate' (1-6 months), 'advanced' (6+ months)",
          enum: ["absolute-beginner", "beginner", "intermediate", "advanced"]
        },
        timeAvailable: {
          type: "number" as const,
          description: "Minutes available for practice per day (e.g., 15, 30, 60)"
        }
      },
      required: ["level", "timeAvailable"]
    }
  }
]

export type HandpanToolName = "searchLessons" | "navigateToLesson" | "getCurrentLesson" | "listAllLessons" | "suggestPracticeRoutine"
