import Link from 'next/link';
import { ScreenView } from '@/components/veridit/screen-view';

export default function Page() {
  return (
    <ScreenView active="credits" eyebrow="Pedido criado." title="Pagamento pendente">
      <section className="box dash col" style={{ maxWidth: 620 }}>
        <h3>Pedido aguardando pagamento</h3><h2>Os créditos serão liberados após a confirmação.</h2>
        <p>O pedido foi registrado. O saldo só será atualizado quando o pagamento for confirmado.</p>
        <Link className="btn pri" href="/dashboard">Voltar ao início</Link>
      </section>
    </ScreenView>
  );
}
