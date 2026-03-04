import { Pool } from "pg";

export const pool = new Pool({
    host: "localhost",
    port: 5432,
    user: "admin",
    password: "my-pass",
    database: "app_test"
})

// Test connection on startup
pool.connect((err, client, release) => {
    if (err) {
        console.error("Failed to connect to database", err.message);
        return;
    }
    release();
    console.log("Connected to PostgreSQL")
})