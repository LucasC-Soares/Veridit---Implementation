import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CaptureModule } from './modules/capture/capture.module';
import { MessagingModule } from './shared/infrastructure/messaging/messaging.module';
import { ObservabilityModule } from './shared/infrastructure/observability/observability.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CaptureModule,
    MessagingModule,
    ObservabilityModule,
  ],
})
export class AppModule {}
