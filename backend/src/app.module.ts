import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AccessModule } from './modules/access/access.module';
import { CreditsModule } from './modules/credits/credits.module';
import { NotificationModule } from './modules/notification/notification.module';
import { MessagingModule } from './shared/infrastructure/messaging/messaging.module';
import { StorageModule } from './shared/infrastructure/storage/storage.module';
import { ObservabilityModule } from './shared/infrastructure/observability/observability.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AccessModule,
    CreditsModule,
    NotificationModule,
    MessagingModule,
    StorageModule,
    ObservabilityModule,
  ],
})
export class AppModule {}
