export const AI_PROCESSING_CONSENT_VERSION =
  'ai_processing_consent_v0.1' as const;

export type AiConsentDecision = 'unknown' | 'accepted' | 'declined';

export interface AiProcessingConsent {
  version: typeof AI_PROCESSING_CONSENT_VERSION;
  decision: AiConsentDecision;
  decidedAt: string | null;
}

export function createAiProcessingConsent(): AiProcessingConsent {
  return {
    version: AI_PROCESSING_CONSENT_VERSION,
    decision: 'unknown',
    decidedAt: null,
  };
}

export function decideAiProcessingConsent(
  decision: Exclude<AiConsentDecision, 'unknown'>,
  now: Date = new Date(),
): AiProcessingConsent {
  return {
    version: AI_PROCESSING_CONSENT_VERSION,
    decision,
    decidedAt: now.toISOString(),
  };
}

export function parseAiProcessingConsent(
  value: string,
): AiProcessingConsent | null {
  try {
    const parsed: unknown = JSON.parse(value);
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return null;
    }
    const record = parsed as Record<string, unknown>;
    if (
      record.version !== AI_PROCESSING_CONSENT_VERSION ||
      !['accepted', 'declined'].includes(String(record.decision)) ||
      typeof record.decidedAt !== 'string' ||
      Number.isNaN(Date.parse(record.decidedAt))
    ) {
      return null;
    }

    return record as unknown as AiProcessingConsent;
  } catch {
    return null;
  }
}
