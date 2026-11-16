import { Injectable } from '@nestjs/common';
import {
  CreditPackageResponseData,
  ListCreditPackagesResponseDto,
} from '../dtos/credit.dto';
import { CreditsService } from '../services/credits.service';

@Injectable()
export class ListCreditPackagesUseCase {
  constructor(private readonly service: CreditsService) {}

  async execute(): Promise<ListCreditPackagesResponseDto> {
    const packages = await this.service.listPackages();
    const data: CreditPackageResponseData[] = packages.map((item) => ({
      id: item.id,
      name: item.name,
      credits: item.credits,
      pricePerCreditCents: item.pricePerCreditCents,
      benefitsDescription: item.benefitsDescription,
    }));
    return { success: true, data, message: 'Pacotes retornados com sucesso.' };
  }
}
