import type { SecurityIssue, SecurityIssueType, SecuritySeverity } from "./types.js";

interface SecurityRule {
  readonly type: SecurityIssueType;
  readonly severity: SecuritySeverity;
  readonly pattern: RegExp;
  readonly message: string;
}

const SECURITY_RULES: readonly SecurityRule[] = [
  {
    type: "sql-injection",
    severity: "critical",
    pattern: /\b(query|execute|exec)\s*\(\s*["'`][^"'`]*\$\{/i,
    message: "Possible SQL injection through string interpolation.",
  },
  {
    type: "xss",
    severity: "high",
    pattern: /\b(innerHTML|outerHTML)\s*=/i,
    message: "Possible XSS risk from direct HTML assignment.",
  },
  {
    type: "unsafe-input",
    severity: "medium",
    pattern: /\b(eval|Function)\s*\(/i,
    message: "Potentially unsafe dynamic input execution.",
  },
  {
    type: "secret",
    severity: "critical",
    pattern: /\b(api[_-]?key|secret|password|token)\s*[:=]\s*["'][^"']{8,}["']/i,
    message: "Possible hard-coded secret or credential.",
  },
  {
    type: "weak-crypto",
    severity: "medium",
    pattern: /\b(md5|sha1|des|rc4)\b/i,
    message: "Weak or outdated cryptographic algorithm detected.",
  },
  {
    type: "unsafe-file-access",
    severity: "high",
    pattern: /\b(readFile|writeFile|unlink|rm)\s*\([^)]*(\.\.\/|process\.env)/i,
    message: "Potentially unsafe file-system access detected.",
  },
  {
    type: "command-injection",
    severity: "critical",
    pattern: /\b(exec|execSync|spawn|spawnSync)\s*\([^)]*(\$\{|process\.env)/i,
    message: "Possible command injection through dynamic command input.",
  },
];

function getLineNumber(code: string, index: number): number {
  return code.slice(0, index).split("\n").length;
}

export function scanSecurity(code: string): readonly SecurityIssue[] {
  const issues: SecurityIssue[] = [];

  for (const rule of SECURITY_RULES) {
    const match = rule.pattern.exec(code);

    if (match?.index === undefined) {
      continue;
    }

    issues.push({
      type: rule.type,
      severity: rule.severity,
      message: rule.message,
      line: getLineNumber(code, match.index),
      confidence: 70,
    });
  }

  return issues;
}
