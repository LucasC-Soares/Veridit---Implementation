import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { SignJWT } from 'jose';
import {
  AccessRepository,
  ACCESS_REPOSITORY,
  CreateUserData,
} from '../../domain/repositories/access.repository';
import { PasswordHasher } from '../../infrastructure/security/argon2-password.hasher';
import { RegisterDto, RegistrationRole } from '../dtos/access.dto';

const ACCESS_TTL_SECONDS = 15 * 60;
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;

@Injectable()
export class AccessService {
  private readonly jwtSecret = new TextEncoder().encode(
    process.env.JWT_SECRET ?? 'development-only-change-me',
  );

  constructor(
    @Inject(ACCESS_REPOSITORY) private readonly repository: AccessRepository,
    @Inject('PASSWORD_HASHER') private readonly passwordHasher: PasswordHasher,
  ) {}

  async register(input: RegisterDto) {
    if (input.role === RegistrationRole.LAWYER && !input.oab) {
      throw new UnauthorizedException('OAB é obrigatória para advogados.');
    }
    if (await this.repository.findByEmail(input.email)) {
      throw new UnauthorizedException('Email já cadastrado.');
    }
    const data: CreateUserData = {
      name: input.name,
      email: input.email,
      passwordHash: await this.passwordHasher.hash(input.password),
      role: input.role,
      cpf: input.cpf,
      oab: input.oab,
    };
    return this.repository.createUser(data);
  }

  async login(email: string, password: string) {
    const user = await this.repository.findByEmail(email);
    if (
      !user ||
      !(await this.passwordHasher.verify(user.passwordHash, password))
    ) {
      throw new UnauthorizedException('Email ou senha inválidos.');
    }

    const refreshToken = randomBytes(48).toString('base64url');
    await this.repository.createSession(
      user.id,
      refreshToken,
      new Date(Date.now() + REFRESH_TTL_MS),
    );
    return {
      accessToken: await this.createAccessToken(user.id, user.role),
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async refresh(refreshToken: string) {
    const replacementToken = randomBytes(48).toString('base64url');
    const user = await this.repository.rotateSession(
      refreshToken,
      replacementToken,
      new Date(Date.now() + REFRESH_TTL_MS),
    );
    if (!user) return null;
    return {
      accessToken: await this.createAccessToken(user.id, user.role),
      refreshToken: replacementToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  logout(refreshToken: string): Promise<void> {
    return this.repository.revokeSession(refreshToken);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.repository.findByEmail(email);
    if (!user) return;
    await this.repository.createPasswordReset(
      user.id,
      user.email,
      randomBytes(32).toString('base64url'),
      new Date(Date.now() + 30 * 60 * 1000),
    );
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const reset = await this.repository.findValidPasswordReset(
      token,
      new Date(),
    );
    if (!reset) throw new UnauthorizedException('Token inválido ou expirado.');
    await this.repository.completePasswordReset(
      reset.id,
      reset.userId,
      await this.passwordHasher.hash(password),
    );
  }

  private createAccessToken(userId: number, role: string) {
    return new SignJWT({ role })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(String(userId))
      .setIssuedAt()
      .setExpirationTime(`${ACCESS_TTL_SECONDS}s`)
      .sign(this.jwtSecret);
  }
}
