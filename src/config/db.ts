import { Pool } from "pg";
import { ENV } from "./env";

export const pool = new Pool({
  host: ENV.DB_HOST,
  port: ENV.DB_PORT,
  user: ENV.DB_USER,
  password: ENV.DB_PASSWORD,
  database: ENV.DB_NAME,
});

// Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error("Failed to connect to database", err.message);
    return;
  }
  release();
  console.log("Connected to PostgreSQL");
});
