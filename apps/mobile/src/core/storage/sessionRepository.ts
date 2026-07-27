import {
  parseSessionSnapshot,
  type SessionSnapshot,
} from '../session/session.ts';
import type { SessionStorage } from './storage.ts';

export interface SessionRepository {
  load(): Promise<SessionSnapshot | null>;
  save(snapshot: SessionSnapshot): Promise<void>;
  clear(): Promise<void>;
}

export function createSessionRepository(storage: SessionStorage): SessionRepository {
  let pendingWrite = Promise.resolve();

  return {
    async load() {
      const candidates = await storage.readCandidates();
      for (const candidate of candidates) {
        const snapshot = parseSessionSnapshot(candidate);
        if (snapshot) {
          return snapshot;
        }
      }
      return null;
    },
    async save(snapshot) {
      const nextWrite = pendingWrite
        .catch(() => undefined)
        .then(() => storage.write(JSON.stringify(snapshot)));
      pendingWrite = nextWrite.catch(() => undefined);
      await nextWrite;
    },
    async clear() {
      await pendingWrite;
      await storage.clear();
    },
  };
}
