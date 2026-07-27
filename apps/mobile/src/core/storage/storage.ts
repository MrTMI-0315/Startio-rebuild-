import { Directory, File, Paths } from 'expo-file-system';

export interface SessionStorage {
  readCandidates(): Promise<readonly string[]>;
  write(value: string): Promise<void>;
  clear(): Promise<void>;
}

const SNAPSHOT_PREFIX = 'session-';
const SNAPSHOT_SUFFIX = '.json';
const MAX_SNAPSHOT_FILES = 2;

export function createExpoFileSessionStorage(): SessionStorage {
  const directory = new Directory(Paths.document, 'startio-session');

  const listSnapshotFiles = () => {
    if (!directory.exists) {
      return [];
    }

    return directory
      .list()
      .filter(
        (entry): entry is File =>
          entry instanceof File &&
          entry.name.startsWith(SNAPSHOT_PREFIX) &&
          entry.name.endsWith(SNAPSHOT_SUFFIX),
      )
      .sort((left, right) => right.name.localeCompare(left.name));
  };

  return {
    async readCandidates() {
      const contents: string[] = [];
      for (const file of listSnapshotFiles()) {
        try {
          contents.push(await file.text());
        } catch {
          // A partially written candidate is ignored; the previous snapshot remains available.
        }
      }
      return contents;
    },
    async write(value) {
      directory.create({ idempotent: true, intermediates: true });
      const timestamp = Date.now().toString().padStart(13, '0');
      const random = Math.random().toString(36).slice(2, 8);
      const file = new File(
        directory,
        `${SNAPSHOT_PREFIX}${timestamp}-${random}${SNAPSHOT_SUFFIX}`,
      );
      file.create({ intermediates: true });
      file.write(value);

      for (const staleFile of listSnapshotFiles().slice(MAX_SNAPSHOT_FILES)) {
        try {
          staleFile.delete();
        } catch {
          // Cleanup failure must not invalidate the newly written snapshot.
        }
      }
    },
    async clear() {
      for (const file of listSnapshotFiles()) {
        file.delete();
      }
    },
  };
}
