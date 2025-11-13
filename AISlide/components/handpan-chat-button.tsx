"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Music } from "lucide-react"
import { HandpanChatPanel } from "./handpan-chat-panel"

export function HandpanChatButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating Chat Button - ChatGPT style */}
      <motion.div
        className="fixed top-20 right-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className="h-14 w-14 rounded-full bg-teal-500 hover:bg-teal-600 shadow-lg hover:shadow-xl transition-all border-2 border-white"
        >
          <Music className="w-6 h-6 text-white" />
        </Button>

        {/* Tooltip */}
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 }}
            className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap"
          >
            <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg">
              Chat with Kaia
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
                <div className="border-4 border-transparent border-l-gray-900"></div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <HandpanChatPanel onClose={() => setIsOpen(false)} />
        )}
      </AnimatePresence>
    </>
  )
}
