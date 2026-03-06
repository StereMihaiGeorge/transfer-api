export interface RsvpNotificationTemplateData {
  guestName: string;
  status: 'confirmed' | 'declined';
  memberCount: number;
  brideName: string;
  groomName: string;
}

export function rsvpNotificationTemplate(data: RsvpNotificationTemplateData): { subject: string; html: string } {
  const isConfirmed = data.status === 'confirmed';

  const subject = isConfirmed
    ? `${data.guestName} confirmed their attendance!`
    : `${data.guestName} declined their invitation`;

  const statusBadge = isConfirmed
    ? `<span style="display:inline-block;background-color:#d4edda;color:#155724;padding:4px 12px;border-radius:20px;font-size:13px;font-family:Arial,sans-serif;">Confirmed</span>`
    : `<span style="display:inline-block;background-color:#f8d7da;color:#721c24;padding:4px 12px;border-radius:20px;font-size:13px;font-family:Arial,sans-serif;">Declined</span>`;

  const bodyContent = isConfirmed
    ? `<p style="margin:0 0 16px;color:#555;font-size:15px;line-height:1.7;">
        Great news! <strong style="color:#2c2c2c;">${data.guestName}</strong> has confirmed their attendance.
       </p>
       <p style="margin:0;color:#555;font-size:15px;line-height:1.7;">
        Number of guests attending: <strong style="color:#2c2c2c;">${data.memberCount}</strong>
       </p>`
    : `<p style="margin:0;color:#555;font-size:15px;line-height:1.7;">
        <strong style="color:#2c2c2c;">${data.guestName}</strong> has let you know they will not be able to attend. You can update your guest list accordingly.
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
            <td style="background-color:#2c2c2c;padding:36px 40px;text-align:center;">
              <p style="margin:0 0 8px;color:#c9a96e;font-size:11px;letter-spacing:3px;text-transform:uppercase;">Guest Response</p>
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:400;letter-spacing:1px;">${data.brideName} &amp; ${data.groomName}</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px;text-align:center;">
              <div style="margin-bottom:24px;">${statusBadge}</div>
              ${bodyContent}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9f5f0;padding:20px 40px;text-align:center;border-top:1px solid #e8e0d5;">
              <p style="margin:0;color:#aaa;font-size:12px;font-family:Arial,sans-serif;">This is an automated notification from your wedding planner.</p>
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
