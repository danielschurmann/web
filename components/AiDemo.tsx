"use client";

import { useEffect, useRef, useState } from "react";

type Message = { role: "assistant" | "user"; text: string };

const QA = [
  {
    q: "¿Cuándo vence el IVA este mes?",
    a: "El vencimiento del IVA se ordena por la terminación de tu CUIT. Con tu número armo el calendario del período y te aviso 3 días antes de cada vencimiento. ¿Querés que lo configuremos?",
  },
  {
    q: "¿Conviene monotributo o responsable inscripto?",
    a: "Depende de tu facturación anual proyectada, el rubro y tus compras con crédito fiscal. Con tus números te calculo el punto exacto donde deja de convenir el monotributo.",
  },
  {
    q: "¿Qué gastos de mi pyme puedo deducir?",
    a: "Se deduce todo gasto necesario para generar la renta: sueldos, alquiler, servicios, honorarios y amortizaciones. Los rodados y ciertos gastos tienen tope. Reviso tus comprobantes y te marco cuáles computar.",
  },
];

const INITIAL: Message[] = [
  {
    role: "assistant",
    text: "Hola 👋 Soy el asistente del estudio. Puedo resolver dudas contables o derivarte con un contador. ¿En qué te ayudo?",
  },
];

export function AiDemo() {
  const [messages, setMessages] = useState<Message[]>(INITIAL);
  const [typing, setTyping] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function ask(index: number) {
    if (busyRef.current) return;
    busyRef.current = true;
    const qa = QA[index];
    setMessages((prev) => [...prev, { role: "user", text: qa.q }]);
    setTyping(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    timeoutRef.current = setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { role: "assistant", text: "" }]);
      let i = 0;
      intervalRef.current = setInterval(() => {
        i += 2;
        const text = qa.a.slice(0, i);
        setMessages((prev) => {
          const next = prev.slice();
          next[next.length - 1] = { role: "assistant", text };
          return next;
        });
        if (i >= qa.a.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          busyRef.current = false;
        }
      }, 16);
    }, 650);
  }

  const showTyping =
    typing && messages[messages.length - 1]?.role === "user";

  return (
    <div className="flex h-full min-h-[380px] flex-col overflow-hidden rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04),0_14px_40px_-18px_rgba(0,0,0,0.28)]">
      <div className="flex items-center gap-2.5 border-b border-white/10 bg-[#0C1620] px-[18px] py-3.5 text-[#E9EEF4]">
        <span className="h-2.5 w-2.5 rounded-full bg-accent-demo shadow-[0_0_0_3px_rgba(108,92,231,0.13)]" />
        <span className="text-sm font-semibold tracking-[-0.01em]">
          Asistente contable
        </span>
        <span className="ml-auto rounded-full bg-accent-demo/10 px-2.5 py-0.5 text-[11px] font-semibold tracking-[0.04em] text-accent-demo uppercase">
          demo en vivo
        </span>
      </div>

      <div
        ref={bodyRef}
        className="flex flex-1 flex-col gap-3 overflow-y-auto bg-[#111B27] p-[18px]"
      >
        {messages.map((m, idx) => {
          const isUser = m.role === "user";
          return (
            <div
              key={`${idx}-${m.role}`}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={
                  isUser
                    ? "max-w-[82%] rounded-[16px_16px_4px_16px] bg-accent-demo px-3.5 py-2.5 text-sm leading-[1.5] text-white"
                    : "max-w-[82%] rounded-[16px_16px_16px_4px] bg-[#1D2A39] px-3.5 py-2.5 text-sm leading-[1.5] text-[#E9EEF4]"
                }
              >
                {m.text}
              </div>
            </div>
          );
        })}
        {showTyping ? (
          <div className="flex justify-start">
            <div className="rounded-[16px_16px_16px_4px] bg-[#1D2A39] px-3.5 py-3">
              <span className="inline-flex items-center gap-1">
                <i className="inline-block h-1.5 w-1.5 rounded-full bg-[#8797A8] [animation:aidemo-blink_1s_infinite_0s]" />
                <i className="inline-block h-1.5 w-1.5 rounded-full bg-[#8797A8] [animation:aidemo-blink_1s_infinite_0.2s]" />
                <i className="inline-block h-1.5 w-1.5 rounded-full bg-[#8797A8] [animation:aidemo-blink_1s_infinite_0.4s]" />
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="border-t border-white/10 bg-[#0C1620] px-[18px] pt-3.5 pb-[18px]">
        <span className="text-xs tracking-[0.01em] text-[#8797A8]">
          Probá una consulta:
        </span>
        <div className="mt-2 flex flex-wrap gap-2">
          {QA.map((qa, i) => (
            <button
              key={qa.q}
              type="button"
              onClick={() => ask(i)}
              className="cursor-pointer rounded-[10px] border border-accent-demo/25 bg-accent-demo/5 px-3 py-2 text-left text-[13px] leading-[1.3] text-[#E9EEF4] transition-colors hover:border-accent-demo hover:bg-accent-demo/11"
            >
              {qa.q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
