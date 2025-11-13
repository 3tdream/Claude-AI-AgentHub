import React from "react"
import { motion } from "framer-motion"
import type { AgentConfig } from "@/components/avatar-info"
import { BroadcastButton } from "@/components/broadcast-button"
import { AvatarInfo } from "@/components/avatar-info"
import { StatusDisplay } from "@/components/status"
import { MessageControls } from "@/components/message-controls"
import { MuteButton } from "@/components/mute-button"
import { WandButton } from "@/components/wand-button"
import { SecuritySlides } from "@/components/security-slides"
import { useLanguageStore } from "@/hooks/use-language-store"
import { translations } from "@/lib/translations"
import type { Conversation } from "@/lib/conversations"

interface DesktopLayoutProps {
  status: string
  isSessionActive: boolean
  handleStartStopClick: () => Promise<void>
  conversation: Conversation[]
  setConversation: React.Dispatch<React.SetStateAction<Conversation[]>>
  audioStreamRef: React.MutableRefObject<MediaStream | null>
  dataChannelRef: React.MutableRefObject<RTCDataChannel | null>
  agentConfig: AgentConfig
  setAgentConfig: (config: AgentConfig) => void
}

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({
  status,
  isSessionActive,
  handleStartStopClick,
  conversation,
  setConversation,
  audioStreamRef,
  dataChannelRef,
  setAgentConfig,
}) => {
  const { language } = useLanguageStore()
  const t = translations[language]

  return (
    <main className="p-8" style={{ height: 'calc(100vh - 52px)' }} dir={language === 'he' ? 'rtl' : 'ltr'}>
      <div className="h-full grid grid-cols-3 gap-8">
        <motion.div 
          className="col-span-2 overflow-hidden"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SecuritySlides />
        </motion.div>

        <motion.div
          className="col-span-1 overflow-hidden bg-purple-50 bg-[radial-gradient(circle_at_center,_rgba(167,139,250,0.1)_0%,_rgba(167,139,250,0.05)_25%,_transparent_50%)] [background-image:radial-gradient(rgba(167,139,250,0.1)_1px,transparent_1px),radial-gradient(rgba(167,139,250,0.1)_1px,transparent_1px)] [background-size:20px_20px] [background-position:0_0,10px_10px] rounded-xl border border-purple-100/50"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div className="p-6 flex flex-col h-full">
            {/* Top Section */}
            <div className="space-y-4">
              <AvatarInfo 
                onConfigChange={setAgentConfig}
                hideEdit={isSessionActive}
              />
            </div>

            {/* Conversation Section */}
            {isSessionActive && (
              <>
                <div className="h-px bg-border my-6" />
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-light">{t.sections.conversation}</h2>
                  {isSessionActive && (
                    <div className="flex gap-2">
                      <MuteButton audioStream={audioStreamRef.current} />
                      <WandButton dataChannel={dataChannelRef.current} />
                    </div>
                  )}
                </div>
                <motion.div 
                  className="flex-grow overflow-y-auto"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <MessageControls conversation={conversation} />
                </motion.div>
              </>
            )}

            {/* Bottom Section */}
            <div className="mt-auto space-y-4">
              {status && <StatusDisplay status={status} />}
              <div className="flex flex-col items-center">
                <BroadcastButton
                  isSessionActive={isSessionActive}
                  onClick={handleStartStopClick}
                  dataChannel={dataChannelRef.current}
                  setConversation={setConversation}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
