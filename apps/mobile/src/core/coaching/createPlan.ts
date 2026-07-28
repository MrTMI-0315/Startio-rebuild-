import { createFallbackPlan } from './fallback.ts';
import { validateTaskInput } from './input.ts';
import {
  createV02LocalPlan,
  DEFAULT_LOCAL_COACHING_POLICY_VERSION,
  type LocalCoachingPolicyVersion,
} from './localChunkingEngine.ts';
import type { PlanResult } from './result.ts';
import { classifySafety } from './safety.ts';

export function createLocalPlan(
  rawInput: string,
  options: {
    policyVersion?: LocalCoachingPolicyVersion;
  } = {},
): PlanResult {
  const validation = validateTaskInput(rawInput);

  if (!validation.isValid) {
    throw new Error(`Invalid task input: ${validation.error}`);
  }

  const safeRedirect = classifySafety(validation.value);
  if (safeRedirect) {
    return safeRedirect;
  }

  const policyVersion =
    options.policyVersion ?? DEFAULT_LOCAL_COACHING_POLICY_VERSION;

  return policyVersion === 'local_chunking_policy_v0.1'
    ? createFallbackPlan(validation.value)
    : createV02LocalPlan(validation.value);
}
