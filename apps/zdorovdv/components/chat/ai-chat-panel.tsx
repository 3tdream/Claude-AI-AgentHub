"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useConversation } from "@elevenlabs/react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Send, Mic, MicOff, PhoneOff, Phone, MessageSquareText,
  AudioLines, Trash2, Volume2, VolumeX,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { AiChatMessages } from "./ai-chat-messages"
import { VoiceVisualizer } from "./voice-visualizer"
import { useChatStore } from "@/lib/stores/chat-store"
import { useLanguageStore } from "@/lib/use-language-store"
import { translations } from "@/lib/translations"
import { services } from "@/data/services"
import { cn } from "@/lib/utils"

export function AiChatPanel() {
  const {
    messages, addMessage, updateLastMessage, clearMessages,
    isVoiceMode, setVoiceMode, voiceStatus, setVoiceStatus, isMuted, setMuted,
  } = useChatStore()
  const { language } = useLanguageStore()
  const t = translations[language]
  const router = useRouter()
  const [input, setInput] = useState('')
  const languageRef = useRef(language)

  useEffect(() => {
    languageRef.current = language
  }, [language])

  const conversation = useConversation({
    clientTools: {
      navigate_to_booking: async (params: { service_id?: string }) => {
        const path = params.service_id ? `/booking?service=${params.service_id}` : '/booking'
        router.push(path)
        return `Navigating to booking${params.service_id ? ` for service ${params.service_id}` : ''}`
      },
      show_service_info: async (params: { category?: string }) => {
        const filtered = params.category
          ? services.filter(s => s.category === params.category)
          : services.slice(0, 6)
        const lang = languageRef.current
        const info = filtered.map(s => ({
          id: s.id,
          name: lang === 'ru' ? s.name : s.nameEn,
          price: s.price,
          duration: s.duration,
          category: s.category,
        }))
        return JSON.stringify(info)
      },
      get_clinic_info: async () => {
        return JSON.stringify({
          name: 'Медицинский центр «Здоровье»',
          address: 'г. Хабаровск, ул. Ленина, 26',
          phone: '+7 (4212) 45-45-45',
          hours: 'Пн-Пт: 9:00-20:00, Сб: 10:00-18:00, Вс: выходной',
          license: 'ЛО-27-01-002345',
          since: 2003,
          categories: ['laser', 'injection', 'face', 'body', 'medical', 'removal'],
          totalServices: services.length,
        })
      },
      end_call: async () => {
        conversation.endSession()
        return 'Call ended'
      },
    },
    onConnect: () => {
      setVoiceStatus('listening')
      // Send language context
      if (languageRef.current === 'ru') {
        setTimeout(() => {
          conversation.sendContextualUpdate(
            `[LANGUAGE INSTRUCTION] Отвечай на русском языке. Ты — AI-ассистент медицинского центра «Здоровье» в Хабаровске. Помогай пациентам с информацией об услугах, записью на приём и ответами на вопросы о клинике. Будь вежливым и профессиональным.`
          )
        }, 300)
      } else {
        setTimeout(() => {
          conversation.sendContextualUpdate(
            `[LANGUAGE INSTRUCTION] Respond in English. You are the AI assistant of Medical Center "Zdorovye" in Khabarovsk, Russia. Help patients with service information, appointment booking, and clinic questions. Be polite and professional.`
          )
        }, 300)
      }
    },
    onDisconnect: () => {
      setVoiceStatus('idle')
    },
    onMessage: (message) => {
      if (typeof message === 'object' && message !== null && 'message' in message) {
        const msg = message as { message: string; source: string }
        const role = msg.source === 'user' ? 'user' as const : 'assistant' as const
        updateLastMessage(role, msg.message)
      }
    },
    onError: (error) => {
      console.error('ElevenLabs error:', error)
      setVoiceStatus('idle')
    },
  })

  // Track speaking/listening from conversation.isSpeaking
  useEffect(() => {
    if (voiceStatus === 'idle' || voiceStatus === 'connecting') return
    setVoiceStatus(conversation.isSpeaking ? 'speaking' : 'listening')
  }, [conversation.isSpeaking, voiceStatus, setVoiceStatus])

  const startVoice = useCallback(async () => {
    const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID
    if (!agentId || agentId === 'your_agent_id_here') {
      addMessage('assistant', language === 'ru'
        ? 'Голосовой ассистент не настроен. Укажите NEXT_PUBLIC_ELEVENLABS_AGENT_ID в .env.local'
        : 'Voice assistant not configured. Set NEXT_PUBLIC_ELEVENLABS_AGENT_ID in .env.local'
      )
      return
    }

    setVoiceStatus('connecting')
    try {
      await conversation.startSession({
        agentId,
        connectionType: "websocket" as const,
      })
    } catch (err) {
      console.error('Failed to start voice session:', err)
      setVoiceStatus('idle')
      addMessage('assistant', language === 'ru'
        ? 'Не удалось подключиться к голосовому ассистенту. Проверьте микрофон и попробуйте снова.'
        : 'Could not connect to voice assistant. Check your microphone and try again.'
      )
    }
  }, [conversation, addMessage, language, setVoiceStatus])

  const endVoice = useCallback(async () => {
    try {
      await conversation.endSession()
    } catch {}
    setVoiceStatus('idle')
  }, [conversation, setVoiceStatus])

  const handleSend = useCallback(() => {
    if (!input.trim()) return
    addMessage('user', input.trim())
    setInput('')
    setTimeout(() => {
      addMessage('assistant', language === 'ru'
        ? 'Спасибо за ваш вопрос! Для записи на приём перейдите в раздел «Запись» или позвоните: +7 (4212) 45-45-45. Для голосового общения нажмите кнопку микрофона.'
        : 'Thank you for your question! To book an appointment, go to the Booking page or call: +7 (4212) 45-45-45. For voice chat, click the microphone button.'
      )
    }, 800)
  }, [input, addMessage, language])

  const isVoiceActive = voiceStatus !== 'idle'
  const welcomeShown = messages.length === 0 && !isVoiceActive

  const voiceStatusLabel = {
    idle: '',
    connecting: language === 'ru' ? 'Подключение...' : 'Connecting...',
    connected: language === 'ru' ? 'Подключён' : 'Connected',
    listening: t.chat.listening,
    speaking: t.chat.speaking,
  }[voiceStatus]

  return (
    <Card className="flex flex-col h-[520px] shadow-2xl border overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-primary text-primary-foreground flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm">{t.chat.title}</h3>
          <p className="text-xs text-primary-foreground/70">{t.chat.subtitle}</p>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
              onClick={clearMessages}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-7 w-7 hover:bg-primary-foreground/10",
              isVoiceMode ? "text-primary-foreground" : "text-primary-foreground/70 hover:text-primary-foreground"
            )}
            onClick={() => setVoiceMode(!isVoiceMode)}
          >
            {isVoiceMode
              ? <MessageSquareText className="w-3.5 h-3.5" />
              : <AudioLines className="w-3.5 h-3.5" />
            }
          </Button>
        </div>
      </div>

      {/* Voice Mode Active View */}
      <AnimatePresence mode="wait">
        {isVoiceMode && isVoiceActive ? (
          <motion.div
            key="voice-active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-6 gap-4"
          >
            {/* Animated orb */}
            <motion.div
              className={cn(
                "w-28 h-28 rounded-full flex items-center justify-center relative",
                voiceStatus === 'speaking' ? "bg-primary/10" : "bg-gold/10"
              )}
              animate={voiceStatus === 'speaking' ? {
                scale: [1, 1.08, 1],
                boxShadow: [
                  '0 0 0 0 hsl(152 45% 42% / 0)',
                  '0 0 0 16px hsl(152 45% 42% / 0.1)',
                  '0 0 0 0 hsl(152 45% 42% / 0)',
                ],
              } : voiceStatus === 'listening' ? {
                scale: [1, 1.04, 1],
                boxShadow: [
                  '0 0 0 0 hsl(43 55% 55% / 0)',
                  '0 0 0 12px hsl(43 55% 55% / 0.1)',
                  '0 0 0 0 hsl(43 55% 55% / 0)',
                ],
              } : {}}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <motion.div
                className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center",
                  voiceStatus === 'speaking' ? "bg-primary/20" : voiceStatus === 'connecting' ? "bg-muted" : "bg-gold/20"
                )}
              >
                {voiceStatus === 'speaking' ? (
                  <Volume2 className="w-8 h-8 text-primary" />
                ) : voiceStatus === 'listening' ? (
                  <Mic className="w-8 h-8 text-gold" />
                ) : (
                  <AudioLines className="w-8 h-8 text-muted-foreground animate-pulse" />
                )}
              </motion.div>
            </motion.div>

            <VoiceVisualizer status={voiceStatus as 'connecting' | 'connected' | 'speaking' | 'listening'} />

            <p className={cn(
              "text-sm font-medium",
              voiceStatus === 'speaking' ? "text-primary" : voiceStatus === 'listening' ? "text-gold" : "text-muted-foreground"
            )}>
              {voiceStatusLabel}
            </p>

            {/* Last message preview */}
            {messages.length > 0 && (
              <motion.p
                key={messages[messages.length - 1].id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-muted-foreground text-center max-w-[250px] line-clamp-2"
              >
                {messages[messages.length - 1].content}
              </motion.p>
            )}

            {/* Voice controls */}
            <div className="flex items-center gap-3 mt-2">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => setMuted(!isMuted)}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="destructive"
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={endVoice}
              >
                <PhoneOff className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => { endVoice(); setVoiceMode(false) }}
              >
                <MessageSquareText className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="chat-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col min-h-0"
          >
            {/* Messages / Welcome */}
            {welcomeShown ? (
              <div className="flex-1 overflow-y-auto p-4">
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs">🤖</span>
                  </div>
                  <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-muted px-3.5 py-2.5 text-sm leading-relaxed">
                    {t.chat.welcome}
                  </div>
                </div>

                {/* Voice CTA */}
                {isVoiceMode && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 flex flex-col items-center gap-3"
                  >
                    <Button
                      size="lg"
                      className="rounded-full h-16 w-16 bg-primary hover:bg-primary/90"
                      onClick={startVoice}
                    >
                      <Phone className="w-6 h-6" />
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      {language === 'ru' ? 'Нажмите, чтобы начать разговор' : 'Tap to start a conversation'}
                    </p>
                  </motion.div>
                )}

                {/* Suggestion chips */}
                {!isVoiceMode && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {t.chat.suggestions.map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          addMessage('user', suggestion)
                          setTimeout(() => {
                            addMessage('assistant', language === 'ru'
                              ? 'Спасибо за ваш вопрос! Для записи перейдите в раздел «Запись» или позвоните нам: +7 (4212) 45-45-45.'
                              : 'Thank you! To book, visit the Booking page or call us: +7 (4212) 45-45-45.'
                            )
                          }, 800)
                        }}
                        className="text-xs px-3 py-1.5 rounded-full border border-primary/30 text-primary hover:bg-primary/5 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <AiChatMessages messages={messages} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area - hidden during active voice */}
      {!(isVoiceMode && isVoiceActive) && (
        <div className="p-3 border-t bg-card">
          {isVoiceMode ? (
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setVoiceMode(false)}
              >
                <MessageSquareText className="w-4 h-4" />
                {t.chat.textMode}
              </Button>
              <Button
                size="lg"
                className="rounded-full h-12 w-12 bg-primary hover:bg-primary/90"
                onClick={startVoice}
              >
                <Phone className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => setVoiceMode(true)}
                title={t.chat.voiceMode}
              >
                <Mic className="w-4 h-4" />
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t.chat.placeholder}
                className="h-10"
              />
              <Button size="icon" onClick={handleSend} disabled={!input.trim()} className="shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
