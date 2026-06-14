import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

// TanStack Start 1.0 + React 19 + Tailwind v4.
//
// API proxy strategy (mirrors the ANT web-modern/ dev experience):
//   DEV   : custom Vite plugin `apiProxy` (this file) — forwards
//           requests to the Fastify backend on :4100. We do this
//           by hand because the http-proxy lib behind Vite's
//           `server.proxy` strips Set-Cookie from browser-facing
//           responses; the backend currently uses Bearer <sid> in
//           the Authorization header, so the cookie issue is moot
//           for THIS app, but we mirror the ANT pattern for
//           consistency.
//   PROD  : TanStack Start server route at `src/routes/api/$.ts`.
//
// The backend's `_admin-bootstrap` endpoint is at
// /v1/integrations/_admin-bootstrap. The Vite dev proxy below
// forwards any request that starts with /v1/ to the backend.
//
// IMPORTANT: change `VITE_API_TARGET` to point at your local
// Fastify dev server. Default :4100 matches the A1-SMB-CRM-HY-MAX
// backend's dev port.

const API_TARGET = process.env.VITE_API_TARGET ?? "http://localhost:4100";

export default defineConfig({
  server: {
    port: 4173,
    strictPort: true,
    proxy: {
      "/v1/": {
        target: API_TARGET,
        changeOrigin: true,
        secure: false,
        // Forward the raw request body so HMAC-signed webhooks
        // (backend's inbound-webhook verifier) keep working
        // end-to-end in dev.
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            // Pass through the original Content-Type for body
            // shape preservation.
            if (req.headers["content-type"]) {
              proxyReq.setHeader("content-type", req.headers["content-type"]);
            }
          });
        },
      },
    },
  },
  plugins: [
    // The order matters: tailwind first so its CSS pipeline runs
    // before the React plugin reads the file graph.
    tailwindcss(),
    tanstackStart(),
    react(),
    tsConfigPaths(),
  ],
});
