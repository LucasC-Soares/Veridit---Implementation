import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  MESSAGE_BROKER,
  MessageBroker,
} from '../../../shared/infrastructure/messaging/message-broker.port';
import { ObservabilityService } from '../../../shared/infrastructure/observability/observability.service';
import { ContentRecord } from '../domain/entities/content-record.entity';
import {
  CAPTURE_REPOSITORY,
  CaptureRepository,
} from '../domain/repositories/capture.repository';

@Injectable()
export class CaptureService {
  constructor(
    @Inject(CAPTURE_REPOSITORY) private readonly repository: CaptureRepository,
    @Inject(MESSAGE_BROKER) private readonly broker: MessageBroker,
    private readonly observability: ObservabilityService,
  ) {}

  async create(userId: number, title: string, siteUrl: string) {
    const record = await this.repository.create(
      new ContentRecord(0, userId, title, siteUrl),
    );
    await this.broker.publish({
      id: randomUUID(),
      topic: 'capture.requested',
      correlationId: this.observability.correlationId(),
      payload: { recordId: record.id, userId, siteUrl },
    });
    return record;
  }

  async list(userId: number) {
    return this.repository.listByUser(userId);
  }

  async get(userId: number, id: number) {
    const record = await this.repository.findById(id);
    if (record?.userId !== userId) {
      throw new NotFoundException('Registro não encontrado.');
    }
    return record;
  }
}
