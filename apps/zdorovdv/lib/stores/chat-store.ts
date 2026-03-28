import { create } from 'zustand';
import type { ChatMessage } from '@/types';

type VoiceStatus = 'idle' | 'connecting' | 'connected' | 'speaking' | 'listening';

interface ChatStore {
  messages: ChatMessage[];
  isOpen: boolean;
  isVoiceMode: boolean;
  voiceStatus: VoiceStatus;
  isMuted: boolean;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  updateLastMessage: (role: 'user' | 'assistant', content: string) => void;
  setVoiceMode: (voice: boolean) => void;
  setVoiceStatus: (status: VoiceStatus) => void;
  setMuted: (muted: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isOpen: false,
  isVoiceMode: false,
  voiceStatus: 'idle',
  isMuted: false,
  setOpen: (isOpen) => set({ isOpen }),
  toggleOpen: () => set((s) => ({ isOpen: !s.isOpen })),
  addMessage: (role, content) =>
    set((s) => ({
      messages: [
        ...s.messages,
        { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, role, content, timestamp: Date.now() },
      ],
    })),
  updateLastMessage: (role, content) =>
    set((s) => {
      const last = s.messages[s.messages.length - 1];
      if (last && last.role === role && Date.now() - last.timestamp < 3000) {
        return { messages: [...s.messages.slice(0, -1), { ...last, content }] };
      }
      return {
        messages: [
          ...s.messages,
          { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, role, content, timestamp: Date.now() },
        ],
      };
    }),
  setVoiceMode: (isVoiceMode) => set({ isVoiceMode }),
  setVoiceStatus: (voiceStatus) => set({ voiceStatus }),
  setMuted: (isMuted) => set({ isMuted }),
  clearMessages: () => set({ messages: [] }),
}));
