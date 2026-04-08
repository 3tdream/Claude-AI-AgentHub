import { create } from 'zustand';

interface BookingState {
  step: number;
  selectedServiceId: string | null;
  selectedSpecialistId: string | null;
  selectedDate: string | null;
  selectedTime: string | null;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  notes: string;
  submitted: boolean;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setServiceId: (id: string) => void;
  setSpecialistId: (id: string) => void;
  setDate: (date: string) => void;
  setTime: (time: string) => void;
  setClientName: (name: string) => void;
  setClientPhone: (phone: string) => void;
  setClientEmail: (email: string) => void;
  setNotes: (notes: string) => void;
  submit: () => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  step: 1,
  selectedServiceId: null,
  selectedSpecialistId: null,
  selectedDate: null,
  selectedTime: null,
  clientName: '',
  clientPhone: '',
  clientEmail: '',
  notes: '',
  submitted: false,
  setStep: (step) => set({ step }),
  nextStep: () => set((s) => ({ step: Math.min(s.step + 1, 5) })),
  prevStep: () => set((s) => ({ step: Math.max(s.step - 1, 1) })),
  setServiceId: (selectedServiceId) => set({ selectedServiceId }),
  setSpecialistId: (selectedSpecialistId) => set({ selectedSpecialistId }),
  setDate: (selectedDate) => set({ selectedDate }),
  setTime: (selectedTime) => set({ selectedTime }),
  setClientName: (clientName) => set({ clientName }),
  setClientPhone: (clientPhone) => set({ clientPhone }),
  setClientEmail: (clientEmail) => set({ clientEmail }),
  setNotes: (notes) => set({ notes }),
  submit: () => set({ submitted: true, step: 5 }),
  reset: () => set({
    step: 1,
    selectedServiceId: null,
    selectedSpecialistId: null,
    selectedDate: null,
    selectedTime: null,
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    notes: '',
    submitted: false,
  }),
}));
