import { Directory, File, Paths } from 'expo-file-system';

import type { AiConsentStorage } from './aiConsentRepository.ts';

export function createExpoAiConsentStorage(): AiConsentStorage {
  const directory = new Directory(Paths.document, 'startio-consent');
  const file = new File(directory, 'ai-processing.json');

  return {
    async read() {
      if (!file.exists) {
        return null;
      }
      try {
        return await file.text();
      } catch {
        return null;
      }
    },
    async write(value) {
      directory.create({ idempotent: true, intermediates: true });
      if (!file.exists) {
        file.create({ intermediates: true });
      }
      file.write(value);
    },
    async clear() {
      if (file.exists) {
        file.delete();
      }
      if (directory.exists) {
        directory.delete();
      }
    },
  };
}
