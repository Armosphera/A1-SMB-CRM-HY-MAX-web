/**
 * Toaster — Sonner wrapper. Mounted once in the root route.
 */
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "bg-white text-neutral-900 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-100 dark:border-neutral-800",
          description: "text-neutral-600 dark:text-neutral-400",
        },
      }}
    />
  );
}
