import { Request, Response, NextFunction } from "express";

export const logger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  // Log when response finishes
  res.on("finish", () => {
    const duration = Date.now() - start;
    let statusColor: string;
    if (res.statusCode >= 500) {
      statusColor = "\x1b[31m";
    } else if (res.statusCode >= 400) {
      statusColor = "\x1b[33m";
    } else if (res.statusCode >= 200) {
      statusColor = "\x1b[32m";
    } else {
      statusColor = "\x1b[0m";
    }

    console.log(
      `${statusColor}[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} - ${duration}ms\x1b[0m`
    );
  });

  next();
};