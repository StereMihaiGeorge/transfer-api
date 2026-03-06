import { Response } from "express";
import { AuthRequest } from "../middleware/authenticate";
import {
  createEvent,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventDashboard,
} from "../services/eventService";

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const event = await createEvent(req.user!.id, req.body);
    res.status(201).json({ message: "Event created successfully", event });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error occurred";
    res.status(400).json({ error: message });
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const event = await getEventById(Number.parseInt(req.params.id as string));
    res.status(200).json({ event });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error occurred";
    res.status(400).json({ error: message });
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const event = await updateEvent(Number.parseInt(req.params.id as string), req.body);
    res.status(200).json({ message: "Event updated successfully", event });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error occurred";
    res.status(400).json({ error: message });
  }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await deleteEvent(Number.parseInt(req.params.id as string));
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error occurred";
    res.status(400).json({ error: message });
  }
};

export const dashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await getEventDashboard(Number.parseInt(req.params.id as string));
    res.status(200).json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error occurred";
    res.status(400).json({ error: message });
  }
};