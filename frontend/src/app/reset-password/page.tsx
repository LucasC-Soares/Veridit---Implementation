'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { accessService } from '@/services/access.service';

export default function ResetPasswordPage() {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get('token') ?? '');
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    try {
      await accessService.resetPassword(token, password);
      setSubmitted(true);
      setPassword('');
    } catch (cause: unknown) {
      setError(
        cause instanceof Error ? cause.message : 'Não foi possível redefinir a senha.',
      );
    }
  }

  return (
    <main className="pg">
      <nav className="bar">
        <Link className="wm" href="/login">VERIDIT</Link>
      </nav>
      <div className="auth-content">
        <form className="box col" style={{ maxWidth: 460 }} onSubmit={submit}>
          <h1>Redefinir senha</h1>
          <div className="fld">
            <label className="lb" htmlFor="password">Nova senha</label>
            <input className="in" id="password" type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required />
          </div>
          <button className="btn pri" type="submit" disabled={!token}>Salvar nova senha</button>
          {error && <p className="error">{error}</p>}
          {submitted && (
            <p className="success">
              Senha redefinida. <Link className="lk" href="/login">Entrar</Link>
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
