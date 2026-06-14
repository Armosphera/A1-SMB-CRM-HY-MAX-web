// Vitest config for the web-modern/ test harness.
//
// Tests that use react-testing-library need the jsdom env. Tests
// that touch crypto / node APIs (e.g. token signing helpers)
// need node. We default to jsdom; individual test files can
// opt in to node with `// @vitest-environment node` at the top.

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsConfigPaths()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
  },
});
