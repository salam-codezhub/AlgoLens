import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import TreeSitterParser from "web-tree-sitter";

const require = createRequire(import.meta.url);

/** Maps our language ids to `tree-sitter-wasms`' actual grammar filenames. */
const GRAMMAR_FILES: Record<"c" | "cpp" | "java" | "python", string> = {
  c: "tree-sitter-c.wasm",
  cpp: "tree-sitter-cpp.wasm",
  java: "tree-sitter-java.wasm",
  python: "tree-sitter-python.wasm",
};

let initPromise: Promise<void> | undefined;
const languageCache = new Map<string, TreeSitterParser.Language>();

function grammarPath(language: keyof typeof GRAMMAR_FILES): string {
  const packageJsonPath = require.resolve("tree-sitter-wasms/package.json");
  return join(dirname(packageJsonPath), "out", GRAMMAR_FILES[language]);
}

async function ensureInitialized(): Promise<void> {
  initPromise ??= TreeSitterParser.init();
  await initPromise;
}

/**
 * Loads (and caches) the tree-sitter grammar for one of the four
 * tree-sitter-backed languages (C, C++, Java, Python — JS/TS use Babel
 * instead, see babel-extractor.ts). WASM initialization and grammar
 * loading both happen once per process; subsequent calls reuse the cache.
 */
export async function loadLanguage(
  language: keyof typeof GRAMMAR_FILES
): Promise<TreeSitterParser.Language> {
  await ensureInitialized();

  const cached = languageCache.get(language);
  if (cached) {
    return cached;
  }

  const loaded = await TreeSitterParser.Language.load(grammarPath(language));
  languageCache.set(language, loaded);
  return loaded;
}

export async function createParser(
  language: keyof typeof GRAMMAR_FILES
): Promise<TreeSitterParser> {
  const loadedLanguage = await loadLanguage(language);
  const parser = new TreeSitterParser();
  parser.setLanguage(loadedLanguage);
  return parser;
}
