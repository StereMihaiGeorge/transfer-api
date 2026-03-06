import { z } from "zod";

export const rsvpSchema = z.object({
  status: z.enum(["confirmed", "declined"], {
    error: "Status must be confirmed or declined",
  }),
  member_count: z
    .number()
    .int()
    .min(1, "Must have at least 1 member")
    .max(20, "Cannot exceed 20 members")
    .optional(),
});

export const preferencesSchema = z.object({
  meal_preference: z
    .string({ error: "Meal preference is required" })
    .max(100, "Meal preference must be less than 100 characters"),
  special_needs: z.string().max(500, "Special needs must be less than 500 characters").optional(),
  sit_with: z.string().max(255, "Sit with must be less than 255 characters").optional(),
  not_sit_with: z.string().max(255, "Not sit with must be less than 255 characters").optional(),
});
