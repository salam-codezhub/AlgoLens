import type { ExportData, ExportResult } from "./types.js";

export function exportJson(data: ExportData): ExportResult {
  return {
    format: "json",
    fileExtension: ".json",
    content: JSON.stringify(data, null, 2),
  };
}
