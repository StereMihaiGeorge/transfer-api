export interface SongRequest {
  id: number;
  event_id: number;
  guest_id: number;
  song_title: string;
  artist: string | null;
  created_at: Date;
}

export interface CreateSongInput {
  song_title: string;
  artist?: string;
}