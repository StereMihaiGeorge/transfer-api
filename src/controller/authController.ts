import { Request, Response } from "express";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  forgotPassword,
  resetPassword,
  getMe,
} from "../services/authService";
import { AuthRequest } from "../middleware/authenticate";
import { AppError } from "../middleware/errorHandler";

export const register = async (req: Request, res: Response): Promise<void> => {
  const { username, email, password } = req.body;

  try {
    const user = await registerUser(username, email, password);
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error occurred";
    res.status(400).json({ error: message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const { accessToken, refreshToken } = await loginUser(email, password);
    res.status(200).json({ message: "Login successful", accessToken, refreshToken });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error occurred";
    res.status(400).json({ error: message });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json({ error: "Refresh token required" });
    return;
  }

  try {
    const accessToken = await refreshAccessToken(refreshToken);
    res.status(200).json({ accessToken });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error occurred";
    res.status(401).json({ error: message });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json({ error: "Refresh token required" });
    return;
  }

  try {
    await logoutUser(refreshToken);
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error occurred";
    res.status(500).json({ error: message });
  }
};

export const forgotPasswordController = async (req: Request, res: Response): Promise<void> => {
  await forgotPassword(req.body.email);
  res.status(200).json({ message: "If this email exists you will receive a reset link shortly" });
};

export const resetPasswordController = async (req: Request, res: Response): Promise<void> => {
  try {
    await resetPassword(req.body.token, req.body.password);
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Unexpected error occurred" });
  }
};

export const getMeController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await getMe(req.user!.id);
    res.status(200).json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error occurred";
    res.status(400).json({ error: message });
  }
};
