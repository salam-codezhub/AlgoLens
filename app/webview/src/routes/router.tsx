import { createMemoryRouter, type RouteObject } from "react-router";
import { PagePlaceholder } from "@algolens/ui";
import { AppShell } from "../layout/app-shell.js";
import { DashboardPreview } from "../pages/dashboard-preview.js";
import { ACTIVITY_BAR_SECTIONS } from "./sections.js";

/**
 * Ten of the eleven Activity Bar sections render the shared
 * {@link PagePlaceholder}; the Dashboard route (index, "/") renders
 * {@link DashboardPreview} instead, as a temporary Phase 10 proof that the
 * shadcn-pattern component library actually works when consumed. Each
 * section gains a real, purpose-built page as its corresponding feature
 * phase lands (Dashboard in Phase 14, Analyzer in Phase 21, and so on).
 */
const children: RouteObject[] = ACTIVITY_BAR_SECTIONS.map((section): RouteObject => {
  const element =
    section.path === "/" ? (
      <DashboardPreview />
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
