export interface Event {
  id: number;
  user_id: number;
  bride_name: string;
  groom_name: string;
  date: Date;
  venue: string;
  city: string;
  slug: string;
  cover_message: string | null;
  created_at: Date;
}

export interface CreateEventInput {
  bride_name: string;
  groom_name: string;
  date: string;
  venue: string;
  city: string;
  cover_message?: string;
}