import { searchDocs, getDocSection, docsMetadata } from '@/lib/docs-metadata'
import { useDocsStore } from './use-docs-store'

/**
 * Documentation AI Tool Implementations
 *
 * These functions are called by the AI assistant to search and navigate documentation.
 */

export function useDocsTools() {
  const { currentSection, navigateToSection } = useDocsStore()

  const tools = {
    /**
     * Search documentation by query
     */
    searchDocs: (args: { query: string }) => {
      const results = searchDocs(args.query)

      if (results.length === 0) {
        return {
          success: false,
          message: "No matching documentation found",
          results: []
        }
      }

      return {
        success: true,
        message: `Found ${results.length} relevant section(s)`,
        results: results.map(r => ({
          id: r.id,
          label: r.label,
          description: r.description,
          content: r.content
        }))
      }
    },

    /**
     * Navigate to a specific section
     */
    navigateToSection: (args: { sectionId: string }) => {
      const section = getDocSection(args.sectionId)

      if (!section) {
        return {
          success: false,
          message: `Section '${args.sectionId}' not found`,
          validSections: docsMetadata.map(s => s.id)
        }
      }

      navigateToSection(args.sectionId)

      return {
        success: true,
        message: `Navigated to ${section.label} section`,
        section: {
          id: section.id,
          label: section.label,
          description: section.description
        }
      }
    },

    /**
     * Get current section information
     */
    getCurrentSection: () => {
      const section = getDocSection(currentSection)

      if (!section) {
        return {
          success: false,
          message: "Current section not found"
        }
      }

      return {
        success: true,
        message: `Currently viewing ${section.label}`,
        section: {
          id: section.id,
          label: section.label,
          description: section.description,
          content: section.content
        }
      }
    },

    /**
     * List all available sections
     */
    listAllSections: () => {
      return {
        success: true,
        message: `Documentation has ${docsMetadata.length} sections`,
        sections: docsMetadata.map(s => ({
          id: s.id,
          label: s.label,
          description: s.description
        }))
      }
    }
  }

  return tools
}

export type DocsTools = ReturnType<typeof useDocsTools>
