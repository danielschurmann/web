import { sendGAEvent } from "@next/third-parties/google";

export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-324PTYZ0ZG";

/** Eventos custom para analizar en GA4 → Admin → Eventos */
export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>,
) {
  if (typeof window === "undefined") return;
  sendGAEvent("event", name, params ?? {});
}

export function trackWhatsappClick(location: string) {
  trackEvent("whatsapp_click", {
    location,
    method: "whatsapp",
  });
}

export function trackContactSubmit(source: string = "landing_form") {
  trackEvent("generate_lead", {
    source,
    method: "form",
  });
}

export function trackCtaClick(cta: string, location: string) {
  trackEvent("cta_click", { cta, location });
}

export function trackNavClick(section: string, location: string = "header") {
  trackEvent("nav_click", { section, location });
}

export function trackSectionView(section: string) {
  trackEvent("section_view", { section });
}

export function trackServiceClick(service: string) {
  trackEvent("service_click", {
    service,
    section: "servicios",
  });
}

export function trackSituationClick(situation: string, destination: string) {
  trackEvent("situation_click", {
    situation,
    section: "situaciones",
    destination,
  });
}

export function trackAiDemoAsk(question: string) {
  trackEvent("ai_demo_ask", {
    question,
    section: "ai",
  });
}

export function trackFormStart(source: string = "landing_form") {
  trackEvent("form_start", {
    source,
    method: "form",
  });
}

export function trackFormSubmitAttempt(source: string = "landing_form") {
  trackEvent("form_submit_attempt", {
    source,
    method: "form",
  });
}

export function trackNewsClick(title: string) {
  trackEvent("news_click", {
    title,
    section: "novedades",
  });
}

export function trackFooterClick(cta: string) {
  trackEvent("footer_click", {
    cta,
    location: "footer",
  });
}
