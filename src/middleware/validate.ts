import { Request, Response, NextFunction } from "express";


export const validateTransfer = (req: Request, res: Response, next: NextFunction) : void => {
    const { sender_id, receiver_id, amount } = req.body;

    if (!sender_id || !receiver_id || !amount) {
        res.status(400).json({ error : "sender_id, receiver_id and amount are required"});
        return;
    }

    if (typeof sender_id !== "number" || typeof receiver_id !== "number") {
        res.status(400).json({error : "sender_id and receiver_id must be numbers"})
        return;
    }

    if (typeof amount !== "number" || amount <=0 ) {
        res.status(400).json({error: "amount must be a positive number"});
        return;
    }
    
    if (sender_id === receiver_id) {
        res.status(400).json({error: "sender and receiver cannot be the same user"});
        return;
    }

    next()
}