'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { accessService } from '@/services/access.service';
import { AuthView } from './screen-view';

export function AuthForm({ mode }: { mode: 'register' | 'login' | 'forgot' }) {
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  if (mode === 'forgot') {
    return (
      <AuthView action="Entrar" actionHref="/login">
        <header className="hd">
          <div className="col" style={{ gap: 8 }}>
            <h1>Recuperar senha</h1>
            <p className="mut">Duas situações da mesma tela.</p>
          </div>
        </header>
        <div className="row" style={{ gap: 36 }}>
          <form
            className="box col"
            style={{ flex: '1 1 420px' }}
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitted(true);
            }}
          >
            <h3>Situação 1 · pedir o link</h3>
            <div className="fld">
              <label className="lb" htmlFor="email">E-mail da conta</label>
              <input className="in" id="email" type="email" placeholder="nome@exemplo.com" />
            </div>
            <button className="btn pri" type="submit">Enviar link de recuperação</button>
            {submitted && <p className="success">Solicitação enviada.</p>}
            <Link className="lk" href="/login">Voltar ao login</Link>
          </form>
          <div className="box dash col" style={{ flex: '1 1 420px' }}>
            <h3>Situação 2 · depois de enviar</h3>
            <h2>Confira seu e-mail</h2>
            <p>Se o endereço estiver cadastrado, enviamos um link para criar uma nova senha.</p>
            <Link className="btn sec" href="/login">Voltar ao login</Link>
          </div>
        </div>
      </AuthView>
    );
  }

  if (mode === 'register') {
    return (
      <AuthView action="Já tenho conta" actionHref="/login">
        <form
          className="box col"
          style={{ flex: '2 1 560px', gap: 22 }}
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(true);
          }}
        >
          <div className="hd"><h1>Criar conta</h1></div>
          <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
            <legend className="lb">Tipo de conta</legend>
            <div className="row" style={{ gap: 28 }}>
              <label className="rd" htmlFor="tipo-comum">
                <input type="radio" name="tipo" id="tipo-comum" defaultChecked />
                Usuário comum
              </label>
              <label className="rd" htmlFor="tipo-adv">
                <input type="radio" name="tipo" id="tipo-adv" />
                Advogado
              </label>
            </div>
          </fieldset>
          <div className="g2">
            <div className="fld">
              <label className="lb" htmlFor="nome">Nome completo</label>
              <input className="in" id="nome" type="text" />
            </div>
            <div className="fld">
              <label className="lb" htmlFor="email">E-mail</label>
              <input className="in" id="email" type="email" placeholder="nome@exemplo.com" />
            </div>
            <div className="fld">
              <label className="lb" htmlFor="senha">Senha</label>
              <input className="in" id="senha" type="password" />
            </div>
            <div className="fld">
              <label className="lb" htmlFor="cpf">CPF</label>
              <input className="in" id="cpf" type="text" placeholder="000.000.000-00" />
            </div>
          </div>
          <div className="box dash" style={{ padding: 16 }}>
            <div className="fld">
              <label className="lb" htmlFor="oab">Número da OAB</label>
              <input className="in" id="oab" type="text" />
            </div>
          </div>
          <button className="btn pri" type="submit">Criar conta</button>
          {submitted && <p className="success">Conta criada. Você já pode entrar.</p>}
        </form>
      </AuthView>
    );
  }

  return (
    <AuthView>
      <div className="row" style={{ justifyContent: 'center', gap: 56, paddingTop: 24 }}>
        <LoginForm
          onSuccess={() => router.replace('/dashboard')}
        />
      </div>
    </AuthView>
  );
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setLoading(true);
    try {
      await accessService.login(email, password);
      onSuccess();
    } catch (cause: unknown) {
      setError(
        cause instanceof Error ? cause.message : 'Não foi possível entrar.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
          className="box col"
          style={{ flex: '0 1 460px', gap: 20 }}
          onSubmit={submit}
        >
          <div className="hd"><h1>Entrar</h1></div>
          <div className="fld">
            <label className="lb" htmlFor="email">E-mail</label>
            <input className="in" id="email" type="email" placeholder="nome@exemplo.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>
          <div className="fld">
            <label className="lb" htmlFor="senha">Senha</label>
            <input className="in" id="senha" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </div>
          <button className="btn pri full" type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
          {error && <p className="error">{error}</p>}
          <div className="row" style={{ justifyContent: 'space-between', gap: 12 }}>
            <Link className="lk" href="/forgot-password">Esqueci minha senha</Link>
            <Link className="lk" href="/register">Criar conta</Link>
          </div>
        </form>
  );
}
