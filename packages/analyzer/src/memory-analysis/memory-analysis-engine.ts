import type { StaticAnalysisResult } from "../types.js";
import { analyzeMemoryFromStructure } from "./structural-estimator.js";
import type { MemoryReport } from "./types.js";

export function analyzeMemory(_code: string, analysis: StaticAnalysisResult): MemoryReport {
  return analyzeMemoryFromStructure(analysis);
}
