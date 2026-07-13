"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/current-user";
import { slugify } from "@/lib/api-auth";
import { createClient } from "@/lib/supabase/server";

export type UsersActionState = {
  ok: boolean;
  message: string;
};

const ASSIGNABLE_ROLES = ["superadmin", "editor", "client"] as const;

async function requireSuperadmin() {
  const me = await getCurrentProfile();
  if (!me || me.role !== "superadmin") {
    return null;
  }
  return me;
}

const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().email("Ingresá un email válido.").max(160),
  fullName: z.string().trim().min(2, "Ingresá el nombre.").max(120),
  role: z.enum(ASSIGNABLE_ROLES),
});

/**
 * Invita a un usuario nuevo. Crea la cuenta en Supabase Auth (vía service role)
 * y le manda un email con el link de acceso. El perfil se crea solo mediante el
 * trigger handle_new_user con el rol indicado.
 */
export async function inviteUser(
  _prev: UsersActionState,
  formData: FormData,
): Promise<UsersActionState> {
  const me = await requireSuperadmin();
  if (!me) {
    return { ok: false, message: "No autorizado." };
  }

  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
    fullName: formData.get("fullName"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  const { email, fullName, role } = parsed.data;

  let admin;
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin");
    admin = getSupabaseAdmin();
  } catch {
    return {
      ok: false,
      message:
        "Falta configurar SUPABASE_SERVICE_ROLE_KEY en el servidor para poder invitar usuarios.",
    };
  }

  const meta = {
    full_name: fullName,
    role,
    slug: slugify(fullName),
  };

  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/auth/callback?next=/admin`;

  const { error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: meta,
    redirectTo: redirectTo || undefined,
  });

  if (error) {
    return {
      ok: false,
      message: `No se pudo invitar: ${error.message}`,
    };
  }

  revalidatePath("/admin/users");
  return {
    ok: true,
    message: `Invitación enviada a ${email}. Ya puede ingresar desde el link del email.`,
  };
}

const roleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(ASSIGNABLE_ROLES),
});

/** Cambia el rol de un usuario existente. Solo superadmin. */
export async function changeUserRole(
  _prev: UsersActionState,
  formData: FormData,
): Promise<UsersActionState> {
  const me = await requireSuperadmin();
  if (!me) {
    return { ok: false, message: "No autorizado." };
  }

  const parsed = roleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { ok: false, message: "Datos inválidos." };
  }

  const { userId, role } = parsed.data;
  if (userId === me.id) {
    return {
      ok: false,
      message: "No podés cambiar tu propio rol (evita quedarte sin acceso).",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    return { ok: false, message: `No se pudo cambiar el rol: ${error.message}` };
  }

  revalidatePath("/admin/users");
  return { ok: true, message: "Rol actualizado." };
}

const removeSchema = z.object({ userId: z.string().uuid() });

/** Elimina un usuario (cuenta + perfil). Solo superadmin. */
export async function removeUser(
  _prev: UsersActionState,
  formData: FormData,
): Promise<UsersActionState> {
  const me = await requireSuperadmin();
  if (!me) {
    return { ok: false, message: "No autorizado." };
  }

  const parsed = removeSchema.safeParse({ userId: formData.get("userId") });
  if (!parsed.success) {
    return { ok: false, message: "Datos inválidos." };
  }

  const { userId } = parsed.data;
  if (userId === me.id) {
    return { ok: false, message: "No podés eliminarte a vos mismo." };
  }

  let admin;
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin");
    admin = getSupabaseAdmin();
  } catch {
    return {
      ok: false,
      message:
        "Falta configurar SUPABASE_SERVICE_ROLE_KEY en el servidor para poder eliminar usuarios.",
    };
  }

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) {
    return { ok: false, message: `No se pudo eliminar: ${error.message}` };
  }

  revalidatePath("/admin/users");
  return { ok: true, message: "Usuario eliminado." };
}
