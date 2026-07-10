"use client";

import { useActionState } from "react";
import {
  submitLead,
  type SubmitLeadState,
} from "@/app/actions";
import { whatsappUrl } from "@/lib/site";
import { IconWhatsapp } from "./Icons";

const initialState: SubmitLeadState = {
  ok: false,
  message: "",
};

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitLead, initialState);

  return (
    <div>
      <div className="mb-4 text-[13px] font-semibold tracking-[0.12em] text-faint uppercase">
        Hablemos
      </div>

      {state.ok ? (
        <div className="rounded-[11px] border border-whatsapp/30 bg-whatsapp/10 px-4 py-4 text-sm leading-[1.5] text-ink">
          {state.message}
        </div>
      ) : (
        <form action={formAction} className="flex flex-col gap-2.5">
          <div>
            <label htmlFor="nombre" className="sr-only">
              Nombre
            </label>
            <input
              id="nombre"
              name="nombre"
              required
              autoComplete="name"
              placeholder="Nombre"
              className="w-full rounded-[10px] border border-border-input bg-white px-3.5 py-3 text-sm text-ink outline-none focus:border-accent"
            />
            {state.fieldErrors?.nombre ? (
              <p className="mt-1 text-xs text-red-600">
                {state.fieldErrors.nombre}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="contacto" className="sr-only">
              Email o WhatsApp
            </label>
            <input
              id="contacto"
              name="contacto"
              required
              autoComplete="email"
              placeholder="Email o WhatsApp"
              className="w-full rounded-[10px] border border-border-input bg-white px-3.5 py-3 text-sm text-ink outline-none focus:border-accent"
            />
            {state.fieldErrors?.contacto ? (
              <p className="mt-1 text-xs text-red-600">
                {state.fieldErrors.contacto}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="mensaje" className="sr-only">
              Mensaje
            </label>
            <textarea
              id="mensaje"
              name="mensaje"
              rows={3}
              placeholder="¿En qué te podemos ayudar? (opcional)"
              className="w-full resize-y rounded-[10px] border border-border-input bg-white px-3.5 py-3 text-sm text-ink outline-none focus:border-accent"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-11 items-center justify-center gap-2.5 rounded-[11px] bg-ink px-4 py-3.5 text-[15px] font-semibold text-white disabled:opacity-60"
          >
            {pending ? "Enviando…" : "Agendá una reunión sin cargo"}
          </button>
          {!state.ok && state.message ? (
            <p className="text-xs text-red-600">{state.message}</p>
          ) : null}
        </form>
      )}

      <a
        href={whatsappUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2.5 inline-flex min-h-11 w-full items-center justify-center gap-2.5 rounded-[11px] bg-whatsapp px-4 py-3.5 text-[15px] font-semibold text-white"
      >
        <IconWhatsapp size={18} />
        Escribinos por WhatsApp
      </a>
    </div>
  );
}
