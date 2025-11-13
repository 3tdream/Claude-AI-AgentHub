import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Square, Loader2 } from "lucide-react"
import { useState, KeyboardEvent, useEffect, Dispatch, SetStateAction } from "react"
import { useLanguageStore } from "@/hooks/use-language-store"
import { translations } from "@/lib/translations"
import { useIsMobile } from "@/hooks/use-mobile"
import { v4 as uuidv4 } from "uuid"
import { Conversation } from "@/lib/conversations"

interface BroadcastButtonProps {
  isSessionActive: boolean
  onClick: () => Promise<void>
  dataChannel?: RTCDataChannel | null
  setConversation: Dispatch<SetStateAction<Conversation[]>>
}

export function BroadcastButton({ isSessionActive, onClick, dataChannel, setConversation }: BroadcastButtonProps) {
  const [inputText, setInputText] = useState("")
  const [isChannelReady, setIsChannelReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { language } = useLanguageStore()
  const t = translations[language]
  const isMobile = useIsMobile()

  useEffect(() => {
    if (!dataChannel) {
      setIsChannelReady(false);
      return;
    }

    const handleStateChange = () => {
      setIsChannelReady(dataChannel.readyState === 'open');
    };

    // Set initial state
    setIsChannelReady(dataChannel.readyState === 'open');

    // Listen for state changes
    dataChannel.addEventListener('open', handleStateChange);
    dataChannel.addEventListener('close', handleStateChange);

    return () => {
      dataChannel.removeEventListener('open', handleStateChange);
      dataChannel.removeEventListener('close', handleStateChange);
    };
  }, [dataChannel]);

  const handleSubmit = () => {
    if (!dataChannel || !inputText.trim() || !isChannelReady) {
      console.error('DataChannel is not ready');
      return;
    }

    try {
      // Generate unique ID for the message
      const messageId = uuidv4();
      const messageText = inputText.trim();

      // Add message to conversation state FIRST
      const conversationItem: Conversation = {
        id: messageId,
        role: 'user',
        text: messageText,
        timestamp: new Date().toISOString(),
        isFinal: true,
        status: 'final'
      };

      setConversation(prev => [...prev, conversationItem]);

      // Send user message to OpenAI
      const userMessage = {
        type: 'conversation.item.create',
        item: {
          id: messageId,
          type: 'message',
          role: 'user',
          content: [{
            type: 'input_text',
            text: messageText
          }]
        }
      };

      // Send the message
      dataChannel.send(JSON.stringify(userMessage));

      // Trigger the voice response
      const responseCreate = {
        type: 'response.create',
        response: {
          modalities: ['text', 'audio']
        }
      };

      dataChannel.send(JSON.stringify(responseCreate));
      setInputText(""); // Clear input after sending
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  }

  if (isMobile) {
    return (
      <Button
        variant={isSessionActive ? "destructive" : "default"}
        className="w-full py-6 text-lg font-medium flex items-center justify-center gap-2"
        onClick={async () => {
          setIsLoading(true)
          try {
            await onClick()
          } finally {
            setIsLoading(false)
          }
        }}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            {t.buttons.starting}
          </>
        ) : isSessionActive ? (
          <>
            <Square className="h-5 w-5" />
            {t.buttons.stop}
          </>
        ) : (
          t.buttons.start
        )}
      </Button>
    )
  }

  if (!isSessionActive) {
    return (
      <Button
        className="w-full h-11 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg shadow-sm transition-colors"
        onClick={async () => {
          setIsLoading(true)
          try {
            await onClick()
          } finally {
            setIsLoading(false)
          }
        }}
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Starting...</span>
          </div>
        ) : (
          <span>Start Conversation</span>
        )}
      </Button>
    )
  }

  // Active session - text input + controls
  return (
    <div className="flex gap-2 w-full" dir={language === 'he' ? 'rtl' : 'ltr'}>
      <div className="flex-1 relative">
        <Input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isChannelReady ? "Type a message..." : "Connecting..."}
          disabled={!isChannelReady}
          className="h-11 pr-10 border-gray-300 focus:border-teal-500 focus:ring-teal-500 rounded-lg"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSubmit}
          disabled={!isChannelReady || !inputText.trim()}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-teal-500 hover:text-teal-600 hover:bg-teal-50 disabled:opacity-30"
          aria-label="Send message"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="m3 3 3 9-3 9 19-9Z" />
          </svg>
        </Button>
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={onClick}
        className="h-11 w-11 border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600 rounded-lg"
        aria-label="Stop conversation"
      >
        <Square className="h-4 w-4" />
      </Button>
    </div>
  )
}
