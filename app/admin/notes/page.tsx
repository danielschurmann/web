import Link from "next/link";
import { requireStaff } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";

export default async function AdminNotesPage() {
  await requireStaff();
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, slug, status, created_via, published_at, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Notas</h1>
          <p className="text-sm text-muted">
            Borradores y publicados. Los agentes crean vía API.
          </p>
        </div>
        <Link
          href="/admin/notes/new"
          className="rounded-[10px] bg-accent px-4 py-2.5 text-sm font-semibold text-white"
        >
          Nueva nota
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-band text-faint">
            <tr>
              <th className="px-4 py-3 font-medium">Título</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Origen</th>
              <th className="px-4 py-3 font-medium">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {(posts ?? []).length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted">
                  Todavía no hay notas.
                </td>
              </tr>
            ) : (
              (posts ?? []).map((post) => (
                <tr key={post.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/notes/${post.id}`}
                      className="font-medium text-ink hover:text-accent"
                    >
                      {post.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 capitalize text-muted">{post.status}</td>
                  <td className="px-4 py-3 text-muted">{post.created_via}</td>
                  <td className="px-4 py-3 text-faint">
                    {new Date(post.created_at).toLocaleDateString("es-AR")}
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
