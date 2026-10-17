import { describe, expect, it } from "vitest";
import { analyzeSecurity } from "../src/index.js";

it("detects secrets in assignment syntax while ignoring comments and placeholders", () => {
  const result = analyzeSecurity(
    [
      'const password = "correct-horse-battery-staple";',
      'const access_token = "tok_0123456789abcdef";',
      '// const secretKey = "commented_out_secret_123";',
      'const apiKey = "replace_me_with_real_key";',
    ].join("\n")
  );

  expect(
    result.issues.filter((issue) => issue.type === "secret").map((issue) => issue.line)
  ).toEqual([1, 2]);
});

it("detects dynamic SQL concatenation and unsafe file paths", () => {
  const result = analyzeSecurity(
    [
      'db.query("SELECT * FROM users WHERE id = " + userInput);',
      "fs.readFileSync(path.join(baseDir, process.env.USER_PATH));",
    ].join("\n")
  );

  expect(result.issues.some((issue) => issue.type === "sql-injection")).toBe(true);
  expect(result.issues.some((issue) => issue.type === "unsafe-file-access")).toBe(true);
});

it("does not report secret-like assignments inside comments", () => {
  const result = analyzeSecurity(
    [
      '// const apiKey = "sk_live_1234567890";',
      '/* password = "correct-horse-battery-staple"; */',
    ].join("\n")
  );

  expect(result.issues.some((issue) => issue.type === "secret")).toBe(false);
});
describe("SecurityEngine", () => {
  it("detects SQL injection risk from interpolated queries", () => {
    const result = analyzeSecurity("query(`SELECT * FROM users WHERE id = ${userId}`);");

    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.issues.some((issue) => issue.type === "sql-injection")).toBe(true);
  });
  it("detects multiple unsafe assignments on separate lines", () => {
    const result = analyzeSecurity("element.innerHTML = input;\nnode.outerHTML = value;");
    expect(result.issues.filter((issue) => issue.type === "xss")).toHaveLength(2);
    expect(
      result.issues.filter((issue) => issue.type === "xss").map((issue) => issue.line)
    ).toEqual([1, 2]);
  });

  it("does not report dangerous-looking text inside comments or ordinary strings", () => {
    const code = [
      "// element.innerHTML = input;",
      "const example = 'eval(userInput)';",
      "/* execSync(process.env.CMD); */",
      "const note = 'algorithm md5';",
    ].join("\n");
    const result = analyzeSecurity(code);
    expect(result.issues).toHaveLength(0);
  });

  it("detects dynamic code execution", () => {
    const result = analyzeSecurity("eval(userInput);\nconst fn = new Function(source);");
    expect(result.issues.some((issue) => issue.type === "unsafe-input")).toBe(true);
  });

  it("detects hard-coded credentials but ignores obvious placeholders", () => {
    const real = analyzeSecurity('const apiKey = "sk_live_1234567890";');
    const placeholder = analyzeSecurity('const apiKey = "your_api_key_here";');
    expect(real.issues.some((issue) => issue.type === "secret")).toBe(true);
    expect(placeholder.issues.some((issue) => issue.type === "secret")).toBe(false);
  });

  it("detects weak hash algorithms when used in crypto calls", () => {
    const result = analyzeSecurity('createHash("md5");');
    expect(result.issues.some((issue) => issue.type === "weak-crypto")).toBe(true);
  });

  it("does not report weak crypto from comments or unrelated strings", () => {
    const result = analyzeSecurity(
      [
        "// createHash('md5');",
        "const note = 'createHash(md5) is mentioned in documentation';",
      ].join("\n")
    );
    expect(result.issues.some((issue) => issue.type === "weak-crypto")).toBe(false);
  });

  it("detects unsafe file access and dynamic command construction", () => {
    const result = analyzeSecurity(
      ["readFileSync(userSuppliedPath);", "exec('tool ' + userInput);"].join("\n")
    );
    expect(result.issues.some((issue) => issue.type === "unsafe-file-access")).toBe(true);
    expect(result.issues.some((issue) => issue.type === "command-injection")).toBe(true);
  });
});

describe("SQL template interpolation regressions", () => {
  it("detects SQL interpolation with nested expressions", () => {
    const result = analyzeSecurity("query(`SELECT ${format(userId, `${suffix}`)}`);");
    expect(result.issues.some((issue) => issue.type === "sql-injection")).toBe(true);
  });

  it("detects multiline interpolated SQL", () => {
    const result = analyzeSecurity("query(`SELECT * FROM users WHERE id = ${userId}\n`);");
    expect(result.issues.some((issue) => issue.type === "sql-injection")).toBe(true);
  });

  it("does not detect SQL interpolation text inside comments or ordinary strings", () => {
    const result = analyzeSecurity(
      "// query(`SELECT ${userId}`);\nconst note = 'query(`SELECT ${userId}`)';"
    );
    expect(result.issues.some((issue) => issue.type === "sql-injection")).toBe(false);
  });
});
describe("security scanner lexer regressions", () => {
  it("detects dangerous code inside nested template interpolation", () => {
    const report = analyzeSecurity(
      "const html = `outer ${`inner ${element.innerHTML = input}`} tail`;"
    );
    expect(report.issues.some((issue) => issue.type === "xss")).toBe(true);
  });

  it("ignores comment markers and dangerous-looking text in quoted strings", () => {
    const report = analyzeSecurity(
      'const text = "/* eval(input) */ // createHash(md5)";\n' +
        "const escaped = 'it\\'s only text: eval(input)';"
    );
    expect(report.issues).toHaveLength(0);
  });

  it("ignores comments within template interpolation", () => {
    const report = analyzeSecurity("const value = `${input /* element.innerHTML = input; */}`;");
    expect(report.issues.some((issue) => issue.type === "xss")).toBe(false);
  });

  it("reports distinct rule types on the same line and consistent severity totals", () => {
    const report = analyzeSecurity('element.innerHTML = input; eval(input); createHash("md5");');
    expect(report.issues.some((issue) => issue.type === "xss")).toBe(true);
    expect(report.issues.some((issue) => issue.type === "unsafe-input")).toBe(true);
    expect(report.issues.some((issue) => issue.type === "weak-crypto")).toBe(true);
    expect(report.issueCount).toBe(report.issues.length);
    expect(report.criticalCount).toBe(
      report.issues.filter((issue) => issue.severity === "critical").length
    );
    expect(report.highCount).toBe(
      report.issues.filter((issue) => issue.severity === "high").length
    );
    expect(report.mediumCount).toBe(
      report.issues.filter((issue) => issue.severity === "medium").length
    );
    expect(report.lowCount).toBe(report.issues.filter((issue) => issue.severity === "low").length);
  });
});

describe("security scanner dynamic-input edge cases", () => {
  it("does not flag safe parameterized SQL or HTML equality comparisons", () => {
    const sql = analyzeSecurity('db.query("SELECT * FROM users WHERE id = ?", [userId]);');
    const html = analyzeSecurity("if (element.innerHTML === expected) {}");

    expect(sql.issues.some((issue) => issue.type === "sql-injection")).toBe(false);
    expect(html.issues.some((issue) => issue.type === "xss")).toBe(false);
  });

  it("does not flag environment-based secrets or obvious placeholder credentials", () => {
    const env = analyzeSecurity("const apiKey = process.env.API_KEY;");
    const placeholder = analyzeSecurity('const apiKey = "replace_me_with_real_key";');

    expect(env.issues.some((issue) => issue.type === "secret")).toBe(false);
    expect(placeholder.issues.some((issue) => issue.type === "secret")).toBe(false);
  });

  it("detects nested-brace SQL template interpolation", () => {
    const result = analyzeSecurity(
      "query(`SELECT * FROM users WHERE id = ${format({ id: userId })}`);"
    );

    expect(result.issues.some((issue) => issue.type === "sql-injection")).toBe(true);
  });

  it("does not report SQL interpolation text inside comments or strings", () => {
    const result = analyzeSecurity(
      ["/* query(`SELECT ${userId}`); */", 'const note = "query(`SELECT ${userId}`)";'].join("\n")
    );

    expect(result.issues.some((issue) => issue.type === "sql-injection")).toBe(false);
  });
});

// Additional credential formats that the scanner should detect.
describe("security scanner credential format regressions", () => {
  it("detects hardcoded credentials in common assignment formats", () => {
    const samples = [
      'const dbPassword = "prod-db-password-93842";',
      'const secretKey = "live_secret_value_73921";',
      'const token = "ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij";',
    ];

    for (const code of samples) {
      expect(analyzeSecurity(code).issues.some((issue) => issue.type === "secret")).toBe(true);
    }
  });

  it("does not flag credential references supplied by environment variables", () => {
    const result = analyzeSecurity(
      ["const password = process.env.DB_PASSWORD;", "const token = process.env.ACCESS_TOKEN;"].join(
        "\\n"
      )
    );

    expect(result.issues.some((issue) => issue.type === "secret")).toBe(false);
  });

  it("does not flag credential-looking assignments inside ordinary strings", () => {
    const result = analyzeSecurity(
      "const documentation = 'password = \"prod-db-password-93842\"';"
    );

    expect(result.issues.some((issue) => issue.type === "secret")).toBe(false);
  });
});
