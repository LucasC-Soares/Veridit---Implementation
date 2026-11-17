import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MediaModule } from './modules/media/media.module';
import { StorageModule } from './shared/infrastructure/storage/storage.module';
import { ObservabilityModule } from './shared/infrastructure/observability/observability.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MediaModule,
    StorageModule,
    ObservabilityModule,
  ],
})
export class AppModule {}
