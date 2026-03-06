import { z } from "zod";

const todoCategories = [
  "music",
  "venue",
  "flowers",
  "catering",
  "photography",
  "decoration",
  "clothing",
  "transport",
  "honeymoon",
  "other",
] as const;

const todoStatuses = ["pending", "in_progress", "done"] as const;

export const createTodoSchema = z.object({
  title: z
    .string({ error: "Title is required" })
    .min(2, "Title must be at least 2 characters")
    .max(255, "Title must be less than 255 characters"),
  category: z.enum(todoCategories, {
    error: "Invalid category",
  }),
  due_date: z
    .string()
    .refine((val) => !Number.isNaN(Date.parse(val)), "Invalid date format")
    .optional(),
  notes: z.string().max(1000, "Notes must be less than 1000 characters").optional(),
});

export const updateTodoSchema = createTodoSchema
  .extend({
    status: z
      .enum(todoStatuses, {
        error: "Status must be pending, in_progress or done",
      })
      .optional(),
  })
  .partial();
