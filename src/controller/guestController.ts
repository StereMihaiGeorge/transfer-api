import { Response } from "express";
import { AuthRequest } from "../middleware/authenticate";
import {
  createGuest,
  getGuestsByEventId,
  updateGuest,
  deleteGuest,
  assignGuestToTable,
} from "../services/guestService";

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const guest = await createGuest(Number.parseInt(req.params.id as string), req.body);
    res.status(201).json({ message: "Guest added successfully", guest });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error occurred";
    res.status(400).json({ error: message });
  }
};

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const guests = await getGuestsByEventId(Number.parseInt(req.params.id as string));
    res.status(200).json({ guests, total: guests.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error occurred";
    res.status(400).json({ error: message });
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const guest = await updateGuest(Number.parseInt(req.params.gid as string), req.body);
    res.status(200).json({ message: "Guest updated successfully", guest });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error occurred";
    res.status(400).json({ error: message });
  }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await deleteGuest(Number.parseInt(req.params.gid as string));
    res.status(200).json({ message: "Guest removed successfully" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error occurred";
    res.status(400).json({ error: message });
  }
};

export const assignTable = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const guest = await assignGuestToTable(
      Number.parseInt(req.params.gid as string),
      req.body.table_id,
      Number.parseInt(req.params.id as string)
    );
    res.status(200).json({ message: "Guest assigned to table successfully", guest });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error occurred";
    res.status(400).json({ error: message });
  }
};