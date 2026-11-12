'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

export function ScreenView({ title, eyebrow, children }: {
  title: string; eyebrow: string; children?: ReactNode;
}) {
  return (
    <div className="pg">
      <nav className="bar"><Link className="wm" href="/dashboard">VERIDIT</Link><div className="row" style={{gap: 20}}><Link className="lk" href="/dashboard">INÍCIO</Link><Link className="lk" href="/credits">CRÉDITOS</Link><span className="lk" style={{opacity: .55}}>NOVO REGISTRO</span><span className="lk" style={{opacity: .55}}>MEUS REGISTROS</span><span className="lk">SALDO · 12 CRÉDITOS</span><Link className="lk" href="/profile">Mariana Souza · Advogada</Link><Link className="lk" href="/login">SAIR</Link></div></nav>
      <main className="mn"><header className="hd"><div className="col" style={{gap: 8}}><h1>{title}</h1><p className="mut">{eyebrow}</p></div></header>{children}</main>
    </div>
  );
}

export function FormCard({ children }: { children: ReactNode }) {
  return <div className="form-card">{children}</div>;
}

export function AuthView({ children, action = 'Criar conta', actionHref = '/register' }: { children: ReactNode; action?: string; actionHref?: string }) {
  return (
    <main className="auth-view">
      <nav className="bar"><Link className="wm" href="/login">VERIDIT</Link><Link className="lk" href={actionHref as never}>{action}</Link></nav>
      <div className="auth-content">{children}</div>
    </main>
  );
}
