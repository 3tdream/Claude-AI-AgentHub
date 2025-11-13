export interface SlideBackground {
  type: "image" | "gradient";
  source: string;
  fallback?: string;
}

export interface Badge {
  text: string;
  color: string;
  textColor?: string;
}

export interface Button {
  text: string;
  variant: "primary" | "outline";
  action: string;
}

export interface Highlight {
  text: string;
  color: string;
}

export interface Quote {
  text: string;
  color: string;
}

export interface Card {
  icon: string; // Lucide icon name (e.g., "AlertTriangle", "Zap")
  title: string;
  description: string;
}

export interface Stat {
  number: string;
  label: string;
}

export interface List {
  title: string;
  items: string[];
}

export interface Award {
  icon: string; // Lucide icon name (e.g., "Medal", "Star", "GraduationCap")
  title: string;
  source: string;
}

export interface SlideContent {
  alignment: "left" | "center" | "right";
  badge?: Badge;
  title?: string;
  subtitle?: string;
  paragraphs?: string[];
  quote?: Quote;
  footer?: string | string[];
  highlight?: Highlight;
  items?: string[];
  cards?: Card[];
  stats?: Stat[];
  lists?: List[];
  awards?: Award[];
  buttons?: Button[];
}

export interface Slide {
  id: number;
  type: "title" | "content" | "cards" | "stats" | "dual-list" | "checklist" | "awards" | "cta";
  background: SlideBackground;
  overlay: boolean;
  content: SlideContent;
}

export interface PresentationMetadata {
  title: string;
  subtitle: string;
  totalSlides: number;
}

export interface PresentationData {
  presentation: PresentationMetadata;
  slides: Slide[];
}
