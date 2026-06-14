/**
 * IntegrationsHeader — page title + status pill + last-fetched time.
 *
 * Status states:
 *   - "loading" : initial fetch in flight. Renders a skeleton pill.
 *   - "ready"   : envelope loaded. Shows the totalIntegration count
 *                 and a "Refresh" button.
 *   - "error"   : fetch failed. Shows the error message + a retry
 *                 button. The page above still renders (we don't
 *                 unmount on error) so the user can read the error.
 */
import { RefreshCcw, ShieldAlert, CircleCheck, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/Button";

type Status = "loading" | "ready" | "error";

interface Props {
  status: Status;
  generatedAt?: string;
  totalIntegrations?: number;
  errorMessage?: string;
  onRetry?: () => void;
  lastFetchedAt?: number;
}

export function IntegrationsHeader({
  status,
  generatedAt,
  totalIntegrations,
  errorMessage,
  onRetry,
  lastFetchedAt,
}: Props) {
  return (
    <header className="flex items-start justify-between gap-4 border-b border-neutral-200 pb-6 dark:border-neutral-800">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
          Integrations
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Connect external tools and configure outbound policies.
        </p>
        {status === "ready" && totalIntegrations !== undefined && (
          <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-500">
            {totalIntegrations} integration{totalIntegrations === 1 ? "" : "s"} configured
            {generatedAt && ` · envelope generated ${formatRelative(generatedAt)}`}
            {lastFetchedAt !== undefined && ` · last fetched ${formatRelative(new Date(lastFetchedAt).toISOString())}`}
          </p>
        )}
        {status === "error" && errorMessage && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-red-700 dark:text-red-400">
            <ShieldAlert className="h-4 w-4" />
            {errorMessage}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {status === "loading" && (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </span>
        )}
        {status === "ready" && (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-300">
            <CircleCheck className="h-4 w-4" />
            Ready
          </span>
        )}
        {onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            <RefreshCcw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        )}
      </div>
    </header>
  );
}

function formatRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 5_000) return "just now";
  if (ms < 60_000) return `${Math.round(ms / 1_000)}s ago`;
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)}m ago`;
  if (ms < 86_400_000) return `${Math.round(ms / 3_600_000)}h ago`;
  return new Date(iso).toLocaleString();
}
