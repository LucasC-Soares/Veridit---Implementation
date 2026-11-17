import { Module } from '@nestjs/common';
import { AccessTokenGuard } from '../access/infrastructure/guards/access-token.guard';
import { CreditsController } from './infrastructure/controllers/credits.controller';
import { CreditsService } from './application/services/credits.service';
import { ListCreditPackagesUseCase } from './application/use-cases/list-credit-packages.use-case';
import { CreateCreditPurchaseUseCase } from './application/use-cases/create-credit-purchase.use-case';
import { GetCreditBalanceUseCase } from './application/use-cases/get-credit-balance.use-case';
import { CREDITS_REPOSITORY } from './domain/repositories/credits.repository';
import { CreditsRepositoryImpl } from './infrastructure/repositories/credits.repository.impl';

@Module({
  controllers: [CreditsController],
  providers: [
    AccessTokenGuard,
    CreditsService,
    { provide: CREDITS_REPOSITORY, useClass: CreditsRepositoryImpl },
    ListCreditPackagesUseCase,
    CreateCreditPurchaseUseCase,
    GetCreditBalanceUseCase,
  ],
})
export class CreditsModule {}
