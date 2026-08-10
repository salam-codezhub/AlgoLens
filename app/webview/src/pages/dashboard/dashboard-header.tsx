import type { ReactElement } from "react";
import type { ProjectContext } from "@algolens/core";
import { useProjectContext } from "../../providers/store-provider.js";

const SCAN_STATUS_LABEL: Record<ProjectContext["scanStatus"], string> = {
  idle: "Idle",
  scanning: "Scanning…",
  complete: "Complete",
  error: "Error",
};

const SCAN_STATUS_COLOR_CLASS: Record<ProjectContext["scanStatus"], string> = {
  idle: "text-muted-foreground",
  scanning: "text-primary",
  complete: "text-success",
  error: "text-danger",
};

function StatBlock({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}): ReactElement {
  return (
    <div className="flex flex-col">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="text-foreground text-sm font-medium">{value}</span>
    </div>
  );
}

/**
 * Dashboard header: Project, Current File, Language, Scan Status — the
 * four fields from MASTER_04_UI_GUIDE.md's Dashboard Layout > Header.
 *
 * Reads from {@link useProjectContext} (Phase 15's shared store) rather
 * than local mock data, so this header and any other consumer (see
 * AppShell's footer) always show the same, single source of truth.
 */
export function DashboardHeader(): ReactElement {
  const context = useProjectContext();

  return (
    <div
      className="border-border bg-surface flex flex-wrap items-center gap-x-8 gap-y-3 rounded-lg border p-4"
      data-testid="dashboard-header"
    >
      <StatBlock label="Project" value={context.projectName} />
      <StatBlock label="Current File" value={context.currentFile} />
      <StatBlock label="Language" value={context.language} />
      <div className="flex flex-col">
        <span className="text-muted-foreground text-xs">Scan Status</span>
        <span className={`text-sm font-medium ${SCAN_STATUS_COLOR_CLASS[context.scanStatus]}`}>
          {SCAN_STATUS_LABEL[context.scanStatus]}
        </span>
      </div>
    </div>
  );
}
