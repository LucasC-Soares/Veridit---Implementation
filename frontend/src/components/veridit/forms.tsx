'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { accessService } from '@/services/access.service';
import { AuthView } from './screen-view';

export function AuthForm({ mode }: { mode: 'register' | 'login' | 'forgot' }) {
  const router = useRouter();

  if (mode === 'forgot') {
    return (
      <AuthView action="Entrar" actionHref="/login">
        <ForgotPasswordForm />
      </AuthView>
    );
  }

  if (mode === 'register') {
    return (
      <AuthView action="Já tenho conta" actionHref="/login">
        <RegisterForm />
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

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setSubmitted(false);
    setLoading(true);
    try {
      await accessService.forgotPassword(email);
      setSubmitted(true);
    } catch (cause: unknown) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Não foi possível solicitar a recuperação.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <header className="hd">
        <div className="col" style={{ gap: 8 }}>
          <h1>Recuperar senha</h1>
          <p className="mut">Enviaremos um link para o e-mail informado.</p>
        </div>
      </header>
      <div className="row" style={{ gap: 36 }}>
        <form className="box col" style={{ flex: '1 1 420px' }} onSubmit={submit}>
          <h3>Solicitar link</h3>
          <div className="fld">
            <label className="lb" htmlFor="email">E-mail da conta</label>
            <input className="in" id="email" type="email" placeholder="nome@exemplo.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>
          <button className="btn pri" type="submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar link de recuperação'}
          </button>
          {error && <p className="error">{error}</p>}
          {submitted && <p className="success">Confira o e-mail informado para redefinir sua senha.</p>}
          <Link className="lk" href="/login">Voltar ao login</Link>
        </form>
      </div>
    </>
  );
}

function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cpf, setCpf] = useState('');
  const [oab, setOab] = useState('');
  const [role, setRole] = useState<'COMMON' | 'LAWYER'>('COMMON');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setSubmitted(false);
    setLoading(true);
    try {
      await accessService.register({
        name,
        email,
        password,
        role,
        cpf: cpf.replace(/\D/g, ''),
        ...(oab.trim() ? { oab: oab.trim() } : {}),
      });
      setSubmitted(true);
      setPassword('');
    } catch (cause: unknown) {
      setError(
        cause instanceof Error ? cause.message : 'Não foi possível criar a conta.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="box col"
      style={{ flex: '2 1 560px', gap: 22 }}
      onSubmit={submit}
    >
      <div className="hd"><h1>Criar conta</h1></div>
      <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
        <legend className="lb">Tipo de conta</legend>
        <div className="row" style={{ gap: 28 }}>
          <label className="rd" htmlFor="tipo-comum">
            <input
              type="radio"
              name="tipo"
              id="tipo-comum"
              value="COMMON"
              checked={role === 'COMMON'}
              onChange={() => setRole('COMMON')}
            />
            Usuário comum
          </label>
          <label className="rd" htmlFor="tipo-adv">
            <input
              type="radio"
              name="tipo"
              id="tipo-adv"
              value="LAWYER"
              checked={role === 'LAWYER'}
              onChange={() => setRole('LAWYER')}
            />
            Advogado
          </label>
        </div>
      </fieldset>
      <div className="g2">
        <div className="fld">
          <label className="lb" htmlFor="nome">Nome completo</label>
          <input className="in" id="nome" type="text" value={name} onChange={(event) => setName(event.target.value)} required />
        </div>
        <div className="fld">
          <label className="lb" htmlFor="email">E-mail</label>
          <input className="in" id="email" type="email" placeholder="nome@exemplo.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </div>
        <div className="fld">
          <label className="lb" htmlFor="senha">Senha</label>
          <input className="in" id="senha" type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required />
        </div>
        <div className="fld">
          <label className="lb" htmlFor="cpf">CPF</label>
          <input className="in" id="cpf" type="text" inputMode="numeric" placeholder="000.000.000-00" value={cpf} onChange={(event) => setCpf(event.target.value)} required />
        </div>
      </div>
      <div className="box dash" style={{ padding: 16 }}>
        <div className="fld">
          <label className="lb" htmlFor="oab">Número da OAB</label>
          <input className="in" id="oab" type="text" value={oab} onChange={(event) => setOab(event.target.value)} required={role === 'LAWYER'} />
        </div>
      </div>
      <button className="btn pri" type="submit" disabled={loading}>
        {loading ? 'Criando conta...' : 'Criar conta'}
      </button>
      {error && <p className="error">{error}</p>}
      {submitted && <p className="success">Conta criada. Você já pode entrar.</p>}
    </form>
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
