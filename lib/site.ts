const PUBLIC_SITE_URL = "https://estudiodsyasoc.com.ar";

function resolveSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");

  if (process.env.NODE_ENV === "development") {
    return configured || "http://localhost:3000";
  }

  if (configured && !configured.includes(".vercel.app")) {
    return configured;
  }

  return PUBLIC_SITE_URL;
}

const siteUrl = resolveSiteUrl().replace(/\/$/, "");

export const siteConfig = {
  name: "DS & Asociados",
  legalName: "DS & Asociados",
  title: "DS & Asociados | Estudio contable para pymes en Buenos Aires",
  description:
    "DS & Asociados es un estudio contable en Buenos Aires con más de 30 años asesorando pymes en impuestos, sueldos, auditorías y automatización.",
  language: "es-AR",
  locale: "es_AR",
  url: siteUrl,
  logo: `${siteUrl}/icon`,
  socialImage: `${siteUrl}/opengraph-image`,
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
  contactEmail: process.env.CONTACT_NOTIFY_EMAIL ?? "",
  city: "Buenos Aires",
  country: "Argentina",
  years: 30,
  teamSize: 4,
  // TODO: dirección postal completa (calle, número, CP) cuando el cliente la confirme.
  // TODO: email público de contacto (distinto del interno de notificaciones).
  // TODO: horarios de atención (openingHours) cuando el cliente los confirme.
  // TODO: perfiles de redes (sameAs: LinkedIn, Instagram, etc.) cuando existan.
} as const;

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${normalized === "/" ? "" : normalized}`;
}

export function whatsappUrl(message?: string) {
  const number = siteConfig.whatsappNumber.replace(/\D/g, "");
  if (!number) return "#contacto";
  const text =
    message ??
    "Hola, quiero hacer una consulta con DS & Asociados.";
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
