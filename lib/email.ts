import nodemailer from "nodemailer";
import { Resend } from "resend";

function hasSmtpConfig() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_FROM,
  );
}

/** Destinatario por defecto de las notificaciones de leads. */
const DEFAULT_NOTIFY_EMAIL = "alejandra@estudiodsyasoc.com.ar";

/** Admite una o varias direcciones separadas por coma en CONTACT_NOTIFY_EMAIL. */
function getNotifyRecipients(): string[] {
  const raw = process.env.CONTACT_NOTIFY_EMAIL?.trim();
  const list = (raw && raw.length > 0 ? raw : DEFAULT_NOTIFY_EMAIL)
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
  return list.length > 0 ? list : [DEFAULT_NOTIFY_EMAIL];
}

async function sendViaSmtp(input: {
  to: string[];
  subject: string;
  text: string;
}) {
  const port = Number(process.env.SMTP_PORT || "587");
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: input.to,
    subject: input.subject,
    text: input.text,
  });
}

async function sendViaResend(input: {
  to: string[];
  subject: string;
  text: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Falta RESEND_API_KEY (o configurá SMTP_*).");
  }

  const from =
    process.env.RESEND_FROM_EMAIL ?? "DS & Asociados <onboarding@resend.dev>";
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    text: input.text,
  });

  if (error) {
    throw new Error(error.message);
  }
}

/** Lead notifications: Gmail SMTP if SMTP_* is set, otherwise Resend. */
export async function notifyLeadEmail(input: {
  nombre: string;
  contacto: string;
  mensaje?: string;
}) {
  const to = getNotifyRecipients();

  const subject = `Nueva consulta desde la web: ${input.nombre}`;
  const text = [
    "Llegó una nueva consulta desde el formulario de contacto.",
    "",
    `Nombre: ${input.nombre}`,
    `Contacto: ${input.contacto}`,
    `Mensaje: ${input.mensaje?.trim() || "(sin mensaje)"}`,
    `Origen: landing`,
    "",
    "Respondé a la brevedad para no perder la consulta.",
  ].join("\n");

  if (hasSmtpConfig()) {
    await sendViaSmtp({ to, subject, text });
    return;
  }

  await sendViaResend({ to, subject, text });
}
