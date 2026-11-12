import { Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { createReadStream, promises as fs } from 'node:fs';
import { dirname, join } from 'node:path';
import { Readable } from 'node:stream';
import { ObjectStorage, StoredObject } from './object-storage.port';

@Injectable()
export class LocalObjectStorage implements ObjectStorage {
  private readonly root = process.env.OBJECT_STORAGE_PATH ?? './storage';

  async put(key: string, content: Readable | Buffer): Promise<StoredObject> {
    const data = Buffer.isBuffer(content)
      ? content
      : await this.readStream(content);
    const path = join(this.root, key);
    await fs.mkdir(dirname(path), { recursive: true });
    await fs.writeFile(path, data, { mode: 0o600 });
    return {
      key,
      sizeBytes: data.byteLength,
      sha256: createHash('sha256').update(Buffer.from(data)).digest('hex'),
    };
  }

  async get(key: string): Promise<Readable> {
    try {
      await fs.access(join(this.root, key));
    } catch {
      throw new NotFoundException('Artefato não encontrado.');
    }
    return createReadStream(join(this.root, key));
  }

  private async readStream(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      if (typeof chunk === 'string' || chunk instanceof Uint8Array) {
        chunks.push(Buffer.from(chunk));
      } else {
        throw new TypeError('O stream retornou um chunk inválido.');
      }
    }
    return Buffer.concat(chunks);
  }
}
