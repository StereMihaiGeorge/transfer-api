export type GuestStatus = "pending" | "confirmed" | "declined";
export type GuestSide = "bride" | "groom" | "both";

export interface Guest {
  id: number;
  event_id: number;
  table_id: number | null;
  name: string;
  email: string | null;
  phone: string | null;
  side: GuestSide;
  status: GuestStatus;
  meal_preference: string | null;
  invitation_sent: boolean;
  token: string;
  token_expires_at: Date | null;
  responded_at: Date | null;
  created_at: Date;
}

export interface CreateGuestInput {
  name: string;
  email?: string;
  phone?: string;
  side: GuestSide;
}