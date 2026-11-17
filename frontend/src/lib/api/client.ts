import { z } from 'zod';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function request<T>(
  path: string,
  schema: z.ZodType<T>,
  init?: RequestInit,
): Promise<T> {
  const accessToken =
    typeof window !== 'undefined'
      ? window.localStorage.getItem('veridit.accessToken')
      : null;
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new Error(
      'Não foi possível conectar ao servidor. Verifique se a API está em execução e tente novamente.',
    );
  }
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.success) {
    throw new Error(body?.message ?? 'Não foi possível concluir a operação.');
  }
  return schema.parse(body.data);
}

export const emptySchema = z.unknown();
