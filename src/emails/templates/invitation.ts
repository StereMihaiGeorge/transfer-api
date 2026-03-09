import { Event } from "../../models/event";

export interface InvitationTemplateData {
  guestName: string;
  event: Event;
  date: string;
  rsvpUrl: string;
}

function buildHeader(event: Event): string {
  if (event.type === "wedding") {
    return `
      <p style="margin:0 0 8px;color:#c9a96e;font-size:13px;letter-spacing:3px;text-transform:uppercase;">Together with their families</p>
      <h1 style="margin:0;color:#ffffff;font-size:32px;font-weight:400;letter-spacing:2px;">${event.details.bride_name} &amp; ${event.details.groom_name}</h1>
      <p style="margin:16px 0 0;color:#c9a96e;font-size:13px;letter-spacing:3px;text-transform:uppercase;">request the honour of your presence</p>`;
  }

  if (event.type === "baptism") {
    return `
      <p style="margin:0 0 8px;color:#c9a96e;font-size:13px;letter-spacing:3px;text-transform:uppercase;">We are blessed to announce</p>
      <h1 style="margin:0;color:#ffffff;font-size:32px;font-weight:400;letter-spacing:2px;">the baptism of ${event.details.child_name}</h1>`;
  }

  // birthday
  const ageLabel = event.details.age ? `${event.details.age}th ` : "";
  return `
    <p style="margin:0 0 8px;color:#c9a96e;font-size:13px;letter-spacing:3px;text-transform:uppercase;">Join us to celebrate</p>
    <h1 style="margin:0;color:#ffffff;font-size:32px;font-weight:400;letter-spacing:2px;">${event.details.person_name}'s ${ageLabel}birthday</h1>`;
}

function buildSubject(event: Event): string {
  if (event.type === "wedding") {
    return `You're Invited — ${event.details.bride_name} & ${event.details.groom_name}'s Wedding`;
  }
  if (event.type === "baptism") {
    return `You're Invited — Baptism of ${event.details.child_name}`;
  }
  const ageLabel = event.details.age ? ` ${event.details.age}th` : "";
  return `You're Invited — ${event.details.person_name}'s${ageLabel} Birthday`;
}

function buildDefaultMessage(event: Event): string {
  if (event.type === "wedding") {
    return "We joyfully invite you to celebrate our wedding day with us.";
  }
  if (event.type === "baptism") {
    return `We joyfully invite you to celebrate the baptism of ${event.details.child_name}.`;
  }
  const ageLabel = event.details.age ? ` ${event.details.age}th` : "";
  return `We joyfully invite you to celebrate ${event.details.person_name}'s${ageLabel} birthday.`;
}

export function invitationTemplate(data: InvitationTemplateData): {
  subject: string;
  html: string;
} {
  const subject = buildSubject(data.event);
  const header = buildHeader(data.event);
  const defaultMessage = buildDefaultMessage(data.event);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f9f5f0;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f9f5f0;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:600px;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color:#2c2c2c;padding:48px 40px;text-align:center;">
              ${header}
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:48px 40px;text-align:center;">
              <p style="margin:0 0 8px;color:#555;font-size:15px;">Dear <strong style="color:#2c2c2c;">${data.guestName}</strong>,</p>
              ${
                data.event.cover_message
                  ? `<p style="margin:24px 0;color:#555;font-size:15px;line-height:1.7;">${data.event.cover_message}</p>`
                  : `<p style="margin:24px 0;color:#555;font-size:15px;line-height:1.7;">${defaultMessage}</p>`
              }

              <!-- Event details -->
              <table role="presentation" width="100%" style="margin:32px 0;border-top:1px solid #e8e0d5;border-bottom:1px solid #e8e0d5;padding:24px 0;">
                <tr>
                  <td style="padding:8px 0;text-align:center;">
                    <p style="margin:0 0 4px;color:#c9a96e;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Date</p>
                    <p style="margin:0;color:#2c2c2c;font-size:17px;">${data.date}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;text-align:center;">
                    <p style="margin:0 0 4px;color:#c9a96e;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Venue</p>
                    <p style="margin:0;color:#2c2c2c;font-size:17px;">${data.event.venue}</p>
                    <p style="margin:4px 0 0;color:#777;font-size:14px;">${data.event.city}</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 32px;color:#555;font-size:15px;line-height:1.7;">Please let us know if you will be able to join us by clicking the button below.</p>

              <!-- RSVP Button -->
              <a href="${data.rsvpUrl}" style="display:inline-block;background-color:#2c2c2c;color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:4px;font-size:14px;letter-spacing:2px;text-transform:uppercase;">RSVP Now</a>

              <p style="margin:32px 0 0;color:#999;font-size:13px;">If the button does not work, copy and paste this link into your browser:<br/>
                <a href="${data.rsvpUrl}" style="color:#c9a96e;word-break:break-all;">${data.rsvpUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9f5f0;padding:24px 40px;text-align:center;border-top:1px solid #e8e0d5;">
              <p style="margin:0;color:#aaa;font-size:12px;">${data.event.title}</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
}
