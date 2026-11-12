import { Module } from '@nestjs/common';
import { CaptureService } from './application/capture.service';
import { CAPTURE_REPOSITORY } from './domain/repositories/capture.repository';
import { CaptureController } from './infrastructure/controllers/capture.controller';
import { InMemoryCaptureRepository } from './infrastructure/in-memory-capture.repository';

@Module({
  controllers: [CaptureController],
  providers: [
    CaptureService,
    InMemoryCaptureRepository,
    { provide: CAPTURE_REPOSITORY, useExisting: InMemoryCaptureRepository },
  ],
})
export class CaptureModule {}
