import { z } from "zod";

export const createGuestSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string().check(z.email("Invalid email format")).optional(),
  phone: z
    .string()
    .min(10, "Phone must be at least 10 characters")
    .max(20, "Phone must be less than 20 characters")
    .optional(),
  side: z.enum(["bride", "groom", "both"], {
    error: "Side must be bride, groom or both",
  }),
  member_count: z
    .number()
    .int()
    .min(1, "Must have at least 1 member")
    .max(20, "Cannot exceed 20 members per entry")
    .default(1)
    .optional(),
});

export const updateGuestSchema = createGuestSchema.partial();

export const assignTableSchema = z.object({
  table_id: z.number({ error: "Table ID is required" }).int().positive(),
});
