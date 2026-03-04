import { pool } from "../config/db";

const migrate = async () => {
  const client = await pool.connect();

  try {
    console.log("🔄 Running migration...");

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id       SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        balance  NUMERIC(12, 2) NOT NULL DEFAULT 0.00
      );
    `);
    console.log("✅ Table 'users' ready");

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
    const users = await client.query("SELECT * FROM users ORDER BY id");
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