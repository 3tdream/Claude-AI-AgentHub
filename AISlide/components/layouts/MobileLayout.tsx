import React from "react"
import { motion } from "framer-motion"
import { BroadcastButton } from "@/components/broadcast-button"
import { StatusDisplay } from "@/components/status"
import { MuteButton } from "@/components/mute-button"
import { SecuritySlides } from "@/components/security-slides"
import { useLanguageStore } from "@/hooks/use-language-store"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import type { Conversation } from "@/lib/conversations"

interface MobileLayoutProps {
  status: string
  isSessionActive: boolean
  handleStartStopClick: () => Promise<void>
  setConversation: React.Dispatch<React.SetStateAction<Conversation[]>>
  audioStreamRef: React.MutableRefObject<MediaStream | null>
  dataChannelRef: React.MutableRefObject<RTCDataChannel | null>
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  status,
  isSessionActive,
  handleStartStopClick,
  setConversation,
  audioStreamRef,
  dataChannelRef,
}) => {
  const { language } = useLanguageStore()

  return (
    <main className="relative" style={{ minHeight: 'calc(100vh - 52px)' }} dir={language === 'he' ? 'rtl' : 'ltr'}>
      {/* Main Content */}
      <div className="pb-24">
        <SecuritySlides />
      </div>

      {/* Sticky Control Panel */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-purple-100 shadow-lg"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="px-4 py-4 max-w-lg mx-auto">
          <div className="flex flex-col gap-2 w-full">
            {/* Controls Row */}
            <div className="flex items-center justify-end">
              <MuteButton audioStream={audioStreamRef.current} />
            </div>

            {/* Status and Full-width Button */}
            <div className="w-full">
              {status && (
                <div className="text-sm text-center mb-2">
                  <StatusDisplay status={status} />
                </div>
              )}
              
              {/* Avatar and Button Container */}
              <div className="flex items-center gap-3">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-1 bg-white/50 px-3 py-2 rounded-lg">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/avatars/jacqueline-avatar.png" alt="Jacqueline" />
                  </Avatar>
                  <div className="text-center">
                    <h3 className="text-sm font-medium leading-none">Jacqueline</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">ai buddy</p>
                  </div>
                </div>

                {/* Broadcast Button */}
                <div className="flex-1">
                  <BroadcastButton
                    isSessionActive={isSessionActive}
                    onClick={handleStartStopClick}
                    dataChannel={dataChannelRef.current}
                    setConversation={setConversation}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Safe Area Padding for Mobile */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </motion.div>
    </main>
  )
}
