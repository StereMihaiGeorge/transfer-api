import { Request, Response } from "express";
import { registerUser, loginUser } from "../services/authService";

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
    const token = await loginUser(username, password);
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected error occured";
    res.status(400).json({ error: message });
  }
};
