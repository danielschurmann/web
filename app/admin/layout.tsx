import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const nav = [
  { href: "/admin/notes", label: "Notas" },
  { href: "/admin/leads", label: "Consultas" },
  { href: "/admin/keys", label: "API keys" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-page text-ink">
      {user ? (
        <header className="border-b border-border bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-[11px] font-bold text-white">
                DS
              </span>
              <div>
                <div className="font-display text-sm font-semibold">
                  Backoffice
                </div>
                <div className="text-xs text-faint">{user.email}</div>
              </div>
            </div>
            <nav className="flex items-center gap-4 text-sm">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-muted hover:text-ink"
                >
                  {item.label}
                </Link>
              ))}
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted"
                >
                  Salir
                </button>
              </form>
            </nav>
          </div>
        </header>
      ) : null}
      <main className="mx-auto max-w-5xl px-5 py-8">{children}</main>
    </div>
  );
}
