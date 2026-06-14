# Multi-stage build for the Integrations settings UI.
#
# Stage 1: install + build the TanStack Start bundle.
# Stage 2: minimal runtime with the built artifact + the Node
#          entrypoint that wraps the Web Fetch handler in a
#          Node http listener.
#
# Build artifact: dist/client (static) + dist/server/server.js
# (Web Fetch handler, default export). The Node entry at
# scripts/start.mjs imports that handler and binds it to PORT
# via srvx.

FROM node:22-alpine AS builder
WORKDIR /app

# Install deps first (cache layer) — separate copy so source changes
# don't bust the install layer.
COPY package.json package-lock.json* ./
RUN npm ci

# Now the source.
COPY . .

# Build the dist/client + dist/server/server.js bundle. The dev
# server (vite dev) is NOT used in production — TanStack Start
# compiles to a Web Fetch handler that the Node entry wraps.
RUN npm run build

# ---

FROM node:22-alpine AS runtime
WORKDIR /app

# Production-only deps — no devDependencies, no Vite, no TypeScript.
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy the build artifact AND the Node entry script.
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/scripts ./scripts

# Bind to 4173 to match the dev port (the user expects 4173 from
# the ANT web-modern/ convention). Change via PORT env if you need
# to compose behind a reverse proxy.
ENV PORT=4173
EXPOSE 4173

# Health check — TanStack Start's server returns 200 on /. The
# healthcheck verifies the runtime is up. A broken build would
# fail to start (the start.mjs would throw on the dynamic import
# of dist/server/server.js), so a 200 on / is a strong signal.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:4173/ >/dev/null 2>&1 || exit 1

CMD ["node", "scripts/start.mjs"]
