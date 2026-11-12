export class CreditPackage {
  private constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly credits: number,
    public readonly pricePerCreditCents: number,
    public readonly benefitsDescription: string,
  ) {}

  static create(data: {
    id: number;
    name: string;
    credits: number;
    pricePerCreditCents: number;
    benefitsDescription: string;
  }): CreditPackage {
    return new CreditPackage(
      data.id,
      data.name,
      data.credits,
      data.pricePerCreditCents,
      data.benefitsDescription,
    );
  }
}
