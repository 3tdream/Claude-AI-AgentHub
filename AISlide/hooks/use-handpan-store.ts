import { create } from 'zustand'

interface HandpanState {
  currentLesson: string
  isNavigating: boolean
  setCurrentLesson: (lesson: string) => void
  navigateToLesson: (lesson: string) => void
  setIsNavigating: (isNavigating: boolean) => void
}

export const useHandpanStore = create<HandpanState>((set) => ({
  currentLesson: 'introduction',
  isNavigating: false,

  setCurrentLesson: (lesson) => set({ currentLesson: lesson }),

  navigateToLesson: (lesson) => {
    set({ isNavigating: true })

    const element = document.getElementById(lesson)
    if (element) {
      // Calculate offset for sticky header
      const offset = 100
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })

      // Update current lesson
      set({ currentLesson: lesson })

      // Reset navigating state after scroll completes
      setTimeout(() => {
        set({ isNavigating: false })
      }, 800)
    } else {
      set({ isNavigating: false })
    }
  },

  setIsNavigating: (isNavigating) => set({ isNavigating })
}))
