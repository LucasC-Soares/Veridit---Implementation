import { z } from 'zod';
import { request } from '@/lib/api/client';
import type { User } from '@/types/veridit';

const sessionSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z
    .object({
      id: z.number(),
      name: z.string(),
      email: z.string(),
      role: z.enum(['LAWYER', 'COMMON']),
    }),
});

function saveSession(session: z.infer<typeof sessionSchema>) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('veridit.accessToken', session.accessToken);
    window.localStorage.setItem('veridit.refreshToken', session.refreshToken);
  }
  return session;
}

export const accessService = {
  register: (input: Record<string, unknown>) =>
    request('/auth/register', sessionSchema, {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  login: async (email: string, password: string) =>
    saveSession(await request('/auth/login', sessionSchema, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })),
  logout: async () => {
    const refreshToken =
      typeof window !== 'undefined'
        ? window.localStorage.getItem('veridit.refreshToken')
        : null;
    const result = await request('/auth/logout', z.unknown(), {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('veridit.accessToken');
      window.localStorage.removeItem('veridit.refreshToken');
    }
    return result;
  },
  refresh: async () => {
    const refreshToken =
      typeof window !== 'undefined'
        ? window.localStorage.getItem('veridit.refreshToken')
        : null;
    if (!refreshToken) throw new Error('Sessão não encontrada.');
    return saveSession(await request('/auth/refresh', sessionSchema, {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }));
  },
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
