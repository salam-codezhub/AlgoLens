import type { ExportData, ExportResult } from "./types.js";

function renderValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    return String(value);
  }

  return "";
}

export function exportMarkdown(data: ExportData): ExportResult {
  const lines: string[] = [`# ${data.title}`, ""];

  if (data.reports) {
    lines.push("## Reports", "");

    for (const [name, report] of Object.entries(data.reports)) {
      lines.push(`### ${name}`, "", renderValue(report), "");
    }
  }

  if (data.tables) {
    lines.push("## Tables", "");

    for (const table of data.tables) {
      lines.push(`### ${table.title}`, "");
      lines.push(`| ${table.headers.join(" | ")} |`);
      lines.push(`| ${table.headers.map(() => "---").join(" | ")} |`);

      for (const row of table.rows) {
        lines.push(`| ${row.map(renderValue).join(" | ")} |`);
      }

      lines.push("");
    }
  }

  if (data.charts) {
    lines.push("## Charts", "");

    for (const chart of data.charts) {
      lines.push(`### ${chart.title}`, "", "```mermaid", chart.source, "```", "");
    }
  }

  return {
    format: "markdown",
    fileExtension: ".md",
    content: lines.join("\n"),
  };
}
