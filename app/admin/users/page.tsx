import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import { UsersManager, type UserRow } from "./UsersManager";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const me = await getCurrentProfile();
  if (!me) redirect("/admin/login");
  if (me.role !== "superadmin") {
    return (
      <div className="rounded-xl border border-border bg-white p-8 text-center">
        <h1 className="mb-2 font-display text-xl font-semibold">Usuarios</h1>
        <p className="text-sm text-muted">
          Esta sección es solo para superadministradores.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, slug, created_at")
    .order("created_at", { ascending: true });

  const users = (profiles ?? []) as UserRow[];

  return <UsersManager users={users} currentUserId={me.id} />;
}
