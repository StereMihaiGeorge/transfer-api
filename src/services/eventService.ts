import { pool } from "../config/db";
import {
  Event,
  EventType,
  BaseEvent,
  WeddingDetails,
  BaptismDetails,
  BirthdayDetails,
  CreateEventInput,
} from "../models/event";
import { seedDefaultTodos } from "./todoService";

// ─── Slug Generation ─────────────────────────────────────────────────────────

type SlugDetails = {
  bride_name?: string;
  groom_name?: string;
  child_name?: string;
  person_name?: string;
};

const normalizeSlugPart = (val: string): string =>
  val
    .toLowerCase()
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "") // remove diacritics (ă, â, î, ș, ț)
    .replaceAll(/[^a-z0-9-]/g, "-") // replace special chars with dash
    .replaceAll(/-+/g, "-") // remove duplicate dashes
    .replaceAll(/^-|-$/g, ""); // trim leading/trailing dashes

export const generateSlug = (type: EventType, details: SlugDetails, date: string): string => {
  const year = new Date(date).getFullYear();

  let raw: string;
  if (type === "wedding") {
    raw = `${details.bride_name ?? ""}-si-${details.groom_name ?? ""}-${year}`;
  } else if (type === "baptism") {
    raw = `botez-${details.child_name ?? ""}-${year}`;
  } else {
    raw = `majorat-${details.person_name ?? ""}-${year}`;
  }

  return normalizeSlugPart(raw);
};

// ─── Row → Event mapper ───────────────────────────────────────────────────────

interface EventRow extends BaseEvent {
  // wedding_details columns (nullable when not a wedding)
  bride_name: string | null;
  groom_name: string | null;
  // baptism_details columns
  child_name: string | null;
  child_date_of_birth: Date | null;
  parent_name: string | null;
  godfather_name: string | null;
  godmother_name: string | null;
  church_name: string | null;
  // birthday_details columns
  person_name: string | null;
  age: number | null;
  theme: string | null;
  dress_code: string | null;
}

function rowToEvent(row: EventRow): Event {
  const base: BaseEvent = {
    id: row.id,
    user_id: row.user_id,
    type: row.type,
    title: row.title,
    date: row.date,
    venue: row.venue,
    city: row.city,
    slug: row.slug,
    cover_message: row.cover_message,
    created_at: row.created_at,
  };

  if (row.type === "wedding") {
    const details: WeddingDetails = {
      bride_name: row.bride_name!,
      groom_name: row.groom_name!,
    };
    return { ...base, type: "wedding", details };
  }

  if (row.type === "baptism") {
    const details: BaptismDetails = {
      child_name: row.child_name!,
      child_date_of_birth: row.child_date_of_birth,
      parent_name: row.parent_name!,
      godfather_name: row.godfather_name,
      godmother_name: row.godmother_name,
      church_name: row.church_name,
    };
    return { ...base, type: "baptism", details };
  }

  // birthday
  const details: BirthdayDetails = {
    person_name: row.person_name!,
    age: row.age,
    theme: row.theme,
    dress_code: row.dress_code,
  };
  return { ...base, type: "birthday", details };
}

// Single query with LEFT JOINs on all three detail tables
const EVENT_WITH_DETAILS_QUERY = `
  SELECT
    e.*,
    wd.bride_name,        wd.groom_name,
    bd.child_name,        bd.child_date_of_birth, bd.parent_name,
    bd.godfather_name,    bd.godmother_name,    bd.church_name,
    bdd.person_name,      bdd.age, bdd.theme, bdd.dress_code
  FROM events e
  LEFT JOIN wedding_details  wd  ON wd.event_id  = e.id
  LEFT JOIN baptism_details  bd  ON bd.event_id  = e.id
  LEFT JOIN birthday_details bdd ON bdd.event_id = e.id
`;

// ─── Service Functions ────────────────────────────────────────────────────────

export const createEvent = async (userId: number, input: CreateEventInput): Promise<Event> => {
  // 1. Generate slug based on type
  let slug: string;
  if (input.type === "wedding") {
    slug = generateSlug(
      "wedding",
      { bride_name: input.bride_name, groom_name: input.groom_name },
      input.date
    );
  } else if (input.type === "baptism") {
    slug = generateSlug("baptism", { child_name: input.child_name }, input.date);
  } else {
    slug = generateSlug("birthday", { person_name: input.person_name }, input.date);
  }

  // 2. Ensure slug uniqueness
  const existing = await pool.query("SELECT id FROM events WHERE slug = $1", [slug]);
  if (existing.rows.length > 0) {
    slug = `${slug}-${Date.now()}`;
  }

  // 3. Insert into events base table
  const eventResult = await pool.query<BaseEvent>(
    `INSERT INTO events (user_id, type, title, date, venue, city, slug, cover_message)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      userId,
      input.type,
      input.title,
      input.date,
      input.venue,
      input.city,
      slug,
      input.cover_message ?? null,
    ]
  );
  const event = eventResult.rows[0];

  // 4. Insert into the appropriate detail table
  if (input.type === "wedding") {
    await pool.query(
      `INSERT INTO wedding_details (event_id, bride_name, groom_name) VALUES ($1, $2, $3)`,
      [event.id, input.bride_name, input.groom_name]
    );
  } else if (input.type === "baptism") {
    await pool.query(
      `INSERT INTO baptism_details
         (event_id, child_name, child_date_of_birth, parent_name, godfather_name, godmother_name, church_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        event.id,
        input.child_name,
        input.child_date_of_birth ?? null,
        input.parent_name,
        input.godfather_name ?? null,
        input.godmother_name ?? null,
        input.church_name ?? null,
      ]
    );
  } else {
    await pool.query(
      `INSERT INTO birthday_details (event_id, person_name, age, theme, dress_code)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        event.id,
        input.person_name,
        input.age ?? null,
        input.theme ?? null,
        input.dress_code ?? null,
      ]
    );
  }

  // 5. Seed default todos per type
  await seedDefaultTodos(event.id, input.type);

  // 6. Return full event with details
  return getEventById(event.id) as Promise<Event>;
};

export const getEventById = async (eventId: number): Promise<Event | null> => {
  const result = await pool.query<EventRow>(`${EVENT_WITH_DETAILS_QUERY} WHERE e.id = $1`, [
    eventId,
  ]);
  if (result.rows.length === 0) return null;
  return rowToEvent(result.rows[0]);
};

export const updateEvent = async (
  eventId: number,
  input: Record<string, unknown>
): Promise<Event> => {
  // Fetch current event type to know which detail table to update
  const typeResult = await pool.query<{ type: EventType }>(
    "SELECT type FROM events WHERE id = $1",
    [eventId]
  );
  if (typeResult.rows.length === 0) throw new Error("Event not found");
  const eventType = typeResult.rows[0].type;

  // Separate base fields from detail fields
  const baseFieldSet = new Set(["title", "date", "venue", "city", "cover_message"]);

  let detailFieldSet: Set<string>;
  if (eventType === "wedding") {
    detailFieldSet = new Set(["bride_name", "groom_name"]);
  } else if (eventType === "baptism") {
    detailFieldSet = new Set([
      "child_name",
      "child_date_of_birth",
      "parent_name",
      "godfather_name",
      "godmother_name",
      "church_name",
    ]);
  } else {
    detailFieldSet = new Set(["person_name", "age", "theme", "dress_code"]);
  }

  const baseUpdates: Record<string, unknown> = {};
  const detailUpdates: Record<string, unknown> = {};

  for (const [key, val] of Object.entries(input)) {
    if (baseFieldSet.has(key)) baseUpdates[key] = val;
    else if (detailFieldSet.has(key)) detailUpdates[key] = val;
  }

  // Update events base table
  if (Object.keys(baseUpdates).length > 0) {
    const fields = Object.keys(baseUpdates);
    const values = Object.values(baseUpdates);
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
    await pool.query(`UPDATE events SET ${setClause} WHERE id = $${fields.length + 1}`, [
      ...values,
      eventId,
    ]);
  }

  // Update detail table
  if (Object.keys(detailUpdates).length > 0) {
    const fields = Object.keys(detailUpdates);
    const values = Object.values(detailUpdates);
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
    let detailTable: string;
    if (eventType === "wedding") {
      detailTable = "wedding_details";
    } else if (eventType === "baptism") {
      detailTable = "baptism_details";
    } else {
      detailTable = "birthday_details";
    }
    await pool.query(
      `UPDATE ${detailTable} SET ${setClause} WHERE event_id = $${fields.length + 1}`,
      [...values, eventId]
    );
  }

  return getEventById(eventId) as Promise<Event>;
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
    `SELECT COUNT(*) AS total_requests FROM song_requests WHERE event_id = $1`,
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
