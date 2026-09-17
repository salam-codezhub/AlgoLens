import type { GraphVisualization, VisualizationEdge, VisualizationNode } from "./types.js";

function escapeMermaidLabel(label: string): string {
  return label.replaceAll('"', "'");
}

function renderNode(node: VisualizationNode): string {
  return `${node.id}["${escapeMermaidLabel(node.label)}"]`;
}

function renderEdge(edge: VisualizationEdge): string {
  const label = edge.label ? `|${escapeMermaidLabel(edge.label)}|` : "";

  return `${edge.source} -->${label} ${edge.target}`;
}

export function generateMermaid(visualization: GraphVisualization): string {
  const lines: string[] = ["flowchart TD"];

  for (const node of visualization.nodes) {
    lines.push(`  ${renderNode(node)}`);
  }

  for (const edge of visualization.edges) {
    lines.push(`  ${renderEdge(edge)}`);
  }

  return lines.join("\n");
}
