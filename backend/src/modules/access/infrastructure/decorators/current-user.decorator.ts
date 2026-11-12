import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type AuthenticatedUser = { id: number; role: string };

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    return context.switchToHttp().getRequest<{ user: AuthenticatedUser }>()
      .user;
  },
);
