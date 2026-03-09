import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/db";
import { ENV } from "../config/env";
import { UserPublic } from "../models/user";
import { AppError } from "../middleware/errorHandler";
import { sendPasswordResetEmail } from "../emails/emailService";
import logger from "../config/logger";

const SALT_ROUNDS = 10;

export const registerUser = async (
  username: string,
  email: string,
  password: string
): Promise<UserPublic> => {
  const existingUsername = await pool.query("SELECT id FROM users WHERE username = $1", [username]);
  if (existingUsername.rows.length > 0) {
    throw new Error("Username already taken");
  }

  const existingEmail = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  if (existingEmail.rows.length > 0) {
    throw new Error("Email already registered");
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const result = await pool.query<UserPublic>(
    `INSERT INTO users (username, email, password)
         VALUES ($1, $2, $3)
         RETURNING id, username, email, plan`,
    [username, email, hashedPassword]
  );

  return result.rows[0];
};

export const loginUser = async (
  email: string,
  password: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

  if (result.rows.length === 0) {
    throw new Error("Invalid email or password");
  }

  const user = result.rows[0];

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new Error("Invalid email or password");
  }

  const accessToken = jwt.sign({ id: user.id, username: user.username }, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_ACCESS_EXPIRES as jwt.SignOptions["expiresIn"],
  });

  const refreshToken = jwt.sign({ id: user.id, username: user.username }, ENV.JWT_REFRESH_SECRET, {
    expiresIn: ENV.JWT_REFRESH_EXPIRES as jwt.SignOptions["expiresIn"],
  });

  const decoded = jwt.decode(refreshToken) as { exp: number };
  const expiresAt = new Date(decoded.exp * 1000);

  const hashedToken = await bcrypt.hash(refreshToken, SALT_ROUNDS);

  await pool.query("INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)", [
    user.id,
    hashedToken,
    expiresAt,
  ]);

  return { accessToken, refreshToken };
};

export const refreshAccessToken = async (refreshToken: string): Promise<string> => {
  let payload: { id: number; username: string };

  try {
    payload = jwt.verify(refreshToken, ENV.JWT_REFRESH_SECRET) as { id: number; username: string };
  } catch {
    throw new Error("Invalid or expired refresh token");
  }

  const result = await pool.query(
    "SELECT id, token FROM refresh_tokens WHERE user_id = $1 AND expires_at > NOW()",
    [payload.id]
  );

  const matched = await Promise.all(
    result.rows.map((row) => bcrypt.compare(refreshToken, row.token))
  ).then((results) => results.some(Boolean));

  if (!matched) {
    throw new Error("Refresh token not found or revoked");
  }

  return jwt.sign({ id: payload.id, username: payload.username }, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_ACCESS_EXPIRES as jwt.SignOptions["expiresIn"],
  });
};

export const logoutUser = async (refreshToken: string): Promise<void> => {
  let payload: { id: number };
  try {
    payload = jwt.verify(refreshToken, ENV.JWT_REFRESH_SECRET) as { id: number };
  } catch {
    return; // token is invalid/expired — nothing to revoke
  }

  const result = await pool.query(
    "SELECT id, token FROM refresh_tokens WHERE user_id = $1 AND expires_at > NOW()",
    [payload.id]
  );

  for (const row of result.rows) {
    const match = await bcrypt.compare(refreshToken, row.token);
    if (match) {
      await pool.query("DELETE FROM refresh_tokens WHERE id = $1", [row.id]);
      return;
    }
  }
};

export const forgotPassword = async (email: string): Promise<void> => {
  const result = await pool.query<{ id: number }>("SELECT id FROM users WHERE email = $1", [email]);
  if (result.rows.length === 0) return; // silent — prevents user enumeration

  const userId = result.rows[0].id;

  // Only one active reset token at a time
  await pool.query("DELETE FROM password_reset_tokens WHERE user_id = $1", [userId]);

  const tokenResult = await pool.query<{ token: string }>(
    `INSERT INTO password_reset_tokens (user_id, expires_at)
     VALUES ($1, NOW() + INTERVAL '1 hour')
     RETURNING token`,
    [userId]
  );
  const token = tokenResult.rows[0].token;

  sendPasswordResetEmail(userId, token).catch((err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`[Auth] Failed to send password reset email: ${message}`);
  });
};

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  const result = await pool.query<{ user_id: number }>(
    `SELECT prt.user_id
     FROM password_reset_tokens prt
     WHERE prt.token = $1 AND prt.expires_at > NOW()`,
    [token]
  );

  if (result.rows.length === 0) {
    throw new AppError("Invalid or expired reset token", 400);
  }

  const { user_id } = result.rows[0];

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, user_id]);

  await pool.query("DELETE FROM password_reset_tokens WHERE token = $1", [token]);
  await pool.query("DELETE FROM refresh_tokens WHERE user_id = $1", [user_id]);
};
