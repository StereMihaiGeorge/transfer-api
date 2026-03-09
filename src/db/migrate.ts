import { pool } from "../config/db";

const migrate = async () => {
  const client = await pool.connect();

  try {
    console.log("🔄 Running fresh migration...");

    // Drop all tables in correct FK order
    await client.query(`
      DROP TABLE IF EXISTS email_logs CASCADE;
      DROP TABLE IF EXISTS song_requests CASCADE;
      DROP TABLE IF EXISTS event_songs CASCADE;
      DROP TABLE IF EXISTS todos CASCADE;
      DROP TABLE IF EXISTS guests CASCADE;
      DROP TABLE IF EXISTS tables CASCADE;
      DROP TABLE IF EXISTS birthday_details CASCADE;
      DROP TABLE IF EXISTS baptism_details CASCADE;
      DROP TABLE IF EXISTS wedding_details CASCADE;
      DROP TABLE IF EXISTS events CASCADE;
      DROP TABLE IF EXISTS password_reset_tokens CASCADE;
      DROP TABLE IF EXISTS refresh_tokens CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);
    console.log("✅ Dropped all existing tables");

    // Users
    await client.query(`
      CREATE TABLE users (
        id         SERIAL PRIMARY KEY,
        username   VARCHAR(100) UNIQUE NOT NULL,
        email      VARCHAR(100) UNIQUE NOT NULL,
        password   VARCHAR(255) NOT NULL,
        plan       VARCHAR(20) NOT NULL DEFAULT 'free',
        language   VARCHAR(5) NOT NULL DEFAULT 'ro',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ Table 'users' created");

    // Password reset tokens
    await client.query(`
      CREATE TABLE password_reset_tokens (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token      UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ Table 'password_reset_tokens' created");

    // Refresh tokens
    await client.query(`
      CREATE TABLE refresh_tokens (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token      VARCHAR(512) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ Table 'refresh_tokens' created");

    // Events (base table)
    await client.query(`
      CREATE TABLE events (
        id            SERIAL PRIMARY KEY,
        user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type          VARCHAR(20) NOT NULL CHECK (type IN ('wedding', 'baptism', 'birthday')),
        title         VARCHAR(255) NOT NULL,
        date          DATE NOT NULL,
        venue         VARCHAR(255) NOT NULL,
        city          VARCHAR(100) NOT NULL,
        slug          VARCHAR(255) UNIQUE NOT NULL,
        cover_message TEXT,
        created_at    TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ Table 'events' created");

    // Wedding details
    await client.query(`
      CREATE TABLE wedding_details (
        id         SERIAL PRIMARY KEY,
        event_id   INTEGER NOT NULL UNIQUE REFERENCES events(id) ON DELETE CASCADE,
        bride_name VARCHAR(100) NOT NULL,
        groom_name VARCHAR(100) NOT NULL
      );
    `);
    console.log("✅ Table 'wedding_details' created");

    // Baptism details
    await client.query(`
      CREATE TABLE baptism_details (
        id                  SERIAL PRIMARY KEY,
        event_id            INTEGER NOT NULL UNIQUE REFERENCES events(id) ON DELETE CASCADE,
        child_name          VARCHAR(100) NOT NULL,
        child_date_of_birth DATE,
        parent_name         VARCHAR(255) NOT NULL,
        godfather_name      VARCHAR(255),
        godmother_name      VARCHAR(255),
        church_name         VARCHAR(255)
      );
    `);
    console.log("✅ Table 'baptism_details' created");

    // Birthday details
    await client.query(`
      CREATE TABLE birthday_details (
        id          SERIAL PRIMARY KEY,
        event_id    INTEGER NOT NULL UNIQUE REFERENCES events(id) ON DELETE CASCADE,
        person_name VARCHAR(100) NOT NULL,
        age         INTEGER,
        theme       VARCHAR(100),
        dress_code  VARCHAR(100)
      );
    `);
    console.log("✅ Table 'birthday_details' created");

    // Tables (seating)
    await client.query(`
      CREATE TABLE tables (
        id         SERIAL PRIMARY KEY,
        event_id   INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        name       VARCHAR(100) NOT NULL,
        capacity   INTEGER NOT NULL DEFAULT 8,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ Table 'tables' created");

    // Guests
    await client.query(`
      CREATE TABLE guests (
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
        special_needs    TEXT,
        sit_with         VARCHAR(255),
        not_sit_with     VARCHAR(255),
        member_count     INTEGER NOT NULL DEFAULT 1,
        token            UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
        token_expires_at TIMESTAMP,
        responded_at     TIMESTAMP,
        created_at       TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ Table 'guests' created");

    // Todos
    await client.query(`
      CREATE TABLE todos (
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
    console.log("✅ Table 'todos' created");

    // Song requests
    await client.query(`
      CREATE TABLE song_requests (
        id         SERIAL PRIMARY KEY,
        event_id   INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        guest_id   INTEGER NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
        song_title VARCHAR(255) NOT NULL,
        artist     VARCHAR(255),
        genre      VARCHAR(50) DEFAULT 'other',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ Table 'song_requests' created");

    // Event songs (couple's special moment songs)
    await client.query(`
      CREATE TABLE event_songs (
        id         SERIAL PRIMARY KEY,
        event_id   INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        moment     VARCHAR(100) NOT NULL,
        song_title VARCHAR(255) NOT NULL,
        artist     VARCHAR(255),
        notes      TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ Table 'event_songs' created");

    // Email logs
    await client.query(`
      CREATE TABLE email_logs (
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
    console.log("✅ Table 'email_logs' created");

    // Indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
      CREATE INDEX IF NOT EXISTS idx_events_user_id         ON events(user_id);
      CREATE INDEX IF NOT EXISTS idx_events_type            ON events(type);
      CREATE INDEX IF NOT EXISTS idx_guests_event_id        ON guests(event_id);
      CREATE INDEX IF NOT EXISTS idx_guests_token           ON guests(token);
      CREATE INDEX IF NOT EXISTS idx_tables_event_id        ON tables(event_id);
      CREATE INDEX IF NOT EXISTS idx_todos_event_id         ON todos(event_id);
      CREATE INDEX IF NOT EXISTS idx_song_requests_event_id ON song_requests(event_id);
      CREATE INDEX IF NOT EXISTS idx_event_songs_event_id   ON event_songs(event_id);
      CREATE INDEX IF NOT EXISTS idx_email_logs_event_id    ON email_logs(event_id);
    `);
    console.log("✅ Indexes created");

    console.log("\n✅ All migrations completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    client.release();
    await pool.end();
  }
};

migrate();
