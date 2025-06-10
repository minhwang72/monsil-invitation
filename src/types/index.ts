export interface Invitation {
  id: number;
  groom: string;
  bride: string;
  wedding_date: Date;
  main_img: string;
  message: string;
}

export interface Account {
  id: number;
  role: 'groom' | 'bride';
  name: string;
  bank: string;
  number: string;
}

export interface ContactPerson {
  id: number;
  side: 'groom' | 'bride';
  relationship: 'person' | 'father' | 'mother';
  name: string;
  phone: string;
}

export interface Gallery {
  id: number;
  filename: string;
  image_type: 'main' | 'gallery';
  created_at: Date;
  deleted_at?: Date | null;
}

export interface Guestbook {
  id: number;
  name: string;
  password: string;
  content: string;
  created_at: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
} 