import { pool } from "../config/db";
import { Table, CreateTableInput } from "../models/table";

export const createTable = async (
  eventId: number,
  input: CreateTableInput
): Promise<Table> => {
  const result = await pool.query<Table>(
    `INSERT INTO tables (event_id, name, capacity)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [eventId, input.name, input.capacity]
  );
  return result.rows[0];
};

export const getTablesByEventId = async (eventId: number): Promise<Table[]> => {
  const result = await pool.query<Table>(
    `SELECT t.*,
      COUNT(g.id) AS guests_count,
      t.capacity - COUNT(g.id) AS available_spots
     FROM tables t
     LEFT JOIN guests g ON g.table_id = t.id
     WHERE t.event_id = $1
     GROUP BY t.id
     ORDER BY t.created_at ASC`,
    [eventId]
  );
  return result.rows;
};

export const getTableById = async (
  tableId: number,
  eventId: number
): Promise<Table | null> => {
  const result = await pool.query<Table>(
    "SELECT * FROM tables WHERE id = $1 AND event_id = $2",
    [tableId, eventId]
  );
  return result.rows[0] || null;
};

export const updateTable = async (
  tableId: number,
  input: Partial<CreateTableInput>
): Promise<Table> => {
  const fields = Object.keys(input);
  const values = Object.values(input);

  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  const setClause = fields
    .map((field, index) => `${field} = $${index + 1}`)
    .join(", ");

  const result = await pool.query<Table>(
    `UPDATE tables SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
    [...values, tableId]
  );

  return result.rows[0];
};

export const deleteTable = async (tableId: number): Promise<void> => {
  // Check if table has guests assigned
  const guests = await pool.query(
    "SELECT COUNT(*) FROM guests WHERE table_id = $1",
    [tableId]
  );

  const count = Number.parseInt(guests.rows[0].count);
  if (count > 0) {
    throw new Error(
      `Cannot delete table — it has ${count} guest(s) assigned. Please reassign them first.`
    );
  }

  await pool.query("DELETE FROM tables WHERE id = $1", [tableId]);
};