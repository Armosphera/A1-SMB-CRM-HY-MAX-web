/**
 * Index route — redirects to the Integrations settings page.
 *
 * The app's purpose is the Integrations admin UI. Anything else is
 * out of scope for the first cut.
 */
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/integrations" });
  },
});
