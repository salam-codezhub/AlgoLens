# apps/webview — React Webview UI

The React application rendered inside the VS Code webview panel: dashboard, editor overlays, chat UI, visualizations, and settings screens. Pure presentation — talks to the extension host via message passing, never directly to the filesystem, AI providers, or the database.

**Depends on:** `packages/ui`, `packages/shared`.
**Must not:** import Node.js-only APIs or talk to `packages/storage` / `packages/ai` directly.
