import { Injectable } from '@nestjs/common';
import { ContentRecord } from '../domain/entities/content-record.entity';
import { CaptureRepository } from '../domain/repositories/capture.repository';

@Injectable()
export class InMemoryCaptureRepository implements CaptureRepository {
  private readonly records = new Map<number, ContentRecord>();
  private nextId = 1;

  create(record: ContentRecord): Promise<ContentRecord> {
    const persisted = new ContentRecord(
      this.nextId++,
      record.userId,
      record.title,
      record.siteUrl,
      record.status,
      record.details,
      record.createdAt,
    );
    this.records.set(persisted.id, persisted);
    return Promise.resolve(persisted);
  }

  findById(id: number): Promise<ContentRecord | null> {
    return Promise.resolve(this.records.get(id) ?? null);
  }

  listByUser(userId: number): Promise<ContentRecord[]> {
    return Promise.resolve(
      [...this.records.values()].filter((record) => record.userId === userId),
    );
  }

  update(record: ContentRecord): Promise<ContentRecord> {
    this.records.set(record.id, record);
    return Promise.resolve(record);
  }
}
