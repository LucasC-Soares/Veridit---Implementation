import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AccessModule } from './modules/access/access.module';
import { ObservabilityModule } from './shared/infrastructure/observability/observability.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AccessModule,
    ObservabilityModule,
  ],
})
export class AppModule {}
