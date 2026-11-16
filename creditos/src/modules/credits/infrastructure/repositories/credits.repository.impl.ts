import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import {
  createCipheriv,
  createHash,
  createHmac,
  createSecretKey,
  randomBytes,
} from 'node:crypto';
import { DATABASE } from '../../../../database/database.module';
import { Database } from '../../../../database/database.types';
import { creditPackages, creditPurchases } from '../../../../database/schema';
import { CreditPackage } from '../../domain/entities/credit-package.entity';
import { CreditPurchase } from '../../domain/entities/credit-purchase.entity';
import {
  CreatePurchaseData,
  CreditsRepository,
} from '../../domain/repositories/credits.repository';

@Injectable()
export class CreditsRepositoryImpl implements CreditsRepository {
  private readonly cpfSecret =
    process.env.CPF_ENCRYPTION_KEY ?? 'development-only-cpf-key';

  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async listPackages(): Promise<CreditPackage[]> {
    const rows = await this.db
      .select()
      .from(creditPackages)
      .where(eq(creditPackages.active, 1));
    return rows.map((row) => CreditPackage.create(row));
  }

  async findPackage(id: number): Promise<CreditPackage | null> {
    const [row] = await this.db
      .select()
      .from(creditPackages)
      .where(eq(creditPackages.id, id));
    return row?.active === 1 ? CreditPackage.create(row) : null;
  }

  async createPurchase(data: CreatePurchaseData): Promise<CreditPurchase> {
    const [row] = await this.db
      .insert(creditPurchases)
      .values({
        userId: data.userId,
        packageId: data.packageId,
        fullName: data.fullName,
        email: data.email.toLowerCase(),
        phone: data.phone,
        cpfCiphertext: this.encrypt(data.cpf),
        cpfBlindIndex: createHmac('sha256', this.cpfSecret)
          .update(data.cpf)
          .digest('hex'),
        postalCode: data.postalCode,
        address: data.address,
        number: data.number,
        complement: data.complement,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state.toUpperCase(),
        totalCents: data.totalCents,
      })
      .returning();
    return CreditPurchase.create(row);
  }

  private encrypt(value: string): string {
    const key = createSecretKey(
      createHash('sha256').update(this.cpfSecret).digest(),
    );
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([
      cipher.update(value, 'utf8'),
      cipher.final(),
    ]);
    return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString(
      'base64url',
    );
  }
}
