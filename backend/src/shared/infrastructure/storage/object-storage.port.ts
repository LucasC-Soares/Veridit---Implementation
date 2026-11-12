import { Readable } from 'node:stream';

export const OBJECT_STORAGE = Symbol('OBJECT_STORAGE');

export interface StoredObject {
  key: string;
  sizeBytes: number;
  sha256: string;
}

export interface ObjectStorage {
  put(
    key: string,
    content: Readable | Buffer,
    metadata?: Record<string, string>,
  ): Promise<StoredObject>;
  get(key: string): Promise<Readable>;
}
