import { pool } from "../config/db";

const migrate = async () => {
  const client = await pool.connect();

  try {
    console.log("🔄 Running migration...");

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id       SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL DEFAULT '',
        balance  NUMERIC(12, 2) NOT NULL DEFAULT 0.00
      );
    `);
    console.log("✅ Table 'users' ready");

    // Add password column if it doesn't exist (for existing tables)
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255) NOT NULL DEFAULT '';
    `);
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(100) DEFAULT '';
    `);
    console.log("✅ Password column ready");

    // Only seed if the table is empty
    const { rows } = await client.query("SELECT COUNT(*) FROM users");
    const count = parseInt(rows[0].count);

    if (count === 0) {
      await client.query(`
        INSERT INTO users (username, balance) VALUES
          ('Alice', 1000.00),
          ('Bob',   1000.00),
          ('Carol',  500.00);
      `);
      console.log("✅ Seeded 3 users: Alice ($1000), Bob ($1000), Carol ($500)");
    } else {
      console.log(`ℹ️  Skipping seed — table already has ${count} users`);
    }

    // Show current state
    const users = await client.query("SELECT id, username, balance FROM users ORDER BY id");
    console.log("\n📋 Current users:");
    console.table(users.rows);

  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    client.release();
    await pool.end();
  }
};

migrate();