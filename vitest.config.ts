import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "code-explainer-test-module": process.cwd() + "/apps/extension/src/code-explainer.ts",
    },
  },

  test: {
    environment: "node",
    include: ["packages/**/tests/**/*.test.ts", "apps/**/tests/**/*.test.ts"],
    coverage: {
      reporter: ["text", "html"],
    },
  },
});
