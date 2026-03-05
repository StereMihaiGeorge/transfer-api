import { Response, NextFunction } from "express";
import { pool } from "../config/db";
import { AuthRequest } from "./authenticate";

export const authorizeEvent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const eventId = Number.parseInt(req.params.id as string);

    if (Number.isNaN(eventId)) {
      res.status(400).json({ error: "Invalid event ID" });
      return;
    }

    const result = await pool.query(
      "SELECT id, user_id FROM events WHERE id = $1",
      [eventId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    const event = result.rows[0];

    if (event.user_id !== req.user?.id) {
      res.status(403).json({ error: "Forbidden — this event does not belong to you" });
      return;
    }

    // Now fully typed, no 'as any' needed
    req.event = event;

    next();
  } catch (error) {
    next(error);
  }
};