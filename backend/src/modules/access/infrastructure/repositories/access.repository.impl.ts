import { Inject, Injectable } from '@nestjs/common';
import { and, eq, gt, isNull } from 'drizzle-orm';
import {
  createHash,
  createHmac,
  createCipheriv,
  createSecretKey,
  randomBytes,
} from 'node:crypto';
import { DATABASE } from '../../../../database/database.module';
import { Database } from '../../../../database/database.types';
import {
  outboxMessages,
  passwordResetTokens,
  refreshSessions,
  users,
} from '../../../../database/schema';
import {
  AccessRepository,
  CreateUserData,
  PasswordReset,
} from '../../domain/repositories/access.repository';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class AccessRepositoryImpl implements AccessRepository {
  private readonly cpfSecret =
    process.env.CPF_ENCRYPTION_KEY ?? 'development-only-cpf-key';

  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async findByEmail(email: string): Promise<User | null> {
    const [data] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()));
    return data ? this.toEntity(data) : null;
  }

  async createUser(data: CreateUserData): Promise<User> {
    const [created] = await this.db
      .insert(users)
      .values({
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        role: data.role,
        oab: data.oab,
        cpfCiphertext: this.encrypt(data.cpf),
        cpfBlindIndex: this.blind(data.cpf),
      })
      .returning();
    return this.toEntity(created);
  }

  async createSession(
    userId: number,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.db.insert(refreshSessions).values({
      id: randomBytes(24).toString('hex'),
      userId,
      tokenHash: this.hash(token),
      expiresAt,
    });
  }

  async revokeSession(token: string): Promise<void> {
    await this.db
      .update(refreshSessions)
      .set({ revokedAt: new Date() })
      .where(eq(refreshSessions.tokenHash, this.hash(token)));
  }

  async rotateSession(
    token: string,
    replacementToken: string,
    expiresAt: Date,
  ): Promise<User | null> {
    const tokenHash = this.hash(token);
    const [session] = await this.db
      .select({
        sessionId: refreshSessions.id,
        userId: refreshSessions.userId,
        user: users,
      })
      .from(refreshSessions)
      .innerJoin(users, eq(users.id, refreshSessions.userId))
      .where(
        and(
          eq(refreshSessions.tokenHash, tokenHash),
          isNull(refreshSessions.revokedAt),
          gt(refreshSessions.expiresAt, new Date()),
        ),
      );
    if (!session) return null;

    await this.db.transaction(async (tx) => {
      await tx
        .update(refreshSessions)
        .set({ revokedAt: new Date() })
        .where(eq(refreshSessions.id, session.sessionId));
      await tx.insert(refreshSessions).values({
        id: randomBytes(24).toString('hex'),
        userId: session.userId,
        tokenHash: this.hash(replacementToken),
        expiresAt,
      });
    });
    return this.toEntity(session.user);
  }

  async findValidPasswordReset(
    token: string,
    now: Date,
  ): Promise<PasswordReset | null> {
    const [reset] = await this.db
      .select({
        id: passwordResetTokens.id,
        userId: passwordResetTokens.userId,
      })
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, this.hash(token)),
          isNull(passwordResetTokens.usedAt),
          gt(passwordResetTokens.expiresAt, now),
        ),
      );
    return reset ?? null;
  }

  async createPasswordReset(
    userId: number,
    email: string,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.insert(passwordResetTokens).values({
        userId,
        tokenHash: this.hash(token),
        expiresAt,
      });
      await tx.insert(outboxMessages).values({
        topic: 'access.password-reset-requested',
        payload: { email, token },
        correlationId: randomBytes(16).toString('hex'),
      });
    });
  }

  async completePasswordReset(
    resetId: number,
    userId: number,
    passwordHash: string,
  ): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.update(users).set({ passwordHash }).where(eq(users.id, userId));
      await tx
        .update(passwordResetTokens)
        .set({ usedAt: new Date() })
        .where(eq(passwordResetTokens.id, resetId));
      await tx
        .update(refreshSessions)
        .set({ revokedAt: new Date() })
        .where(
          and(
            eq(refreshSessions.userId, userId),
            isNull(refreshSessions.revokedAt),
          ),
        );
    });
  }

  private toEntity(data: typeof users.$inferSelect): User {
    return User.create(data);
  }

  private hash(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  private blind(value: string): string {
    return createHmac('sha256', this.cpfSecret).update(value).digest('hex');
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
