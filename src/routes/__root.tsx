/**
 * Root route — wraps every page with the QueryClient, Toaster, and
 * the global stylesheet.
 *
 * The QueryClient IS a real provider — every page that uses useQuery
 * needs it above in the tree. See lib/api/queryClient.ts for the
 * defaults (no refetch on focus, 5s stale time, 1 retry).
 */
import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "~/components/feedback/Toaster";
import { queryClient } from "~/lib/api/queryClient";
import "~/styles/globals.css";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Armosphera One — Integrations" },
      { name: "description", content: "Integrations settings for the A1 SMB CRM MAX" },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en" data-theme="light">
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <Outlet />
          <Toaster />
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  );
}
