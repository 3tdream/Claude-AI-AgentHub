'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Mic, MicOff, Send } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import useWebRTCAudioSession from '@/hooks/use-webrtc'
import { useDocsTools } from '@/hooks/use-docs-tools'
import { docsTools } from '@/lib/docs-tools'
import Transcriber from './ui/transcriber'

interface DocsChatPanelProps {
  onClose: () => void
}

export function DocsChatPanel({ onClose }: DocsChatPanelProps) {
  // Initialize WebRTC session with docs endpoint
  const {
    status,
    isSessionActive,
    handleStartStopClick,
    conversation,
    registerFunction,
    audioStreamRef,
  } = useWebRTCAudioSession(
    "alloy", // Professional voice for documentation
    docsTools,
    undefined, // Instructions are in docsAssistantConfig
    "/api/docs-session" // Custom endpoint for docs
  )

  // Get docs tool implementations
  const toolsFunctions = useDocsTools()

  // Register all docs tools
  useEffect(() => {
    Object.entries(toolsFunctions).forEach(([name, func]) => {
      registerFunction(name, func)
    })
  }, [registerFunction, toolsFunctions])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ duration: 0.2 }}
      className="fixed bottom-24 right-6 z-40 w-96 max-h-[600px]"
    >
      <Card className="flex flex-col h-full shadow-2xl border-2 border-purple-200/50 bg-white/95 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <h3 className="font-semibold text-gray-900">Documentation Assistant</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Conversation Area */}
        <div className="flex-1 overflow-y-auto min-h-[300px] max-h-[400px]">
          {conversation.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <Mic className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Ask me anything about the docs
              </h4>
              <p className="text-sm text-gray-600">
                Start a session and ask questions about the project. I'll search the documentation and guide you to the right section.
              </p>
            </div>
          ) : (
            <Transcriber conversation={conversation} />
          )}
        </div>

        {/* Footer Controls */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          {/* Status Display */}
          {status && (
            <div className="text-xs text-gray-600 text-center">
              {status}
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleStartStopClick}
              className={`flex-1 ${
                isSessionActive
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
              }`}
            >
              {isSessionActive ? (
                <>
                  <MicOff className="w-4 h-4 mr-2" />
                  Stop Session
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Start Session
                </>
              )}
            </Button>

            {isSessionActive && (
              <Button
                variant="outline"
                size="icon"
                className="border-gray-300"
                title="Mute microphone"
                onClick={() => {
                  if (audioStreamRef.current) {
                    const audioTrack = audioStreamRef.current.getAudioTracks()[0]
                    if (audioTrack) {
                      audioTrack.enabled = !audioTrack.enabled
                    }
                  }
                }}
              >
                <MicOff className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Helper Text */}
          <p className="text-xs text-gray-500 text-center">
            Try asking: "How do I deploy this app?" or "What components are available?"
          </p>
        </div>
      </Card>
    </motion.div>
  )
}
