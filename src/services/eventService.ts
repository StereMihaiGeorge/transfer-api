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
      COALESCE(SUM(member_count), 0) AS total_people,
      COUNT(*) AS total_entries,
      COALESCE(SUM(member_count) FILTER (WHERE status = 'confirmed'), 0) AS confirmed_people,
      COALESCE(SUM(member_count) FILTER (WHERE status = 'declined'), 0) AS declined_people,
      COALESCE(SUM(member_count) FILTER (WHERE status = 'pending'), 0) AS pending_people,
      COALESCE(SUM(member_count) FILTER (WHERE invitation_sent = true), 0) AS invited_people,
      COALESCE(SUM(member_count) FILTER (WHERE invitation_sent = false), 0) AS not_invited_people,
      COALESCE(SUM(member_count) FILTER (WHERE side = 'bride'), 0) AS bride_side,
      COALESCE(SUM(member_count) FILTER (WHERE side = 'groom'), 0) AS groom_side,
      COALESCE(SUM(member_count) FILTER (WHERE side = 'both'), 0) AS both_side
     FROM guests
     WHERE event_id = $1`,
    [eventId]
  );

  // Table stats
  const tableStats = await pool.query(
    `SELECT
      COUNT(DISTINCT t.id) AS total_tables,
      COALESCE(SUM(t.capacity), 0) AS total_capacity,
      COALESCE(SUM(g.member_count), 0) AS occupied_spots,
      COALESCE(SUM(t.capacity), 0) - COALESCE(SUM(g.member_count), 0) AS available_spots
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
      total_entries: Number.parseInt(guests.total_entries),
      total_people: Number.parseInt(guests.total_people),
      confirmed: Number.parseInt(guests.confirmed_people),
      declined: Number.parseInt(guests.declined_people),
      pending: Number.parseInt(guests.pending_people),
      invited: Number.parseInt(guests.invited_people),
      not_invited: Number.parseInt(guests.not_invited_people),
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