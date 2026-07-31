import type { TreeSitterNode } from "@algolens/parser";

/** Collects the text of every leaf (terminal) node — tree-sitter's
 *  equivalent of a token stream, since its public API doesn't expose a
 *  separate flat token list the way Babel's parser does. */
export function collectLeafTokenTexts(root: TreeSitterNode): string[] {
  const texts: string[] = [];

  function visit(node: TreeSitterNode): void {
    if (node.childCount === 0) {
      if (node.text.trim().length > 0) {
        texts.push(node.text);
      }
      return;
    }
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child) {
        visit(child);
      }
    }
  }

  visit(root);
  return texts;
}
