import { pool } from "../config/db";
import { Guest, CreateGuestInput } from "../models/guests";

export const createGuest = async (
  eventId: number,
  input: CreateGuestInput
): Promise<Guest> => {
  const result = await pool.query<Guest>(
    `INSERT INTO guests (event_id, name, email, phone, side, member_count)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [eventId, input.name, input.email || null, input.phone || null, input.side, input.member_count ?? 1]
  );
  return result.rows[0];
};

export const getGuestsByEventId = async (eventId: number): Promise<Guest[]> => {
  const result = await pool.query<Guest>(
    `SELECT g.*, t.name as table_name
     FROM guests g
     LEFT JOIN tables t ON g.table_id = t.id
     WHERE g.event_id = $1
     ORDER BY g.created_at ASC`,
    [eventId]
  );
  return result.rows;
};

export const getGuestByToken = async (token: string): Promise<Guest | null> => {
  const result = await pool.query<Guest>(
    `SELECT g.*, e.bride_name, e.groom_name, e.date, e.venue, e.city, e.cover_message
     FROM guests g
     JOIN events e ON g.event_id = e.id
     WHERE g.token = $1`,
    [token]
  );
  return result.rows[0] || null;
};

export const updateGuest = async (
  guestId: number,
  input: Partial<CreateGuestInput>
): Promise<Guest> => {
  const fields = Object.keys(input);
  const values = Object.values(input);

  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  const setClause = fields
    .map((field, index) => `${field} = $${index + 1}`)
    .join(", ");

  const result = await pool.query<Guest>(
    `UPDATE guests SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
    [...values, guestId]
  );

  return result.rows[0];
};

export const deleteGuest = async (guestId: number): Promise<void> => {
  await pool.query("DELETE FROM guests WHERE id = $1", [guestId]);
};

export const assignGuestToTable = async (
  guestId: number,
  tableId: number,
  eventId: number
): Promise<Guest> => {
  // Check table belongs to same event
  const table = await pool.query(
    "SELECT id, capacity FROM tables WHERE id = $1 AND event_id = $2",
    [tableId, eventId]
  );

  if (table.rows.length === 0) {
    throw new Error("Table not found or does not belong to this event");
  }

  // Get the guest's member_count
  const guestResult = await pool.query(
    "SELECT member_count FROM guests WHERE id = $1",
    [guestId]
  );
  const memberCount = Number.parseInt(guestResult.rows[0]?.member_count ?? 1);

  // Check table capacity using sum of member_count
  const occupiedResult = await pool.query(
    "SELECT COALESCE(SUM(member_count), 0) AS occupied FROM guests WHERE table_id = $1",
    [tableId]
  );

  const occupied = Number.parseInt(occupiedResult.rows[0].occupied);
  const capacity = table.rows[0].capacity;
  const available = capacity - occupied;

  if (memberCount > available) {
    throw new Error(`Not enough spots at this table. Available: ${available}, Required: ${memberCount}`);
  }

  const result = await pool.query<Guest>(
    "UPDATE guests SET table_id = $1 WHERE id = $2 RETURNING *",
    [tableId, guestId]
  );

  return result.rows[0];
};

export const markAsInvited = async (guestId: number): Promise<Guest> => {
  const result = await pool.query<Guest>(
    `UPDATE guests 
     SET invitation_sent = true 
     WHERE id = $1 
     RETURNING *`,
    [guestId]
  );

  if (result.rows.length === 0) {
    throw new Error("Guest not found");
  }

  return result.rows[0];
};