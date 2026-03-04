import { Request, Response } from "express";
import { transferFunds } from "../services/transferService";

export const handleTransfer = async (req: Request, res: Response): Promise<void> => {
    const { sender_id, receiver_id, amount} = req.body;

    try {
        const result = await transferFunds(sender_id, receiver_id, amount);
        res.status(200).json(result);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unexpected error occurred";
        res.status(400).json({ error: message });
    }
}