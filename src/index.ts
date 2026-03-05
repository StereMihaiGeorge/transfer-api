import express from 'express';
import authRoutes from "./routes/auth";
import eventRoutes from "./routes/events";
import { errorHandler } from "./middleware/errorHandler";
import { logger } from "./middleware/logger";
import "./config/db"; // trigger connection test on startup

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(logger);

// Health check 

app.get("/health", (_, res) => {
    res.json({ status: "ok"})
})

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);


app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on htpp://localhost:${PORT}`);
})