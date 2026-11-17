import Link from 'next/link';
import { ScreenView } from '@/components/veridit/screen-view';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <ScreenView active="records" eyebrow={`Registro ${id} · detalhes e evidências.`} title="Detalhes do registro">
      <section className="box col" style={{ maxWidth: 760 }}>
        <dl className="g2">
          <div><dt className="lb">Título</dt><dd>Story · perfil de exemplo</dd></div>
          <div><dt className="lb">Status</dt><dd><span className="chip">Concluído</span></dd></div>
          <div><dt className="lb">Data/hora início</dt><dd>19/10/2026 09:42</dd></div>
          <div><dt className="lb">URL</dt><dd>https://exemplo.com</dd></div>
        </dl>
        <Link className="btn sec" href="/records">Voltar aos registros</Link>
      </section>
    </ScreenView>
  );
}
