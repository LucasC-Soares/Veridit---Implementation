import { z } from 'zod';
import { request } from '@/lib/api/client';
import type { CreditPackage } from '@/types/veridit';

const packageSchema = z.object({
  id: z.string(),
  name: z.string(),
  credits: z.number(),
  price: z.number(),
});
export const creditsService = {
  listPackages: () =>
    request<CreditPackage[]>('/credits/packages', z.array(packageSchema)),
  createPurchase: (packageId: string, billing: Record<string, unknown>) =>
    request('/credits/purchases', z.unknown(), {
      method: 'POST',
      body: JSON.stringify({ packageId, billing }),
    }),
};
