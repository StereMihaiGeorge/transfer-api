import nodemailer from 'nodemailer';
import { pool } from '../config/db';
import { getTransporter, getFromAddress } from '../config/mailer';
import { invitationTemplate } from './templates/invitation';
import { rsvpConfirmationTemplate } from './templates/rsvpConfirmation';
import { rsvpNotificationTemplate } from './templates/rsvpNotification';
import { reminderTemplate } from './templates/reminder';
import { preferencesTemplate } from './templates/preferences';
import { Guest } from '../models/guests';
import { Event } from '../models/event';

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function fetchGuestAndEvent(guestId: number, eventId: number): Promise<{ guest: Guest; event: Event }> {
  const [guestResult, eventResult] = await Promise.all([
    pool.query<Guest>('SELECT * FROM guests WHERE id = $1', [guestId]),
    pool.query<Event>('SELECT * FROM events WHERE id = $1', [eventId]),
  ]);

  const guest = guestResult.rows[0];
  const event = eventResult.rows[0];

  if (!guest) throw new Error(`Guest ${guestId} not found`);
  if (!event) throw new Error(`Event ${eventId} not found`);

  return { guest, event };
}

async function logEmail(
  guestId: number,
  eventId: number,
  type: string,
  status: 'sent' | 'failed',
  errorMessage?: string,
): Promise<void> {
  await pool.query(
    `INSERT INTO email_logs (guest_id, event_id, type, status, error_message, created_at)
     VALUES ($1, $2, $3, $4, $5, NOW())`,
    [guestId, eventId, type, status, errorMessage ?? null],
  );
}

async function sendMail(transporter: nodemailer.Transporter, options: nodemailer.SendMailOptions): Promise<void> {
  const info = await transporter.sendMail(options);

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`[Mailer] Preview URL: ${previewUrl}`);
  }
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// ─── Email Functions ──────────────────────────────────────────────────────────

export async function sendInvitationEmail(guestId: number, eventId: number, token: string): Promise<void> {
  const { guest, event } = await fetchGuestAndEvent(guestId, eventId);

  if (!guest.email) throw new Error('Guest has no email');

  const rsvpUrl = `${process.env.FRONTEND_URL}/rsvp/${token}`;
  const { subject, html } = invitationTemplate({
    guestName: guest.name,
    brideName: event.bride_name,
    groomName: event.groom_name,
    date: formatDate(event.date),
    venue: event.venue,
    city: event.city,
    coverMessage: event.cover_message,
    rsvpUrl,
  });

  try {
    const transporter = await getTransporter();
    await sendMail(transporter, { from: getFromAddress(), to: guest.email, subject, html });

    await pool.query('UPDATE guests SET invitation_sent = true WHERE id = $1', [guestId]);
    await logEmail(guestId, eventId, 'invitation', 'sent');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Mailer] Failed to send invitation email:', message);
    await logEmail(guestId, eventId, 'invitation', 'failed', message);
    throw err;
  }
}

export async function sendRsvpConfirmationEmail(guestId: number, eventId: number): Promise<void> {
  const { guest, event } = await fetchGuestAndEvent(guestId, eventId);

  if (!guest.email) throw new Error('Guest has no email');

  const { subject, html } = rsvpConfirmationTemplate({
    guestName: guest.name,
    brideName: event.bride_name,
    groomName: event.groom_name,
    date: formatDate(event.date),
    venue: event.venue,
    status: guest.status as 'confirmed' | 'declined',
    memberCount: guest.member_count,
  });

  try {
    const transporter = await getTransporter();
    await sendMail(transporter, { from: getFromAddress(), to: guest.email, subject, html });
    await logEmail(guestId, eventId, 'rsvp_confirmation', 'sent');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Mailer] Failed to send RSVP confirmation email:', message);
    await logEmail(guestId, eventId, 'rsvp_confirmation', 'failed', message);
    throw err;
  }
}

export async function sendRsvpNotificationEmail(guestId: number, eventId: number): Promise<void> {
  const { guest, event } = await fetchGuestAndEvent(guestId, eventId);

  const coupleResult = await pool.query<{ email: string }>('SELECT email FROM users WHERE id = $1', [event.user_id]);
  const couple = coupleResult.rows[0];
  if (!couple) throw new Error(`User ${event.user_id} not found`);

  const { subject, html } = rsvpNotificationTemplate({
    guestName: guest.name,
    status: guest.status as 'confirmed' | 'declined',
    memberCount: guest.member_count,
    brideName: event.bride_name,
    groomName: event.groom_name,
  });

  try {
    const transporter = await getTransporter();
    await sendMail(transporter, { from: getFromAddress(), to: couple.email, subject, html });
    await logEmail(guestId, eventId, 'rsvp_notification', 'sent');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Mailer] Failed to send RSVP notification email:', message);
    await logEmail(guestId, eventId, 'rsvp_notification', 'failed', message);
    throw err;
  }
}

export async function sendReminderEmail(guestId: number, eventId: number): Promise<void> {
  const { guest, event } = await fetchGuestAndEvent(guestId, eventId);

  if (!guest.email) throw new Error('Guest has no email');
  if (guest.status !== 'pending') throw new Error('Guest has already responded');

  const rsvpUrl = `${process.env.FRONTEND_URL}/rsvp/${guest.token}`;
  const { subject, html } = reminderTemplate({
    guestName: guest.name,
    brideName: event.bride_name,
    groomName: event.groom_name,
    date: formatDate(event.date),
    venue: event.venue,
    rsvpUrl,
  });

  try {
    const transporter = await getTransporter();
    await sendMail(transporter, { from: getFromAddress(), to: guest.email, subject, html });
    await logEmail(guestId, eventId, 'reminder', 'sent');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Mailer] Failed to send reminder email:', message);
    await logEmail(guestId, eventId, 'reminder', 'failed', message);
    throw err;
  }
}

export async function sendPreferencesEmail(guestId: number, eventId: number, token: string): Promise<void> {
  const { guest, event } = await fetchGuestAndEvent(guestId, eventId);

  if (!guest.email) throw new Error('Guest has no email');
  if (guest.status !== 'confirmed') throw new Error('Guest has not confirmed attendance');

  const preferencesUrl = `${process.env.FRONTEND_URL}/rsvp/${token}/preferences`;
  const { subject, html } = preferencesTemplate({
    guestName: guest.name,
    brideName: event.bride_name,
    groomName: event.groom_name,
    preferencesUrl,
  });

  try {
    const transporter = await getTransporter();
    await sendMail(transporter, { from: getFromAddress(), to: guest.email, subject, html });
    await logEmail(guestId, eventId, 'preferences', 'sent');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Mailer] Failed to send preferences email:', message);
    await logEmail(guestId, eventId, 'preferences', 'failed', message);
    throw err;
  }
}
