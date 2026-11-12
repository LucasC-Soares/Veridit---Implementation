import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  CREDITS_REPOSITORY,
  CreditsRepository,
} from '../../domain/repositories/credits.repository';
import { PurchaseCreditsDto } from '../dtos/credit.dto';

@Injectable()
export class CreditsService {
  constructor(
    @Inject(CREDITS_REPOSITORY) private readonly repository: CreditsRepository,
  ) {}

  listPackages() {
    return this.repository.listPackages();
  }

  async createPurchase(userId: number, input: PurchaseCreditsDto) {
    const creditPackage = await this.repository.findPackage(input.packageId);
    if (!creditPackage)
      throw new NotFoundException('Pacote de créditos não encontrado.');
    if (!this.isCpfValid(input.cpf))
      throw new BadRequestException('CPF inválido.');
    return this.repository.createPurchase({
      userId,
      packageId: input.packageId,
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      cpf: input.cpf,
      postalCode: input.postalCode,
      address: input.address,
      number: input.number,
      complement: input.complement,
      neighborhood: input.neighborhood,
      city: input.city,
      state: input.state,
      totalCents: creditPackage.credits * creditPackage.pricePerCreditCents,
    });
  }

  private isCpfValid(cpf: string): boolean {
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    const calculate = (length: number) => {
      let sum = 0;
      for (let index = 0; index < length; index += 1)
        sum += Number(cpf[index]) * (length + 1 - index);
      const digit = (sum * 10) % 11;
      return digit === 10 ? 0 : digit;
    };
    return calculate(9) === Number(cpf[9]) && calculate(10) === Number(cpf[10]);
  }
}
