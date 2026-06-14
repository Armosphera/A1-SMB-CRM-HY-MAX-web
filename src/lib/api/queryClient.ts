/**
 * TanStack Query client — singleton, no refetch on focus by default.
 * Stale time 5s because the admin-bootstrap envelope is a "what's
 * the current state" call, not a high-frequency thing.
 *
 * For pages that need fresh-on-focus (none yet in this app), the
 * page-level useQuery opts in with `refetchOnWindowFocus: true`.
 */
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
