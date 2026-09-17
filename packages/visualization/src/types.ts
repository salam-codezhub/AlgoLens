export type VisualizationType =
  | "flowchart"
  | "control-flow"
  | "call-graph"
  | "dependency-graph"
  | "runtime-graph"
  | "memory-graph"
  | "complexity-graph"
  | "execution-timeline";

export type VisualizationTechnology = "mermaid" | "react-flow" | "d3";

export interface VisualizationNode {
  readonly id: string;
  readonly label: string;
  readonly type?: string;
}

export interface VisualizationEdge {
  readonly source: string;
  readonly target: string;
  readonly label?: string;
}

export interface GraphVisualization {
  readonly type: VisualizationType;
  readonly technology: VisualizationTechnology;
  readonly nodes: readonly VisualizationNode[];
  readonly edges: readonly VisualizationEdge[];
  readonly source: string;
}

export interface TimelinePoint {
  readonly timestamp: number;
  readonly label: string;
  readonly durationMs?: number;
}

export interface ExecutionTimeline {
  readonly type: "execution-timeline";
  readonly technology: "d3";
  readonly points: readonly TimelinePoint[];
  readonly source: string;
}
