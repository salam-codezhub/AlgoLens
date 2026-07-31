/**
 * Standard Maintainability Index formula (the Microsoft/Visual Studio
 * variant, normalized to 0-100):
 *   MI = MAX(0, (171 - 5.2*ln(V) - 0.23*CC - 16.2*ln(LOC)) * 100 / 171)
 * where V = Halstead Volume, CC = cyclomatic complexity, LOC = lines of
 * code. Higher is more maintainable; below ~20 is generally considered
 * hard to maintain, above ~80 easy.
 */
export function computeMaintainabilityIndex(
  halsteadVolume: number,
  cyclomaticComplexity: number,
  linesOfCode: number
): number {
  const safeVolume = Math.max(halsteadVolume, 1);
  const safeLoc = Math.max(linesOfCode, 1);

  const raw =
    171 - 5.2 * Math.log(safeVolume) - 0.23 * cyclomaticComplexity - 16.2 * Math.log(safeLoc);

  return Math.max(0, (raw * 100) / 171);
}
