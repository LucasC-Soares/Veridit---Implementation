import { Injectable } from '@nestjs/common';
import { CreditsService } from '../services/credits.service';

@Injectable()
export class GetCreditBalanceUseCase {
  constructor(private readonly service: CreditsService) {}

  async execute(userId: number) {
    return {
      success: true,
      data: { balance: await this.service.getBalance(userId) },
      message: 'Saldo de créditos retornado com sucesso.',
    };
  }
}
