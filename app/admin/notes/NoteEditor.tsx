"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function NoteEditor({
  initial,
}: {
  initial?: {
    id?: string;
    title: string;
    body_md: string;
    excerpt: string;
    status: string;
  };
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.body_md ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [status, setStatus] = useState(initial?.status ?? "draft");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function save() {
    setPending(true);
    setError("");
    try {
      const payload = {
        title,
        body_md: body,
        excerpt,
        status,
      };
      const res = await fetch(
        initial?.id ? `/api/v1/notes/${initial.id}` : "/api/v1/notes",
        {
          method: initial?.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al guardar");
      router.push(`/admin/notes/${json.data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título"
        className="rounded-[10px] border border-border-input px-3.5 py-3 font-display text-lg font-semibold outline-none focus:border-accent"
      />
      <input
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
        placeholder="Extracto / resumen corto"
        className="rounded-[10px] border border-border-input px-3.5 py-3 text-sm outline-none focus:border-accent"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={16}
        placeholder="Cuerpo en Markdown"
        className="rounded-[10px] border border-border-input px-3.5 py-3 font-mono text-sm outline-none focus:border-accent"
      />
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-[10px] border border-border-input px-3 py-2 text-sm"
        >
          <option value="draft">Borrador</option>
          <option value="published">Publicado</option>
          <option value="archived">Archivado</option>
        </select>
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="rounded-[10px] bg-accent px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Guardar"}
        </button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
