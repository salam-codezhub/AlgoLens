import {
  FileText,
  Gauge,
  History,
  LayoutDashboard,
  MemoryStick,
  MessageSquare,
  ScanSearch,
  Settings,
  ShieldCheck,
  Wand2,
  Waypoints,
  type LucideIcon,
} from "lucide-react";
import type { ReactElement } from "react";
import { NavLink } from "react-router";
import { ACTIVITY_BAR_SECTIONS } from "../routes/sections.js";

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  ScanSearch,
  Wand2,
  Gauge,
  MemoryStick,
  ShieldCheck,
  MessageSquare,
  Waypoints,
  FileText,
  History,
  Settings,
};

/**
 * The vertical icon rail navigating between the app's eleven sections
 * (Dashboard, Analyzer, ...). This recreates VS Code's own Activity Bar
 * visual pattern *inside* the webview, rather than contributing to VS
 * Code's native `contributes.viewsContainers.activitybar` — the whole app
 * is a single webview panel with in-app routing (Phase 08), not multiple
 * native VS Code views, so navigation between sections has to live here.
 */
export function ActivityBar(): ReactElement {
  return (
    <nav aria-label="Primary" className="bg-surface flex w-12 flex-none flex-col items-center py-2">
      {ACTIVITY_BAR_SECTIONS.map((section) => {
        const Icon = ICONS[section.iconName];
        return (
          <NavLink
            key={section.id}
            to={section.path}
            end={section.path === "/"}
            aria-label={section.title}
            title={section.title}
            className={({ isActive }) =>
              `mx-1 my-0.5 flex h-9 w-9 items-center justify-center rounded-md transition-colors ${
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`
            }
          >
            {Icon ? <Icon className="h-5 w-5" aria-hidden="true" /> : null}
          </NavLink>
        );
      })}
    </nav>
  );
}
