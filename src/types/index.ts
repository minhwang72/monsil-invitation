export interface ContactPerson {
  id: number;
  side: 'groom' | 'bride';
  relationship: 'person' | 'father' | 'mother' | 'brother' | 'sister' | 'other';
  name: string;
  phone: string;
  bank_name?: string;
  account_number?: string;
  kakaopay_link?: string;
}

export interface Gallery {
  id: number;
  url: string;
  filename?: string;
  description?: string;
  image_type: 'main' | 'gallery';
  created_at: Date | string;
  deleted_at?: Date | string | null;
}

export interface Guestbook {
  id: number;
  name: string;
  password: string;
  content: string;
  created_at: Date;
  deleted_at?: Date | string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
} 