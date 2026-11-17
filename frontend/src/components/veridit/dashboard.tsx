'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ScreenView } from './screen-view';

export function Dashboard() {
  const [name, setName] = useState('usuário');

  useEffect(() => {
    const rawUser = window.localStorage.getItem('veridit.user');
    if (!rawUser) return;
    try {
      setName(JSON.parse(rawUser).name ?? 'usuário');
    } catch {
      window.localStorage.removeItem('veridit.user');
    }
  }, []);

  return <ScreenView eyebrow="O que você quer fazer agora?" title={`Olá, ${name}`}>
    <div className="row" style={{ gap: 28 }}>
      <div className="col" style={{ flex: '2 1 520px', gap: 28 }}>
        <section className="box dash col" aria-label="Novo registro">
          <h2>Registrar um conteúdo</h2>
          <p>Informe o endereço do site; a captura roda no servidor, em ambiente isolado.</p>
          <div><Link className="btn pri" href="/capture">Novo registro</Link></div>
        </section>
        <section className="box col" aria-label="Últimos registros">
          <h2>Últimos registros</h2>
          <p className="mut">Você ainda não possui registros.</p>
          <div style={{ padding: '4px 0 18px' }}>
            <Link className="lk" href="/records">Ver todos os registros</Link>
          </div>
        </section>
      </div>
      <aside className="box col" style={{ flex: '1 1 280px' }} aria-label="Créditos">
        <h2>Créditos</h2>
        <p style={{ fontStretch: '112%', fontWeight: 800, fontVariationSettings: "'wdth' 112", fontSize: 48, lineHeight: 1 }}>0</p>
        <p className="mut">disponíveis</p>
        <hr className="hr" />
        <p className="sm mut">Em reserva (captura em andamento): 0</p>
        <Link className="btn full" href="/credits">Comprar créditos</Link>
      </aside>
    </div>
  </ScreenView>;
}
