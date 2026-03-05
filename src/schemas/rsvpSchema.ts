import { z } from "zod";

export const rsvpSchema = z.object({
  status: z.enum(["confirmed", "declined"], {
    error: "Status must be confirmed or declined",
  }),
});

export const preferencesSchema = z.object({
  meal_preference: z
    .string({ error: "Meal preference is required" })
    .max(100, "Meal preference must be less than 100 characters"),
  song_title: z
    .string()
    .max(255, "Song title must be less than 255 characters")
    .optional(),
  artist: z
    .string()
    .max(255, "Artist must be less than 255 characters")
    .optional(),
  special_needs: z
    .string()
    .max(500, "Special needs must be less than 500 characters")
    .optional(),
  sit_with: z
    .string()
    .max(255, "Sit with must be less than 255 characters")
    .optional(),
  not_sit_with: z
    .string()
    .max(255, "Not sit with must be less than 255 characters")
    .optional(),
});