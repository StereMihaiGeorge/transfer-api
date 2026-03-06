import { Request, Response } from "express";
import {
  getGuestByToken,
  respondToRSVP,
  submitPreferences,
} from "../services/rspvService";
import { createSongRequestByToken } from "../services/songService";
import { sendPreferencesEmail } from "../emails/emailService";

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
    const { status, member_count } = req.body;

    console.log("RSVP body:", req.body);
    console.log("member_count:", member_count, typeof member_count);
    const guest = await respondToRSVP(token, status, member_count);

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

    if (guest.email) {
      sendPreferencesEmail(guest.id, guest.event_id, token).catch(console.error);
    }

    res.status(200).json({
      message: "Preferences saved successfully",
      guest,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error occurred";
    res.status(400).json({ error: message });
  }
};

export const addSongRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = String(req.params.token);
    const songRequest = await createSongRequestByToken(token, req.body);
    res.status(201).json({ message: "Song request submitted successfully", songRequest });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error occurred";
    res.status(400).json({ error: message });
  }
};
