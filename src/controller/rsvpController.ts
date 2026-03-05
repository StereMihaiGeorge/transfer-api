import { Request, Response } from "express";
import {
  getGuestByToken,
  respondToRSVP,
  submitPreferences,
} from "../services/rspvService";

export const getInvitation = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = String(req.params.token);
    const data = await getGuestByToken(token);
    res.status(200).json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error occurred";
    res.status(404).json({ error: message });
  }
};

export const respond = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = String(req.params.token);
    const { status } = req.body;
    const guest = await respondToRSVP(token, status);

    res.status(200).json({
      message: status === "confirmed"
        ? "Attendance confirmed successfully"
        : "Response recorded successfully",
      guest,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error occurred";
    res.status(400).json({ error: message });
  }
};

export const preferences = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = String(req.params.token);
    const guest = await submitPreferences(token, req.body);
    res.status(200).json({
      message: "Preferences saved successfully",
      guest,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error occurred";
    res.status(400).json({ error: message });
  }
};
