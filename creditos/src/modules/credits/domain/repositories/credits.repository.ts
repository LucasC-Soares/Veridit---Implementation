import { CreditPackage } from '../entities/credit-package.entity';
import { CreditPurchase } from '../entities/credit-purchase.entity';

export const CREDITS_REPOSITORY = Symbol('CREDITS_REPOSITORY');

export type CreatePurchaseData = {
  userId: number;
  packageId: number;
  fullName: string;
  email: string;
  phone: string;
  cpf: string;
  postalCode: string;
  address: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  totalCents: number;
};

export interface CreditsRepository {
  listPackages(): Promise<CreditPackage[]>;
  findPackage(id: number): Promise<CreditPackage | null>;
  createPurchase(data: CreatePurchaseData): Promise<CreditPurchase>;
}
