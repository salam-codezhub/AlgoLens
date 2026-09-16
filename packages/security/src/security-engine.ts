import { createSecurityReport } from "./security-report.js";
import { scanSecurity } from "./security-scanner.js";
import type { SecurityReport } from "./types.js";

export function analyzeSecurity(code: string): SecurityReport {
  const issues = scanSecurity(code);

  return createSecurityReport(issues);
}
