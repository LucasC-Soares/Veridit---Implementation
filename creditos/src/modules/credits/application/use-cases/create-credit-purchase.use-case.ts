import { Injectable } from '@nestjs/common';
import {
  CreateCreditPurchaseResponseDto,
  PurchaseCreditsDto,
} from '../dtos/credit.dto';
import { CreditsService } from '../services/credits.service';

@Injectable()
export class CreateCreditPurchaseUseCase {
  constructor(private readonly service: CreditsService) {}

  async execute(
    userId: number,
    input: PurchaseCreditsDto,
  ): Promise<CreateCreditPurchaseResponseDto> {
    return {
      success: true,
      data: await this.service.createPurchase(userId, input),
      message: 'Compra criada e aguardando pagamento.',
    };
  }
}
