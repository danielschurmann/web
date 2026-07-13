"use client";

import { useActionState, useState } from "react";
import {
  changeUserRole,
  inviteUser,
  removeUser,
  type UsersActionState,
} from "./actions";

export type UserRow = {
  id: string;
  email: string;
  full_name: string;
  role: "superadmin" | "admin" | "editor" | "client";
  slug: string | null;
  created_at: string;
};

const initialState: UsersActionState = { ok: false, message: "" };

const ROLE_LABELS: Record<UserRow["role"], string> = {
  superadmin: "Superadmin",
  admin: "Admin",
  editor: "Editor",
  client: "Cliente",
};

const ROLE_HINT: Record<UserRow["role"], string> = {
  superadmin: "Gestiona usuarios y todo el backoffice.",
  admin: "Acceso completo (rol heredado).",
  editor: "Ve consultas y crea/edita notas.",
  client: "Sin acceso al backoffice.",
};

function Feedback({ state }: { state: UsersActionState }) {
  if (!state.message) return null;
  return (
    <p
      className={
        state.ok ? "text-sm text-whatsapp" : "text-sm text-red-600"
      }
    >
      {state.message}
    </p>
  );
}

function RoleControl({
  user,
  isSelf,
}: {
  user: UserRow;
  isSelf: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    changeUserRole,
    initialState,
  );

  if (isSelf) {
    return (
      <span className="inline-flex rounded-full bg-band px-2.5 py-1 text-xs font-semibold text-muted">
        {ROLE_LABELS[user.role]} · vos
      </span>
    );
  }

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="userId" value={user.id} />
      <select
        name="role"
        defaultValue={
          user.role === "admin" ? "superadmin" : user.role
        }
        disabled={pending}
        className="rounded-[10px] border border-border-input px-2.5 py-1.5 text-sm"
      >
        <option value="superadmin">Superadmin</option>
        <option value="editor">Editor</option>
        <option value="client">Cliente</option>
      </select>
      <button
        type="submit"
        disabled={pending}
        className="rounded-[10px] border border-border px-3 py-1.5 text-sm font-medium text-muted hover:text-ink disabled:opacity-60"
      >
        {pending ? "…" : "Guardar"}
      </button>
      <Feedback state={state} />
    </form>
  );
}

function RemoveControl({ user }: { user: UserRow }) {
  const [state, formAction, pending] = useActionState(removeUser, initialState);
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-sm text-red-600 hover:underline"
      >
        Eliminar
      </button>
    );
  }

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="userId" value={user.id} />
      <span className="text-xs text-muted">¿Seguro?</span>
      <button
        type="submit"
        disabled={pending}
        className="text-sm font-semibold text-red-600 disabled:opacity-60"
      >
        {pending ? "…" : "Sí, eliminar"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="text-sm text-muted"
      >
        No
      </button>
      <Feedback state={state} />
    </form>
  );
}

export function UsersManager({
  users,
  currentUserId,
}: {
  users: UserRow[];
  currentUserId: string;
}) {
  const [inviteState, inviteAction, invitePending] = useActionState(
    inviteUser,
    initialState,
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold">Usuarios</h1>
        <p className="text-sm text-muted">
          Administrá quién accede al backoffice y con qué permisos. Solo los
          superadministradores ven esta sección.
        </p>
      </div>

      <form
        action={inviteAction}
        className="mb-8 rounded-xl border border-border bg-white p-4"
      >
        <div className="mb-3 text-sm font-semibold">Invitar usuario</div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-xs text-faint">Nombre</label>
            <input
              name="fullName"
              required
              placeholder="Nombre y apellido"
              className="w-full min-w-[180px] rounded-[10px] border border-border-input px-3 py-2 text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs text-faint">Email</label>
            <input
              name="email"
              type="email"
              required
              placeholder="persona@estudiodsyasoc.com.ar"
              className="w-full min-w-[220px] rounded-[10px] border border-border-input px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-faint">Rol</label>
            <select
              name="role"
              defaultValue="editor"
              className="rounded-[10px] border border-border-input px-3 py-2 text-sm"
            >
              <option value="editor">Editor</option>
              <option value="superadmin">Superadmin</option>
              <option value="client">Cliente</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={invitePending}
            className="rounded-[10px] bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {invitePending ? "Enviando…" : "Invitar"}
          </button>
        </div>
        <div className="mt-3">
          <Feedback state={inviteState} />
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border border-border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-band text-faint">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isSelf = user.id === currentUserId;
              return (
                <tr
                  key={user.id}
                  className="border-b border-border align-middle last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink">
                      {user.full_name}
                    </div>
                    <div className="text-xs text-faint">
                      {ROLE_HINT[user.role]}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{user.email}</td>
                  <td className="px-4 py-3">
                    <RoleControl user={user} isSelf={isSelf} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isSelf ? (
                      <span className="text-xs text-faint">—</span>
                    ) : (
                      <RemoveControl user={user} />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
