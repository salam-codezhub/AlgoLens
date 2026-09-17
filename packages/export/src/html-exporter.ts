import type { ExportData, ExportResult } from "./types.js";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function exportHtml(data: ExportData): ExportResult {
  const reports = data.reports
    ? Object.entries(data.reports)
        .map(
          ([name, report]) =>
            `<section><h2>${escapeHtml(name)}</h2><pre>${escapeHtml(
              JSON.stringify(report, null, 2)
            )}</pre></section>`
        )
        .join("\n")
    : "";

  const tables = data.tables
    ? data.tables
        .map(
          (table) => `
<section>
<h2>${escapeHtml(table.title)}</h2>
<table>
<thead><tr>${table.headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
<tbody>
${table.rows
  .map(
    (row) =>
      `<tr>${row
        .map(
          (value) =>
            `<td>${escapeHtml(value === null || value === undefined ? "" : typeof value === "object" ? JSON.stringify(value) : typeof value === "string" || typeof value === "number" || typeof value === "boolean" || typeof value === "bigint" ? String(value) : "")}</td>`
        )
        .join("")}</tr>`
  )
  .join("\n")}
</tbody>
</table>
</section>`
        )
        .join("\n")
    : "";

  const charts = data.charts
    ? data.charts
        .map(
          (chart) =>
            `<section><h2>${escapeHtml(chart.title)}</h2><pre>${escapeHtml(
              chart.source
            )}</pre></section>`
        )
        .join("\n")
    : "";

  const content = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${escapeHtml(data.title)}</title>
</head>
<body>
<h1>${escapeHtml(data.title)}</h1>
${reports}
${tables}
${charts}
</body>
</html>`;

  return {
    format: "html",
    fileExtension: ".html",
    content,
  };
}
