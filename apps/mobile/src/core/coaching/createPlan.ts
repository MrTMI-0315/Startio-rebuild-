import { createFallbackPlan } from './fallback.ts';
import { validateTaskInput } from './input.ts';
import type { PlanResult } from './result.ts';
import { classifySafety } from './safety.ts';

export function createLocalPlan(rawInput: string): PlanResult {
  const validation = validateTaskInput(rawInput);

  if (!validation.isValid) {
    throw new Error(`Invalid task input: ${validation.error}`);
  }

  const safeRedirect = classifySafety(validation.value);
  if (safeRedirect) {
    return safeRedirect;
  }

  return createFallbackPlan(validation.value);
}
