"use server";

import { z } from "zod";
import { notifyLeadEmail } from "@/lib/email";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const leadSchema = z.object({
  nombre: z.string().trim().min(2, "Ingresá tu nombre.").max(120),
  contacto: z
    .string()
    .trim()
    .min(5, "Ingresá un email o WhatsApp.")
    .max(160),
  mensaje: z.string().trim().max(2000).optional(),
});

export type SubmitLeadState = {
  ok: boolean;
  message: string;
  fieldErrors?: Partial<Record<"nombre" | "contacto" | "mensaje", string>>;
};

export async function submitLead(
  _prev: SubmitLeadState,
  formData: FormData,
): Promise<SubmitLeadState> {
  const parsed = leadSchema.safeParse({
    nombre: formData.get("nombre"),
    contacto: formData.get("contacto"),
    mensaje: formData.get("mensaje") || undefined,
  });

  if (!parsed.success) {
    const fieldErrors: SubmitLeadState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key === "nombre" || key === "contacto" || key === "mensaje") {
        fieldErrors[key] = issue.message;
      }
    }
    return {
      ok: false,
      message: "Revisá los datos del formulario.",
      fieldErrors,
    };
  }

  const { nombre, contacto, mensaje } = parsed.data;

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("leads").insert({
      nombre,
      contacto,
      mensaje: mensaje ?? null,
      source: "landing",
    });

    if (error) {
      console.error("supabase insert lead", error);
      return {
        ok: false,
        message: "No pudimos guardar tu consulta. Probá de nuevo o escribinos por WhatsApp.",
      };
    }

    try {
      await notifyLeadEmail({ nombre, contacto, mensaje });
    } catch (emailError) {
      console.error("resend notify", emailError);
      // Lead already saved — still report success to the user.
    }

    return {
      ok: true,
      message: "¡Listo! Te vamos a contactar a la brevedad.",
    };
  } catch (error) {
    console.error("submitLead", error);
    return {
      ok: false,
      message:
        "El formulario todavía no está configurado. Escribinos por WhatsApp mientras tanto.",
    };
  }
}
