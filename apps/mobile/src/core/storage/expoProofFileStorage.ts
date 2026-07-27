import { Directory, File, Paths } from 'expo-file-system';

import type { ProofFileStorage } from './proofFileRepository';

const PROOF_DIRECTORY_NAME = 'startio-proof';

export function createExpoProofFileStorage(): ProofFileStorage {
  const directory = new Directory(Paths.document, PROOF_DIRECTORY_NAME);

  const ensureDirectory = () => {
    directory.create({ idempotent: true, intermediates: true });
  };

  return {
    async copyToOwnedFile(sourceUri, fileName) {
      ensureDirectory();
      const source = new File(sourceUri);
      const destination = new File(directory, fileName);
      source.copy(destination);
      return destination.uri;
    },
    async deleteOwnedFile(uri) {
      const file = new File(uri);
      if (file.exists) {
        file.delete();
      }
    },
    async deleteAllOwnedFiles() {
      if (directory.exists) {
        directory.delete();
      }
    },
  };
}
