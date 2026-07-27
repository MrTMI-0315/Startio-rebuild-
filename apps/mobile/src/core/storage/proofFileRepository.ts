export interface ProofPhotoSource {
  uri: string;
  mimeType: string | null;
  width: number;
  height: number;
}

export interface LocalProofPhoto {
  photoId: string;
  uri: string;
  mimeType: string;
  width: number;
  height: number;
  createdAt: string;
}

export interface ProofFileStorage {
  copyToOwnedFile(sourceUri: string, fileName: string): Promise<string>;
  deleteOwnedFile(uri: string): Promise<void>;
  deleteAllOwnedFiles(): Promise<void>;
}

export interface ProofFileRepository {
  save(source: ProofPhotoSource): Promise<LocalProofPhoto>;
  delete(photo: LocalProofPhoto): Promise<void>;
  clear(): Promise<void>;
}

const MIME_EXTENSIONS: Readonly<Record<string, string>> = {
  'image/heic': 'heic',
  'image/heif': 'heif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function normalizeMimeType(value: string | null): string {
  return value && value.startsWith('image/') ? value : 'image/jpeg';
}

function extensionForMimeType(mimeType: string): string {
  return MIME_EXTENSIONS[mimeType] ?? 'jpg';
}

export function createProofFileRepository(
  storage: ProofFileStorage,
  options: {
    now?: () => Date;
    createId?: () => string;
  } = {},
): ProofFileRepository {
  const now = options.now ?? (() => new Date());
  const createId =
    options.createId ??
    (() => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`);

  return {
    async save(source) {
      if (
        !source.uri ||
        !Number.isFinite(source.width) ||
        !Number.isFinite(source.height) ||
        source.width <= 0 ||
        source.height <= 0
      ) {
        throw new Error('invalid_proof_photo_source');
      }

      const photoId = createId();
      const mimeType = normalizeMimeType(source.mimeType);
      const fileName = `proof-${photoId}.${extensionForMimeType(mimeType)}`;
      const uri = await storage.copyToOwnedFile(source.uri, fileName);

      return {
        photoId,
        uri,
        mimeType,
        width: source.width,
        height: source.height,
        createdAt: now().toISOString(),
      };
    },
    delete(photo) {
      return storage.deleteOwnedFile(photo.uri);
    },
    clear() {
      return storage.deleteAllOwnedFiles();
    },
  };
}

export function isLocalProofPhoto(value: unknown): value is LocalProofPhoto {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const photo = value as Record<string, unknown>;
  return (
    Object.keys(photo).every((key) =>
      ['photoId', 'uri', 'mimeType', 'width', 'height', 'createdAt'].includes(key),
    ) &&
    typeof photo.photoId === 'string' &&
    typeof photo.uri === 'string' &&
    photo.uri.startsWith('file://') &&
    typeof photo.mimeType === 'string' &&
    photo.mimeType.startsWith('image/') &&
    typeof photo.width === 'number' &&
    photo.width > 0 &&
    typeof photo.height === 'number' &&
    photo.height > 0 &&
    typeof photo.createdAt === 'string' &&
    !Number.isNaN(Date.parse(photo.createdAt))
  );
}
