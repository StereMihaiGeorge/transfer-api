import { Response } from "express";
import { AuthRequest } from "../middleware/authenticate";
import {
  createTable,
  getTablesByEventId,
  getTableById,
  updateTable,
  deleteTable,
} from "../services/tableService";

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const table = await createTable(Number.parseInt(id), req.body);
    res.status(201).json({ message: "Table created successfully", table });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error occurred";
    res.status(400).json({ error: message });
  }
};

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const tables = await getTablesByEventId(Number.parseInt(id));
    res.status(200).json({ tables, total: tables.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error occurred";
    res.status(400).json({ error: message });
  }
};

export const getOne = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tid = Array.isArray(req.params.tid) ? req.params.tid[0] : req.params.tid;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const table = await getTableById(
      Number.parseInt(tid),
      Number.parseInt(id)
    );
    if (!table) {
      res.status(404).json({ error: "Table not found" });
      return;
    }
    res.status(200).json({ table });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error occurred";
    res.status(400).json({ error: message });
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tid = Array.isArray(req.params.tid) ? req.params.tid[0] : req.params.tid;
    const table = await updateTable(Number.parseInt(tid), req.body);
    res.status(200).json({ message: "Table updated successfully", table });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error occurred";
    res.status(400).json({ error: message });
  }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tid = Array.isArray(req.params.tid) ? req.params.tid[0] : req.params.tid;
    await deleteTable(Number.parseInt(tid));
    res.status(200).json({ message: "Table deleted successfully" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error occurred";
    res.status(400).json({ error: message });
  }
};