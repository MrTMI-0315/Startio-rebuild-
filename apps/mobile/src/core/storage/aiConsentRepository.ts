import {
  parseAiProcessingConsent,
  type AiProcessingConsent,
} from '../coaching/aiConsent.ts';

export interface AiConsentStorage {
  read(): Promise<string | null>;
  write(value: string): Promise<void>;
  clear(): Promise<void>;
}

export interface AiConsentRepository {
  load(): Promise<AiProcessingConsent | null>;
  save(consent: AiProcessingConsent): Promise<void>;
  clear(): Promise<void>;
}

export function createAiConsentRepository(
  storage: AiConsentStorage,
): AiConsentRepository {
  return {
    async load() {
      const value = await storage.read();
      return value === null ? null : parseAiProcessingConsent(value);
    },
    async save(consent) {
      await storage.write(JSON.stringify(consent));
    },
    async clear() {
      await storage.clear();
    },
  };
}
