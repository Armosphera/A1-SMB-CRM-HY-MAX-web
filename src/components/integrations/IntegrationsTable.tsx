/**
 * IntegrationsTable — renders one row per integration row from the
 * admin-bootstrap envelope.
 *
 * Per-row columns: type, status pill, last sync, outbound policy,
 * trigger count, "Connect" button (or "Configure" when connected).
 *
 * Empty rows for a provider that's not in oauthConnectActions
 * (e.g. an apiKey-only provider) get a "Configure" button that
 * navigates to the per-resource editor (not yet built).
 */
import { ExternalLink, Settings2, Link2 } from "lucide-react";
import { Button } from "~/components/ui/Button";
import type { IntegrationDTO, AdminBootstrap } from "~/lib/api/integrations";
import { StatusPill } from "~/components/integrations/StatusPill";

interface Props {
  rows: IntegrationDTO[];
  outboundStatuses: AdminBootstrap["outboundStatuses"];
  triggerConfigs: AdminBootstrap["triggerConfigs"];
  oauthConnectActions: AdminBootstrap["oauthConnectActions"];
  vaultAudit: AdminBootstrap["vaultAudit"];
}

export function IntegrationsTable({
  rows,
  outboundStatuses,
  triggerConfigs,
  oauthConnectActions,
  vaultAudit,
}: Props) {
  const rowsWithPlaintext = new Set(
    vaultAudit.findings
      .filter((f) => (f.configFields?.length ?? 0) + (f.oauthFields?.length ?? 0) > 0)
      .map((f) => f.integrationId),
  );

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <table className="min-w-full divide-y divide-neutral-200 text-sm dark:divide-neutral-800">
        <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
          <tr>
            <th className="px-4 py-3 font-medium">Provider</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Last sync</th>
            <th className="px-4 py-3 font-medium">Outbound</th>
            <th className="px-4 py-3 font-medium">Triggers</th>
            <th className="px-4 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
          {rows.map((row) => {
            const outbound = outboundStatuses[row.id] as { enabled?: boolean } | undefined;
            const triggers = triggerConfigs[row.id] ?? [];
            const connectAction = oauthConnectActions[row.type];
            return (
              <tr key={row.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                <td className="px-4 py-3">
                  <div className="font-medium text-neutral-900 dark:text-neutral-100">
                    {row.type}
                  </div>
                  {rowsWithPlaintext.has(row.id) && (
                    <div className="mt-0.5 text-xs text-amber-600 dark:text-amber-400">
                      Has unencrypted fields — re-save to vault.
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusPill status={row.status} />
                  {row.lastError && (
                    <div className="mt-0.5 text-xs text-red-600 dark:text-red-400" title={row.lastError}>
                      {row.lastError.slice(0, 60)}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                  {row.lastSyncAt ? new Date(row.lastSyncAt).toLocaleString() : "—"}
                </td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                  {outbound?.enabled ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                      <Link2 className="h-3.5 w-3.5" />
                      enabled
                    </span>
                  ) : (
                    <span className="text-neutral-500">disabled</span>
                  )}
                </td>
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                  {triggers.length > 0 ? (
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      {triggers.length} configured
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {connectAction?.startUrl ? (
                    <a
                      href={connectAction.startUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex"
                    >
                      <Button variant="primary" size="sm">
                        <ExternalLink className="h-3.5 w-3.5" />
                        {row.status === "connected" ? "Reconnect" : "Connect"}
                      </Button>
                    </a>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        // TODO: navigate to per-resource editor when
                        // /integrations/$id route is added. For the
                        // v1 cut, an apiKey-style provider can't
                        // "Connect" — operator opens the route
                        // and the row's config editor comes next.
                        void row.id;
                      }}
                    >
                      <Settings2 className="h-3.5 w-3.5" />
                      Configure
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
