import type { ServiceResponse, ServiceError } from "@algolens/shared";
import { ok, fail, PACKAGE_NAME as SHARED_PACKAGE_NAME } from "@algolens/shared";

export type { ServiceResponse, ServiceError };
export { ok, fail };

export * from "./event-bus.js";
export * from "./store.js";
export * from "./services/project-context-service.js";
export * from "./services/workspace-context-service.js";

/** Canonical package name, useful for logging and diagnostics. */
export const PACKAGE_NAME = "@algolens/core" as const;

/**
 * Confirms this package can see and re-export {@link SHARED_PACKAGE_NAME}
 * from `@algolens/shared`, proving the workspace path alias and TypeScript
 * project reference to that package are wired correctly.
 */
export function sharedPackageDependency(): string {
  return SHARED_PACKAGE_NAME;
}
