"use client"

import { toast } from "sonner"
import { useSlideStore } from "@/hooks/use-slides-store"
import type { SlideBlock } from "@/hooks/use-slides-store"

export const useToolsFunctions = () => {
  const { nextSlide: next, prevSlide: prev, currentSlide, totalSlides, getCurrentSlideContent, updateCurrentSlideTitle, updateCurrentSlideDescription, updateSlideBlock } = useSlideStore()

  const getCurrentSlideFunction = () => {
    const slide = getCurrentSlideContent()
    if (!slide) {
      return {
        success: false,
        message: "No slide content available"
      }
    }

    const formattedBlocks = slide.blocks.map(block => 
      `Block ID: ${block.id}\nTitle: ${block.title}\nContent: ${block.content}`
    ).join('\n\n')

    return {
      success: true,
      content: {
        title: slide.title,
        description: slide.description,
        blocks: formattedBlocks
      },
      message: `Current slide (${currentSlide + 1}/${totalSlides}):\n\nTitle: ${slide.title}\n\nDescription: ${slide.description}\n\nBlocks:\n${formattedBlocks}`
    }
  }

  const nextSlideFunction = () => {
    if (currentSlide >= totalSlides - 1) {
      return {
        success: false,
        message: "Already at the last slide."
      }
    }
    next()
    toast("Next Slide →", {
      description: `Moved to slide ${currentSlide + 2} of ${totalSlides}`,
    })
    return {
      success: true,
      message: `Moved to slide ${currentSlide + 2} of ${totalSlides}`
    }
  }

  const prevSlideFunction = () => {
    if (currentSlide <= 0) {
      return {
        success: false,
        message: "Already at the first slide."
      }
    }
    prev()
    toast("← Previous Slide", {
      description: `Moved to slide ${currentSlide} of ${totalSlides}`,
    })
    return {
      success: true,
      message: `Moved to slide ${currentSlide} of ${totalSlides}`
    }
  }

  const timeFunction = () => {
    const now = new Date()
    return {
      success: true,
      time: now.toLocaleTimeString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      message: "Current time is " + now.toLocaleTimeString() + " in " + Intl.DateTimeFormat().resolvedOptions().timeZone + " timezone."
    }
  }

  const updateCurrentSlideTitleFunction = (args: { title: string }) => {
    const slide = getCurrentSlideContent()
    if (!slide) {
      return {
        success: false,
        message: "No slide content available"
      }
    }
    
    updateCurrentSlideTitle(args.title)
    toast("Slide Title Updated", {
      description: `Updated title to: ${args.title}`,
    })
    
    return {
      success: true,
      message: `Updated slide ${currentSlide + 1} title to: ${args.title}`
    }
  }

  const updateSlideBlockFunction = (args: { blockId: string, title?: string, content?: string }) => {
    const slide = getCurrentSlideContent()
    if (!slide) {
      return {
        success: false,
        message: "No slide content available"
      }
    }

    const block = slide.blocks.find(b => b.id === args.blockId)
    if (!block) {
      return {
        success: false,
        message: `Block with ID ${args.blockId} not found`
      }
    }

    const updates: Partial<SlideBlock> = {}
    if (args.title !== undefined) updates.title = args.title
    if (args.content !== undefined) updates.content = args.content

    updateSlideBlock(args.blockId, updates)
    
    const updateType = args.title && args.content ? "title and content" 
      : args.title ? "title"
      : "content"
    
    toast("Block Updated", {
      description: `Updated block ${updateType}`,
    })
    
    return {
      success: true,
      message: `Updated block ${updateType} successfully`
    }
  }

  const updateCurrentSlideDescriptionFunction = (args: { description: string }) => {
    const slide = getCurrentSlideContent()
    if (!slide) {
      return {
        success: false,
        message: "No slide content available"
      }
    }
    
    updateCurrentSlideDescription(args.description)
    toast("Slide Description Updated", {
      description: `Updated description successfully`,
    })
    
    return {
      success: true,
      message: `Updated slide ${currentSlide + 1} description`
    }
  }

  return {
    getCurrentSlideFunction,
    nextSlideFunction,
    prevSlideFunction,
    timeFunction,
    updateCurrentSlideTitleFunction,
    updateCurrentSlideDescriptionFunction,
    updateSlideBlockFunction
  }
}
