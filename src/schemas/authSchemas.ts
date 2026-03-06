import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string({ error: "Username is required" })
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be less than 50 characters"),
  email: z.string({ error: "Email is required" }).check(z.email("Invalid email format")),
  password: z
    .string({ error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .check(z.regex(/[A-Z]/, "Password must contain at least one uppercase letter"))
    .check(z.regex(/\d/, "Password must contain at least one number")),
});

export const loginSchema = z.object({
  email: z.string({ error: "Email is required" }).check(z.email("Invalid email format")),
  password: z.string({ error: "Password is required" }).min(1, "Password is required"),
});

export const refreshSchema = z.object({
  refreshToken: z
    .string({ error: "Refresh token is required" })
    .min(1, "Refresh token is required"),
});

export const logoutSchema = z.object({
  refreshToken: z
    .string({ error: "Refresh token is required" })
    .min(1, "Refresh token is required"),
});
