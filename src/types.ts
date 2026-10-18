export interface StaggeredCard {
  id: string;
  title: string;
  subtitle: string;
  annotation: string;
  aspectRatio: 'aspect-[4/3]' | 'aspect-[3/4]' | 'aspect-[16/10]' | 'aspect-square' | 'aspect-video' | string;
  yOffsetClass: string;
  visualType: 'blueprint' | 'material' | 'light' | 'monolith' | 'installation' | 'detail' | 'video' | string;
  imageUrl?: string;
  mediaType?: 'image' | 'video';
  videoUrl?: string;
  customRatio?: string;
  customWidth?: number;
  fitMode?: 'cover' | 'contain';
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  englishTitle: string;
  year: string;
  client: string;
  discipline: string;
  role: string;
  location: string;
  tagline: string;
  chineseIntro: string;
  designConcept: string;
  awards: string[];
  specs: { label: string; value: string }[];
  accentColor: string;
  coverVisual: 'chair' | 'pavilion' | 'luminaire' | 'book' | 'monolith' | 'tactile' | string;
  coverImage?: string;
  staggeredCards: StaggeredCard[];
}

export interface TimelineItem {
  id: string;
  period: string;
  year: string;
  title: string;
  organization: string;
  location: string;
  category: '经历' | '教育' | '荣誉';
  description: string;
  highlights: string[];
}

export interface SkillItem {
  name: string;
  english: string;
  category: string;
}
