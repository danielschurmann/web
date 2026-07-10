"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"magic" | "password">("magic");
  const [status, setStatus] = useState<string>("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setStatus("");
    const supabase = createClient();

    try {
      if (mode === "magic") {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/admin`,
          },
        });
        if (error) throw error;
        setStatus("Te enviamos un link a tu email. Abrilo para entrar.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        window.location.href = "/admin";
      }
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "No se pudo iniciar sesión");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-border bg-white p-8 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] bg-accent font-display text-sm font-bold text-white">
          DS
        </span>
        <div>
          <h1 className="font-display text-xl font-semibold">Ingresar</h1>
          <p className="text-sm text-muted">Backoffice DS & Asociados</p>
        </div>
      </div>

      <div className="mb-4 flex gap-2 text-sm">
        <button
          type="button"
          onClick={() => setMode("magic")}
          className={
            mode === "magic"
              ? "rounded-lg bg-accent px-3 py-1.5 font-semibold text-white"
              : "rounded-lg border border-border px-3 py-1.5 text-muted"
          }
        >
          Link por email
        </button>
        <button
          type="button"
          onClick={() => setMode("password")}
          className={
            mode === "password"
              ? "rounded-lg bg-accent px-3 py-1.5 font-semibold text-white"
              : "rounded-lg border border-border px-3 py-1.5 text-muted"
          }
        >
          Email y contraseña
        </button>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="rounded-[10px] border border-border-input px-3.5 py-3 text-sm outline-none focus:border-accent"
        />
        {mode === "password" ? (
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="rounded-[10px] border border-border-input px-3.5 py-3 text-sm outline-none focus:border-accent"
          />
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="rounded-[11px] bg-accent px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending
            ? "Enviando…"
            : mode === "magic"
              ? "Enviar link de acceso"
              : "Ingresar"}
        </button>
      </form>

      {status ? (
        <p className="mt-4 text-sm leading-relaxed text-muted">{status}</p>
      ) : null}

      <p className="mt-6 text-xs text-faint">
        <Link href="/" className="text-accent">
          ← Volver al sitio
        </Link>
      </p>
    </div>
  );
}
