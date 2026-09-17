import { generateMermaid } from "./mermaid-generator.js";
import type { GraphVisualization, VisualizationType } from "./types.js";

export function createVisualization(
  type: VisualizationType,
  nodes: GraphVisualization["nodes"],
  edges: GraphVisualization["edges"]
): GraphVisualization {
  const visualization: GraphVisualization = {
    type,
    technology: "mermaid",
    nodes,
    edges,
    source: "",
  };

  return {
    ...visualization,
    source: generateMermaid(visualization),
  };
}
