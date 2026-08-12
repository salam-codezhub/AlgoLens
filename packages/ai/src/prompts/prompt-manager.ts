import type { AIContext } from "../types.js";
import { buildPromptContext } from "./context-builder.js";
import { PROMPT_TEMPLATES } from "./templates.js";
import type { PromptCategory, PromptContext, PromptTemplate, RenderedPrompt } from "./types.js";
import { injectVariables } from "./variable-injection.js";
import { validatePromptContext } from "./validation.js";

export class UnknownPromptCategoryError extends Error {
  constructor(category: string) {
    super(`No prompt template registered for category "${category}".`);
    this.name = "UnknownPromptCategoryError";
  }
}

/**
 * Central Prompt Management System (Phase 17): owns every {@link PromptTemplate},
 * builds context, injects variables, validates required fields, and
 * returns a versioned {@link RenderedPrompt}.
 *
 * Per Phase 17's acceptance criterion ("All AI requests use Prompt
 * Manager"), nothing in the codebase should construct a prompt string by
 * hand — {@link BaseAIProvider}'s task methods call this class instead of
 * the ad-hoc template map Phase 16 used as a placeholder.
 */
export class PromptManager {
  private readonly templates: ReadonlyMap<PromptCategory, PromptTemplate>;

  constructor(templates: readonly PromptTemplate[] = PROMPT_TEMPLATES) {
    this.templates = new Map(templates.map((template) => [template.category, template]));
  }

  getTemplate(category: PromptCategory): PromptTemplate {
    const template = this.templates.get(category);
    if (!template) {
      throw new UnknownPromptCategoryError(category);
    }
    return template;
  }

  getAllTemplates(): readonly PromptTemplate[] {
    return [...this.templates.values()];
  }

  /**
   * Builds context from `aiContext`, validates it against the category's
   * template, injects variables, and returns the fully-rendered,
   * versioned prompt. Throws {@link PromptValidationError} if a required
   * field is missing — a request that would produce an incomplete prompt
   * never reaches an AI provider.
   */
  render(category: PromptCategory, aiContext: AIContext): RenderedPrompt {
    const template = this.getTemplate(category);
    const context: PromptContext = buildPromptContext(aiContext);

    validatePromptContext(template, context);

    return {
      templateId: template.id,
      category: template.category,
      version: template.version,
      systemPrompt: injectVariables(template.systemTemplate, context),
      userPrompt: injectVariables(template.userTemplate, context),
    };
  }
}

/** Shared default instance — most callers don't need their own PromptManager. */
export const defaultPromptManager = new PromptManager();
