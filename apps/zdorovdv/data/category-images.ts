import type { ServiceCategory } from '@/types';

export const categoryImages: Record<ServiceCategory, { src: string; alt: string; altEn: string }> = {
  laser: {
    src: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=800&h=500&fit=crop&q=80',
    alt: 'Лазерные процедуры',
    altEn: 'Laser Procedures',
  },
  injection: {
    src: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&h=500&fit=crop&q=80',
    alt: 'Инъекционная косметология',
    altEn: 'Injection Cosmetology',
  },
  face: {
    src: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d946?w=800&h=500&fit=crop&q=80',
    alt: 'Уход за лицом',
    altEn: 'Facial Care',
  },
  body: {
    src: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=500&fit=crop&q=80',
    alt: 'Уход за телом',
    altEn: 'Body Care',
  },
  medical: {
    src: 'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=800&h=500&fit=crop&q=80',
    alt: 'Медицинские услуги',
    altEn: 'Medical Services',
  },
  removal: {
    src: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=500&fit=crop&q=80',
    alt: 'Удаление новообразований',
    altEn: 'Removal Procedures',
  },
};

export const clinicImage = {
  src: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=900&h=600&fit=crop&q=80',
  alt: 'Медицинский центр Здоровье',
  altEn: 'Medical Center Zdorovye',
};
