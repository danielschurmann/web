import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export default async function AdminLeadsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const admin = getSupabaseAdmin();
  const { data: leads } = await admin
    .from("leads")
    .select("id, nombre, contacto, mensaje, source, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="mb-2 font-display text-2xl font-semibold">Consultas</h1>
      <p className="mb-6 text-sm text-muted">
        Leads del formulario (email o WhatsApp que dejó el visitante). Los chats
        abiertos directo por el botón de WhatsApp no quedan registrados acá.
      </p>

      <div className="overflow-hidden rounded-xl border border-border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-band text-faint">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Contacto</th>
              <th className="px-4 py-3 font-medium">Mensaje</th>
              <th className="px-4 py-3 font-medium">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {(leads ?? []).length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted">
                  Sin consultas todavía.
                </td>
              </tr>
            ) : (
              (leads ?? []).map((lead) => (
                <tr key={lead.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{lead.nombre}</td>
                  <td className="px-4 py-3 text-muted">{lead.contacto}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-muted">
                    {lead.mensaje || "—"}
                  </td>
                  <td className="px-4 py-3 text-faint">
                    {new Date(lead.created_at).toLocaleString("es-AR")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
