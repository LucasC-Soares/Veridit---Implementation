import { z } from 'zod';
import { request } from '@/lib/api/client';
import type { User } from '@/types/veridit';

const sessionSchema = z.object({
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  user: z
    .object({ id: z.string(), name: z.string(), email: z.string() })
    .optional(),
});

export const accessService = {
  register: (input: Record<string, unknown>) =>
    request('/auth/register', sessionSchema, {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  login: (email: string, password: string) =>
    request('/auth/login', sessionSchema, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  logout: () => request('/auth/logout', z.unknown(), { method: 'POST' }),
  refresh: () => request('/auth/refresh', sessionSchema, { method: 'POST' }),
  forgotPassword: (email: string) =>
    request('/auth/forgot-password', z.unknown(), {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  resetPassword: (token: string, password: string) =>
    request('/auth/reset-password', z.unknown(), {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    }),
  updateProfile: (input: Partial<User>) =>
    request('/auth/profile', z.unknown(), {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
};
