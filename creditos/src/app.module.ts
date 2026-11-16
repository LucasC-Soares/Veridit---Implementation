import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { CreditsModule } from './modules/credits/credits.module';
import { ObservabilityModule } from './shared/infrastructure/observability/observability.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    CreditsModule,
    ObservabilityModule,
  ],
})
export class AppModule {}
