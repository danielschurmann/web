import { Resend } from "resend";

let resend: Resend | null = null;

export function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Falta RESEND_API_KEY en el entorno.");
  }
  if (!resend) {
    resend = new Resend(apiKey);
  }
  return resend;
}

export async function notifyLeadEmail(input: {
  nombre: string;
  contacto: string;
  mensaje?: string;
}) {
  const to = process.env.CONTACT_NOTIFY_EMAIL;
  if (!to) {
    throw new Error("Falta CONTACT_NOTIFY_EMAIL en el entorno.");
  }

  const from =
    process.env.RESEND_FROM_EMAIL ?? "DS & Asociados <onboarding@resend.dev>";

  const { error } = await getResend().emails.send({
    from,
    to: [to],
    subject: `Nuevo lead: ${input.nombre}`,
    text: [
      `Nombre: ${input.nombre}`,
      `Contacto: ${input.contacto}`,
      `Mensaje: ${input.mensaje?.trim() || "(sin mensaje)"}`,
      `Origen: landing`,
    ].join("\n"),
  });

  if (error) {
    throw new Error(error.message);
  }
}
