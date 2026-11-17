import Link from 'next/link';
import { ScreenView } from '@/components/veridit/screen-view';

export default function Page() {
  return (
    <ScreenView active="records" eyebrow="Registros realizados pelo usuário." title="Meus registros">
      <div className="box" style={{ overflowX: 'auto' }}>
        <table className="tbl" style={{ minWidth: 720 }}>
          <thead><tr><th>Título</th><th>Início</th><th>Status</th><th /></tr></thead>
          <tbody>
            <tr><td>Story · perfil de exemplo</td><td>19/10/2026 09:42</td><td><span className="chip">Concluído</span></td><td><Link className="lk" href="/records/1">Detalhes</Link></td></tr>
            <tr><td>Navegação em loja virtual</td><td>18/10/2026 16:10</td><td><span className="chip">Concluído</span></td><td><Link className="lk" href="/records/2">Detalhes</Link></td></tr>
            <tr><td>Anúncio em marketplace</td><td>12/10/2026 14:30</td><td><span className="chip run">Em andamento</span></td><td><Link className="lk" href="/records/3">Detalhes</Link></td></tr>
          </tbody>
        </table>
      </div>
    </ScreenView>
  );
}
