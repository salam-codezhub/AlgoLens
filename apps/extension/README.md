# apps/extension — VS Code Extension Host

Presentation-layer glue code that runs inside VS Code: activation, commands, menus, tree views, status bar, and wiring the extension host to the webview and to `packages/*`. Contains no business logic — orchestration only.

**Depends on:** `packages/core`, `packages/shared`, and other `packages/*` as needed.
**Must not:** contain analysis, AI, or optimization logic directly.
