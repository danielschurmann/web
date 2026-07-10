# DS & Asociados — Landing

Next.js (App Router) + Tailwind + Supabase + Resend. Deploy en Vercel.

## Desarrollo local

```bash
cd web
cp .env.example .env.local
# completar variables
npm install
npm run dev
```

## Variables de entorno

Ver `.env.example`. Las claves de Supabase y Resend son **server-only** (sin `NEXT_PUBLIC_`).

## Migración Supabase

```bash
cd web
supabase login
supabase link --project-ref <PROJECT_REF>
supabase db push
```

O ejecutar el SQL de `supabase/migrations/20260710120000_leads.sql` en el SQL Editor del dashboard.

## Deploy Vercel (desde esta máquina, cuenta de Dani)

1. `vercel login` (o team invite de Dani)
2. `cd web && vercel link` → elegir team/proyecto de Dani
3. Cargar envs: `vercel env add` (Production / Preview / Development)
4. Preview: `vercel deploy`
5. Prod: `vercel --prod`

Root Directory del proyecto en Vercel: `web` (si se linkea desde el monorepo root, usar `vercel link --repo` y setear Root Directory).

## Documentación

- [docs/AGENT_API.md](docs/AGENT_API.md) — doc viva para agentes Claude/GPT
- [docs/GMAIL_SMTP.md](docs/GMAIL_SMTP.md) — magic link con Gmail SMTP
- [DEPLOY.md](DEPLOY.md) — checklist de deploy

## Backoffice

- `/admin/login` — magic link (principal) o email/password
- `/admin/notes` — notas
- `/admin/leads` — consultas del formulario
- `/admin/keys` — API keys para agentes
