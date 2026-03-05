import { pool } from "../config/db";

const migrate = async () => {
  const client = await pool.connect();

  try {
    console.log("🔄 Running migration...");

    // Users table (already exists, we add plan column)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id         SERIAL PRIMARY KEY,
        username   VARCHAR(100) UNIQUE NOT NULL,
        email      VARCHAR(100) UNIQUE NOT NULL,
        password   VARCHAR(255) NOT NULL,
        plan       VARCHAR(20) NOT NULL DEFAULT 'free',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(100) UNIQUE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS plan VARCHAR(20) NOT NULL DEFAULT 'free';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
    `);
    console.log("✅ Table 'users' ready");

    // Events table
    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id              SERIAL PRIMARY KEY,
        user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        bride_name      VARCHAR(100) NOT NULL,
        groom_name      VARCHAR(100) NOT NULL,
        date            DATE NOT NULL,
        venue           VARCHAR(255) NOT NULL,
        city            VARCHAR(100) NOT NULL,
        slug            VARCHAR(255) UNIQUE NOT NULL,
        cover_message   TEXT,
        created_at      TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ Table 'events' ready");

    // Tables table (seating tables at the wedding)
    await client.query(`
      CREATE TABLE IF NOT EXISTS tables (
        id         SERIAL PRIMARY KEY,
        event_id   INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        name       VARCHAR(100) NOT NULL,
        capacity   INTEGER NOT NULL DEFAULT 8,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ Table 'tables' ready");
    

    // Guests table
    await client.query(`
  CREATE TABLE IF NOT EXISTS guests (
    id               SERIAL PRIMARY KEY,
    event_id         INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    table_id         INTEGER REFERENCES tables(id) ON DELETE SET NULL,
    name             VARCHAR(100) NOT NULL,
    email            VARCHAR(100),
    phone            VARCHAR(20),
    side             VARCHAR(10) NOT NULL DEFAULT 'both',
    status           VARCHAR(20) NOT NULL DEFAULT 'pending',
    meal_preference  VARCHAR(100),
    invitation_sent  BOOLEAN NOT NULL DEFAULT FALSE,
    token            UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    token_expires_at TIMESTAMP,
    responded_at     TIMESTAMP,
    created_at       TIMESTAMP DEFAULT NOW()
  );
`);
    
    await client.query(`
  ALTER TABLE guests ADD COLUMN IF NOT EXISTS side VARCHAR(10) NOT NULL DEFAULT 'both';
  ALTER TABLE guests ADD COLUMN IF NOT EXISTS invitation_sent BOOLEAN NOT NULL DEFAULT FALSE;
`);
    console.log("✅ Table 'guests' ready");

    // Song requests table
    await client.query(`
      CREATE TABLE IF NOT EXISTS song_requests (
        id         SERIAL PRIMARY KEY,
        event_id   INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        guest_id   INTEGER NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
        song_title VARCHAR(255) NOT NULL,
        artist     VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ Table 'song_requests' ready");

    // Email logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS email_logs (
        id         SERIAL PRIMARY KEY,
        event_id   INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        guest_id   INTEGER NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
        type       VARCHAR(50) NOT NULL,
        status     VARCHAR(20) NOT NULL DEFAULT 'pending',
        sent_at    TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ Table 'email_logs' ready");

    // Refresh tokens table
    await client.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token      TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ Table 'refresh_tokens' ready");

    console.log("\n✅ All migrations completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    client.release();
    await pool.end();
  }
};

migrate();
