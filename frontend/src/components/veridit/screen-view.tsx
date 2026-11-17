'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { accessService } from '@/services/access.service';

export function ScreenView({ title, eyebrow, active = 'home', children }: {
  title: string; eyebrow: string; active?: 'home' | 'credits' | 'capture' | 'records'; children?: ReactNode;
}) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (!window.localStorage.getItem('veridit.accessToken')) {
      router.replace('/login');
      return;
    }
    setAuthenticated(true);
  }, [router]);

  if (!authenticated) return null;

  return (
    <div className="pg">
      <PrimaryNav active={active} />
      <main className="mn">
        <header className="hd">
          <div className="col" style={{ gap: 8 }}>
            <h1>{title}</h1>
            <p className="mut">{eyebrow}</p>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

export function PrimaryNav({ active }: { active: 'home' | 'credits' | 'capture' | 'records' }) {
  const router = useRouter();
  const [userName, setUserName] = useState('Usuário');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const rawUser = window.localStorage.getItem('veridit.user');
    if (!rawUser) return;
    try {
      const user = JSON.parse(rawUser) as { name?: string; role?: string };
      setUserName(user.name ?? 'Usuário');
      setUserRole(user.role === 'LAWYER' ? 'Advogado' : 'Usuário comum');
    } catch {
      window.localStorage.removeItem('veridit.user');
    }
  }, []);

  async function logout() {
    await accessService.logout();
    router.replace('/login');
  }

  const links = [
    { key: 'home', label: 'Início', href: '/dashboard' },
    { key: 'credits', label: 'Créditos', href: '/credits' },
    { key: 'capture', label: 'Novo registro', href: '/capture' },
    { key: 'records', label: 'Meus registros', href: '/records' },
  ] as const;

  return (
    <nav className="bar" aria-label="Principal">
      <Link className="wm" href="/dashboard">VERIDIT</Link>
      {links.map((link) => (
        <Link
          className={`nav-link${active === link.key ? ' active' : ''}`}
          href={link.href}
          key={link.key}
        >
          {link.label}
        </Link>
      ))}
      <div className="nav-spacer" />
      <Link className="nav-balance" href="/credits">Saldo · 12 créditos</Link>
      <span className="nav-user">{userName}{userRole ? ` · ${userRole}` : ''}</span>
      <button className="nav-logout" type="button" onClick={() => void logout()}>Sair</button>
    </nav>
  );
}

export function FormCard({ children }: { children: ReactNode }) {
  return <div className="form-card">{children}</div>;
}

export function AuthView({ children, action = 'Criar conta', actionHref = '/register' }: {
  children: ReactNode;
  action?: string;
  actionHref?: '/login' | '/register';
}) {
  return (
    <main className="pg">
      <nav className="bar">
        <Link className="wm" href="/login">VERIDIT</Link>
        <Link className="lk" href={actionHref}>{action}</Link>
      </nav>
      <div className="auth-content">{children}</div>
    </main>
  );
}
