import type { ReactElement } from "react";
import { DashboardHeader } from "./dashboard-header.js";
import { MetricCard } from "./metric-card.js";
import { TrendChart } from "./trend-chart.js";
import { StaticAnalysisDetails } from "./static-analysis-details.js";
import type { ScoreCardData, TrendChartData } from "./mock-data.js";
import {
  useAnalysisHistory,
  useAnalysisResult,
  useSecurityReport,
} from "../../providers/store-provider.js";

function buildScoreCards(analysis: ReturnType<typeof useAnalysisResult>): readonly ScoreCardData[] {
  if (!analysis) {
    return [
      {
        id: "maintainability",
        title: "Maintainability",
        value: "â€”",
        description: "Waiting for static analysis",
      },
      {
        id: "complexity",
        title: "Cyclomatic Complexity",
        value: "â€”",
        description: "Waiting for static analysis",
      },
      {
        id: "loops",
        title: "Loops",
        value: "â€”",
        description: "Waiting for static analysis",
      },
      {
        id: "nesting",
        title: "Max Loop Nesting",
        value: "â€”",
        description: "Waiting for static analysis",
      },
      {
        id: "recursion",
        title: "Recursive Functions",
        value: "â€”",
        description: "Waiting for static analysis",
      },
      {
        id: "issues",
        title: "Static Issues",
        value: "â€”",
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

function formatHistoryLabel(analyzedAt: number): string {
  return new Date(analyzedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function buildHistoryCharts(
  history: ReturnType<typeof useAnalysisHistory>
): readonly TrendChartData[] {
  return [
    {
      id: "runtime-trend",
      title: "Runtime Trend",
      unit: "ms",
      points: history.map((entry) => ({
        label: formatHistoryLabel(entry.analyzedAt),
        value: entry.runtimeMs,
      })),
    },
    {
      id: "memory-trend",
      title: "Memory Trend",
      unit: "MB",
      points: [],
      emptyMessage: "Memory usage measurements are not recorded yet.",
    },
    {
      id: "complexity-trend",
      title: "Complexity Trend",
      unit: "cyclomatic",
      points: history.map((entry) => ({
        label: formatHistoryLabel(entry.analyzedAt),
        value: entry.complexity,
      })),
    },
  ];
}

function SecurityFindings(): ReactElement {
  const report = useSecurityReport();
  return (
    <section
      className="rounded-xl border border-border bg-card p-5"
      aria-labelledby="security-findings-heading"
      data-testid="security-findings"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 id="security-findings-heading" className="text-lg font-semibold">
          Security Findings
        </h2>
        {report ? (
          <span className="text-sm text-muted-foreground">
            {report.issueCount} finding{report.issueCount === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>
      {!report ? (
        <p className="text-sm text-muted-foreground">
          Security scan has not been run yet. Run AlgoLens security analysis to inspect the current
          file.
        </p>
      ) : report.issues.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Scan complete. No issues were detected by the current security rules.
        </p>
      ) : (
        <ul className="space-y-3">
          {report.issues.map((issue, index) => (
            <li
              key={`${issue.type}-${String(issue.line ?? "unknown")}-${String(index)}`}
              className="rounded-lg border border-border p-3"
            >
              <div className="mb-1 flex flex-wrap items-center gap-2 text-sm">
                <span className="font-semibold uppercase">{issue.severity}</span>
                <span className="font-mono">{issue.type}</span>
                {issue.line !== undefined ? (
                  <span className="text-muted-foreground">Line {issue.line}</span>
                ) : null}
              </div>
              <p className="text-sm">{issue.message}</p>
            </li>
          ))}
        </ul>
      )}
      {report ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Heuristic scan only; results may include false positives or miss vulnerabilities.
        </p>
      ) : null}
    </section>
  );
}

export function Dashboard(): ReactElement {
  const analysis = useAnalysisResult();
  const history = useAnalysisHistory();
  const scoreCards = buildScoreCards(analysis);
  const trendCharts = buildHistoryCharts(history);

  return (
    <div className="flex flex-col gap-4" data-testid="dashboard">
      <DashboardHeader />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {scoreCards.map((card) => (
          <MetricCard key={card.id} data={card} />
        ))}
      </div>

      <SecurityFindings />

      {analysis ? <StaticAnalysisDetails analysis={analysis} /> : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {trendCharts.map((chart) => (
          <TrendChart key={chart.id} data={chart} />
        ))}
      </div>
    </div>
  );
}
