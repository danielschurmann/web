import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type UserRole = "superadmin" | "admin" | "editor" | "client";

export type CurrentProfile = {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  slug: string | null;
};

/** Perfil (con rol) del usuario logueado, o null si no hay sesión. */
export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, slug")
    .eq("id", user.id)
    .maybeSingle();

  return (profile as CurrentProfile | null) ?? null;
}

export function isStaffRole(role: UserRole | undefined | null) {
  return role === "superadmin" || role === "admin" || role === "editor";
}

export function isSuperadminRole(role: UserRole | undefined | null) {
  return role === "superadmin";
}

/** Exige sesión con acceso al backoffice; redirige si no corresponde. */
export async function requireStaff(): Promise<CurrentProfile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/admin/login");
  if (!isStaffRole(profile.role)) redirect("/");
  return profile;
}
