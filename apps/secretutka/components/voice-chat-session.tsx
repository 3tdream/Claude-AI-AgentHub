"use client"

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, User, Bot, Volume2, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface VoiceChatSessionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function VoiceChatSession({ open, onOpenChange, onSuccess }: VoiceChatSessionProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setRecording(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[event.results.length - 1][0].transcript;
          setInput(transcript);
          recognition.stop();
          // Auto-send the message
          handleSendMessage(transcript);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setRecording(false);
        };

        recognition.onend = () => {
          setRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      addMessage('assistant', 'Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (recording) {
      recognitionRef.current.stop();
    } else {
      setInput('');
      recognitionRef.current.start();
      setRecording(true);
    }
  };

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    // Add user message
    addMessage('user', messageText);
    setInput('');
    setProcessing(true);

    try {
      // Process through voice API
      const voiceResponse = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: messageText }),
      });

      const voiceData = await voiceResponse.json();

      if (!voiceData.success || !voiceData.actions || voiceData.actions.length === 0) {
        addMessage('assistant', 'I\'m not sure what you want me to do. Could you rephrase that?');
        return;
      }

      // Execute actions
      const results = [];
      for (const action of voiceData.actions) {
        const actionResponse = await fetch('/api/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        });

        const actionData = await actionResponse.json();
        results.push(actionData);
      }

      // Create response message
      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      let responseMessage = '';
      if (failCount === 0) {
        responseMessage = results.map(r => r.message || r.preview).join('\n\n');
        if (!responseMessage) {
          responseMessage = `Successfully completed ${successCount} action(s).`;
        }
      } else {
        responseMessage = `Completed ${successCount} action(s), but ${failCount} failed.`;
      }

      addMessage('assistant', responseMessage);

      // Refresh dashboard if any actions succeeded
      if (successCount > 0) {
        onSuccess();
      }

      // Speak the response (optional)
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(responseMessage);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        window.speechSynthesis.speak(utterance);
      }

    } catch (error) {
      console.error('Chat error:', error);
      addMessage('assistant', 'Sorry, I encountered an error processing your request.');
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    if (recognitionRef.current && recording) {
      recognitionRef.current.stop();
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setMessages([]);
    setInput('');
    setRecording(false);
    setProcessing(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] h-[600px] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-600" />
            Voice Chat Session
          </DialogTitle>
        </DialogHeader>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Mic className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Start a Conversation</h3>
              <p className="text-sm text-gray-600 max-w-sm">
                Click the microphone button to speak, or type your message below.
                I can help you track work sessions, generate reports, and manage your time.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-indigo-600" />
                  </div>
                )}
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-indigo-200' : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))
          )}
          {processing && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <Bot className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                  <span className="text-sm text-gray-600">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t px-6 py-4 space-y-3">
          {/* Recording Status */}
          {recording && (
            <div className="flex items-center justify-center gap-2 text-sm text-red-600 animate-pulse">
              <Volume2 className="w-4 h-4" />
              <span>Listening... Speak now</span>
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2">
            <Button
              onClick={toggleRecording}
              disabled={processing}
              variant={recording ? "destructive" : "outline"}
              size="icon"
              className={`flex-shrink-0 ${recording ? 'animate-pulse' : ''}`}
            >
              {recording ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </Button>

            <Textarea
              placeholder="Type a message or click the microphone..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={processing || recording}
              className="min-h-[48px] max-h-[120px] resize-none"
            />

            <Button
              onClick={() => handleSendMessage()}
              disabled={processing || !input.trim() || recording}
              size="icon"
              className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
