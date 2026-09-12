import type { PromptContext } from "./types.js";

const PLACEHOLDER_PATTERN = /\{\{(\w+)\}\}/g;

/** How each optional {@link PromptContext} field renders when absent —
 *  readable prose instead of a blank or a literal "undefined". */
const NOT_AVAILABLE = "(not available yet)";

/**
 * Every valid {@link PromptContext} field name. Deliberately a fixed list
 * rather than `fieldName in context`: optional fields are correctly
 * omitted as own-properties when absent (see context-builder.ts, which
 * avoids assigning literal `undefined` under `exactOptionalPropertyTypes`),
 * so `in` can't distinguish "a real field that's just not populated yet"
 * from "not a real field at all" — this list can.
 */
const KNOWN_FIELDS = new Set<keyof PromptContext>([
  "code",
  "language",
  "filePath",
  "astSummary",
  "imports",
  "functions",
  "classes",
  "dependencies",
  "complexitySummary",
  "workspaceSummary",
  "userRequest",
]);

function formatValue(value: string | readonly string[] | undefined): string {
  if (value === undefined) {
    return NOT_AVAILABLE;
  }
  if (typeof value === "string") {
    return value;
  }
  return value.length > 0 ? value.join(", ") : NOT_AVAILABLE;
}

/**
 * Substitutes `{{fieldName}}` placeholders in `template` with values from
 * `context`. No `eval`/`Function` involved — purely a lookup-and-replace
 * over a fixed field allowlist ({@link PromptContext}'s own keys), so a
 * template can never execute arbitrary code even if its source somehow
 * came from an untrusted place.
 */
export function injectVariables(template: string, context: PromptContext): string {
  return template.replace(PLACEHOLDER_PATTERN, (match, fieldName: string) => {
    if (!KNOWN_FIELDS.has(fieldName as keyof PromptContext)) {
      return match; // Leave unrecognized placeholders untouched rather than guessing.
    }
    return formatValue(context[fieldName as keyof PromptContext]);
  });
}
