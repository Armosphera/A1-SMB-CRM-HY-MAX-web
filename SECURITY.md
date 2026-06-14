# Security

This document tracks known security findings, the mitigation status, and
the responsible disclosure process for the A1-SMB-CRM-HY-MAX-web
frontend.

## Reporting a vulnerability

Please email security@armosphera.com with a description of the
vulnerability, the affected endpoint, and a reproducible proof of
concept. We will respond within two business days.

## Known findings

### F-1 — esbuild / vite 6 advisory GHSA-gv7w-rqhr (dev-only)

**Status:** Accepted risk. Fix is gated on upstream Vite 8 support.

`npm audit` reports 4 high-severity vulnerabilities in `esbuild`
(≤ 0.28.0) reached via the `vite@6` dev-only chain. The advisory
describes a binary-injection attack via the NPM registry. The risk
is real for machines that install from a hostile registry but is
not relevant for the production artifact, which does NOT bundle
Vite or esbuild.

Mitigations in place:

- Production `npm ci --omit=dev` excludes devDependencies, so the
  runtime image does not contain `esbuild`.
- The Dockerfile is multi-stage; only the final `runtime` stage
  ships to the deploy target.
- A future major bump to Vite 8 (which TanStack Start 1.168 does
  not yet peer-support) will close this finding without runtime
  changes.

## Data sovereignty

The frontend is a single-page application that calls the backend
over Bearer-token HTTP. The session id is stored in
`window.localStorage` (key `a1sid`); the Bearer header carries it
on every request. The frontend does not call any third-party
endpoints directly.

## Secrets

The frontend embeds no secrets. Provider API keys are vault-encrypted
in the backend (see the backend's `docs/integrations-admin-ui.md`).
The admin-bootstrap envelope's `vaultAudit` section surfaces any
plaintext-backed secrets so the operator can re-save them.

## CSP

The app sets no inline scripts in production. TanStack Start's
`Scripts` component emits the necessary boot script with a
nonce-based CSP. A strict Content-Security-Policy header is
recommended at the deploy layer (nginx/caddy) — see the
backend's docs for the policy list.
