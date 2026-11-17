import Link from 'next/link';
import { ScreenView } from '@/components/veridit/screen-view';

export default function Page() {
  return (
    <ScreenView active="credits" eyebrow="Pagamento recebido." title="Compra confirmada">
      <section className="box dash col" style={{ maxWidth: 620 }}>
        <h3>Compra aprovada</h3><h2>Seus créditos já estão disponíveis.</h2>
        <p>Enviamos a confirmação para o seu e-mail.</p>
        <Link className="btn pri" href="/dashboard">Voltar ao início</Link>
      </section>
    </ScreenView>
  );
}
