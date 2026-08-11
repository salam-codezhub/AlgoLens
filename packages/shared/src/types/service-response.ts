/**
 * Global service response envelope.
 *
 * Every internal service across `packages/*` and `apps/*` returns its result
 * wrapped in this shape rather than throwing or returning raw values, so
 * callers always have a single, predictable way to check success and read
 * errors, timing, and metadata.
 *
 * Spec: MASTER_06_API_DESIGN.md § 2 — Global Response Model
 */
export interface ServiceResponse<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: ServiceError;
  readonly executionTime?: number;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Structured error shape used inside a {@link ServiceResponse}.
 *
 * Services must never throw untyped errors across package boundaries;
 * failures are represented as data using this shape instead.
 *
 * Spec: MASTER_06_API_DESIGN.md § 2 — Service Error
 */
export interface ServiceError {
  readonly code: string;
  readonly message: string;
  readonly cause?: string;
  readonly recoverable: boolean;
}

/**
 * Builds a successful {@link ServiceResponse}.
 */
export function ok<T>(
  data: T,
  metadata?: Record<string, unknown>,
  executionTime?: number
): ServiceResponse<T> {
  return {
    success: true,
    data,
    ...(executionTime !== undefined ? { executionTime } : {}),
    ...(metadata !== undefined ? { metadata } : {}),
  };
}

/**
 * Builds a failed {@link ServiceResponse}.
 */
export function fail<T = never>(error: ServiceError): ServiceResponse<T> {
  return {
    success: false,
    error,
  };
}
