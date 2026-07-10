import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminIndexPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  redirect(user ? "/admin/notes" : "/admin/login");
}
