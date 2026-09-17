import type { DocumentationExport, ProjectDocumentation } from "./types.js";
import { generateMarkdown } from "./markdown-generator.js";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function markdownToHtml(markdown: string): string {
  return escapeHtml(markdown)
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/^\*\*(.+?)\*\*$/gm, "<strong>$1</strong>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>");
}

export function generateHtml(documentation: ProjectDocumentation): string {
  const markdown = generateMarkdown(documentation);
  const body = markdownToHtml(markdown);

  return [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8">',
    `<title>${escapeHtml(documentation.title)}</title>`,
    "<style>",
    "body{font-family:Arial,sans-serif;max-width:900px;margin:40px auto;padding:0 24px;line-height:1.6;color:#222}",
    "h1,h2,h3{margin-top:1.5em}",
    "li{margin:4px 0}",
    "</style>",
    "</head>",
    "<body>",
    `<p>${body}</p>`,
    "</body>",
    "</html>",
  ].join("\n");
}

export function createHtmlExport(documentation: ProjectDocumentation): DocumentationExport {
  return {
    format: "html",
    content: generateHtml(documentation),
    fileExtension: ".html",
  };
}
