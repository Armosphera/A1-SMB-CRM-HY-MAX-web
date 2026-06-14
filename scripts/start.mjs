/**
 * Node prod server entry for the Integrations settings UI.
 *
 * In dev, the Vite dev server (vite.config.ts) serves the app and
 * proxies /v1/* to the Fastify backend.
 *
 * In prod, `vite build` produces:
 *   - dist/client (static)
 *   - dist/server/server.js — default export is a Web Fetch handler
 *     that runs the TanStack Start framework.
 *
 * This file:
 *   1. Wraps the Web Fetch handler in a Node http listener via
 *      `srvx` (already a transitive dep of TanStack Start).
 *   2. Intercepts /v1/* requests BEFORE TanStack Start, and
 *      forwards them to `BACKEND_URL` using Node 22's built-in
 *      `fetch`. This is the prod analog of the Vite dev proxy.
 *   3. Falls through to the framework for everything else.
 *
 * Why a Node-level proxy and not a TanStack Start server route?
 * The defaultStreamHandler renders React for non-handler paths;
 * installing a server route that matches /v1/$ works, but the
 * round-trip through React Router's matcher adds latency for a
 * request that is a pure pass-through. A Node-level middleware is
 * the cleaner fit.
 */
import { serve } from "srvx/node";
import serverEntry from "../dist/server/server.js";

// `import serverEntry from "..."` already unwraps the default
// export, so serverEntry is the `{ fetch }` object directly. Do
// NOT do `serverEntry.default.fetch` — that double-unwraps and
// blows up.
const innerFetch = serverEntry.fetch;

const PORT = Number(process.env.PORT ?? 4173);
const HOST = process.env.HOST ?? "0.0.0.0";
const BACKEND_URL = process.env.BACKEND_URL ?? "";

async function proxyToBackend(request) {
  if (!BACKEND_URL) {
    return new Response(
      JSON.stringify({
        error: {
          code: "BACKEND_URL_UNSET",
          message: "BACKEND_URL is not configured. Set it in the deploy env.",
          requestId: "no-request",
        },
      }),
      { status: 502, headers: { "content-type": "application/json" } },
    );
  }
  const inUrl = new URL(request.url);
  const target = new URL(inUrl.pathname + inUrl.search, BACKEND_URL);
  const headers = new Headers(request.headers);
  headers.delete("host");
  // forward Authorization and any other custom headers — the
  // backend's auth middleware reads Bearer <sid> and the request
  // flows through unchanged.
  const init = { method: request.method, headers };
  if (request.method && !["GET", "HEAD"].includes(request.method)) {
    init.duplex = "half";
    init.body = request.body;
  }
  let upstream;
  try {
    upstream = await fetch(target, init);
  } catch (e) {
    return new Response(
      JSON.stringify({
        error: {
          code: "BACKEND_UNREACHABLE",
          message: `Backend at ${BACKEND_URL} is unreachable: ${e?.message ?? e}`,
          requestId: "no-request",
        },
      }),
      { status: 502, headers: { "content-type": "application/json" } },
    );
  }
  const resHeaders = new Headers();
  upstream.headers.forEach((v, k) => resHeaders.set(k, v));
  return new Response(upstream.body, { status: upstream.status, headers: resHeaders });
}

async function wrappedFetch(request) {
  const url = new URL(request.url);
  if (url.pathname.startsWith("/v1/")) {
    return proxyToBackend(request);
  }
  return innerFetch(request);
}

serve({
  fetch: wrappedFetch,
  port: PORT,
  hostname: HOST,
});
