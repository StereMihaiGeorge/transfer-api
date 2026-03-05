import { pool } from "../config/db";
import { Event, CreateEventInput } from "../models/event";

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

  return result.rows[0];
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