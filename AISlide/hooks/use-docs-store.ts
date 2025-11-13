import { create } from 'zustand'

interface DocsState {
  currentSection: string
  isNavigating: boolean
  setCurrentSection: (section: string) => void
  navigateToSection: (section: string) => void
  setIsNavigating: (isNavigating: boolean) => void
}

export const useDocsStore = create<DocsState>((set) => ({
  currentSection: 'overview',
  isNavigating: false,

  setCurrentSection: (section) => set({ currentSection: section }),

  navigateToSection: (section) => {
    set({ isNavigating: true })

    const element = document.getElementById(section)
    if (element) {
      // Calculate offset for sticky header
      const offset = 140 // Adjust based on your header height
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })

      // Update current section
      set({ currentSection: section })

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
