import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import authRoutes from "./routes/auth";
import eventRoutes from "./routes/events";
import guestRoutes from "./routes/guests";
import tableRoutes from "./routes/tables";
import rsvpRoutes from "./routes/rsvp";
import todoRoutes from "./routes/todo";
import songRoutes from "./routes/songs";
import { errorHandler } from "./middleware/errorHandler";
import { sanitizeInput } from "./middleware/sanitize";
import { httpLogger } from "./middleware/httpLogger";
import logger from "./config/logger";
import "./config/db"; // trigger connection test on startup

const app = express();
const PORT = 3000;

// Security headers
app.use(helmet());

// CORS — only allow your frontend domain
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 requests per 15 minutes
  message: { error: "Too many attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// General rate limiting for all routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per 15 minutes
  message: { error: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json({ limit: "10kb" })); // limit JSON body to 10kb
app.use(sanitizeInput);
app.use(httpLogger);
app.use(generalLimiter);

// Swagger docs
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/events", eventRoutes);
app.use("/api/v1/events/:id/guests", guestRoutes);
app.use("/api/v1/events/:id/tables", tableRoutes);
app.use("/api/v1/events/:id/todos", todoRoutes);
app.use("/api/v1/events/:id/songs", songRoutes);
app.use("/api/v1/rsvp", rsvpRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
  logger.info(`📚 Swagger docs: http://localhost:${PORT}/api/docs`);
});
