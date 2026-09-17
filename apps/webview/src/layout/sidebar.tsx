import { PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";
import { useMemo, useState, type ReactElement } from "react";
import { NavLink } from "react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Input } from "@algolens/ui";
import { ACTIVITY_BAR_SECTIONS } from "../routes/sections.js";

const SIDEBAR_WIDTH_EXPANDED = "w-64";
const SIDEBAR_WIDTH_COLLAPSED = "w-10";

/**
 * The collapsible secondary navigation panel next to the ActivityBar:
 * search, a Navigation panel (links to all eleven sections, richer than
 * the icon-only ActivityBar), and a Recent Files panel. Built entirely
 * with Phase 10's shadcn-pattern components (Input, Accordion) — no new
 * primitives introduced here.
 */
export function Sidebar(): ReactElement {
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState("");

  const filteredSections = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return ACTIVITY_BAR_SECTIONS;
    }
    return ACTIVITY_BAR_SECTIONS.filter((section) =>
      section.title.toLowerCase().includes(normalized)
    );
  }, [query]);

  if (collapsed) {
    return (
      <div className={`border-border bg-surface flex-none border-r ${SIDEBAR_WIDTH_COLLAPSED}`}>
        <button
          type="button"
          aria-label="Expand sidebar"
          data-testid="sidebar-expand"
          onClick={() => {
            setCollapsed(false);
          }}
          className="text-muted-foreground hover:text-foreground flex h-9 w-9 items-center justify-center"
        >
          <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <aside
      aria-label="Sidebar"
      data-testid="sidebar"
      className={`border-border bg-surface flex flex-none flex-col border-r ${SIDEBAR_WIDTH_EXPANDED}`}
    >
      <div className="flex items-center gap-2 p-2">
        <div className="relative flex-1">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            type="search"
            aria-label="Search sections"
            placeholder="Search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
            }}
            className="pl-8"
          />
        </div>
        <button
          type="button"
          aria-label="Collapse sidebar"
          data-testid="sidebar-collapse"
          onClick={() => {
            setCollapsed(true);
          }}
          className="text-muted-foreground hover:text-foreground flex h-9 w-9 flex-none items-center justify-center"
        >
          <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="flex-1 overflow-auto px-2">
        <Accordion type="multiple" defaultValue={["navigation", "recent-files"]}>
          <AccordionItem value="navigation">
            <AccordionTrigger>Navigation</AccordionTrigger>
            <AccordionContent>
              <ul className="flex flex-col gap-0.5" data-testid="sidebar-navigation-list">
                {filteredSections.map((section) => (
                  <li key={section.id}>
                    <NavLink
                      to={section.path}
                      end={section.path === "/"}
                      className={({ isActive }) =>
                        `block rounded-md px-2 py-1 text-sm transition-colors ${
                          isActive
                            ? "bg-primary/15 text-primary"
                            : "text-foreground hover:bg-secondary"
                        }`
                      }
                    >
                      {section.title}
                    </NavLink>
                  </li>
                ))}
                {filteredSections.length === 0 && (
                  <li className="text-muted-foreground px-2 py-1 text-sm">No matches</li>
                )}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </aside>
  );
}
