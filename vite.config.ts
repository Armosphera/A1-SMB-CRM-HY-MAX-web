import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

// TanStack Start 1.168 + React 19 + Tailwind v4.
//
// API proxy strategy:
//   DEV   : Vite's built-in `server.proxy` (this file). It forwards
//           any request whose path starts with /v1/ to the Fastify
//           backend on the URL in `VITE_API_TARGET` (default
//           http://localhost:4100). The browser sees one origin, so
//           the auth Bearer token doesn't trip CORS.
//   PROD  : A TanStack Start server route at `src/routes/v1/$.tsx`
//           with `server.handlers.ANY` forwards the same paths to
//           `BACKEND_URL` (set in the deploy env). Identical
//           request/response shape to dev.
//
// The backend's `_admin-bootstrap` endpoint is at
// /v1/integrations/_admin-bootstrap and is called by the
// Integrations settings page.

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
