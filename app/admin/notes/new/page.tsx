import { NoteEditor } from "../NoteEditor";

export default function NewNotePage() {
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold">Nueva nota</h1>
      <NoteEditor />
    </div>
  );
}
