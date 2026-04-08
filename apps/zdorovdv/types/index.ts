export type ServiceCategory = 'laser' | 'injection' | 'face' | 'body' | 'medical' | 'removal';

export interface ClinicService {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  category: ServiceCategory;
  price: number;
  currency: string;
  duration: number;
  icon: string;
}

export interface Specialist {
  id: string;
  name: string;
  nameEn: string;
  role: string;
  roleEn: string;
  description: string;
  descriptionEn: string;
  experience: number;
  avatar: string;
  serviceIds: string[];
}

export interface BookingRequest {
  serviceId: string;
  date: string;
  time: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export type Language = 'ru' | 'en';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
