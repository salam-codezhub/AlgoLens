import type { PromptContext, PromptTemplate } from "./types.js";

export class PromptValidationError extends Error {
  constructor(
    readonly templateId: string,
    readonly missingFields: readonly string[]
  ) {
    super(
      `Prompt template "${templateId}" is missing required field(s): ${missingFields.join(", ")}.`
    );
    this.name = "PromptValidationError";
  }
}

function isPresent(value: unknown): boolean {
  if (value === undefined || value === null) {
    return false;
  }
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return true;
}

/**
 * Checks every field {@link PromptTemplate.requiredFields} lists is
 * actually present (and non-empty) in `context`, throwing
 * {@link PromptValidationError} otherwise. This is what stops a
 * half-populated context from silently producing a prompt with blank
 * sections — per MASTER_05_AI_RULES.md's "Never invent facts": a template
 * that needs a field the caller didn't supply should fail loudly, not
 * render "(not available yet)" into a spot the caller assumed was filled.
 */
export function validatePromptContext(template: PromptTemplate, context: PromptContext): void {
  const missing = template.requiredFields.filter((field) => !isPresent(context[field]));
  if (missing.length > 0) {
    throw new PromptValidationError(template.id, missing);
  }
}
