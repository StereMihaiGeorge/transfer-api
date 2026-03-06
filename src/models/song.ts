export type SongGenre =
  | "pop"
  | "rock"
  | "manele"
  | "house"
  | "jazz"
  | "classical"
  | "folk"
  | "populara"
  | "other";

export interface EventSong {
  id: number;
  event_id: number;
  moment: string;
  song_title: string;
  artist: string | null;
  notes: string | null;
  created_at: Date;
}

export interface SongRequest {
  id: number;
  event_id: number;
  guest_id: number;
  song_title: string;
  artist: string | null;
  genre: SongGenre;
  created_at: Date;
}

export interface CreateEventSongInput {
  moment: string;
  song_title: string;
  artist?: string;
  notes?: string;
}

export interface CreateSongRequestInput {
  song_title: string;
  artist?: string;
  genre: SongGenre;
}
