import { Directory, File, Paths } from 'expo-file-system';

import {
  parseHistoryArchive,
  type HistoryArchive,
} from '../events/historyProjection.ts';

const HISTORY_PREFIX = 'history-';
const HISTORY_SUFFIX = '.json';
const MAX_HISTORY_FILES = 2;
export interface HistoryRepository {
  load(): Promise<HistoryArchive | null>;
  save(archive: HistoryArchive): Promise<void>;
  clear(): Promise<void>;
}

export function createHistoryRepository(): HistoryRepository {
  const directory = new Directory(Paths.document, 'startio-session');
  let pendingWrite = Promise.resolve();

  const listFiles = () => {
    if (!directory.exists) {
      return [];
    }
    return directory
      .list()
      .filter(
        (entry): entry is File =>
          entry instanceof File &&
          entry.name.startsWith(HISTORY_PREFIX) &&
          entry.name.endsWith(HISTORY_SUFFIX),
      )
      .sort((left, right) => right.name.localeCompare(left.name));
  };

  return {
    async load() {
      for (const file of listFiles()) {
        try {
          const archive = parseHistoryArchive(await file.text());
          if (archive) {
            return archive;
          }
        } catch {
          // The previous valid history projection remains a recovery candidate.
        }
      }
      return null;
    },
    async save(archive) {
      const nextWrite = pendingWrite
        .catch(() => undefined)
        .then(() => {
          directory.create({ idempotent: true, intermediates: true });
          const timestamp = Date.now().toString().padStart(13, '0');
          const file = new File(
            directory,
            `${HISTORY_PREFIX}${timestamp}-${Math.random().toString(36).slice(2, 8)}${HISTORY_SUFFIX}`,
          );
          file.create({ intermediates: true });
          file.write(JSON.stringify(archive));
          for (const staleFile of listFiles().slice(MAX_HISTORY_FILES)) {
            staleFile.delete();
          }
        });
      pendingWrite = nextWrite.catch(() => undefined);
      await nextWrite;
    },
    async clear() {
      await pendingWrite;
      for (const file of listFiles()) {
        file.delete();
      }
    },
  };
}
