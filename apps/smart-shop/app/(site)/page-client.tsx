'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Mic } from 'lucide-react'

export function VoiceShoppingButton() {
  const { toast } = useToast()
  const [isListening, setIsListening] = useState(false)

  const handleVoiceClick = () => {
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: 'Voice not supported',
        description: 'Your browser does not support voice recognition. Please try Chrome or Edge.',
        variant: 'destructive',
      })
      return
    }

    setIsListening(true)

    // Create speech recognition instance
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      toast({
        title: 'You said:',
        description: transcript,
      })

      // Simple voice command routing
      const lowerTranscript = transcript.toLowerCase()
      if (lowerTranscript.includes('cart') || lowerTranscript.includes('shopping cart')) {
        window.location.href = '/cart'
      } else if (lowerTranscript.includes('shop') || lowerTranscript.includes('browse')) {
        window.location.href = '/category/all'
      } else {
        toast({
          title: 'Try saying:',
          description: '"Show me the cart" or "Browse products"',
        })
      }

      setIsListening(false)
    }

    recognition.onerror = (event: any) => {
      // Handle different error types
      const errorType = event.error

      switch (errorType) {
        case 'no-speech':
          toast({
            title: 'No speech detected',
            description: 'Please try again and speak clearly when you see "Listening..."',
          })
          break

        case 'audio-capture':
          toast({
            title: 'Microphone not found',
            description: 'Please check that your microphone is connected and working.',
            variant: 'destructive',
          })
          break

        case 'not-allowed':
          toast({
            title: 'Microphone access denied',
            description: 'Please allow microphone access in your browser settings.',
            variant: 'destructive',
          })
          break

        case 'network':
          toast({
            title: 'Network error',
            description: 'Please check your internet connection and try again.',
            variant: 'destructive',
          })
          break

        default:
          console.error('Speech recognition error:', errorType)
          toast({
            title: 'Voice error',
            description: 'Could not recognize speech. Please try again.',
            variant: 'destructive',
          })
      }

      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()

    toast({
      title: 'Listening...',
      description: 'Speak now! Try: "Show me the cart" or "Browse products"',
    })
  }

  return (
    <Button
      size="lg"
      variant="outline"
      onClick={handleVoiceClick}
      disabled={isListening}
    >
      <Mic className={`mr-2 h-4 w-4 ${isListening ? 'animate-pulse' : ''}`} />
      {isListening ? 'Listening...' : 'Try Voice Shopping'}
    </Button>
  )
}
