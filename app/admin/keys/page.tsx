"use client";

import { useEffect, useState } from "react";

type KeyRow = {
  id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
};

export default function AdminKeysPage() {
  const [keys, setKeys] = useState<KeyRow[]>([]);
  const [name, setName] = useState("Claude de Daniel");
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/v1/api-keys");
    const json = await res.json();
    if (res.ok) setKeys(json.data ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function createKey() {
    setError("");
    setToken(null);
    const res = await fetch("/api/v1/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        scopes: ["notes:write", "notes:read", "notes:publish", "leads:read"],
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "No se pudo crear");
      return;
    }
    setToken(json.token);
    await load();
  }

  async function revoke(id: string) {
    await fetch(`/api/v1/api-keys/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <h1 className="mb-2 font-display text-2xl font-semibold">API keys</h1>
      <p className="mb-6 text-sm text-muted">
        Tokens para agentes Claude/GPT. Se muestran una sola vez al crearlos.
      </p>

      <div className="mb-6 flex flex-wrap gap-3 rounded-xl border border-border bg-white p-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="min-w-[220px] flex-1 rounded-[10px] border border-border-input px-3 py-2 text-sm"
          placeholder="Nombre de la key"
        />
        <button
          type="button"
          onClick={createKey}
          className="rounded-[10px] bg-accent px-4 py-2 text-sm font-semibold text-white"
        >
          Crear key
        </button>
      </div>

      {token ? (
        <div className="mb-6 rounded-xl border border-accent/30 bg-accent/5 p-4 text-sm">
          <div className="mb-1 font-semibold">Token (copiá ahora):</div>
          <code className="break-all text-accent">{token}</code>
        </div>
      ) : null}
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      <div className="overflow-hidden rounded-xl border border-border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-band text-faint">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Prefijo</th>
              <th className="px-4 py-3 font-medium">Scopes</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {keys.map((key) => (
              <tr key={key.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">
                  {key.name}
                  {key.revoked_at ? (
                    <span className="ml-2 text-xs text-red-600">revocada</span>
                  ) : null}
                </td>
                <td className="px-4 py-3 font-mono text-muted">{key.key_prefix}…</td>
                <td className="px-4 py-3 text-xs text-muted">
                  {key.scopes?.join(", ")}
                </td>
                <td className="px-4 py-3 text-right">
                  {!key.revoked_at ? (
                    <button
                      type="button"
                      onClick={() => revoke(key.id)}
                      className="text-sm text-red-600"
                    >
                      Revocar
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
