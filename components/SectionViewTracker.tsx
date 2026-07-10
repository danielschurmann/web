"use client";

import { useEffect } from "react";
import { trackSectionView } from "@/lib/analytics";

const SECTIONS = [
  "servicios",
  "ai",
  "novedades",
  "equipo",
  "contacto",
] as const;

/**
 * Observa secciones clave y dispara section_view una vez por sección.
 */
export function SectionViewTracker() {
  useEffect(() => {
    const seen = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = entry.target.id;
          if (!id || seen.has(id)) continue;
          seen.add(id);
          trackSectionView(id);
        }
      },
      { threshold: 0.35, rootMargin: "0px 0px -10% 0px" },
    );

    for (const id of SECTIONS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return null;
}
