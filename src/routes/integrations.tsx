/**
 * Integrations settings page — the headline deliverable.
 *
 * Calls GET /v1/integrations/_admin-bootstrap (one call) and renders:
 *   - The header (tenant name, last-fetched timestamp)
 *   - The list of integrations (one row per rowToDTO from the
 *     backend) with status pill, type, last-sync
 *   - Per-row outbound policy (enabled/disabled + 24h block count)
 *   - Per-row trigger count
 *   - Per-row "Connect" button if oauthConnectActions[type].startUrl
 *     is non-null
 *
 * Error states: 401 (token expired), 5xx (backend down). The empty
 * state explains what this page is for.
 *
 * Per the backend's docs/integrations-admin-ui.md (which we follow
 * verbatim here), this is the "settings page hydrate" view. The
 * mutations (create, update, set outbound, refresh-now, etc.) are
 * separate routes that we add as needed.
 */

import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchAdminBootstrap, type AdminBootstrap } from "~/lib/api/integrations";
import { IntegrationsTable } from "~/components/integrations/IntegrationsTable";
import { IntegrationsHeader } from "~/components/integrations/IntegrationsHeader";
import { IntegrationsEmpty } from "~/components/integrations/IntegrationsEmpty";

export const Route = createFileRoute("/integrations")({
  component: IntegrationsPage,
});

function IntegrationsPage() {
  const { data, isLoading, error, refetch, dataUpdatedAt } = useQuery<AdminBootstrap>({
    queryKey: ["admin-bootstrap"],
    queryFn: fetchAdminBootstrap,
    staleTime: 5_000,
    refetchOnWindowFocus: true,
  });

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl p-8">
        <IntegrationsHeader status="loading" />
        <div className="mt-6 grid gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900"
            />
          ))}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-6xl p-8">
        <IntegrationsHeader
          status="error"
          errorMessage={(error as Error).message}
          onRetry={() => refetch()}
        />
      </main>
    );
  }

  if (!data || data.integrations.items.length === 0) {
    return (
      <main className="mx-auto max-w-6xl p-8">
        <IntegrationsHeader status="ready" generatedAt={data?.meta.generatedAt} />
        <IntegrationsEmpty />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-8">
      <IntegrationsHeader
        status="ready"
        generatedAt={data.meta.generatedAt}
        totalIntegrations={data.meta.totalIntegrations}
        onRetry={() => refetch()}
        lastFetchedAt={dataUpdatedAt}
      />
      <IntegrationsTable
        rows={data.integrations.items}
        outboundStatuses={data.outboundStatuses}
        triggerConfigs={data.triggerConfigs}
        oauthConnectActions={data.oauthConnectActions}
        vaultAudit={data.vaultAudit}
      />
    </main>
  );
}
