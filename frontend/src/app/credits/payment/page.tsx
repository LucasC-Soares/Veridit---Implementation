import Link from 'next/link';
import { ScreenView } from '@/components/veridit/screen-view';

export default function Page() {
  return (
    <ScreenView active="credits" eyebrow="Duas formas de pagar; a pessoa escolhe uma." title="Pagamento">
      <div style={{ width: '100%' }}><div className="steps"><span>01 · PACOTE</span><span>02 · FATURAMENTO</span><b>03 · PAGAMENTO</b></div></div>
      <div className="row" style={{ gap: 28 }}>
        <section className="box col" style={{ flex: '1 1 440px' }}>
          <h3>Opção A</h3><h2>Mercado Pago</h2>
          <p>A pessoa sai para a página do Mercado Pago e volta ao Veridit depois de pagar.</p>
          <dl className="g1"><div><dt className="lb">Total</dt><dd>R$ 105,00</dd></div></dl>
          <Link className="btn pri" href="/credits/confirmed">Pagar com Mercado Pago</Link>
        </section>
        <section className="box col" style={{ flex: '1 1 440px' }}>
          <h3>Opção B</h3><h2>Pix próprio</h2>
          <p>O Veridit gera o QR Code ou o número do Pix para pagamento.</p>
          <Link className="btn sec" href="/credits/confirmed">Gerar Pix</Link>
        </section>
      </div>
    </ScreenView>
  );
}
