import { describe, expect, it } from "vitest";
import { exportHtml } from "../src/html-exporter.js";
import { exportJson } from "../src/json-exporter.js";
import { exportMarkdown } from "../src/markdown-exporter.js";
import { exportResults } from "../src/export-engine.js";
import type { ExportData } from "../src/types.js";

const data: ExportData = {
  title: "Test Report",
  reports: {
    complexity: { complexity: "O(n)" },
  },
  tables: [
    {
      title: "Results",
      headers: ["Name", "Score"],
      rows: [["Alice", 95]],
    },
  ],
  charts: [
    {
      title: "Flow",
      source: "flowchart TD\nA --> B",
    },
  ],
};

describe("exporters", () => {
  it("exports JSON", () => {
    const result = exportJson(data);

    expect(result.format).toBe("json");
    expect(result.fileExtension).toBe(".json");
    expect(JSON.parse(result.content)).toEqual(data);
  });

  it("exports Markdown reports, tables, and charts", () => {
    const result = exportMarkdown(data);

    expect(result.format).toBe("markdown");
    expect(result.fileExtension).toBe(".md");
    expect(result.content).toContain("# Test Report");
    expect(result.content).toContain("## Reports");
    expect(result.content).toContain("## Tables");
    expect(result.content).toContain("| Name | Score |");
    expect(result.content).toContain("## Charts");
    expect(result.content).toContain("flowchart TD");
  });

  it("exports HTML with escaped content", () => {
    const result = exportHtml({
      ...data,
      title: '<Test & "Report">',
      reports: {
        complexity: { complexity: "<script>alert('x')</script>" },
      },
    });

    expect(result.format).toBe("html");
    expect(result.fileExtension).toBe(".html");
    expect(result.content).toContain("&lt;Test &amp; &quot;Report&quot;&gt;");
    expect(result.content).toContain("&lt;script&gt;");
    expect(result.content).not.toContain("<script>alert");
  });

  it("routes JSON, Markdown, and HTML formats", async () => {
    await expect(exportResults("json", data)).resolves.toEqual(exportJson(data));
    await expect(exportResults("markdown", data)).resolves.toEqual(exportMarkdown(data));
    await expect(exportResults("html", data)).resolves.toEqual(exportHtml(data));
  });

  it("rejects unsupported export formats at runtime", async () => {
    await expect(exportResults("unsupported" as never, data)).rejects.toThrow(
      "Unsupported export format"
    );
  });
});
