import type { ReactElement } from "react";
import { DashboardHeader } from "./dashboard-header.js";
import { MetricCard } from "./metric-card.js";
import { TrendChart } from "./trend-chart.js";
import type { ScoreCardData, TrendChartData } from "./mock-data.js";
import { useAnalysisResult } from "../../providers/store-provider.js";

function buildScoreCards(analysis: ReturnType<typeof useAnalysisResult>): readonly ScoreCardData[] {
  if (!analysis) {
    return [
      {
        id: "maintainability",
        title: "Maintainability",
        value: "—",
        description: "Waiting for static analysis",
      },
      {
        id: "complexity",
        title: "Cyclomatic Complexity",
        value: "—",
        description: "Waiting for static analysis",
      },
      {
        id: "loops",
        title: "Loops",
        value: "—",
        description: "Waiting for static analysis",
      },
      {
        id: "nesting",
        title: "Max Loop Nesting",
        value: "—",
        description: "Waiting for static analysis",
      },
      {
        id: "recursion",
        title: "Recursive Functions",
        value: "—",
        description: "Waiting for static analysis",
      },
      {
        id: "issues",
        title: "Static Issues",
        value: "—",
        description: "Waiting for static analysis",
      },
    ];
  }

  const issueCount =
    analysis.unusedImports.length +
    analysis.unusedVariables.length +
    analysis.deadCode.reduce((total, location) => total + location.unreachableStatementCount, 0);

  return [
    {
      id: "maintainability",
      title: "Maintainability",
      value: analysis.maintainabilityIndex.toFixed(1),
      description: "Static analysis index",
    },
    {
      id: "complexity",
      title: "Cyclomatic Complexity",
      value: String(analysis.fileCyclomaticComplexity),
      description: "File-level complexity",
    },
    {
      id: "loops",
      title: "Loops",
      value: String(analysis.loopCount),
      description: "Detected loops",
    },
    {
      id: "nesting",
      title: "Max Loop Nesting",
      value: String(analysis.maxLoopNestingDepth),
      description: "Maximum detected depth",
    },
    {
      id: "recursion",
      title: "Recursive Functions",
      value: String(analysis.recursiveFunctions.length),
      description: "Detected recursive functions",
    },
    {
      id: "issues",
      title: "Static Issues",
      value: String(issueCount),
      description: "Unused symbols and dead code",
    },
  ];
}

const NO_HISTORY_CHARTS: readonly TrendChartData[] = [
  {
    id: "runtime-trend",
    title: "Runtime Trend",
    unit: "ms",
    points: [],
  },
  {
    id: "memory-trend",
    title: "Memory Trend",
    unit: "MB",
    points: [],
  },
  {
    id: "complexity-trend",
    title: "Complexity Trend",
    unit: "cyclomatic",
    points: [],
  },
];

export function Dashboard(): ReactElement {
  const analysis = useAnalysisResult();
  const scoreCards = buildScoreCards(analysis);

  return (
    <div className="flex flex-col gap-4" data-testid="dashboard">
      <DashboardHeader />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {scoreCards.map((card) => (
          <MetricCard key={card.id} data={card} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {NO_HISTORY_CHARTS.map((chart) => (
          <TrendChart key={chart.id} data={chart} />
        ))}
      </div>
    </div>
  );
}
