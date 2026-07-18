export interface ActivityBarSection {
  readonly id: string;
  readonly path: string;
  readonly title: string;
  readonly description: string;
}

/**
 * The eleven Activity Bar sections, verbatim from MASTER_04_UI_GUIDE.md's
 * Navigation list. Each gets a route now (Phase 08) rendering a shared
 * placeholder; real content and the actual Activity Bar UI land in later
 * phases (12–14, 21–37) without needing to change this list's shape.
 */
export const ACTIVITY_BAR_SECTIONS: readonly ActivityBarSection[] = [
  {
    id: "dashboard",
    path: "/",
    title: "Dashboard",
    description:
      "Project overview: overall score, performance, complexity, runtime, memory, security.",
  },
  {
    id: "analyzer",
    path: "/analyzer",
    title: "Analyzer",
    description: "Static analysis results: complexity, algorithm detection, code structure.",
  },
  {
    id: "optimization",
    path: "/optimization",
    title: "Optimization",
    description: "AI-suggested optimizations, alternative algorithms, and one-click patches.",
  },
  {
    id: "runtime",
    path: "/runtime",
    title: "Runtime",
    description: "Estimated vs. measured runtime, execution statistics, and benchmark results.",
  },
  {
    id: "memory",
    path: "/memory",
    title: "Memory",
    description: "Memory usage analysis and space complexity findings.",
  },
  {
    id: "security",
    path: "/security",
    title: "Security",
    description: "Security scan results: threats, secrets, and injection risks.",
  },
  {
    id: "ai-chat",
    path: "/ai-chat",
    title: "AI Chat",
    description: "Conversational assistant for questions about the current project.",
  },
  {
    id: "visualization",
    path: "/visualization",
    title: "Visualization",
    description: "Control flow graphs, dependency graphs, and execution timelines.",
  },
  {
    id: "reports",
    path: "/reports",
    title: "Reports",
    description: "Generated documentation and exportable analysis reports.",
  },
  {
    id: "history",
    path: "/history",
    title: "History",
    description: "Past analyses, applied optimizations, and project timeline.",
  },
  {
    id: "settings",
    path: "/settings",
    title: "Settings",
    description: "AI provider configuration, preferences, and extension settings.",
  },
] as const;
