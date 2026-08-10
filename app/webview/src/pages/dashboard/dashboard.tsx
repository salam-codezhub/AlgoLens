import type { ReactElement } from "react";
import { DashboardHeader } from "./dashboard-header.js";
import { MetricCard } from "./metric-card.js";
import { TrendChart } from "./trend-chart.js";
import { MOCK_SCORE_CARDS, MOCK_TREND_CHARTS } from "./mock-data.js";

/**
 * The real Dashboard (Phase 14), per MASTER_04_UI_GUIDE.md's Dashboard
 * Layout: Header (Project/Current File/Language/Scan Status), six score
 * Cards, and three trend Charts. Replaces Phase 10's temporary
 * DashboardPreview verification page.
 *
 * Grids use responsive breakpoints (1 column on narrow widths, up to 3 on
 * wide ones) since a VS Code webview panel's width varies with how the
 * user has docked/resized it — "responsive" here is a real, load-bearing
 * requirement, not just a nice-to-have.
 */
export function Dashboard(): ReactElement {
  return (
    <div className="flex flex-col gap-4" data-testid="dashboard">
      <DashboardHeader />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_SCORE_CARDS.map((card) => (
          <MetricCard key={card.id} data={card} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {MOCK_TREND_CHARTS.map((chart) => (
          <TrendChart key={chart.id} data={chart} />
        ))}
      </div>
    </div>
  );
}
