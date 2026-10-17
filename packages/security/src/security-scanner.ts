import type { SecurityIssue, SecurityIssueType, SecuritySeverity } from "./types.js";

interface SecurityRule {
  readonly type: SecurityIssueType;
  readonly severity: SecuritySeverity;
  readonly pattern: RegExp;
  readonly message: string;
}

const CODE_RULES: readonly SecurityRule[] = [
  {
    type: "sql-injection",
    severity: "critical",
    pattern: /\b(?:query|execute|exec)\s*\(\s*(?:`[^`]*\$\{|[^)]*(?:["'][^"']*["']\s*\+))/gi,
    message: "Possible SQL injection through dynamically constructed query input.",
  },
  {
    type: "xss",
    severity: "high",
    pattern: /\b(?:innerHTML|outerHTML)\s*=(?!=)/g,
    message: "Possible XSS risk from direct HTML assignment.",
  },
  {
    type: "unsafe-input",
    severity: "high",
    pattern: /\b(?:eval\s*\(|new\s+Function\s*\(|Function\s*\()/g,
    message: "Potentially unsafe dynamic code execution.",
  },
  {
    type: "weak-crypto",
    severity: "medium",
    pattern:
      /\b(?:createHash\s*\(\s*["'](?:md5|sha1)["']|createCipher(?:iv)?\s*\(\s*["'](?:des|rc4)[^"']*["']|(?:md5|sha1|rc4)\s*\()/gi,
    message: "Weak or outdated cryptographic algorithm detected.",
  },
  {
    type: "unsafe-file-access",
    severity: "high",
    pattern:
      /\b(?:readFile|readFileSync|writeFile|writeFileSync|unlink|unlinkSync|rm|rmSync)\s*\(\s*(?:[^,)]*(?:process\.env|userSuppliedPath|userInput|input|params?|request|argv|path\.join\s*\([^)]*|\.\.\/))/gi,
    message: "Potentially unsafe file-system access using a dynamic or traversing path.",
  },
  {
    type: "command-injection",
    severity: "critical",
    pattern:
      /\b(?:exec|execSync|spawn|spawnSync)\s*\(\s*(?:`[^`]*\$\{|[^,)]*\+\s*(?:input|userInput|command|process\.env)|[^,)]*process\.env)/gi,
    message: "Possible command injection through dynamically constructed command input.",
  },
];

type LexMode = "code" | "single" | "double" | "template" | "line" | "block";

interface LexFrame {
  mode: LexMode;
  escaped: boolean;
  interpolationDepth?: number;
}

function maskSource(source: string, maskStrings: boolean): string {
  const chars = source.split("");
  const stack: LexFrame[] = [{ mode: "code", escaped: false }];
  const mask = (index: number): void => {
    if (source[index] !== "\n" && source[index] !== "\r") chars[index] = " ";
  };

  for (let i = 0; i < source.length; i++) {
    const frame = stack[stack.length - 1];
    if (frame === undefined) continue;
    const c = source[i];
    if (c === undefined) continue;
    const next = source[i + 1];

    if (frame.mode === "line") {
      mask(i);
      if (c === "\n") frame.mode = "code";
      continue;
    }

    if (frame.mode === "block") {
      mask(i);
      if (c === "*" && next === "/") {
        mask(i + 1);
        i++;
        stack.pop();
      }
      continue;
    }

    if (frame.mode === "single" || frame.mode === "double") {
      if (maskStrings) mask(i);
      if (frame.escaped) {
        frame.escaped = false;
        continue;
      }
      if (c === "\\") {
        frame.escaped = true;
        continue;
      }
      if ((frame.mode === "single" && c === "'") || (frame.mode === "double" && c === '"')) {
        stack.pop();
      }
      continue;
    }

    if (frame.mode === "template") {
      if (frame.escaped) {
        frame.escaped = false;
        mask(i);
        continue;
      }
      if (c === "\\") {
        frame.escaped = true;
        mask(i);
        continue;
      }
      if (c === "`") {
        mask(i);
        stack.pop();
        continue;
      }
      if (c === "$" && next === "{") {
        mask(i);
        mask(i + 1);
        i++;
        stack.push({ mode: "code", escaped: false, interpolationDepth: 1 });
        continue;
      }
      if (maskStrings) mask(i);
      continue;
    }

    // In code, a closing brace returns from template interpolation only
    // when its nesting depth reaches zero.
    if (frame.interpolationDepth !== undefined && c === "}") {
      frame.interpolationDepth--;
      if (frame.interpolationDepth === 0) {
        mask(i);
        stack.pop();
        continue;
      }
    }

    if (c === "/" && next === "/") {
      mask(i);
      mask(i + 1);
      i++;
      stack.push({ mode: "line", escaped: false });
    } else if (c === "/" && next === "*") {
      mask(i);
      mask(i + 1);
      i++;
      stack.push({ mode: "block", escaped: false });
    } else if (c === "'") {
      if (maskStrings) mask(i);
      stack.push({ mode: "single", escaped: false });
    } else if (c === '"') {
      if (maskStrings) mask(i);
      stack.push({ mode: "double", escaped: false });
    } else if (c === "`") {
      if (maskStrings) mask(i);
      stack.push({ mode: "template", escaped: false });
    } else {
      if (frame.interpolationDepth !== undefined && c === "{") {
        frame.interpolationDepth++;
      }
    }
  }

  return chars.join("");
}

function maskComments(source: string): string {
  return maskSource(source, false);
}

function maskStringsAndComments(source: string): string {
  return maskSource(source, true);
}
function getLineNumber(code: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index; i++) {
    if (code[i] === "\n") line++;
  }
  return line;
}

function collectMatches(
  source: string,
  rule: SecurityRule,
  issues: SecurityIssue[],
  seen: Set<string>,
  codeOnly?: string
): void {
  rule.pattern.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = rule.pattern.exec(source)) !== null) {
    const index = match.index;
    if (codeOnly && /\s/.test(codeOnly.charAt(index))) {
      continue;
    }
    const line = getLineNumber(source, index);
    const key = `${rule.type}:${String(line)}`;
    if (!seen.has(key)) {
      seen.add(key);
      issues.push({
        type: rule.type,
        severity: rule.severity,
        message: rule.message,
        line,
        confidence: rule.type === "secret" ? 85 : 75,
      });
    }
    if (match[0].length === 0) rule.pattern.lastIndex++;
  }
}

function collectSecrets(
  source: string,
  codeOnly: string,
  issues: SecurityIssue[],
  seen: Set<string>
): void {
  const pattern =
    /\b(api[_-]?key|secret(?:[_-]?key)?|[a-z0-9]*password|passwd|(?:access|auth)?[_-]?token)\s*[:=]\s*["']([^"']{8,})["']/gi;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(source)) !== null) {
    // The assignment must begin in executable code, not inside a quoted string.
    if (/\s/.test(codeOnly.charAt(match.index))) continue;

    const value = (match[2] ?? "").trim();
    if (
      /^(?:your[_ -]?|replace[_ -]?|example|placeholder|changeme|<|x{8,}|test[_ -]?value)/i.test(
        value
      )
    )
      continue;
    if (/^(?:process\.env|env\.)/i.test(value)) continue;

    const line = getLineNumber(source, match.index);
    const key = `secret:${String(line)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    issues.push({
      type: "secret",
      severity: "critical",
      message: "Possible hard-coded secret or credential.",
      line,
      confidence: 85,
    });
  }
}
export function scanSecurity(code: string): readonly SecurityIssue[] {
  const issues: SecurityIssue[] = [];
  const seen = new Set<string>();
  const commentMasked = maskComments(code);
  const codeOnly = maskStringsAndComments(code);
  const cryptoView = commentMasked;
  const sqlTemplateCalls = code.matchAll(
    /\b(?:query|execute|exec)\s*\(\s*`[^`]*\$\{[^}]+\}[^`]*`/g
  );
  for (const match of sqlTemplateCalls) {
    const callIndex = match.index;
    if (codeOnly[callIndex] !== code[callIndex]) {
      continue;
    }
    const line = getLineNumber(code, match.index);
    const key = `sql-injection:${String(line)}`;
    if (!seen.has(key)) {
      seen.add(key);
      issues.push({
        type: "sql-injection",
        severity: "critical",
        message: "Possible SQL injection through dynamically constructed query input.",
        line,
        confidence: 75,
      });
    }
  }

  for (const rule of CODE_RULES) {
    const input =
      rule.type === "sql-injection" ||
      rule.type === "command-injection" ||
      rule.type === "weak-crypto"
        ? cryptoView
        : codeOnly;
    collectMatches(
      input,
      rule,
      issues,
      seen,
      rule.type === "sql-injection" ||
        rule.type === "command-injection" ||
        rule.type === "weak-crypto"
        ? codeOnly
        : undefined
    );
  }

  collectSecrets(commentMasked, codeOnly, issues, seen);
  issues.sort((a, b) => (a.line ?? 0) - (b.line ?? 0) || a.type.localeCompare(b.type));
  return issues;
}
