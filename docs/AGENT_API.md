# AGENT_API.md — Manual para agentes (Claude / GPT)

> **Mantenimiento:** actualizar este archivo en el mismo PR/cambio cada vez que se modifique la API, auth, scopes o flujos de notas. Es la fuente de verdad para agentes.

**Base URL (producción):** `https://estudiodsyasoc.com.ar`  
**Base URL (alias Vercel):** `https://ds-asociados-landing.vercel.app`  
**Versión API:** `v1`  
**Última actualización:** 2026-07-10

**URL pública de este manual:** `https://estudiodsyasoc.com.ar/docs/agent-api.md`  
**Archivo en el repo:** `web/docs/AGENT_API.md`

---

## Cómo usar con Claude

1. Entrá al backoffice: `https://estudiodsyasoc.com.ar/admin/login` (preferí **magic link**).
2. Andá a **API keys** → `/admin/keys` → creá una key con scopes `notes:read`, `notes:write` (y `notes:publish` solo si querés que el agente publique solo).
3. Copiá el token (`dsa_…`) **una sola vez** y guardalo en el Project de Claude (env / secrets), nunca en el chat público.
4. Pegá este archivo completo (o la URL `https://estudiodsyasoc.com.ar/docs/agent-api.md`) en **Project knowledge** de Claude.
5. Flujo operativo: el agente crea **borrador** → un humano revisa en `/admin/notes` → recién ahí se publica.

```bash
export BASE="https://estudiodsyasoc.com.ar"
export DSA_TOKEN="dsa_…"   # la key de /admin/keys
```

---

## Quién sos

Sos un agente del estudio contable **DS & Asociados**. Podés crear y actualizar **notas/novedades** para clientes (pymes) a partir de links de diarios o normativa. Preferí tono profesional, claro, en español rioplatense. Por defecto creá **borradores** (`status: "draft"`) para que Daniel o Alejandra revisen antes de publicar.

Autores disponibles (slug):

| slug | Persona |
|------|---------|
| `daniel` | Daniel Schurmann |
| `alejandra` | Alejandra Fernández |
| `gabriel` | Gabriel Marín |

---

## Autenticación

Todas las rutas `/api/v1/*` requieren:

```http
Authorization: Bearer dsa_...
```

- El token lo genera un admin en `/admin/keys`.
- Nunca lo imprimas en logs públicos ni lo pegues en el cuerpo de la nota.
- Si recibís `401` / `403`, pedí un token nuevo o scopes adicionales.

### Scopes

| Scope | Permite |
|-------|---------|
| `notes:read` | Listar / leer notas |
| `notes:write` | Crear / editar borradores |
| `notes:publish` | Publicar (`status: published`) |
| `leads:read` | Ver consultas del formulario |
| `keys:manage` | Crear/revocar API keys (backoffice) |

---

## Flujo recomendado (draft → revisión → publish)

1. Usuario te pasa un link del diario / normativa.
2. Llamás `POST /api/v1/notes/from-url` con `author` correcto y `status: "draft"`.
3. Devolvés el link `links.admin` para que Daniel/Alejandra revisen en el backoffice.
4. Solo publicás (`PATCH` con `status: "published"`) si te lo piden **explícitamente** y tu token tiene `notes:publish`.

```mermaid
flowchart LR
  Link[Link del diario] --> FromUrl[POST from-url draft]
  FromUrl --> Review[Humano revisa en /admin/notes]
  Review --> Publish[PATCH status published]
  Publish --> Public[/novedades/slug]
```

---

## Endpoints

### `POST /api/v1/notes/from-url`  ★ principal para agentes

Crea una nota a partir de un link (extrae título/texto y arma un borrador MD).

```bash
curl -X POST "$BASE/api/v1/notes/from-url" \
  -H "Authorization: Bearer $DSA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://ejemplo.com/noticia-monotributo",
    "author": "alejandra",
    "status": "draft",
    "tone": "profesional",
    "audience": "pymes",
    "tags": ["monotributo", "impuestos"]
  }'
```

**Body**

| Campo | Tipo | Default | Notas |
|-------|------|---------|-------|
| `url` | string URL | required | Fuente |
| `author` | `daniel` \| `alejandra` \| `gabriel` | `alejandra` | Firma de la nota |
| `status` | `draft` \| `published` | `draft` | Preferí draft |
| `tone` | string | opcional | |
| `audience` | string | opcional | |
| `title` | string | opcional | Override del título generado |
| `body_md` | string | opcional | Override del cuerpo |
| `excerpt` | string | opcional | |
| `tags` | string[] | opcional | |

**Respuesta 201:** `{ data, links: { admin, public, markdown }, tip }`

---

### `POST /api/v1/notes` — crear con contenido armado

```bash
curl -X POST "$BASE/api/v1/notes" \
  -H "Authorization: Bearer $DSA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Cambios en monotributo 2026",
    "body_md": "## Qué cambia\n\n…\n\n## Qué hacer\n\n…",
    "excerpt": "Resumen corto para el listado.",
    "status": "draft",
    "author_slug": "daniel",
    "source_url": "https://ejemplo.com/fuente",
    "tags": ["monotributo", "impuestos"]
  }'
```

---

### `GET /api/v1/notes` — listar

```bash
curl "$BASE/api/v1/notes?status=draft" \
  -H "Authorization: Bearer $DSA_TOKEN"
```

Query: `status=draft|published` (opcional). Máx. 50.

---

### `GET /api/v1/notes/:id` — detalle

```bash
curl "$BASE/api/v1/notes/UUID" \
  -H "Authorization: Bearer $DSA_TOKEN"
```

---

### `PATCH /api/v1/notes/:id` — editar / publicar

```bash
# Editar borrador
curl -X PATCH "$BASE/api/v1/notes/UUID" \
  -H "Authorization: Bearer $DSA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Título revisado",
    "body_md": "## Cuerpo actualizado\n\n…",
    "excerpt": "Nuevo excerpt"
  }'

# Publicar (requiere scope notes:publish)
curl -X PATCH "$BASE/api/v1/notes/UUID" \
  -H "Authorization: Bearer $DSA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "status": "published" }'
```

Campos permitidos: `title`, `body_md`, `excerpt`, `status`, `tags`, `seo_title`, `seo_description`.

---

### `DELETE /api/v1/notes/:id`

Solo admin (sesión o scope adecuado).

```bash
curl -X DELETE "$BASE/api/v1/notes/UUID" \
  -H "Authorization: Bearer $DSA_TOKEN"
```

---

### `GET /api/v1/leads`

Consultas del formulario de contacto.

```bash
curl "$BASE/api/v1/leads" \
  -H "Authorization: Bearer $DSA_TOKEN"
```

---

### API keys (backoffice)

`POST /api/v1/api-keys` / `DELETE /api/v1/api-keys/:id` — gestión de keys (sesión admin o scope `keys:manage`). Preferí crearlas desde la UI `/admin/keys`.

---

## Errores comunes

| Código | Causa |
|--------|-------|
| 401 | Token ausente/inválido/revocado |
| 403 | Falta scope (ej. publicar sin `notes:publish`) |
| 400 | Body inválido o `author` slug inexistente |
| 500 | Error de servidor / DB |

Si `author` no existe: el perfil aún no fue creado en Supabase. Pedí a un humano que invite al usuario admin.

---

## Rutas públicas (sin API key)

| URL | Descripción |
|-----|-------------|
| `/novedades` | Listado de posts `published` |
| `/novedades/:slug` | Detalle HTML |
| `/novedades/:slug.md` | Export Markdown (frontmatter + body) para agentes |
| `/docs/agent-api.md` | Este manual (texto plano) |

---

## Changelog

| Fecha | Cambio |
|-------|--------|
| 2026-07-10 | Base URL `estudiodsyasoc.com.ar`, sección Claude, curls create/edit/publish, ruta pública del manual |
| 2026-07-10 | Rutas públicas: `/novedades`, `/novedades/:slug`, export MD `/novedades/:slug.md` |
| 2026-07-10 | v1 inicial: notes, from-url, leads, api-keys, auth Bearer `dsa_` |
