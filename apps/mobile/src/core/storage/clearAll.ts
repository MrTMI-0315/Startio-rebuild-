export interface LocalDataClearTarget {
  readonly name: string;
  clear(): Promise<void>;
}

export class LocalDataClearError extends Error {
  readonly failedTargets: readonly string[];

  constructor(failedTargets: readonly string[]) {
    super('local_data_clear_failed');
    this.name = 'LocalDataClearError';
    this.failedTargets = [...failedTargets];
  }
}

export interface LocalDataClearer {
  clearAll(): Promise<void>;
}

export function createLocalDataClearer(
  targets: readonly LocalDataClearTarget[],
): LocalDataClearer {
  return {
    async clearAll() {
      const failedTargets: string[] = [];

      for (const target of targets) {
        try {
          await target.clear();
        } catch {
          failedTargets.push(target.name);
        }
      }

      if (failedTargets.length > 0) {
        throw new LocalDataClearError(failedTargets);
      }
    },
  };
}
