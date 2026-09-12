import { createMemoryRouter, type RouteObject } from "react-router";
import { PagePlaceholder } from "@algolens/ui";
import { AppShell } from "../layout/app-shell.js";
import { Dashboard } from "../pages/dashboard/dashboard.js";
import { Settings } from "../pages/settings.js";
import { ACTIVITY_BAR_SECTIONS } from "./sections.js";

const REAL_PAGES: Partial<Record<string, () => RouteObject["element"]>> = {
  "/": () => <Dashboard />,
  "/settings": () => <Settings />,
};

/**
 * Dashboard ("/", Phase 14) and Settings ("/settings", Phase 11's
 * ThemeSwitcher) render their real pages. The remaining nine sections
 * still render the shared {@link PagePlaceholder} until their
 * corresponding feature phase lands (Analyzer in Phase 21, and so on).
 */
const children: RouteObject[] = ACTIVITY_BAR_SECTIONS.map((section): RouteObject => {
  const realPage = REAL_PAGES[section.path];
  const element = realPage ? (
    realPage()
  ) : (
    <PagePlaceholder title={section.title} description={section.description} />
  );
  return section.path === "/" ? { index: true, element } : { path: section.path, element };
});

const routes: RouteObject[] = [
  {
    path: "/",
    element: <AppShell />,
    children,
  },
];

/**
 * A `MemoryRouter`-backed router — not `BrowserRouter` — because this app
 * runs inside a VS Code webview host with no real navigable browser URL bar
 * or server to handle deep links.
 */
export const router = createMemoryRouter(routes, { initialEntries: ["/"] });
