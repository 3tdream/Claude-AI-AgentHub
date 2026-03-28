"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface VoiceVisualizerProps {
  status: 'connecting' | 'connected' | 'speaking' | 'listening'
}

export function VoiceVisualizer({ status }: VoiceVisualizerProps) {
  const isActive = status === 'speaking' || status === 'listening'

  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          className={cn(
            "w-1 rounded-full",
            status === 'speaking' ? "bg-primary" : status === 'listening' ? "bg-gold" : "bg-muted-foreground/30"
          )}
          animate={isActive ? {
            height: [8, 24 + Math.random() * 16, 8],
          } : status === 'connecting' ? {
            height: [6, 14, 6],
            opacity: [0.3, 0.7, 0.3],
          } : {
            height: 8,
          }}
          transition={isActive ? {
            duration: 0.4 + Math.random() * 0.3,
            repeat: Infinity,
            repeatType: "reverse",
            delay: i * 0.08,
            ease: "easeInOut",
          } : status === 'connecting' ? {
            duration: 0.8,
            repeat: Infinity,
            repeatType: "reverse",
            delay: i * 0.15,
          } : {
            duration: 0.3,
          }}
          style={{ height: 8 }}
        />
      ))}
    </div>
  )
}
