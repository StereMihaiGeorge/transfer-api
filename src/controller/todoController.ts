import { Response } from "express";
import { AuthRequest } from "../middleware/authenticate";
import {
  createTodo,
  getTodosByEventId,
  updateTodo,
  deleteTodo,
} from "../services/todoService";

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const todo = await createTodo(Number.parseInt(req.params.id as string), req.body);
    res.status(201).json({ message: "Todo created successfully", todo });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error occurred";
    res.status(400).json({ error: message });
  }
};

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const todos = await getTodosByEventId(Number.parseInt(req.params.id as string));
    res.status(200).json({ todos, total: todos.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error occurred";
    res.status(400).json({ error: message });
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const todo = await updateTodo(Number.parseInt(req.params.tid as string), req.body);
    res.status(200).json({ message: "Todo updated successfully", todo });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error occurred";
    res.status(400).json({ error: message });
  }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await deleteTodo(Number.parseInt(req.params.tid as string));
    res.status(200).json({ message: "Todo deleted successfully" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error occurred";
    res.status(400).json({ error: message });
  }
};