import { Request, Response } from "express";
import { registerUser, loginUser, refreshAccessToken, logoutUser } from "../services/authService";

export const register = async (req: Request, res: Response): Promise<void> => {
  const { username, password, balance } = req.body;

  try {
    const user = await registerUser(username, password, balance);
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected error occured";
    res.status(400).json({ error: message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  try {
    const { accessToken, refreshToken } = await loginUser(username, password);
    res.status(200).json({ message: "Login successful", accessToken, refreshToken });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected error occured";
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
    const message =
      error instanceof Error ? error.message : "Unexpected error occured";
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
    const message =
      error instanceof Error ? error.message : "Unexpected error occured";
    res.status(500).json({ error: message });
  }
};
