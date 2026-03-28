import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language } from '@/types';

interface LanguageStore {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: 'ru',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'zdorovdv-language',
    }
  )
);
