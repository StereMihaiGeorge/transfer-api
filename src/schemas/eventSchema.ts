import { z } from "zod";

export const createEventSchema = z.object({
  bride_name: z
    .string({ error: "Bride name is required" })
    .min(2, "Bride name must be at least 2 characters")
    .max(100, "Bride name must be less than 100 characters"),
  groom_name: z
    .string({ error: "Groom name is required" })
    .min(2, "Groom name must be at least 2 characters")
    .max(100, "Groom name must be less than 100 characters"),
  date: z
    .string({ error: "Date is required" })
    .refine((val) => !Number.isNaN(Date.parse(val)), "Invalid date format"),
  venue: z
    .string({ error: "Venue is required" })
    .min(2, "Venue must be at least 2 characters")
    .max(255, "Venue must be less than 255 characters"),
  city: z
    .string({ error: "City is required" })
    .min(2, "City must be at least 2 characters")
    .max(100, "City must be less than 100 characters"),
  cover_message: z.string().max(1000, "Cover message must be less than 1000 characters").optional(),
});

export const updateEventSchema = createEventSchema.partial();
