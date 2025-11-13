import { searchHandpanLessons, getHandpanLesson, handpanLessons } from '@/lib/handpan-metadata'
import { useHandpanStore } from './use-handpan-store'

/**
 * Handpan AI Tool Implementations
 *
 * These functions are called by the AI teaching assistant to search lessons,
 * navigate content, and provide personalized instruction.
 */

export function useHandpanTools() {
  const { currentLesson, navigateToLesson } = useHandpanStore()

  const tools = {
    /**
     * Search handpan lessons by query
     */
    searchLessons: (args: { query: string }) => {
      const results = searchHandpanLessons(args.query)

      if (results.length === 0) {
        return {
          success: false,
          message: "No matching lessons found for that query",
          results: [],
          suggestion: "Try searching for: 'beginner basics', 'scales', 'rhythm patterns', 'ghost notes', or 'meditation'"
        }
      }

      return {
        success: true,
        message: `Found ${results.length} relevant lesson(s)`,
        results: results.map(r => ({
          id: r.id,
          label: r.label,
          description: r.description,
          difficulty: r.difficulty,
          content: r.content
        }))
      }
    },

    /**
     * Navigate to a specific lesson
     */
    navigateToLesson: (args: { lessonId: string }) => {
      const lesson = getHandpanLesson(args.lessonId)

      if (!lesson) {
        return {
          success: false,
          message: `Lesson '${args.lessonId}' not found`,
          validLessons: handpanLessons.map(l => ({ id: l.id, label: l.label, difficulty: l.difficulty }))
        }
      }

      navigateToLesson(args.lessonId)

      return {
        success: true,
        message: `Navigated to ${lesson.label} lesson`,
        lesson: {
          id: lesson.id,
          label: lesson.label,
          description: lesson.description,
          difficulty: lesson.difficulty
        }
      }
    },

    /**
     * Get current lesson information
     */
    getCurrentLesson: () => {
      const lesson = getHandpanLesson(currentLesson)

      if (!lesson) {
        return {
          success: false,
          message: "Current lesson not found"
        }
      }

      return {
        success: true,
        message: `Currently viewing ${lesson.label}`,
        lesson: {
          id: lesson.id,
          label: lesson.label,
          description: lesson.description,
          difficulty: lesson.difficulty,
          content: lesson.content
        }
      }
    },

    /**
     * List all available lessons
     */
    listAllLessons: () => {
      return {
        success: true,
        message: `Complete handpan curriculum with ${handpanLessons.length} comprehensive lessons`,
        lessons: handpanLessons.map(l => ({
          id: l.id,
          label: l.label,
          description: l.description,
          difficulty: l.difficulty
        })),
        structure: {
          beginner: handpanLessons.filter(l => l.difficulty === 'beginner').length,
          intermediate: handpanLessons.filter(l => l.difficulty === 'intermediate').length,
          advanced: handpanLessons.filter(l => l.difficulty === 'advanced').length
        }
      }
    },

    /**
     * Suggest personalized practice routine
     */
    suggestPracticeRoutine: (args: { level: string; timeAvailable: number }) => {
      const { level, timeAvailable } = args

      const routines: Record<string, any> = {
        'absolute-beginner': {
          focus: 'Building foundation and proper technique',
          routine: timeAvailable >= 30 ? [
            { duration: 5, activity: 'Mindful breathing and centering', lesson: 'introduction' },
            { duration: 10, activity: 'Index finger strikes on ding only', lesson: 'hand-techniques' },
            { duration: 10, activity: 'Exploring each tone field gently', lesson: 'hand-techniques' },
            { duration: 5, activity: 'Free play - just explore sounds', lesson: 'introduction' }
          ] : [
            { duration: 3, activity: 'Mindful breathing', lesson: 'introduction' },
            { duration: 7, activity: 'Index finger strikes practice', lesson: 'hand-techniques' },
            { duration: 5, activity: 'Gentle exploration', lesson: 'hand-techniques' }
          ],
          tip: 'Focus on gentle touch and listening deeply. There\'s no rush - enjoy the journey!'
        },
        'beginner': {
          focus: 'Developing consistent technique and first patterns',
          routine: timeAvailable >= 30 ? [
            { duration: 5, activity: 'Warm up: gentle strikes on each note', lesson: 'hand-techniques' },
            { duration: 10, activity: 'Practice Ding-Side-Ding-Side pattern', lesson: 'scale-rhythm' },
            { duration: 10, activity: 'Learn circular scale exercise', lesson: 'scale-rhythm' },
            { duration: 5, activity: 'Free improvisation with breath awareness', lesson: 'breathing-flow' }
          ] : [
            { duration: 5, activity: 'Warm up with basic strikes', lesson: 'hand-techniques' },
            { duration: 10, activity: 'Rhythm pattern practice', lesson: 'scale-rhythm' }
          ],
          tip: 'Focus on consistency and evenness in your rhythm. Record yourself to track progress!'
        },
        'intermediate': {
          focus: 'Musical expression and composition',
          routine: timeAvailable >= 30 ? [
            { duration: 5, activity: 'Warm up: scales and patterns', lesson: 'scale-rhythm' },
            { duration: 10, activity: 'Practice your 3-4 note melodies', lesson: 'first-melody' },
            { duration: 10, activity: 'Experiment with dynamics and phrasing', lesson: 'breathing-flow' },
            { duration: 5, activity: 'Musical meditation - flow state practice', lesson: 'breathing-flow' }
          ] : [
            { duration: 5, activity: 'Warm up', lesson: 'scale-rhythm' },
            { duration: 10, activity: 'Melody composition work', lesson: 'first-melody' }
          ],
          tip: 'Focus on expressing emotion through dynamics. Play the same melody with different feelings!'
        },
        'advanced': {
          focus: 'Advanced techniques and personal style',
          routine: timeAvailable >= 30 ? [
            { duration: 5, activity: 'Warm up: fundamentals review', lesson: 'hand-techniques' },
            { duration: 10, activity: 'Practice ghost notes and slap technique', lesson: 'advanced-techniques' },
            { duration: 10, activity: 'Explore polyrhythms or odd meters', lesson: 'advanced-techniques' },
            { duration: 5, activity: 'Free composition and experimentation', lesson: 'first-melody' }
          ] : [
            { duration: 5, activity: 'Fundamentals warm up', lesson: 'hand-techniques' },
            { duration: 10, activity: 'Advanced technique focus', lesson: 'advanced-techniques' }
          ],
          tip: 'Challenge yourself with uncomfortable techniques. Record compositions to share with the community!'
        }
      }

      const routine = routines[level]

      if (!routine) {
        return {
          success: false,
          message: 'Invalid level specified',
          validLevels: Object.keys(routines)
        }
      }

      return {
        success: true,
        message: `Here's your personalized ${timeAvailable}-minute practice routine for ${level} level`,
        level,
        timeAvailable,
        focus: routine.focus,
        routine: routine.routine,
        tip: routine.tip,
        weeklyGoal: level === 'absolute-beginner'
          ? 'Practice 4-5 times this week, focusing on consistency'
          : level === 'beginner'
          ? 'Practice daily if possible, even if just 10 minutes'
          : level === 'intermediate'
          ? 'Practice 5-6 times weekly, record yourself once'
          : 'Daily practice with focus on one new technique per week'
      }
    }
  }

  return tools
}

export type HandpanTools = ReturnType<typeof useHandpanTools>
