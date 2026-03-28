"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ChatMessage } from "@/types"

interface AiChatMessagesProps {
  messages: ChatMessage[]
}

export function AiChatMessages({ messages }: AiChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((msg) => (
        <motion.div
          key={msg.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("flex gap-2", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}
        >
          <div className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
            msg.role === 'assistant' ? "bg-primary/10" : "bg-muted"
          )}>
            {msg.role === 'assistant' ? (
              <Bot className="w-4 h-4 text-primary" />
            ) : (
              <User className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          <div className={cn(
            "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
            msg.role === 'assistant'
              ? "bg-muted text-foreground rounded-tl-sm"
              : "bg-primary text-primary-foreground rounded-tr-sm"
          )}>
            {msg.content}
          </div>
        </motion.div>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
