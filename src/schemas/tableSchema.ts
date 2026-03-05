import { z } from "zod";

export const createTableSchema = z.object({
  name: z
    .string({ error: "Table name is required" })
    .min(1, "Table name must be at least 1 character")
    .max(100, "Table name must be less than 100 characters"),
  capacity: z
    .number({ error: "Capacity is required" })
    .int("Capacity must be a whole number")
    .positive("Capacity must be greater than 0")
    .max(50, "Capacity cannot exceed 50 per table"),
});

export const updateTableSchema = createTableSchema.partial();