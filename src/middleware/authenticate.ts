import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { ENV } from "../config/env";

export interface AuthRequest extends Request {
    user?: {
        id: number, 
        username: string
    };
    event?: {
        id: number,
        user_id: number,
    }
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({error: 'No token provided'});
        return;
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, ENV.JWT_SECRET) as { id: number, username: string};
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({error: "Invalid or expired token"});
    }
}