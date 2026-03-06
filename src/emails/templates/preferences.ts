export interface PreferencesTemplateData {
  guestName: string;
  brideName: string;
  groomName: string;
  preferencesUrl: string;
}

export function preferencesTemplate(data: PreferencesTemplateData): { subject: string; html: string } {
  const subject = `Help us personalise your experience — ${data.brideName} & ${data.groomName}'s Wedding`;

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
              <p style="margin:0 0 8px;color:#c9a96e;font-size:13px;letter-spacing:3px;text-transform:uppercase;">One More Step</p>
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:400;letter-spacing:2px;">${data.brideName} &amp; ${data.groomName}</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:48px 40px;text-align:center;">
              <p style="margin:0 0 24px;color:#555;font-size:15px;">Dear <strong style="color:#2c2c2c;">${data.guestName}</strong>,</p>
              <p style="margin:0 0 16px;color:#555;font-size:15px;line-height:1.7;">
                Thank you so much for confirming your attendance — we are so happy you will be joining us!
              </p>
              <p style="margin:0 0 32px;color:#555;font-size:15px;line-height:1.7;">
                To make sure everything is perfect for you on the day, we would love to know a little more about your preferences. Please take a moment to let us know your meal choice and any song requests you might have for our DJ.
              </p>

              <!-- Preferences Button -->
              <a href="${data.preferencesUrl}" style="display:inline-block;background-color:#2c2c2c;color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:4px;font-size:14px;letter-spacing:2px;text-transform:uppercase;">Share Your Preferences</a>

              <p style="margin:32px 0 0;color:#999;font-size:13px;">If the button does not work, copy and paste this link into your browser:<br/>
                <a href="${data.preferencesUrl}" style="color:#c9a96e;word-break:break-all;">${data.preferencesUrl}</a>
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
