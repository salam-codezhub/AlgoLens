/**
 * Dashboard mock data.
 *
 * Every value here is illustrative placeholder data, not a real analysis
 * result. Real values require engines that don't exist yet: the Static
 * Analysis Engine (Phase 21) and Complexity Engines (Phases 23–24) for the
 * score cards, and the Benchmark/Runtime/Memory Engines (Phases 25–27) for
 * the trend charts. This file exists so the Dashboard layout (Phase 14)
 * can be built and verified now; later analysis-engine phases replace this
 * with real data without needing to change this module's shape.
 *
 * Project/file/language/scan-status data (the Dashboard header) is *not*
 * here — as of Phase 15 it's centralized in `@algolens/core`'s
 * `ProjectContext` / `ProjectContextService`, consumed via
 * `useProjectContext()` so the same state can be shared across multiple UI
 * locations (Dashboard header, AppShell footer, ...) instead of being
 * duplicated per-component.
 */

export interface ScoreCardData {
  readonly id: string;
  readonly title: string;
  readonly value: string;
  readonly description: string;
}

export const MOCK_SCORE_CARDS: readonly ScoreCardData[] = [
  {
    id: "overall",
    title: "Overall Score",
    value: "87 / 100",
    description: "Across all categories",
  },
  { id: "performance", title: "Performance", value: "92 / 100", description: "Runtime efficiency" },
  {
    id: "complexity",
    title: "Complexity",
    value: "O(n log n)",
    description: "Dominant time complexity",
  },
  { id: "runtime", title: "Runtime", value: "142 ms", description: "Estimated, not measured" },
  { id: "memory", title: "Memory", value: "18.4 MB", description: "Peak estimated usage" },
  {
    id: "security",
    title: "Security",
    value: "3 issues",
    description: "1 high, 2 medium severity",
  },
];

export interface TrendPoint {
  readonly label: string;
  readonly value: number;
}

export interface TrendChartData {
  readonly id: string;
  readonly title: string;
  readonly unit: string;
  readonly points: readonly TrendPoint[];
}

export const MOCK_TREND_CHARTS: readonly TrendChartData[] = [
  {
    id: "runtime-trend",
    title: "Runtime Trend",
    unit: "ms",
    points: [
      { label: "Mon", value: 168 },
      { label: "Tue", value: 155 },
      { label: "Wed", value: 149 },
      { label: "Thu", value: 151 },
      { label: "Fri", value: 142 },
    ],
  },
  {
    id: "memory-trend",
    title: "Memory Trend",
    unit: "MB",
    points: [
      { label: "Mon", value: 22.1 },
      { label: "Tue", value: 21.4 },
      { label: "Wed", value: 19.8 },
      { label: "Thu", value: 19.2 },
      { label: "Fri", value: 18.4 },
    ],
  },
  {
    id: "complexity-trend",
    title: "Complexity Trend",
    unit: "cyclomatic",
    points: [
      { label: "Mon", value: 14 },
      { label: "Tue", value: 13 },
      { label: "Wed", value: 12 },
      { label: "Thu", value: 12 },
      { label: "Fri", value: 10 },
    ],
  },
];
