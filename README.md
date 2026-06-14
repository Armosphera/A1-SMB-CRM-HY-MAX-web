# A1-SMB-CRM-HY-MAX-web

Integrations settings UI for the A1 SMB CRM MAX backend. The backend exposes a single endpoint that hydrates the entire settings page (`GET /v1/integrations/_admin-bootstrap`) — this app is its frontend.

## Stack

TanStack Start (React 19) + Tailwind CSS v4 + TanStack Query. i18n via paraglide-js. Toast via sonner. Icons via lucide-react. UI primitives styled after kibo-ui (same as the ANT `web-modern/`).

Mirrors the ANT stack so the same components and patterns work in both apps.

## Status

First cut. The headline deliverable is **the Integrations settings page** that calls `_admin-bootstrap` and renders the result. Mutations (create, update, delete, set-outbound, refresh-now, re-vault) are separate routes that will be added incrementally per the backend's `docs/integrations-admin-ui.md` build spec.

## Local dev

```sh
npm install
# Set VITE_API_TARGET to your local Fastify dev server.
# Default: http://localhost:4100
VITE_API_TARGET=http://localhost:4100 npm run dev
# App at http://localhost:4173
```

The Vite dev server proxies `/v1/*` to the backend so the browser sees one origin and the auth Bearer token doesn't trip CORS.

## Build

```sh
npm run build
# Produces .output/server/index.mjs
npm start
# Listens on PORT (default 4173)
```

## Docker

```sh
docker build -t a1-smb-crm-hy-max-web:latest .
docker compose up -d
# App at http://localhost:4173
```

The compose file in this repo expects a backend service named `backend` on the same `a1-net` network. Override `BACKEND_URL` in the deploy environment.

### Production API proxy

In **dev**, the Vite dev server (`vite.config.ts`) proxies `/v1/*` to `VITE_API_TARGET` (default `http://localhost:4100`).

In **prod**, the TanStack Start runtime does NOT have the Vite proxy. Two options:

1. **Reverse proxy in front** (recommended): nginx or caddy terminates TLS and forwards `/v1/*` to the backend service, `/` to the web container. The `docker-compose.yml` in this repo is set up for this case.
2. **TanStack Start server route** at `src/routes/api/$.ts` is a follow-up. The current implementation is intentionally dev-only because the catch-all TanStack Start server API in 1.168.x is not yet stable enough for a clean implementation.

## Structure

```
src/
├── components/
│   ├── feedback/
│   │   └── Toaster.tsx            # sonner wrapper
│   ├── integrations/
│   │   ├── IntegrationsHeader.tsx  # title + status + last-fetched
│   │   ├── IntegrationsTable.tsx   # one row per IntegrationDTO
│   │   ├── IntegrationsEmpty.tsx   # zero-state
│   │   └── StatusPill.tsx          # status badge
│   └── ui/
│       └── Button.tsx              # kibo-ui-style primitive
├── lib/
│   ├── api/
│   │   ├── integrations.ts         # Zod schemas + fetch client
│   │   └── queryClient.ts          # TanStack Query singleton
│   └── cn.ts                       # twMerge + clsx
├── routes/
│   ├── __root.tsx                  # wraps every page
│   ├── index.tsx                   # redirects to /integrations
│   └── integrations.tsx            # the headline page
└── styles/
    └── globals.css                 # Tailwind v4 entry
```

## Sync with backend

The frontend's `src/lib/api/integrations.ts` Zod schemas mirror the backend's `docs/api-contracts.md` and the admin-bootstrap envelope documented in `docs/integrations-admin-ui.md`. If the backend adds a new field to the envelope, the frontend's Zod parse will fail with `SCHEMA_DRIFT` on the next call — that's the canary.

The drift guard is the design: rather than silently rendering with missing data, the UI loudly refuses to render and asks the operator to update the schema.
