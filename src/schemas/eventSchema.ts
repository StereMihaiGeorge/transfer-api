import { z } from "zod";

const baseEventSchema = z.object({
  title: z
    .string({ error: "Title is required" })
    .min(2, "Title must be at least 2 characters")
    .max(255, "Title must be less than 255 characters"),
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
  cover_message: z.string().max(500, "Cover message must be less than 500 characters").optional(),
});

export const createWeddingSchema = baseEventSchema.extend({
  type: z.literal("wedding"),
  bride_name: z
    .string({ error: "Bride name is required" })
    .min(2, "Bride name must be at least 2 characters")
    .max(100, "Bride name must be less than 100 characters"),
  groom_name: z
    .string({ error: "Groom name is required" })
    .min(2, "Groom name must be at least 2 characters")
    .max(100, "Groom name must be less than 100 characters"),
});

export const createBaptismSchema = baseEventSchema.extend({
  type: z.literal("baptism"),
  child_name: z
    .string({ error: "Child name is required" })
    .min(2, "Child name must be at least 2 characters")
    .max(100, "Child name must be less than 100 characters"),
  child_date_of_birth: z
    .string()
    .refine((val) => !Number.isNaN(Date.parse(val)), "Invalid date format")
    .optional(),
  parent_name: z
    .string({ error: "Parent name is required" })
    .min(2, "Parent name must be at least 2 characters")
    .max(255, "Parent name must be less than 255 characters"),
  godfather_name: z.string().max(255).optional(),
  godmother_name: z.string().max(255).optional(),
  church_name: z.string().max(255).optional(),
});

export const createBirthdaySchema = baseEventSchema.extend({
  type: z.literal("birthday"),
  person_name: z
    .string({ error: "Person name is required" })
    .min(2, "Person name must be at least 2 characters")
    .max(100, "Person name must be less than 100 characters"),
  age: z.number().int().min(1).max(120).optional(),
  theme: z.string().max(100).optional(),
  dress_code: z.string().max(100).optional(),
});

export const createEventSchema = z.discriminatedUnion("type", [
  createWeddingSchema,
  createBaptismSchema,
  createBirthdaySchema,
]);

export const updateWeddingSchema = createWeddingSchema.omit({ type: true }).partial();
export const updateBaptismSchema = createBaptismSchema.omit({ type: true }).partial();
export const updateBirthdaySchema = createBirthdaySchema.omit({ type: true }).partial();

export const updateEventSchema = z.union([
  updateWeddingSchema,
  updateBaptismSchema,
  updateBirthdaySchema,
]);
