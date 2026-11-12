import { Module } from '@nestjs/common';
import { AccessModule } from '../access/access.module';
import { CreditsController } from './infrastructure/controllers/credits.controller';
import { CreditsService } from './application/services/credits.service';
import { ListCreditPackagesUseCase } from './application/use-cases/list-credit-packages.use-case';
import { CreateCreditPurchaseUseCase } from './application/use-cases/create-credit-purchase.use-case';
import { CREDITS_REPOSITORY } from './domain/repositories/credits.repository';
import { CreditsRepositoryImpl } from './infrastructure/repositories/credits.repository.impl';

@Module({
  imports: [AccessModule],
  controllers: [CreditsController],
  providers: [
    CreditsService,
    { provide: CREDITS_REPOSITORY, useClass: CreditsRepositoryImpl },
    ListCreditPackagesUseCase,
    CreateCreditPurchaseUseCase,
  ],
})
export class CreditsModule {}
