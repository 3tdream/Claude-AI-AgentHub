"use client"

import React, { useEffect, useState } from "react"
import useWebRTCAudioSession from "@/hooks/use-webrtc"
import { tools } from "@/lib/tools"
import { openAIConfig } from "@/config/openai"
import type { AgentConfig } from "@/components/avatar-info"
import { useToolsFunctions } from "@/hooks/use-tools"
import { useIsMobile } from "@/hooks/use-mobile"
import { DesktopLayout } from "@/components/layouts/DesktopLayout"
import { MobileLayout } from "@/components/layouts/MobileLayout"

const App: React.FC = () => {
  const isMobile = useIsMobile()

  const [agentConfig, setAgentConfig] = useState<AgentConfig>(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('agentConfig') : null
    return stored ? JSON.parse(stored) : {
      name: "Jacqueline Kovalenko",
      role: "ai buddy",
      prompt: openAIConfig.instructions
    }
  })

  // WebRTC Audio Session Hook with custom config
  const {
    status,
    isSessionActive,
    registerFunction,
    handleStartStopClick,
    conversation,
    setConversation,
    audioStreamRef,
    dataChannelRef
  } = useWebRTCAudioSession(openAIConfig.voice, tools, agentConfig.prompt)

  // Get all tools functions
  const toolsFunctions = useToolsFunctions();

  useEffect(() => {
    // Register all functions by iterating over the object
    Object.entries(toolsFunctions).forEach(([name, func]) => {
      const functionNames: Record<string, string> = {
        getCurrentSlideFunction: 'getCurrentSlide',
        nextSlideFunction: 'nextSlide',
        prevSlideFunction: 'prevSlide',
        timeFunction: 'getCurrentTime',
        updateCurrentSlideTitleFunction: 'updateCurrentSlideTitle',
        updateCurrentSlideDescriptionFunction: 'updateCurrentSlideDescription',
        updateSlideBlockFunction: 'updateSlideBlock'
      };
      
      registerFunction(functionNames[name], func);
    });
  }, [registerFunction, toolsFunctions])

  const sharedProps = {
    status,
    isSessionActive,
    handleStartStopClick,
    setConversation,
    audioStreamRef,
    dataChannelRef,
  }

  return isMobile ? (
    <MobileLayout {...sharedProps} />
  ) : (
    <DesktopLayout 
      {...sharedProps}
      conversation={conversation}
      agentConfig={agentConfig}
      setAgentConfig={setAgentConfig}
    />
  )
}

export default App;
