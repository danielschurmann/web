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

/** Siempre recibe las notificaciones de leads, aunque CONTACT_NOTIFY_EMAIL esté seteada. */
const ALWAYS_NOTIFY_EMAIL = "alejandra@estudiodsyasoc.com.ar";

/** CONTACT_NOTIFY_EMAIL suma destinatarios extra (separados por coma). */
function getNotifyRecipients(): string[] {
  const extra = (process.env.CONTACT_NOTIFY_EMAIL ?? "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
  const seen = new Set<string>();
  return [ALWAYS_NOTIFY_EMAIL, ...extra].filter((email) => {
    const key = email.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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
