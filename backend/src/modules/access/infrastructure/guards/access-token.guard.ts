import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { jwtVerify } from 'jose';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  private readonly secret = new TextEncoder().encode(
    process.env.JWT_SECRET ?? 'development-only-change-me',
  );

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: { id: number; role: string };
    }>();
    const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) throw new UnauthorizedException('Autenticação obrigatória.');
    try {
      const { payload } = await jwtVerify(token, this.secret);
      if (!payload.sub) throw new Error('subject ausente');
      request.user = { id: Number(payload.sub), role: String(payload.role) };
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }
  }
}
