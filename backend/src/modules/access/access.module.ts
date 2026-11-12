import { Module } from '@nestjs/common';
import { AccessController } from './infrastructure/controllers/access.controller';
import { AccessService } from './application/services/access.service';
import { Argon2PasswordHasher } from './infrastructure/security/argon2-password.hasher';
import { AccessTokenGuard } from './infrastructure/guards/access-token.guard';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { ForgotPasswordUseCase } from './application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case';
import { ACCESS_REPOSITORY } from './domain/repositories/access.repository';
import { AccessRepositoryImpl } from './infrastructure/repositories/access.repository.impl';
import { RefreshSessionUseCase } from './application/use-cases/refresh-session.use-case';
import { RateLimitGuard } from '../../shared/infrastructure/guards/rate-limit.guard';

@Module({
  controllers: [AccessController],
  providers: [
    AccessService,
    { provide: ACCESS_REPOSITORY, useClass: AccessRepositoryImpl },
    {
      provide: 'PASSWORD_HASHER',
      useClass: Argon2PasswordHasher,
    },
    AccessTokenGuard,
    RegisterUseCase,
    LoginUseCase,
    LogoutUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    RefreshSessionUseCase,
    RateLimitGuard,
  ],
  exports: [AccessTokenGuard],
})
export class AccessModule {}
