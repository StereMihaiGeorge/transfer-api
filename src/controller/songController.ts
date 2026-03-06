import { Response } from "express";
import { AuthRequest } from "../middleware/authenticate";
import {
  createEventSong,
  getEventSongs,
  updateEventSong,
  deleteEventSong,
  exportSongsAsCSV,
} from "../services/songService";

export const createSpecialSong = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const song = await createEventSong(Number.parseInt(req.params.id as string), req.body);
    res.status(201).json({ message: "Song added successfully", song });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error occurred";
    res.status(400).json({ error: message });
  }
};

export const getSpecialSongs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const songs = await getEventSongs(Number.parseInt(req.params.id as string));
    res.status(200).json({ songs, total: songs.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error occurred";
    res.status(400).json({ error: message });
  }
};

export const updateSpecialSong = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const song = await updateEventSong(Number.parseInt(req.params.sid as string), req.body);
    res.status(200).json({ message: "Song updated successfully", song });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error occurred";
    res.status(400).json({ error: message });
  }
};

export const deleteSpecialSong = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await deleteEventSong(Number.parseInt(req.params.sid as string));
    res.status(200).json({ message: "Song deleted successfully" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error occurred";
    res.status(400).json({ error: message });
  }
};

export const exportSongs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const csvString = await exportSongsAsCSV(Number.parseInt(req.params.id as string));
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="playlist-nunta.csv"');
    res.send(csvString);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error occurred";
    res.status(400).json({ error: message });
  }
};
