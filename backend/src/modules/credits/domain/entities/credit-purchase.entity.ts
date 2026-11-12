export class CreditPurchase {
  private constructor(
    public readonly id: number,
    public readonly packageId: number,
    public readonly totalCents: number,
    public readonly status: string,
    public readonly createdAt: Date,
  ) {}

  static create(data: {
    id: number;
    packageId: number;
    totalCents: number;
    status: string;
    createdAt: Date;
  }): CreditPurchase {
    return new CreditPurchase(
      data.id,
      data.packageId,
      data.totalCents,
      data.status,
      data.createdAt,
    );
  }
}
