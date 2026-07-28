import type { ReactElement } from "react";

export interface PagePlaceholderProps {
  /** Section title, matching an Activity Bar entry (e.g. "Dashboard", "Security"). */
  readonly title: string;
  /** One-line description of what this section will eventually show. */
  readonly description: string;
}

/**
 * Minimal placeholder shown for Activity Bar sections that don't have a real
 * implementation yet. Deliberately unstyled beyond basic structure — visual
 * design (Tailwind, shadcn/ui, the theme engine) arrives in Phases 09–11 and
 * will restyle this without needing to touch its logic.
 */
export function PagePlaceholder({ title, description }: PagePlaceholderProps): ReactElement {
  return (
    <section aria-labelledby="page-placeholder-title">
      <h1 id="page-placeholder-title">{title}</h1>
      <p>{description}</p>
    </section>
  );
}
