import nodemailer from "nodemailer";

const isProduction = process.env.NODE_ENV === "production";

async function createTransporter() {
  if (isProduction) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  const testAccount = await nodemailer.createTestAccount();
  console.log("[Mailer] Ethereal test account created:", testAccount.user);

  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

let transporterPromise: Promise<nodemailer.Transporter> | null = null;

export function getTransporter(): Promise<nodemailer.Transporter> {
  if (!transporterPromise) {
    transporterPromise = createTransporter();
  }
  return transporterPromise;
}

export function getFromAddress(): string {
  return process.env.SMTP_FROM || "noreply@nuntaperfecta.ro";
}
