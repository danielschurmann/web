import { requireStaff } from "@/lib/current-user";
import { NoteEditor } from "../NoteEditor";

export default async function NewNotePage() {
  await requireStaff();
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold">Nueva nota</h1>
      <NoteEditor />
    </div>
  );
}
