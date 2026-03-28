"use client"

import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AiChatPanel } from "./ai-chat-panel"
import { useChatStore } from "@/lib/stores/chat-store"
import { cn } from "@/lib/utils"

export function AiChatButton() {
  const { isOpen, toggleOpen, voiceStatus } = useChatStore()
  const isVoiceActive = voiceStatus !== 'idle'

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={cn(
              "fixed z-50",
              "bottom-24 right-4 w-[390px] max-w-[calc(100vw-2rem)] md:right-6",
              "max-md:inset-0 max-md:bottom-0 max-md:right-0 max-md:w-full max-md:max-w-full max-md:rounded-none"
            )}
          >
            <AiChatPanel />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="fixed bottom-6 right-4 z-50 md:right-6"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={toggleOpen}
          size="icon"
          className={cn(
            "h-14 w-14 rounded-full shadow-xl transition-colors",
            isVoiceActive && !isOpen
              ? "bg-gold hover:bg-gold/90 animate-pulse"
              : "bg-primary hover:bg-primary/90"
          )}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <MessageCircle className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>

        {/* Unread/active indicator */}
        {isVoiceActive && !isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gold border-2 border-background animate-pulse" />
        )}
      </motion.div>
    </>
  )
}
