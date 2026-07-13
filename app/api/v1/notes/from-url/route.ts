import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateRequest, requireScope } from "@/lib/api-auth";
import { ApiDataError, createNote } from "@/lib/api-data";

const schema = z.object({
  url: z.string().url(),
  author: z.enum(["daniel", "alejandra", "gabriel"]).default("alejandra"),
  status: z.enum(["draft", "published"]).default("draft"),
  tone: z.string().optional(),
  audience: z.string().optional(),
  title: z.string().optional(),
  body_md: z.string().optional(),
  excerpt: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

async function fetchSource(url: string) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "DS-Asociados-Agent/1.0" },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return { title: "", text: "" };
    const html = await res.text();
    const title =
      html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? "";
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 4000);
    return { title, text };
  } catch {
    return { title: "", text: "" };
  }
}

function draftFromSource(input: {
  url: string;
  sourceTitle: string;
  sourceText: string;
  tone?: string;
  audience?: string;
  title?: string;
  body_md?: string;
  excerpt?: string;
}) {
  const title =
    input.title ||
    input.sourceTitle ||
    `Novedad contable: ${new URL(input.url).hostname}`;

  const excerpt =
    input.excerpt ||
    `Resumen orientado a ${input.audience || "pymes"} a partir de una novedad publicada en la web.`;

  const body =
    input.body_md ||
    [
      `## Contexto`,
      ``,
      `Tomamos como referencia esta novedad: [${input.sourceTitle || "fuente"}](${input.url}).`,
      ``,
      `## Qué implica para tu empresa`,
      ``,
      input.sourceText
        ? `> Extracto de la fuente (para revisión humana):\n>\n> ${input.sourceText.slice(0, 600)}…`
        : `El agente no pudo extraer el cuerpo completo de la fuente. Completá este borrador con el análisis del estudio.`,
      ``,
      `## Recomendación del estudio`,
      ``,
      `Si esta novedad te impacta, escribinos y lo revisamos juntos. Tono: ${input.tone || "profesional"}.`,
      ``,
      `---`,
      ``,
      `*Borrador generado para revisión. Fuente: ${input.url}*`,
    ].join("\n");

  return { title, excerpt, body_md: body };
}

export async function POST(request: Request) {
  const actor = await authenticateRequest(request);
  if (!actor || !requireScope(actor, "notes:write")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const input = parsed.data;
  if (input.status === "published" && !requireScope(actor, "notes:publish")) {
    return NextResponse.json(
      { error: "Missing notes:publish scope. Create as draft instead." },
      { status: 403 },
    );
  }

  const source = await fetchSource(input.url);
  const draft = draftFromSource({
    url: input.url,
    sourceTitle: source.title,
    sourceText: source.text,
    tone: input.tone,
    audience: input.audience,
    title: input.title,
    body_md: input.body_md,
    excerpt: input.excerpt,
  });

  let data: { id: string; slug: string; status: string };
  try {
    data = (await createNote(actor, {
      title: draft.title,
      body_md: draft.body_md,
      excerpt: draft.excerpt,
      source_url: input.url,
      status: input.status,
      author_slug: input.author,
      tags: input.tags ?? ["novedades", "impuestos"],
      seo_title: draft.title,
      seo_description: draft.excerpt,
    })) as { id: string; slug: string; status: string };
  } catch (err) {
    if (err instanceof ApiDataError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL || "";
  return NextResponse.json(
    {
      data,
      links: {
        admin: `${site}/admin/notes/${data.id}`,
        public:
          data.status === "published" ? `${site}/novedades/${data.slug}` : null,
        markdown:
          data.status === "published"
            ? `${site}/novedades/${data.slug}.md`
            : null,
      },
      tip: "Preferí status=draft para que Daniel/Alejandra revisen antes de publicar.",
    },
    { status: 201 },
  );
}
