import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * Vite config for apps/webview — the React webview UI bundle.
 *
 * Type-checking is owned by `tsc -b` (see tsconfig.json / Phase 04); Vite's
 * underlying esbuild transform strips types without checking them, the same
 * division of responsibility used by the webpack config in apps/extension.
 * Workspace packages (`@algolens/*`) are resolved the standard way, through
 * `node_modules` (npm workspace symlinks) to their already-built `dist/*.js`
 * output — which is why packages must build before apps in the root
 * `workspaces` array order (see package.json).
 */
export default defineConfig(({ mode }) => ({
  root: fileURLToPath(new URL(".", import.meta.url)),
  base: "./",
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: mode !== "production",
  },
  server: {
    port: 5173,
    strictPort: true,
  },
}));
