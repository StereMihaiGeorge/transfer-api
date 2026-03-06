import { pool } from "../config/db";
import { Guest } from "../models/guests";

export interface RSVPResponse {
  guest: {
    id: number;
    name: string;
    status: string;
  };
  event: {
    bride_name: string;
    groom_name: string;
    date: Date;
    venue: string;
    city: string;
    cover_message: string | null;
  };
}

export const getGuestByToken = async (token: string): Promise<RSVPResponse> => {
  const result = await pool.query(
    `SELECT 
      g.id, g.name, g.status, g.meal_preference,
      g.special_needs, g.sit_with, g.not_sit_with,
      e.bride_name, e.groom_name, e.date, 
      e.venue, e.city, e.cover_message
     FROM guests g
     JOIN events e ON g.event_id = e.id
     WHERE g.token = $1`,
    [token]
  );

  if (result.rows.length === 0) {
    throw new Error("Invalid or expired invitation link");
  }

  const row = result.rows[0];

  return {
    guest: {
      id: row.id,
      name: row.name,
      status: row.status,
    },
    event: {
      bride_name: row.bride_name,
      groom_name: row.groom_name,
      date: row.date,
      venue: row.venue,
      city: row.city,
      cover_message: row.cover_message,
    },
  };
};

export const respondToRSVP = async (
  token: string,
  status: "confirmed" | "declined",
  member_count?: number
): Promise<Guest> => {
  const guestResult = await pool.query<Guest>(
    "SELECT * FROM guests WHERE token = $1",
    [token]
  );

  if (guestResult.rows.length === 0) {
    throw new Error("Invalid or expired invitation link");
  }

  const guest = guestResult.rows[0];

  if (guest.status !== "pending") {
    throw new Error(`You have already ${guest.status} this invitation`);
  }

  // Build query dynamically based on whether member_count is provided
  let query: string;
  let params: (string | number)[];

  if (member_count && member_count > 1) {
    query = `UPDATE guests 
             SET status = $1, 
                 responded_at = NOW(),
                 member_count = $2
             WHERE token = $3
             RETURNING *`;
    params = [status, member_count, token];
  } else {
    query = `UPDATE guests 
             SET status = $1,
                 responded_at = NOW()
             WHERE token = $2
             RETURNING *`;
    params = [status, token];
  }

  const result = await pool.query<Guest>(query, params);
  return result.rows[0];
};

export const submitPreferences = async (
  token: string,
  preferences: {
    meal_preference: string;
    song_title?: string;
    artist?: string;
    special_needs?: string;
    sit_with?: string;
    not_sit_with?: string;
  }
): Promise<Guest> => {
  // Check token exists and guest is confirmed
  const guestResult = await pool.query<Guest>(
    "SELECT * FROM guests WHERE token = $1",
    [token]
  );

  if (guestResult.rows.length === 0) {
    throw new Error("Invalid or expired invitation link");
  }

  const guest = guestResult.rows[0];

  // Only confirmed guests can submit preferences
  if (guest.status !== "confirmed") {
    throw new Error("Only confirmed guests can submit preferences");
  }

  // Update guest preferences
  const result = await pool.query<Guest>(
    `UPDATE guests
     SET meal_preference = $1,
         special_needs = $2,
         sit_with = $3,
         not_sit_with = $4
     WHERE token = $5
     RETURNING *`,
    [
      preferences.meal_preference,
      preferences.special_needs || null,
      preferences.sit_with || null,
      preferences.not_sit_with || null,
      token,
    ]
  );

  // Save song request if provided
  if (preferences.song_title) {
    await pool.query(
      `INSERT INTO song_requests (event_id, guest_id, song_title, artist)
       VALUES ($1, $2, $3, $4)`,
      [
        guest.event_id,
        guest.id,
        preferences.song_title,
        preferences.artist || null,
      ]
    );
  }

  return result.rows[0];
};