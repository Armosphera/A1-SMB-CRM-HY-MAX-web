/**
 * Empty state — shown when the admin-bootstrap envelope returns
 * an empty integrations.items list. Explains what the page is
 * for and what the operator should do next.
 */
import { Plug2 } from "lucide-react";

export function IntegrationsEmpty() {
  return (
    <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-6 py-16 text-center dark:border-neutral-700 dark:bg-neutral-900/50">
      <Plug2 className="h-10 w-10 text-neutral-400" />
      <h2 className="mt-3 text-base font-semibold text-neutral-900 dark:text-neutral-100">
        No integrations yet
      </h2>
      <p className="mt-1 max-w-md text-sm text-neutral-600 dark:text-neutral-400">
        Integrations connect the CRM to your external tools — email, voice, sequences, lead
        sources. Add your first one to get started.
      </p>
    </div>
  );
}
