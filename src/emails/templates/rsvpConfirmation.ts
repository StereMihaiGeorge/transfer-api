export interface RsvpConfirmationTemplateData {
  guestName: string;
  brideName: string;
  groomName: string;
  date: string;
  venue: string;
  status: "confirmed" | "declined";
  memberCount: number;
}

export function rsvpConfirmationTemplate(data: RsvpConfirmationTemplateData): {
  subject: string;
  html: string;
} {
  const isConfirmed = data.status === "confirmed";

  const subject = isConfirmed
    ? `See you there! — ${data.brideName} & ${data.groomName}'s Wedding`
    : `We'll miss you — ${data.brideName} & ${data.groomName}'s Wedding`;

  const headerBg = isConfirmed ? "#2c2c2c" : "#6b6b6b";
  const accentColor = isConfirmed ? "#c9a96e" : "#aaa";

  const bodyContent = isConfirmed
    ? `<p style="margin:0 0 16px;color:#555;font-size:15px;line-height:1.7;">
        Thank you for confirming! We are thrilled that you will be joining us to celebrate this special day.
       </p>
       <p style="margin:0 0 16px;color:#555;font-size:15px;line-height:1.7;">
        We have noted <strong>${data.memberCount} ${data.memberCount === 1 ? "guest" : "guests"}</strong> attending from your party.
       </p>
       <p style="margin:0;color:#555;font-size:15px;line-height:1.7;">
        We cannot wait to celebrate with you!
       </p>`
    : `<p style="margin:0 0 16px;color:#555;font-size:15px;line-height:1.7;">
        Thank you for letting us know. We are sorry you will not be able to join us, but we completely understand.
       </p>
       <p style="margin:0;color:#555;font-size:15px;line-height:1.7;">
        You will be in our hearts on our special day.
       </p>`;

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
            <td style="background-color:${headerBg};padding:48px 40px;text-align:center;">
              <p style="margin:0 0 8px;color:${accentColor};font-size:13px;letter-spacing:3px;text-transform:uppercase;">${isConfirmed ? "RSVP Confirmed" : "RSVP Received"}</p>
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:400;letter-spacing:2px;">${data.brideName} &amp; ${data.groomName}</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:48px 40px;text-align:center;">
              <p style="margin:0 0 24px;color:#555;font-size:15px;">Dear <strong style="color:#2c2c2c;">${data.guestName}</strong>,</p>
              ${bodyContent}

              ${
                isConfirmed
                  ? `
              <!-- Event details reminder -->
              <table role="presentation" width="100%" style="margin:32px 0;border-top:1px solid #e8e0d5;border-bottom:1px solid #e8e0d5;padding:24px 0;">
                <tr>
                  <td style="padding:8px 0;text-align:center;">
                    <p style="margin:0 0 4px;color:${accentColor};font-size:11px;letter-spacing:2px;text-transform:uppercase;">Date</p>
                    <p style="margin:0;color:#2c2c2c;font-size:17px;">${data.date}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;text-align:center;">
                    <p style="margin:0 0 4px;color:${accentColor};font-size:11px;letter-spacing:2px;text-transform:uppercase;">Venue</p>
                    <p style="margin:0;color:#2c2c2c;font-size:17px;">${data.venue}</p>
                  </td>
                </tr>
              </table>`
                  : ""
              }
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
