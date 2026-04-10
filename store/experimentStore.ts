import type { BlockResult, TechniqueId } from '@/types/experiment';

let selectedTechnique: TechniqueId = 'baseline';
let latestBlockResult: BlockResult | null = null;
let sessionResults: Partial<Record<TechniqueId, BlockResult>> = {};

export function setSelectedTechnique(technique: TechniqueId) {
  selectedTechnique = technique;
}

export function getSelectedTechnique(): TechniqueId {
  return selectedTechnique;
}

export function setLatestBlockResult(result: BlockResult) {
  latestBlockResult = result;
  sessionResults[result.technique] = result;
}

export function getLatestBlockResult(): BlockResult | null {
  return latestBlockResult;
}

export function getSessionResult(technique: TechniqueId): BlockResult | null {
  return sessionResults[technique] ?? null;
}

export function clearSessionResults() {
  latestBlockResult = null;
  sessionResults = {};
}
