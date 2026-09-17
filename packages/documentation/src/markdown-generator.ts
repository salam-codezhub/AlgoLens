import type {
  AnalysisDocumentation,
  ClassDocumentation,
  FunctionDocumentation,
  ProjectDocumentation,
} from "./types.js";

function renderFunction(documentation: FunctionDocumentation): string {
  const parameters =
    documentation.parameters.length === 0
      ? "None"
      : documentation.parameters.map((item) => `- ${item}`).join("\n");

  return [
    `### ${documentation.name}`,
    "",
    documentation.description,
    "",
    "**Parameters**",
    parameters,
    "",
    `**Returns:** ${documentation.returns}`,
  ].join("\n");
}

function renderClass(documentation: ClassDocumentation): string {
  const methods =
    documentation.methods.length === 0
      ? "None"
      : documentation.methods.map((item) => `- ${item}`).join("\n");

  return [
    `### ${documentation.name}`,
    "",
    documentation.description,
    "",
    "**Methods**",
    methods,
  ].join("\n");
}

function renderReport(documentation: AnalysisDocumentation): string {
  return [`### ${documentation.title}`, "", documentation.content].join("\n");
}

export function generateMarkdown(documentation: ProjectDocumentation): string {
  const functions =
    documentation.functions.length === 0
      ? "No function documentation available."
      : documentation.functions.map(renderFunction).join("\n\n");

  const classes =
    documentation.classes.length === 0
      ? "No class documentation available."
      : documentation.classes.map(renderClass).join("\n\n");

  const reports =
    documentation.reports.length === 0
      ? "No analysis reports available."
      : documentation.reports.map(renderReport).join("\n\n");

  return [
    `# ${documentation.title}`,
    "",
    "## Overview",
    "",
    documentation.overview,
    "",
    "## Architecture",
    "",
    documentation.architectureSummary,
    "",
    "## Functions",
    "",
    functions,
    "",
    "## Classes",
    "",
    classes,
    "",
    "## Analysis Reports",
    "",
    reports,
  ].join("\n");
}
