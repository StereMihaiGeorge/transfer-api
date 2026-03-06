import { pool } from "../config/db";
import { EventSong, SongRequest, CreateEventSongInput, CreateSongRequestInput } from "../models/song";
import { Guest } from "../models/guests";

export const createEventSong = async (
  eventId: number,
  input: CreateEventSongInput
): Promise<EventSong> => {
  const result = await pool.query<EventSong>(
    `INSERT INTO event_songs (event_id, moment, song_title, artist, notes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [eventId, input.moment, input.song_title, input.artist || null, input.notes || null]
  );
  return result.rows[0];
};

export const getEventSongs = async (eventId: number): Promise<EventSong[]> => {
  const result = await pool.query<EventSong>(
    `SELECT * FROM event_songs WHERE event_id = $1 ORDER BY created_at ASC`,
    [eventId]
  );
  return result.rows;
};

export const updateEventSong = async (
  songId: number,
  input: Partial<CreateEventSongInput>
): Promise<EventSong> => {
  const fields = Object.keys(input);
  const values = Object.values(input);

  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  const setClause = fields
    .map((field, index) => `${field} = $${index + 1}`)
    .join(", ");

  const result = await pool.query<EventSong>(
    `UPDATE event_songs SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
    [...values, songId]
  );

  if (result.rows.length === 0) {
    throw new Error("Song not found");
  }

  return result.rows[0];
};

export const deleteEventSong = async (songId: number): Promise<void> => {
  const result = await pool.query(
    "DELETE FROM event_songs WHERE id = $1 RETURNING id",
    [songId]
  );

  if (result.rows.length === 0) {
    throw new Error("Song not found");
  }
};

export const createSongRequest = async (
  eventId: number,
  guestId: number,
  input: CreateSongRequestInput
): Promise<SongRequest> => {
  const result = await pool.query<SongRequest>(
    `INSERT INTO song_requests (event_id, guest_id, song_title, artist, genre)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [eventId, guestId, input.song_title, input.artist || null, input.genre]
  );
  return result.rows[0];
};

export const createSongRequestByToken = async (
  token: string,
  input: CreateSongRequestInput
): Promise<SongRequest> => {
  const guestResult = await pool.query<Guest>(
    "SELECT * FROM guests WHERE token = $1",
    [token]
  );

  if (guestResult.rows.length === 0) {
    throw new Error("Invalid or expired invitation link");
  }

  const guest = guestResult.rows[0];

  if (guest.status !== "confirmed") {
    throw new Error("Only confirmed guests can submit song requests");
  }

  return createSongRequest(guest.event_id, guest.id, input);
};

export const getSongRequestsByEventId = async (eventId: number): Promise<SongRequest[]> => {
  const result = await pool.query<SongRequest>(
    `SELECT * FROM song_requests WHERE event_id = $1 ORDER BY genre ASC, song_title ASC`,
    [eventId]
  );
  return result.rows;
};

export const exportSongsAsCSV = async (eventId: number): Promise<string> => {
  const [specialSongs, guestRequests, genreSummary] = await Promise.all([
    pool.query<EventSong>(
      `SELECT * FROM event_songs WHERE event_id = $1 ORDER BY created_at ASC`,
      [eventId]
    ),
    pool.query<SongRequest>(
      `SELECT * FROM song_requests WHERE event_id = $1 ORDER BY genre ASC, song_title ASC`,
      [eventId]
    ),
    pool.query<{ genre: string; count: string }>(
      `SELECT genre, COUNT(*) as count FROM song_requests WHERE event_id = $1 GROUP BY genre ORDER BY COUNT(*) DESC`,
      [eventId]
    ),
  ]);

  const escape = (val: string | null | undefined) => {
    if (!val) return "";
    return val.includes(",") || val.includes('"') || val.includes("\n")
      ? `"${val.replace(/"/g, '""')}"`
      : val;
  };

  const specialRows = specialSongs.rows
    .map((s) => `${escape(s.moment)},${escape(s.song_title)},${escape(s.artist)},${escape(s.notes)}`)
    .join("\n");

  const requestRows = guestRequests.rows
    .map((r) => `${escape(r.song_title)},${escape(r.artist)},${escape(r.genre)}`)
    .join("\n");

  const summaryRows = genreSummary.rows
    .map((g) => `${escape(g.genre)},${g.count}`)
    .join("\n");

  return [
    "=== MOMENTE SPECIALE ===",
    "Moment,Song,Artist,Notes",
    specialRows,
    "",
    "=== SUGESTII INVITATI ===",
    "Song Title,Artist,Genre",
    requestRows,
    "",
    "=== SUMAR GENURI ===",
    "Genre,Count",
    summaryRows,
  ].join("\n");
};
