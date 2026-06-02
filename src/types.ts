export type CertificateTheme = 'gold' | 'emerald' | 'onyx' | 'sapphire' | 'ruby';

export interface WordRecord {
  id: string;
  word: string;
  owner: string;
  ownerEmail: string;
  isGift: boolean;
  giftMessage?: string;
  theme: CertificateTheme;
  createdAt: string;
  quote: string;
  meaning: string;
  story: string;
  lat?: number;
  lng?: number;
  locationName?: string;
  category?: string;
  price?: number;
}

export interface SearchResult {
  available: boolean;
  word: string;
  details?: WordRecord;
  aiFeedback?: {
    word: string;
    meaning: string;
    quote: string;
    story: string;
    suggestedPoets: string[];
  };
}
