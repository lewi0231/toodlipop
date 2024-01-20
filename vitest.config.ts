/// <reference types="vitest" />
/// <reference types="vite/client" />

import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    // environment: "vprisma",
    environment: "happy-dom",
    setupFiles: ["./test/setup-test-env.ts"],
    // setupFiles: ["vitest-environment-vprisma/setup", "vitest.setup.ts"]
      
  },
});
