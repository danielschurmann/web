import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NoteEditor } from "../NoteEditor";

type Props = { params: Promise<{ id: string }> };

export default async function EditNotePage({ params }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { id } = await params;
  const { data: post } = await supabase
    .from("posts")
    .select("id, title, body_md, excerpt, status, slug, source_url, created_via")
    .eq("id", id)
    .maybeSingle();

  if (!post) notFound();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold">Editar nota</h1>
        <p className="text-sm text-muted">
          Origen: {post.created_via}
          {post.source_url ? ` · fuente ${post.source_url}` : ""}
        </p>
      </div>
      <NoteEditor
        initial={{
          id: post.id,
          title: post.title,
          body_md: post.body_md,
          excerpt: post.excerpt ?? "",
          status: post.status,
        }}
      />
    </div>
  );
}
