/**
 * StatusPill — small badge rendering the integration status.
 * Maps directly to the backend's row.status enum.
 */
import { CircleCheck, CircleX, CircleDashed, Loader2 } from "lucide-react";

type Status = "disconnected" | "connecting" | "connected" | "error";

interface Props {
  status: Status;
}

const META: Record<
  Status,
  { label: string; icon: typeof CircleCheck; classes: string }
> = {
  connected: {
    label: "Connected",
    icon: CircleCheck,
    classes: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:ring-emerald-900/50",
  },
  connecting: {
    label: "Connecting",
    icon: Loader2,
    classes: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:ring-amber-900/50",
  },
  disconnected: {
    label: "Disconnected",
    icon: CircleDashed,
    classes: "bg-neutral-100 text-neutral-700 ring-neutral-200 dark:bg-neutral-900 dark:text-neutral-300 dark:ring-neutral-800",
  },
  error: {
    label: "Error",
    icon: CircleX,
    classes: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-900/20 dark:text-red-300 dark:ring-red-900/50",
  },
};

export function StatusPill({ status }: Props) {
  const m = META[status];
  const Icon = m.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${m.classes}`}
    >
      <Icon className={`h-3 w-3 ${status === "connecting" ? "animate-spin" : ""}`} />
      {m.label}
    </span>
  );
}
