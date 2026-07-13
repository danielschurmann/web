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

2. **Aviso por email al recibir un lead** — el aviso se manda a
   `alejandra@estudiodsyasoc.com.ar` (destinatario por defecto; se puede
   sobreescribir con `CONTACT_NOTIFY_EMAIL`, admite varios separados por coma).
   El código ya dispara el mail tras guardar el lead, pero **faltan las
   credenciales de envío en Vercel** (sin esto el lead igual se guarda):

   - Opción A) Gmail SMTP (recomendada):
     ```bash
     cd web
     vercel env add CONTACT_NOTIFY_EMAIL production --value 'alejandra@estudiodsyasoc.com.ar' --yes --scope estudio-ds-y-asoc
     vercel env add SMTP_HOST production --value 'smtp.gmail.com' --yes --scope estudio-ds-y-asoc
     vercel env add SMTP_PORT production --value '587' --yes --scope estudio-ds-y-asoc
     vercel env add SMTP_USER production --value 'daniel@estudiodsyasoc.com.ar' --yes --scope estudio-ds-y-asoc
     vercel env add SMTP_PASS production --sensitive --yes --scope estudio-ds-y-asoc   # app password de Gmail
     vercel env add SMTP_FROM production --value 'DS & Asociados <daniel@estudiodsyasoc.com.ar>' --yes --scope estudio-ds-y-asoc
     vercel deploy --prod --yes --scope estudio-ds-y-asoc
     ```
   - Opción B) Resend: crear API key en https://resend.com y agregar
     `RESEND_API_KEY`, `RESEND_FROM_EMAIL` y `CONTACT_NOTIFY_EMAIL` en Vercel.

3. **Service role key** (necesaria para invitar/eliminar usuarios en
   `/admin/users`; recomendada además para endurecer RLS):
   - Dashboard Supabase → Project Settings → API → `service_role`
   - `vercel env add SUPABASE_SERVICE_ROLE_KEY production --sensitive --yes --scope estudio-ds-y-asoc`
   - Sin esta variable, el resto del backoffice funciona y un superadmin igual
     puede **cambiar roles**; solo quedan deshabilitados el alta y la baja de
     usuarios (que usan la Auth Admin API).

### Roles del backoffice

- `superadmin` (Daniel, Gabriel): administran usuarios + todo el backoffice.
- `editor` (Alejandra, Sebastián): ven consultas y crean/editan notas.
- `admin`: rol heredado con acceso total salvo gestión de usuarios.
- `client`: sin acceso al backoffice.

Un usuario nuevo puede entrar de dos formas: invitándolo desde `/admin/users`
(le llega un email) o, si ya existe, con el link mágico del login. El rol se
asigna al invitar y luego se puede cambiar desde la misma sección.

4. **Dominio** `estudiodsyasoc.com.ar`:
   ```bash
   vercel domains add estudiodsyasoc.com.ar --scope estudio-ds-y-asoc
   ```
   y apuntar DNS según indique Vercel.

5. **Preview envs** — si hace falta, agregar las mismas vars a `preview` (la CLI a veces pide branch).
