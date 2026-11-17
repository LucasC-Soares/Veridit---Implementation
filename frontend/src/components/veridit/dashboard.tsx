import Link from 'next/link';
import { ScreenView } from './screen-view';

export function Dashboard() {
  return <ScreenView eyebrow="O que você quer fazer agora?" title="Olá, Mariana">
    <div className="row" style={{ gap: 28 }}>
      <div className="col" style={{ flex: '2 1 520px', gap: 28 }}>
        <section className="box dash col" aria-label="Novo registro">
          <h2>Registrar um conteúdo</h2>
          <p>Informe o endereço do site; a captura roda no servidor, em ambiente isolado.</p>
          <div><Link className="btn pri" href="/capture">Novo registro</Link></div>
        </section>
        <section className="box col" aria-label="Últimos registros">
          <h2>Últimos registros</h2>
          <ul>
            <li className="row record-item">
              <div className="col" style={{ gap: 2 }}>
                <span>Story · perfil de exemplo</span>
                <span className="sm mut">19/10/2026 09:42</span>
              </div>
              <span className="chip">Concluído</span>
            </li>
            <li className="row record-item">
              <div className="col" style={{ gap: 2 }}>
                <span>Navegação em loja virtual</span>
                <span className="sm mut">18/10/2026 16:10</span>
              </div>
              <span className="chip">Concluído</span>
            </li>
            <li className="row record-item">
              <div className="col" style={{ gap: 2 }}>
                <span>Anúncio em marketplace</span>
                <span className="sm mut">12/10/2026 14:30</span>
              </div>
              <span className="chip run">Em andamento</span>
            </li>
          </ul>
          <div style={{ padding: '4px 0 18px' }}>
            <Link className="lk" href="/records">Ver todos os registros</Link>
          </div>
        </section>
      </div>
      <aside className="box col" style={{ flex: '1 1 280px' }} aria-label="Créditos">
        <h2>Créditos</h2>
        <p style={{ fontStretch: '112%', fontWeight: 800, fontVariationSettings: "'wdth' 112", fontSize: 48, lineHeight: 1 }}>12</p>
        <p className="mut">disponíveis</p>
        <hr className="hr" />
        <p className="sm mut">Em reserva (captura em andamento): 0</p>
        <Link className="btn full" href="/credits">Comprar créditos</Link>
      </aside>
    </div>
  </ScreenView>;
}
