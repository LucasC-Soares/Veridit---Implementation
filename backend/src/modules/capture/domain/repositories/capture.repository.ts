import { ContentRecord } from '../entities/content-record.entity';

export const CAPTURE_REPOSITORY = Symbol('CAPTURE_REPOSITORY');

export interface CaptureRepository {
  create(record: ContentRecord): Promise<ContentRecord>;
  findById(id: number): Promise<ContentRecord | null>;
  listByUser(userId: number): Promise<ContentRecord[]>;
  update(record: ContentRecord): Promise<ContentRecord>;
}
