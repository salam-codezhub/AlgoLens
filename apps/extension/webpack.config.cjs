//@ts-check

"use strict";

const path = require("path");

/**
 * Webpack config for apps/extension — the VS Code extension host bundle.
 *
 * Follows the standard shape from VS Code's own extension bundling guide:
 *   - target: "node"            (runs inside the extension host, not a browser)
 *   - output.libraryTarget: "commonjs2" (VS Code loads extensions as CJS)
 *   - externals.vscode          (the `vscode` module is injected by the host
 *                                 at runtime and must never be bundled)
 *
 * Type-checking is owned by `tsc -b` (see tsconfig.json / Phase 04); ts-loader
 * runs here in transpile-only mode purely to emit JS quickly for this app's
 * own `src/`. Workspace packages (`@algolens/*`) are resolved the standard
 * way, through `node_modules` (npm workspace symlinks) to their already-built
 * `dist/*.js` output — which is why packages must build before apps in the
 * root `workspaces` array order (see package.json).
 *
 * @param {Record<string, string> | undefined} _env
 * @param {{ mode?: string }} argv
 * @returns {import("webpack").Configuration}
 */
module.exports = (_env, argv) => {
  const isProduction = argv.mode === "production";

  return {
    target: "node",
    mode: isProduction ? "production" : "development",
    entry: "./src/extension.ts",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "extension.js",
      library: {
        type: "commonjs2",
      },
      devtoolModuleFilenameTemplate: "../[resource-path]",
    },
    devtool: isProduction ? "source-map" : "eval-source-map",
    externals: {
      // Provided by the VS Code extension host at runtime — never bundle it.
      vscode: "commonjs vscode",
    },
    resolve: {
      extensions: [".ts", ".js"],
      extensionAlias: {
        // Local relative imports use the TypeScript NodeNext convention
        // (e.g. `import ... from "./workspace-context-service.js"` pointing
        // at a sibling `.ts` file) — tsc/ts-loader understand this natively,
        // but webpack's own resolver doesn't unless told to.
        ".js": [".ts", ".js"],
      },
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "ts-loader",
              options: {
                transpileOnly: true,
                configFile: path.resolve(__dirname, "tsconfig.json"),
              },
            },
          ],
        },
      ],
    },
    watchOptions: {
      ignored: /node_modules/,
    },
    infrastructureLogging: {
      level: "log",
    },
  };
};
