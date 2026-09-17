import { describe, expect, it } from "vitest";
import { generateMermaid } from "../src/mermaid-generator.js";
import type { GraphVisualization } from "../src/types.js";

describe("Mermaid generator", () => {
  it("renders the flowchart direction", () => {
    const visualization: GraphVisualization = {
      type: "flowchart",
      technology: "mermaid",
      nodes: [],
      edges: [],
      source: "test",
    };

    expect(generateMermaid(visualization)).toBe("flowchart TD");
  });

  it("renders nodes with labels", () => {
    const visualization: GraphVisualization = {
      type: "flowchart",
      technology: "mermaid",
      nodes: [
        { id: "start", label: "Start" },
        { id: "process", label: "Process", type: "operation" },
      ],
      edges: [],
      source: "test",
    };

    const result = generateMermaid(visualization);

    expect(result).toContain('start["Start"]');
    expect(result).toContain('process["Process"]');
  });

  it("renders labeled and unlabeled edges", () => {
    const visualization: GraphVisualization = {
      type: "control-flow",
      technology: "mermaid",
      nodes: [
        { id: "a", label: "A" },
        { id: "b", label: "B" },
        { id: "c", label: "C" },
      ],
      edges: [
        { source: "a", target: "b", label: "yes" },
        { source: "b", target: "c" },
      ],
      source: "test",
    };

    const result = generateMermaid(visualization);

    expect(result).toContain("a -->|yes| b");
    expect(result).toContain("b --> c");
  });

  it("escapes double quotes in node and edge labels", () => {
    const visualization: GraphVisualization = {
      type: "flowchart",
      technology: "mermaid",
      nodes: [{ id: "a", label: 'Say "hello"' }],
      edges: [],
      source: "test",
    };

    const result = generateMermaid(visualization);

    expect(result).toContain("a[\"Say 'hello'\"]");
    expect(result).not.toContain('Say "hello"');
  });
});
