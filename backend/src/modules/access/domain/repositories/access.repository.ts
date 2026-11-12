import { User } from '../entities/user.entity';

export const ACCESS_REPOSITORY = Symbol('ACCESS_REPOSITORY');

export type CreateUserData = {
  name: string;
  email: string;
  passwordHash: string;
  role: 'LAWYER' | 'COMMON';
  cpf: string;
  oab?: string;
};

export type PasswordReset = { id: number; userId: number };

export interface AccessRepository {
  findByEmail(email: string): Promise<User | null>;
  createUser(data: CreateUserData): Promise<User>;
  createSession(userId: number, token: string, expiresAt: Date): Promise<void>;
  revokeSession(token: string): Promise<void>;
  rotateSession(
    token: string,
    replacementToken: string,
    expiresAt: Date,
  ): Promise<User | null>;
  findValidPasswordReset(
    token: string,
    now: Date,
  ): Promise<PasswordReset | null>;
  createPasswordReset(
    userId: number,
    email: string,
    token: string,
    expiresAt: Date,
  ): Promise<void>;
  completePasswordReset(
    resetId: number,
    userId: number,
    passwordHash: string,
  ): Promise<void>;
}
