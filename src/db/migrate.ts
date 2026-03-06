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
    member_count     INTEGER NOT NULL DEFAULT 1,
    token            UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    token_expires_at TIMESTAMP,
    responded_at     TIMESTAMP,
    created_at       TIMESTAMP DEFAULT NOW()
  );
`);

    await client.query(`
  ALTER TABLE guests ADD COLUMN IF NOT EXISTS special_needs TEXT;
  ALTER TABLE guests ADD COLUMN IF NOT EXISTS sit_with VARCHAR(255);
  ALTER TABLE guests ADD COLUMN IF NOT EXISTS not_sit_with VARCHAR(255);
  ALTER TABLE guests ADD COLUMN IF NOT EXISTS member_count INTEGER NOT NULL DEFAULT 1;
`);
    console.log("✅ Guest preference columns ready");

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
    await client.query(`
      ALTER TABLE song_requests ADD COLUMN IF NOT EXISTS genre VARCHAR(50) DEFAULT 'other';
    `);
    console.log("✅ Table 'song_requests' ready");

    // Event songs table (couple's special moment songs)
    await client.query(`
      CREATE TABLE IF NOT EXISTS event_songs (
        id         SERIAL PRIMARY KEY,
        event_id   INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        moment     VARCHAR(100) NOT NULL,
        song_title VARCHAR(255) NOT NULL,
        artist     VARCHAR(255),
        notes      TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ Table 'event_songs' ready");

    // Email logs table
    await client.query(`
  CREATE TABLE IF NOT EXISTS email_logs (
    id            SERIAL PRIMARY KEY,
    event_id      INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    guest_id      INTEGER NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
    type          VARCHAR(50) NOT NULL,
    status        VARCHAR(20) NOT NULL DEFAULT 'pending',
    error_message TEXT,
    sent_at       TIMESTAMP DEFAULT NOW(),
    created_at    TIMESTAMP DEFAULT NOW()
  );
`);

    // Add column if table already exists
    await client.query(`
  ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS error_message TEXT;
  ALTER TABLE email_logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
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

    // Todos table
    await client.query(`
  CREATE TABLE IF NOT EXISTS todos (
    id         SERIAL PRIMARY KEY,
    event_id   INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    title      VARCHAR(255) NOT NULL,
    category   VARCHAR(50) NOT NULL DEFAULT 'other',
    status     VARCHAR(20) NOT NULL DEFAULT 'pending',
    due_date   DATE,
    notes      TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  );
`);
    console.log("✅ Table 'todos' ready");

    // Indexes for performance
    await client.query(`
  CREATE INDEX IF NOT EXISTS idx_guests_event_id ON guests(event_id);
  CREATE INDEX IF NOT EXISTS idx_tables_event_id ON tables(event_id);
  CREATE INDEX IF NOT EXISTS idx_todos_event_id ON todos(event_id);
  CREATE INDEX IF NOT EXISTS idx_song_requests_event_id ON song_requests(event_id);
  CREATE INDEX IF NOT EXISTS idx_email_logs_event_id ON email_logs(event_id);
  CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
  CREATE INDEX IF NOT EXISTS idx_guests_token ON guests(token);
  CREATE INDEX IF NOT EXISTS idx_event_songs_event_id ON event_songs(event_id);
`);
    console.log("✅ Indexes ready");

    console.log("\n✅ All migrations completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    client.release();
    await pool.end();
  }
};

migrate();
