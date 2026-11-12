import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';

type Attempt = { count: number; resetAt: number };

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly attempts = new Map<string, Attempt>();
  private readonly windowMs = 15 * 60 * 1000;
  private readonly maxAttempts = 5;

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      ip?: string;
      headers: { 'x-forwarded-for'?: string };
      route?: { path?: string };
    }>();
    const address =
      request.headers['x-forwarded-for']?.split(',')[0] ??
      request.ip ??
      'unknown';
    const key = `${address}:${request.route?.path ?? 'unknown'}`;
    const now = Date.now();
    const current = this.attempts.get(key);
    if (!current || current.resetAt <= now) {
      this.attempts.set(key, { count: 1, resetAt: now + this.windowMs });
      return true;
    }
    if (current.count >= this.maxAttempts) {
      throw new HttpException(
        'Muitas tentativas. Tente novamente mais tarde.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    current.count += 1;
    return true;
  }
}
