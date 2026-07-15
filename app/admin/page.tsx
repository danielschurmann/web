import Link from "next/link";
import { requireStaff, isSuperadminRole } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";

export default async function AdminHomePage() {
  const profile = await requireStaff();
  const supabase = await createClient();

  const [postsTotal, postsPublished, postsDraft, leadsTotal] =
    await Promise.all([
      supabase.from("posts").select("id", { count: "exact", head: true }),
      supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("status", "published"),
      supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("status", "draft"),
      supabase.from("leads").select("id", { count: "exact", head: true }),
    ]);

  const stats = [
    { label: "Notas totales", value: postsTotal.count ?? 0 },
    { label: "Publicadas", value: postsPublished.count ?? 0 },
    { label: "Borradores", value: postsDraft.count ?? 0 },
    { label: "Consultas", value: leadsTotal.count ?? 0 },
  ];

  const isSuperadmin = isSuperadminRole(profile.role);

  const shortcuts = [
    {
      href: "/admin/notes",
      title: "Notas",
      desc: "Ver, crear y editar notas del blog.",
    },
    {
      href: "/admin/notes/new",
      title: "Nueva nota",
      desc: "Redactar una nota desde cero.",
    },
    {
      href: "/admin/leads",
      title: "Consultas",
      desc: "Leads que dejaron sus datos en el formulario.",
    },
    ...(isSuperadmin
      ? [
          {
            href: "/admin/users",
            title: "Usuarios",
            desc: "Gestionar accesos y roles del equipo.",
          },
          {
            href: "/admin/keys",
            title: "API keys",
            desc: "Tokens para los agentes de IA.",
          },
        ]
      : []),
  ];

  const firstName = profile.full_name?.split(" ")[0] || profile.email;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold">
          Hola, {firstName}
        </h1>
        <p className="text-sm text-muted">
          Este es el panel del backoffice. Desde acá accedés a todo.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-white p-4"
          >
            <div className="font-display text-2xl font-semibold">
              {stat.value}
            </div>
            <div className="text-xs text-faint">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {shortcuts.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-xl border border-border bg-white p-5 transition-colors hover:border-accent"
          >
            <div className="font-display text-base font-semibold group-hover:text-accent">
              {item.title}
            </div>
            <p className="mt-1 text-sm text-muted">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
