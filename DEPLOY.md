# Deploy checklist — DS & Asociados

## Estado actual (2026-07-10)

- App en `/web` (Next.js 16 + Tailwind 4)
- Vercel team: `estudio-ds-y-asoc`
- Proyecto: `ds-asociados-landing`
- Producción: https://ds-asociados-landing.vercel.app
- Supabase org: `EstudioDS y Asoc`
- Proyecto Supabase: `daniel S Project` (`xqacwzdfihycqzcmuejs`)
- Tabla `public.leads` creada con RLS (insert para anon)

## Pendiente (vos / Dani)

1. **WhatsApp** — número real del estudio:
   ```bash
   cd web
   vercel env add NEXT_PUBLIC_WHATSAPP_NUMBER production --value '54911XXXXXXXX' --yes --scope estudio-ds-y-asoc
   vercel deploy --prod --yes --scope estudio-ds-y-asoc
   ```
   También en `.env.local` para desarrollo.

2. **Resend** (email al recibir leads) — opcional al inicio:
   - Crear cuenta / API key en https://resend.com
   - Agregar `RESEND_API_KEY`, `CONTACT_NOTIFY_EMAIL`, `RESEND_FROM_EMAIL` en Vercel
   - Sin esto, el lead igual se guarda en Supabase

3. **Service role key** (recomendado):
   - Dashboard Supabase → Project Settings → API → `service_role`
   - `vercel env add SUPABASE_SERVICE_ROLE_KEY production --sensitive --yes --scope estudio-ds-y-asoc`
   - Luego se puede endurecer RLS quitando el insert público

4. **Dominio** `estudiodsyasoc.com.ar`:
   ```bash
   vercel domains add estudiodsyasoc.com.ar --scope estudio-ds-y-asoc
   ```
   y apuntar DNS según indique Vercel.

5. **Preview envs** — si hace falta, agregar las mismas vars a `preview` (la CLI a veces pide branch).
