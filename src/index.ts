import express from 'express';
import transferRoutes from "./routes/transfer";
import authRoutes from "./routes/auth";
import "./config/db"; // trigger connection test on startup

const app = express();
const PORT = 3000;

app.use(express.json());

// Health check 

app.get("/health", (_, res) => {
    res.json({ status: "ok"})
})

app.use("/api/auth", authRoutes);
app.use("/api", transferRoutes);

app.listen(PORT, () => {
    console.log(`Server running on htpp://localhost:${PORT}`);
})