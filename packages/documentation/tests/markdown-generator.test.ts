import { describe, expect, it } from "vitest";
import { generateMarkdown } from "../src/markdown-generator.js";
import type { ProjectDocumentation } from "../src/types.js";

describe("Markdown generator", () => {
  it("renders a complete project documentation report", () => {
    const documentation: ProjectDocumentation = {
      title: "AlgoLens",
      overview: "Code analysis platform",
      architectureSummary: "Parser -> Analyzer -> Report",
      functions: [
        {
          name: "analyze",
          description: "Analyzes source code",
          parameters: ["code"],
          returns: "Analysis result",
        },
      ],
      classes: [
        {
          name: "Analyzer",
          description: "Runs static analysis",
          methods: ["analyze"],
        },
      ],
      reports: [
        {
          type: "complexity",
          title: "Complexity Report",
          content: "Time complexity: O(n)",
        },
      ],
    };

    const markdown = generateMarkdown(documentation);

    expect(markdown).toContain("# AlgoLens");
    expect(markdown).toContain("## Overview");
    expect(markdown).toContain("Code analysis platform");
    expect(markdown).toContain("## Architecture");
    expect(markdown).toContain("Parser -> Analyzer -> Report");
    expect(markdown).toContain("## Functions");
    expect(markdown).toContain("### analyze");
    expect(markdown).toContain("**Parameters**");
    expect(markdown).toContain("- code");
    expect(markdown).toContain("**Returns:** Analysis result");
    expect(markdown).toContain("## Classes");
    expect(markdown).toContain("### Analyzer");
    expect(markdown).toContain("**Methods**");
    expect(markdown).toContain("- analyze");
    expect(markdown).toContain("## Analysis Reports");
    expect(markdown).toContain("### Complexity Report");
    expect(markdown).toContain("Time complexity: O(n)");
  });

  it("renders fallback messages when sections are empty", () => {
    const documentation: ProjectDocumentation = {
      title: "Empty Project",
      overview: "No documentation yet",
      architectureSummary: "Not available",
      functions: [],
      classes: [],
      reports: [],
    };

    const markdown = generateMarkdown(documentation);

    expect(markdown).toContain("No function documentation available.");
    expect(markdown).toContain("No class documentation available.");
    expect(markdown).toContain("No analysis reports available.");
  });

  it("renders None for functions without parameters", () => {
    const documentation: ProjectDocumentation = {
      title: "Test",
      overview: "Overview",
      architectureSummary: "Architecture",
      functions: [
        {
          name: "run",
          description: "Runs the task",
          parameters: [],
          returns: "void",
        },
      ],
      classes: [],
      reports: [],
    };

    const markdown = generateMarkdown(documentation);

    expect(markdown).toContain("### run");
    expect(markdown).toContain("**Parameters**\nNone");
    expect(markdown).toContain("**Returns:** void");
  });

  it("renders None for classes without methods", () => {
    const documentation: ProjectDocumentation = {
      title: "Test",
      overview: "Overview",
      architectureSummary: "Architecture",
      functions: [],
      classes: [
        {
          name: "EmptyClass",
          description: "No methods",
          methods: [],
        },
      ],
      reports: [],
    };

    const markdown = generateMarkdown(documentation);

    expect(markdown).toContain("### EmptyClass");
    expect(markdown).toContain("**Methods**\nNone");
  });
});
