export interface ActivityBarSection {
  readonly id: string;
  readonly path: string;
  readonly title: string;
  readonly description: string;
  /** Name of a lucide-react icon component, resolved by ActivityBar's icon map. */
  readonly iconName: string;
}

/**
 * The eleven Activity Bar sections, verbatim from MASTER_04_UI_GUIDE.md's
 * Navigation list. Each gets a route now (Phase 08) rendering a shared
 * placeholder; real content lands in later phases (14, 21–37) without
 * needing to change this list's shape. `iconName` is consumed by
 * ActivityBar (Phase 12).
 */
export const ACTIVITY_BAR_SECTIONS: readonly ActivityBarSection[] = [
  {
    id: "dashboard",
    path: "/",
    title: "Dashboard",
    description:
      "Project overview: overall score, performance, complexity, runtime, memory, security.",
    iconName: "LayoutDashboard",
  },
  {
    id: "analyzer",
    path: "/analyzer",
    title: "Analyzer",
    description: "Static analysis results: complexity, algorithm detection, code structure.",
    iconName: "ScanSearch",
  },
  {
    id: "optimization",
    path: "/optimization",
    title: "Optimization",
    description: "AI-suggested optimizations, alternative algorithms, and one-click patches.",
    iconName: "Wand2",
  },
  {
    id: "runtime",
    path: "/runtime",
    title: "Runtime",
    description: "Estimated vs. measured runtime, execution statistics, and benchmark results.",
    iconName: "Gauge",
  },
  {
    id: "memory",
    path: "/memory",
    title: "Memory",
    description: "Memory usage analysis and space complexity findings.",
    iconName: "MemoryStick",
  },
  {
    id: "security",
    path: "/security",
    title: "Security",
    description: "Security scan results: threats, secrets, and injection risks.",
    iconName: "ShieldCheck",
  },
  {
    id: "ai-chat",
    path: "/ai-chat",
    title: "AI Chat",
    description: "Conversational assistant for questions about the current project.",
    iconName: "MessageSquare",
  },
  {
    id: "visualization",
    path: "/visualization",
    title: "Visualization",
    description: "Control flow graphs, dependency graphs, and execution timelines.",
    iconName: "Waypoints",
  },
  {
    id: "reports",
    path: "/reports",
    title: "Reports",
    description: "Generated documentation and exportable analysis reports.",
    iconName: "FileText",
  },
  {
    id: "history",
    path: "/history",
    title: "History",
    description: "Past analyses, applied optimizations, and project timeline.",
    iconName: "History",
  },
  {
    id: "settings",
    path: "/settings",
    title: "Settings",
    description: "AI provider configuration, preferences, and extension settings.",
    iconName: "Settings",
  },
] as const;
