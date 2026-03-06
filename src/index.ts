import express from 'express';
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth";
import eventRoutes from "./routes/events";
import guestRoutes from "./routes/guests";
import tableRoutes from "./routes/tables";
import rsvpRoutes from "./routes/rsvp";
import todoRoutes from "./routes/todo";
import { errorHandler } from "./middleware/errorHandler";
import { logger } from "./middleware/logger";
import "./config/db"; // trigger connection test on startup

const app = express();
const PORT = 3000;

// Security headers
app.use(helmet());

// CORS — only allow your frontend domain
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // max 10 requests per 15 minutes
  message: { error: "Too many attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// General rate limiting for all routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // max 100 requests per 15 minutes
  message: { error: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json());
app.use(logger);
app.use(generalLimiter);

// Health check 

app.get("/health", (_, res) => {
    res.json({ status: "ok"})
})

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/events/:id/guests", guestRoutes);
app.use("/api/events/:id/tables", tableRoutes);
app.use("/api/events/:id/todos", todoRoutes);
app.use("/api/rsvp", rsvpRoutes);


app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on htpp://localhost:${PORT}`);
})