import { pool } from "../config/db";
import { Event, CreateEventInput } from "../models/event";
import { seedDefaultTodos } from "./todoService";

// Generate a URL-friendly slug from bride and groom names
const generateSlug = (brideName: string, groomName: string, date: string): string => {
  const year = new Date(date).getFullYear();
  const slug = `${brideName}-si-${groomName}-${year}`
    .toLowerCase()
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "") // remove diacritics (ă, â, î, ș, ț)
    .replaceAll(/[^a-z0-9-]/g, "-")     // replace special chars with dash
    .replaceAll(/-+/g, "-")             // remove duplicate dashes
    .replaceAll(/^-|-$/g, "");          // trim leading/trailing dashes
  return slug;
};

export const createEvent = async (
  userId: number,
  input: CreateEventInput
): Promise<Event> => {
  // Generate slug from names
  let slug = generateSlug(input.bride_name, input.groom_name, input.date);

  // Check if slug already exists and make it unique if needed
  const existing = await pool.query(
    "SELECT id FROM events WHERE slug = $1",
    [slug]
  );
  if (existing.rows.length > 0) {
    slug = `${slug}-${Date.now()}`;
  }

  const result = await pool.query<Event>(
    `INSERT INTO events (user_id, bride_name, groom_name, date, venue, city, slug, cover_message)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      userId,
      input.bride_name,
      input.groom_name,
      input.date,
      input.venue,
      input.city,
      slug,
      input.cover_message || null,
    ]
  );

  const event = result.rows[0];

  // Seed default todos for the new event
  await seedDefaultTodos(event.id); 

  return event;
};

export const getEventById = async (eventId: number): Promise<Event | null> => {
  const result = await pool.query<Event>(
    "SELECT * FROM events WHERE id = $1",
    [eventId]
  );
  return result.rows[0] || null;
};

export const updateEvent = async (
  eventId: number,
  input: Partial<CreateEventInput>
): Promise<Event> => {
  // Dynamically build SET clause from provided fields
  const fields = Object.keys(input);
  const values = Object.values(input);

  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  const setClause = fields
    .map((field, index) => `${field} = $${index + 1}`)
    .join(", ");

  const result = await pool.query<Event>(
    `UPDATE events SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
    [...values, eventId]
  );

  return result.rows[0];
};

export const deleteEvent = async (eventId: number): Promise<void> => {
  await pool.query("DELETE FROM events WHERE id = $1", [eventId]);
};

export const getEventDashboard = async (eventId: number) => {
  // Guest stats
  const guestStats = await pool.query(
    `SELECT
      COUNT(*) AS total_guests,
      COUNT(*) FILTER (WHERE status = 'confirmed') AS confirmed,
      COUNT(*) FILTER (WHERE status = 'declined') AS declined,
      COUNT(*) FILTER (WHERE status = 'pending') AS pending,
      COUNT(*) FILTER (WHERE invitation_sent = true) AS invited,
      COUNT(*) FILTER (WHERE invitation_sent = false) AS not_invited,
      COUNT(*) FILTER (WHERE side = 'bride') AS bride_side,
      COUNT(*) FILTER (WHERE side = 'groom') AS groom_side,
      COUNT(*) FILTER (WHERE side = 'both') AS both_side
     FROM guests
     WHERE event_id = $1`,
    [eventId]
  );

  // Table stats
  const tableStats = await pool.query(
    `SELECT
      COUNT(DISTINCT t.id) AS total_tables,
      COALESCE(SUM(t.capacity), 0) AS total_capacity,
      COUNT(g.id) AS occupied_spots,
      COALESCE(SUM(t.capacity), 0) - COUNT(g.id) AS available_spots
     FROM tables t
     LEFT JOIN guests g ON g.table_id = t.id
     WHERE t.event_id = $1`,
    [eventId]
  );

  // Song stats
  const songStats = await pool.query(
    `SELECT COUNT(*) AS total_requests
     FROM song_requests
     WHERE event_id = $1`,
    [eventId]
  );

  // Todos stats
  const todoStats = await pool.query(
    `SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE status = 'pending') AS pending,
      COUNT(*) FILTER (WHERE status = 'in_progress') AS in_progress,
      COUNT(*) FILTER (WHERE status = 'done') AS done,
      COUNT(*) FILTER (WHERE due_date < NOW() AND status != 'done') AS overdue
     FROM todos
     WHERE event_id = $1`,
    [eventId]
  );

  const guests = guestStats.rows[0];
  const tables = tableStats.rows[0];
  const songs = songStats.rows[0];
  const todos = todoStats.rows[0];

  return {
    guests: {
      total: Number.parseInt(guests.total_guests),
      confirmed: Number.parseInt(guests.confirmed),
      declined: Number.parseInt(guests.declined),
      pending: Number.parseInt(guests.pending),
      invited: Number.parseInt(guests.invited),
      not_invited: Number.parseInt(guests.not_invited),
    },
    tables: {
      total: Number.parseInt(tables.total_tables),
      total_capacity: Number.parseInt(tables.total_capacity),
      occupied_spots: Number.parseInt(tables.occupied_spots),
      available_spots: Number.parseInt(tables.available_spots),
    },
    songs: {
      total_requests: Number.parseInt(songs.total_requests),
    },
    by_side: {
      bride: Number.parseInt(guests.bride_side),
      groom: Number.parseInt(guests.groom_side),
      both: Number.parseInt(guests.both_side),
    },
    todos: {
      total: Number.parseInt(todos.total),
      pending: Number.parseInt(todos.pending),
      in_progress: Number.parseInt(todos.in_progress),
      done: Number.parseInt(todos.done),
      overdue: Number.parseInt(todos.overdue),
    },
  };
};