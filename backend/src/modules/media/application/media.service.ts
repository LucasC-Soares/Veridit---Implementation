import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import {
  OBJECT_STORAGE,
  ObjectStorage,
} from '../../../shared/infrastructure/storage/object-storage.port';
import { EGRESS_POLICY, EgressPolicy } from '../domain/egress-policy.port';

@Injectable()
export class MediaService {
  constructor(
    @Inject(OBJECT_STORAGE) private readonly storage: ObjectStorage,
    @Inject(EGRESS_POLICY) private readonly egress: EgressPolicy,
  ) {}

  async capturePage(recordId: number, siteUrl: string) {
    this.egress.validate(siteUrl);
    const response = await fetch(siteUrl, { redirect: 'manual' });
    if (!response.ok || !response.body) {
      throw new NotFoundException('Não foi possível capturar o conteúdo.');
    }
    const content = Buffer.from(await response.arrayBuffer());
    const sha256 = createHash('sha256').update(content).digest('hex');
    const stored = await this.storage.put(
      `records/${recordId}/source-${Date.now()}.html`,
      content,
      {
        sha256,
        contentType: response.headers.get('content-type') ?? 'text/html',
      },
    );
    return { ...stored, artifactType: 'HTML', recordId };
  }
}
