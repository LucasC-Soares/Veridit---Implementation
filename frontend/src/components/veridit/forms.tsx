'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthView } from './screen-view';

export function AuthForm({ mode }: { mode: 'register' | 'login' | 'forgot' }) {
  const [submitted, setSubmitted] = useState(false);
  if (mode === 'forgot') {
    return <AuthView action="Entrar" actionHref="/login"><form className="box col auth-form">
      <div className="hd"><h1>Recuperar senha</h1></div>
      <p className="muted">Duas situações da mesma tela.</p>
      <div className="fld"><label className="lb">E-mail da conta</label><input className="in" type="email" placeholder="nome@exemplo.com" /></div>
      <button className="btn pri" onClick={() => setSubmitted(true)}>Enviar link de recuperação</button>
      {submitted && <div className="notice"><strong>Confira seu e-mail</strong><p>Se o endereço estiver cadastrado, enviamos um link para criar uma nova senha.</p></div>}
      <Link className="lk" href="/login">Voltar ao login</Link>
    </form></AuthView>;
  }
  if (mode === 'register') {
    return <AuthView action="Já tenho conta" actionHref="/login"><form className="box col auth-form register">
      <div className="hd"><h1>Criar conta</h1></div>
      <fieldset style={{border: 0, margin: 0, padding: 0}}><legend className="lb">Tipo de conta</legend><div className="row" style={{gap: 28}}><label className="rd"><input type="radio" name="tipo" defaultChecked />Usuário comum</label><label className="rd"><input type="radio" name="tipo" />Advogado</label></div></fieldset>
      <div className="g2"><div className="fld"><label className="lb">Nome completo</label><input className="in" /></div><div className="fld"><label className="lb">E-mail</label><input className="in" type="email" placeholder="nome@exemplo.com" /></div><div className="fld"><label className="lb">Senha</label><input className="in" type="password" /></div><div className="fld"><label className="lb">CPF</label><input className="in" placeholder="000.000.000-00" /></div></div>
      <div className="box dash" style={{padding: 16}}><label className="lb">Número da OAB</label><input className="in" /></div>
      <button className="btn pri" onClick={() => setSubmitted(true)}>Criar conta</button>
      {submitted && <p className="success">Conta criada. Você já pode entrar.</p>}
    </form></AuthView>;
  }
  return <AuthView><form className="box col auth-form">
    <div className="hd"><h1>Entrar</h1></div>
    <div className="fld"><label className="lb">E-mail</label><input className="in" type="email" placeholder="nome@exemplo.com" /></div>
    <div className="fld"><label className="lb">Senha</label><input className="in" type="password" /></div>
    <button className="btn pri full" onClick={() => setSubmitted(true)}>Entrar</button>
    {submitted && <p className="success">Acesso autorizado.</p>}
    <div className="row" style={{justifyContent: 'space-between', gap: 12}}><Link className="lk" href="/forgot-password">Esqueci minha senha</Link><Link className="lk" href="/register">Criar conta</Link></div>
  </form></AuthView>;
}
