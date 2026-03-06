export interface InvitationTemplateData {
  guestName: string;
  brideName: string;
  groomName: string;
  date: string;
  venue: string;
  city: string;
  coverMessage: string | null;
  rsvpUrl: string;
}

export function invitationTemplate(data: InvitationTemplateData): {
  subject: string;
  html: string;
} {
  const subject = `You're Invited — ${data.brideName} & ${data.groomName}'s Wedding`;

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
              <p style="margin:0 0 8px;color:#c9a96e;font-size:13px;letter-spacing:3px;text-transform:uppercase;">Together with their families</p>
              <h1 style="margin:0;color:#ffffff;font-size:32px;font-weight:400;letter-spacing:2px;">${data.brideName} &amp; ${data.groomName}</h1>
              <p style="margin:16px 0 0;color:#c9a96e;font-size:13px;letter-spacing:3px;text-transform:uppercase;">request the honour of your presence</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:48px 40px;text-align:center;">
              <p style="margin:0 0 8px;color:#555;font-size:15px;">Dear <strong style="color:#2c2c2c;">${data.guestName}</strong>,</p>
              ${
                data.coverMessage
                  ? `<p style="margin:24px 0;color:#555;font-size:15px;line-height:1.7;">${data.coverMessage}</p>`
                  : `<p style="margin:24px 0;color:#555;font-size:15px;line-height:1.7;">We joyfully invite you to celebrate our wedding day with us.</p>`
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
                    <p style="margin:0;color:#2c2c2c;font-size:17px;">${data.venue}</p>
                    <p style="margin:4px 0 0;color:#777;font-size:14px;">${data.city}</p>
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
              <p style="margin:0;color:#aaa;font-size:12px;">With love, ${data.brideName} &amp; ${data.groomName}</p>
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
