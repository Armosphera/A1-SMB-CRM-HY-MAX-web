# Multi-stage build for the Integrations settings UI.
#
# Stage 1: install + build the TanStack Start bundle.
# Stage 2: minimal runtime with the built artifact + node serve.

FROM node:22-alpine AS builder
WORKDIR /app

# Install deps first (cache layer) — separate copy so source changes
# don't bust the install layer.
COPY package.json package-lock.json* ./
RUN npm ci

# Now the source.
COPY . .

# Build the .output/server/index.mjs bundle. The dev server (vite dev)
# is NOT used in production — TanStack Start compiles to a single
# Node server.
RUN npm run build

# ---

FROM node:22-alpine AS runtime
WORKDIR /app

# Production-only deps — no devDependencies, no Vite, no TypeScript.
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy the build artifact.
COPY --from=builder /app/.output ./.output

# Bind to 4173 to match the dev port (the user expects 4173 from
# the ANT web-modern/ convention). Change via PORT env if you need
# to compose behind a reverse proxy.
ENV PORT=4173
EXPOSE 4173

# Health check — TanStack Start's server returns 200 on /. The
# healthcheck verifies both the server is up AND the Vite build
# landed (a broken build would serve an error page here, not 200).
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:4173/ >/dev/null 2>&1 || exit 1

CMD ["node", ".output/server/index.mjs"]
