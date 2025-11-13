"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { X, Music, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { BroadcastButton } from "./broadcast-button"
import { StatusDisplay } from "./status"
import { MessageControls } from "./message-controls"
import { MuteButton } from "./mute-button"
import useWebRTCAudioSession from "@/hooks/use-webrtc"
import { handpanTools } from "@/lib/handpan-tools"
import { useHandpanTools } from "@/hooks/use-handpan-tools"

interface HandpanChatPanelProps {
  onClose: () => void
}

export function HandpanChatPanel({ onClose }: HandpanChatPanelProps) {
  const {
    status,
    isSessionActive,
    handleStartStopClick,
    conversation,
    setConversation,
    registerFunction,
    audioStreamRef,
    dataChannelRef
  } = useWebRTCAudioSession(
    "shimmer", // Warm, friendly voice
    handpanTools,
    undefined,
    "/api/handpan-session" // Custom endpoint for handpan teaching
  )

  const toolsFunctions = useHandpanTools()

  useEffect(() => {
    // Register all handpan teaching functions
    Object.entries(toolsFunctions).forEach(([name, func]) => {
      registerFunction(name, func)
    })
  }, [registerFunction, toolsFunctions])

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className="fixed right-4 top-4 bottom-4 z-50 flex items-stretch"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-[450px] flex flex-col overflow-hidden border border-gray-200"
      >
        {/* Header - ChatGPT style */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-teal-500 flex items-center justify-center text-white font-semibold shadow-sm">
                K
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                  Kaia
                  <span className="text-xs text-gray-500 font-normal">• Handpan Teacher</span>
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isSessionActive && (
                <MuteButton audioStream={audioStreamRef.current} />
              )}
              <Button
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content - Conversation Area */}
        <div className="flex-1 overflow-hidden flex flex-col bg-white">
          {!isSessionActive && (
            <div className="flex items-center justify-center h-full px-8 py-12">
              <div className="text-center space-y-6 max-w-sm">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-500 rounded-full shadow-md">
                  <Music className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Your Handpan Teacher
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Start a voice conversation with me to learn techniques, get practice routines, and improve your handpan skills.
                  </p>
                </div>
                <div className="space-y-2 text-left bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Example questions</p>
                  <div className="space-y-1.5 text-sm text-gray-700">
                    <p>• How do I hold the handpan?</p>
                    <p>• Teach me ghost notes</p>
                    <p>• Show me lesson 3</p>
                    <p>• What's the D Kurd scale?</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isSessionActive && (
            <div className="flex-1 overflow-hidden bg-white">
              {conversation.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-3 px-8">
                    <div className="w-12 h-12 mx-auto rounded-full bg-teal-500 flex items-center justify-center text-white font-semibold shadow-sm">
                      K
                    </div>
                    <p className="text-sm text-gray-500">
                      Listening... Start speaking
                    </p>
                  </div>
                </div>
              ) : (
                <MessageControls conversation={conversation} />
              )}
            </div>
          )}
        </div>

        {/* Footer - ChatGPT style */}
        <div className="border-t border-gray-200 bg-white px-4 py-3">
          {status && (
            <div className="mb-2">
              <StatusDisplay status={status} />
            </div>
          )}
          <BroadcastButton
            isSessionActive={isSessionActive}
            onClick={handleStartStopClick}
            dataChannel={dataChannelRef.current}
            setConversation={setConversation}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}
