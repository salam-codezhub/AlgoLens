import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names, resolving conflicting Tailwind utility classes in
 * favor of the last one (e.g. `cn("p-2", condition && "p-4")` correctly
 * yields just `p-4` when `condition` is true, rather than emitting both).
 * The standard shadcn/ui utility, unchanged from its canonical form.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
