import Link from 'next/link';
import { ScreenView } from './screen-view';

export function Dashboard() {
  return <ScreenView eyebrow="Início · Sair" title="Olá, Mariana">
    <div className="row" style={{gap: 28}}><div className="col" style={{flex: '2 1 520px', gap: 28}}><section className="box dash col" aria-label="Novo registro"><h2>Registrar um conteúdo</h2><p>Informe o endereço do site; a captura roda no servidor, em ambiente isolado.</p><div><span className="btn pri">Novo registro</span></div></section><section className="box col" aria-label="Últimos registros"><h2>Últimos registros</h2><p className="mut">A captura será habilitada nos próximos requisitos.</p></section></div><aside className="box col credit-aside" aria-label="Créditos"><h2>Créditos</h2><p className="credit-number">12</p><p className="mut">disponíveis</p><hr style={{border: 0, borderTop: '1px solid var(--rule)', width: '100%'}} /><p className="sm mut">Em reserva (captura em andamento): 0</p><Link className="btn full" href="/credits">Comprar créditos</Link></aside></div>
  </ScreenView>;
}
