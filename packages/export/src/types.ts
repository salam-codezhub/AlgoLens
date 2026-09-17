export type ExportFormat = "pdf" | "markdown" | "html" | "json";

export interface ExportReport {
  readonly complexity?: unknown;
  readonly runtime?: unknown;
  readonly security?: unknown;
  readonly optimization?: unknown;
  readonly documentation?: unknown;
}

export interface ExportTable {
  readonly title: string;
  readonly headers: readonly string[];
  readonly rows: readonly (readonly unknown[])[];
}

export interface ExportChart {
  readonly title: string;
  readonly source: string;
}

export interface ExportData {
  readonly title: string;
  readonly reports?: ExportReport;
  readonly tables?: readonly ExportTable[];
  readonly charts?: readonly ExportChart[];
}

export interface ExportResult {
  readonly format: ExportFormat;
  readonly fileExtension: ".pdf" | ".md" | ".html" | ".json";
  readonly content: string;
}
