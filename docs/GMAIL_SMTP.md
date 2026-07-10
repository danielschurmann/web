# Configurar envío de mails — Gmail / SMTP / Resend

Hay **dos canales distintos**. Configurar Gmail en Vercel **no** arregla solo los magic links del admin.

| Canal | Quién envía | Dónde se configura |
|-------|-------------|-------------------|
| Magic links / Auth (`/admin/login`) | **Supabase Auth** | Dashboard Supabase → Custom SMTP (no Vercel) |
| Notificación de leads (formulario landing) | **App Next.js en Vercel** | Env vars `SMTP_*` (Gmail) **o** `RESEND_API_KEY` |

**Respuesta corta:** Gmail SMTP en Supabase arregla el login admin. Gmail SMTP (o Resend) en Vercel arregla los mails del formulario. Son setups independientes.

> **No hace falta Google Cloud Console / OAuth client.** Para SMTP con App Password solo necesitás la cuenta Google con 2FA y una App Password desde [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).

---

## A. Magic links (Supabase Custom SMTP) — paso a paso

### 1. Crear App Password de Gmail

1. Entrá a la cuenta Google del estudio (ej. `daniel@estudiodsyasoc.com.ar`).
2. Activá **verificación en 2 pasos** (obligatorio para App Passwords): [Google Account → Seguridad](https://myaccount.google.com/security).
3. Andá a [App Passwords](https://myaccount.google.com/apppasswords) (si no aparece, buscá “Contraseñas de aplicaciones”).
4. Creá una: nombre `Supabase Auth DS`.
5. Copiá las **16 letras** (podés pegarlas con o sin espacios).

### 2. Custom SMTP en Supabase

Dashboard → proyecto **daniel S Project** (`xqacwzdfihycqzcmuejs`) → **Authentication** → **Emails** / **SMTP Settings** → Enable custom SMTP:

| Campo | Valor exacto |
|-------|--------------|
| Host | `smtp.gmail.com` |
| Port | `587` |
| Username | email completo (ej. `daniel@estudiodsyasoc.com.ar`) |
| Password | la App Password de 16 caracteres |
| Sender email | el mismo email (o un alias) |
| Sender name | `DS & Asociados` |

Docs: https://supabase.com/docs/guides/auth/auth-smtp

### 3. URLs de redirect (Auth)

Dashboard → **Authentication** → **URL Configuration**:

- **Site URL:** `https://estudiodsyasoc.com.ar`
- **Redirect URLs** (todas):
  - `http://localhost:3000/auth/callback`
  - `https://estudiodsyasoc.com.ar/auth/callback`
  - `https://ds-asociados-landing.vercel.app/auth/callback`

### 4. Probar magic link

1. Abrí `https://estudiodsyasoc.com.ar/admin/login`
2. Pedí link por email a tu usuario admin
3. Debería llegar el mail (revisá spam). Si no: App Password, SMTP enabled, logs Auth en Supabase.

---

## B. Leads del formulario (Vercel `SMTP_*`) — paso a paso

La app usa **doble camino** (`lib/email.ts`):

1. Si están `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` y `SMTP_FROM` → **Gmail/SMTP** (Nodemailer).
2. Si no → **Resend** (`RESEND_API_KEY`).

### 1. Misma App Password (o una nueva)

Podés reutilizar la App Password de la sección A, o crear otra llamada `Vercel Landing DS`.

### 2. Variables exactas en Vercel (Production)

Proyecto `ds-asociados-landing` · team `estudio-ds-y-asoc` → Settings → Environment Variables, o CLI:

```bash
cd web
vercel env add CONTACT_NOTIFY_EMAIL production --scope estudio-ds-y-asoc
# valor: daniel@estudiodsyasoc.com.ar

vercel env add SMTP_HOST production --scope estudio-ds-y-asoc
# valor: smtp.gmail.com

vercel env add SMTP_PORT production --scope estudio-ds-y-asoc
# valor: 587

vercel env add SMTP_USER production --scope estudio-ds-y-asoc
# valor: daniel@estudiodsyasoc.com.ar

vercel env add SMTP_PASS production --scope estudio-ds-y-asoc
# valor: xxxx xxxx xxxx xxxx   (App Password)

vercel env add SMTP_FROM production --scope estudio-ds-y-asoc
# valor: DS & Asociados <daniel@estudiodsyasoc.com.ar>
```

Resumen de nombres (tienen que coincidir exactamente):

| Env var | Ejemplo |
|---------|---------|
| `CONTACT_NOTIFY_EMAIL` | `daniel@estudiodsyasoc.com.ar` |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | `daniel@estudiodsyasoc.com.ar` |
| `SMTP_PASS` | App Password 16 chars |
| `SMTP_FROM` | `DS & Asociados <daniel@estudiodsyasoc.com.ar>` |

### 3. Redeploy

Después de agregar/cambiar env vars:

```bash
cd web && vercel deploy --prod --yes --scope estudio-ds-y-asoc
```

Sin redeploy, Production sigue con el env viejo.

### Opción Resend (si no usan SMTP_*)

```bash
RESEND_API_KEY=re_xxxxxxxx
RESEND_FROM_EMAIL=DS & Asociados <onboarding@resend.dev>
```

---

## C. Variables Supabase de la app (no SMTP)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xqacwzdfihycqzcmuejs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_URL=https://xqacwzdfihycqzcmuejs.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # server-only; obligatorio en Production
```

El **service_role** es server-only. Nunca al browser. Sin esta key, el admin/API que usa el cliente admin falla.

---

## D. Usuarios admin

| Persona | Email | slug | Login preferido |
|---------|-------|------|-----------------|
| Gabriel Marín | `marin.gabriel@gmail.com` | `gabriel` | Magic link en `/admin/login` |
| Daniel Schurmann | `daniel@estudiodsyasoc.com.ar` | `daniel` | Magic link |
| Alejandra Fernández | `alejandra@estudiodsyasoc.com.ar` | `alejandra` | Magic link |

La contraseña temporal es **secundaria**. Preferí siempre el link por email.

---

## E. Checklist de prueba

1. **Auth:** `/admin/login` → magic link → llega el mail → entrás al backoffice.
2. **Landing:** enviar el formulario de contacto → mail a `CONTACT_NOTIFY_EMAIL`.
3. Si falla Auth: spam, App Password, SMTP en Supabase, logs Auth.
4. Si falla landing: Function logs en Vercel; verificar `SMTP_*` o `RESEND_API_KEY` + redeploy.

---

## Alternativa a mediano plazo

Migrar ambos canales a **Resend** (SMTP en Supabase: `smtp.resend.com` + `RESEND_API_KEY` en Vercel) cuando el volumen crezca.
