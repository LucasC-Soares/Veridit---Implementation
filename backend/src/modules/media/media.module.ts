import { Module } from '@nestjs/common';
import { MediaService } from './application/media.service';
import { EGRESS_POLICY } from './domain/egress-policy.port';
import { PrivateNetworkEgressPolicy } from './infrastructure/egress-policy';
import { MediaController } from './infrastructure/media.controller';

@Module({
  controllers: [MediaController],
  providers: [
    MediaService,
    PrivateNetworkEgressPolicy,
    { provide: EGRESS_POLICY, useExisting: PrivateNetworkEgressPolicy },
  ],
})
export class MediaModule {}
