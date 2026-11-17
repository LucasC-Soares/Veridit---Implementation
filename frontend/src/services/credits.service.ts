import { z } from 'zod';
import { request } from '@/lib/api/client';
import type {
  CreditBilling,
  CreditPackage,
  CreditPurchase,
} from '@/types/veridit';

const packageSchema = z.object({
  id: z.number(),
  name: z.string(),
  credits: z.number(),
  pricePerCreditCents: z.number(),
  benefitsDescription: z.string(),
});

const purchaseSchema = z.object({
  id: z.number(),
  packageId: z.number(),
  totalCents: z.number(),
  status: z.string(),
  createdAt: z.string(),
});

export const creditsService = {
  listPackages: () =>
    request<CreditPackage[]>('/credits/packages', z.array(packageSchema)),
  createPurchase: (packageId: number, billing: CreditBilling) =>
    request<CreditPurchase>('/credits/purchases', purchaseSchema, {
      method: 'POST',
      body: JSON.stringify({ packageId, ...billing }),
    }),
};
