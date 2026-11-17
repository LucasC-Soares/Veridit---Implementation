import Link from 'next/link';
import { ScreenView } from '@/components/veridit/screen-view';

export default function Page() {
  return (
    <ScreenView active="credits" eyebrow="Usados para emitir a cobrança." title="Dados da compra">
      <div style={{ width: '100%' }}><div className="steps"><span>01 · PACOTE</span><b>02 · FATURAMENTO</b><span>03 · PAGAMENTO</span></div></div>
      <div className="row" style={{ gap: 28 }}>
        <form className="box col" style={{ flex: '2 1 560px', gap: 22 }}>
          <div className="g2">
            {['Nome completo', 'E-mail', 'Telefone', 'CPF', 'CEP', 'Endereço', 'Número', 'Complemento', 'Bairro', 'Cidade', 'Estado'].map((label) => (
              <div className="fld" key={label}>
                <label className="lb" htmlFor={label}>{label}</label>
                <input className="in" id={label} type="text" />
              </div>
            ))}
          </div>
          <div className="row" style={{ gap: 16 }}>
            <Link className="btn sec" href="/credits">Voltar</Link>
            <Link className="btn pri" href="/credits/payment">Continuar para pagamento</Link>
          </div>
        </form>
      </div>
    </ScreenView>
  );
}
