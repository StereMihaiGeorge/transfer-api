export type EventType = "wedding" | "baptism" | "birthday";

export interface BaseEvent {
  id: number;
  user_id: number;
  type: EventType;
  title: string;
  date: Date;
  venue: string;
  city: string;
  slug: string;
  cover_message: string | null;
  created_at: Date;
}

export interface WeddingDetails {
  bride_name: string;
  groom_name: string;
}

export interface BaptismDetails {
  child_name: string;
  child_date_of_birth: Date | null;
  parent_name: string;
  godfather_name: string | null;
  godmother_name: string | null;
  church_name: string | null;
}

export interface BirthdayDetails {
  person_name: string;
  age: number | null;
  theme: string | null;
  dress_code: string | null;
}

export interface WeddingEvent extends BaseEvent {
  type: "wedding";
  details: WeddingDetails;
}

export interface BaptismEvent extends BaseEvent {
  type: "baptism";
  details: BaptismDetails;
}

export interface BirthdayEvent extends BaseEvent {
  type: "birthday";
  details: BirthdayDetails;
}

export type Event = WeddingEvent | BaptismEvent | BirthdayEvent;

export interface CreateWeddingInput {
  type: "wedding";
  title: string;
  date: string;
  venue: string;
  city: string;
  cover_message?: string;
  bride_name: string;
  groom_name: string;
}

export interface CreateBaptismInput {
  type: "baptism";
  title: string;
  date: string;
  venue: string;
  city: string;
  cover_message?: string;
  child_name: string;
  child_date_of_birth?: string;
  parent_name: string;
  godfather_name?: string;
  godmother_name?: string;
  church_name?: string;
}

export interface CreateBirthdayInput {
  type: "birthday";
  title: string;
  date: string;
  venue: string;
  city: string;
  cover_message?: string;
  person_name: string;
  age?: number;
  theme?: string;
  dress_code?: string;
}

export type CreateEventInput = CreateWeddingInput | CreateBaptismInput | CreateBirthdayInput;
