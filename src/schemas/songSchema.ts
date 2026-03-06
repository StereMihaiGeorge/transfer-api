import { z } from "zod";

const songGenres = [
  "pop",
  "rock",
  "manele",
  "house",
  "jazz",
  "classical",
  "folk",
  "populara",
  "other",
] as const;

export const createEventSongSchema = z.object({
  moment: z.string().min(2).max(100),
  song_title: z.string().min(1).max(255),
  artist: z.string().max(255).optional(),
  notes: z.string().max(1000).optional(),
});

export const updateEventSongSchema = createEventSongSchema.partial();

export const createSongRequestSchema = z.object({
  song_title: z.string().min(1).max(255),
  artist: z.string().max(255).optional(),
  genre: z.enum(songGenres, { error: "Invalid genre" }),
});
