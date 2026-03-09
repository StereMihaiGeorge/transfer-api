export interface PasswordResetTemplateData {
  username: string;
  resetUrl: string;
}

export function passwordResetTemplate(data: PasswordResetTemplateData): {
  subject: string;
  html: string;
} {
  const subject = "Reset your Nunta Perfecta password";

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
              <p style="margin:0 0 8px;color:#c9a96e;font-size:13px;letter-spacing:3px;text-transform:uppercase;">Nunta Perfecta</p>
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:400;letter-spacing:2px;">Password Reset</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:48px 40px;text-align:center;">
              <p style="margin:0 0 24px;color:#555;font-size:15px;">Hello, <strong style="color:#2c2c2c;">${data.username}</strong>.</p>
              <p style="margin:0 0 32px;color:#555;font-size:15px;line-height:1.7;">We received a request to reset your password. Click the button below to choose a new one.</p>

              <!-- Reset Button -->
              <a href="${data.resetUrl}" style="display:inline-block;background-color:#2c2c2c;color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:4px;font-size:14px;letter-spacing:2px;text-transform:uppercase;">Reset Password</a>

              <p style="margin:32px 0 8px;color:#999;font-size:13px;">This link expires in <strong>1 hour</strong>.</p>
              <p style="margin:0 0 32px;color:#999;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>

              <p style="margin:0;color:#999;font-size:13px;">If the button does not work, copy and paste this link into your browser:<br/>
                <a href="${data.resetUrl}" style="color:#c9a96e;word-break:break-all;">${data.resetUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9f5f0;padding:24px 40px;text-align:center;border-top:1px solid #e8e0d5;">
              <p style="margin:0;color:#aaa;font-size:12px;">With love, Nunta Perfecta team</p>
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
