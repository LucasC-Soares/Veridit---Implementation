import Link from 'next/link';
import { ScreenView } from './screen-view';
const packages = [['Básico', '10 créditos', 'R$ 19,90'], ['Médio', '50 créditos', 'R$ 79,90'], ['Premium', '120 créditos', 'R$ 149,90']];
export function Credits() {
  return <ScreenView active="credits" eyebrow="Escolha um pacote. Se a captura falhar, nada é debitado." title="Comprar créditos">
    <div style={{ width: '100%' }}>
      <div className="steps"><b>01 · PACOTE</b><span>02 · FATURAMENTO</span><span>03 · PAGAMENTO</span></div>
    </div>
    <form className="col" style={{ gap: 20 }}>
      <div className="box" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="tbl" style={{ minWidth: 720 }}>
          <thead><tr><th>Pacote</th><th>Créditos</th><th>Valor por crédito</th><th>Benefícios</th></tr></thead>
          <tbody>{packages.map(([name], index) => <tr key={name}>
            <td><label className="rd" htmlFor={`p${index + 1}`}><input type="radio" name="pacote" id={`p${index + 1}`} defaultChecked={index === 1} />{name}</label></td>
            <td>{index === 0 ? '10' : index === 1 ? '25' : '60'}</td>
            <td>{index === 0 ? 'R$ 5,00' : index === 1 ? 'R$ 4,20' : 'R$ 3,50'}</td>
            <td>{index === 0 ? 'Para registros eventuais' : index === 1 ? 'Para uso frequente, com melhor preço por crédito' : 'Para uso contínuo, com o menor preço por crédito'}</td>
          </tr>)}</tbody>
        </table>
      </div>
      <div className="box dash row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '14px 22px' }}>
        <span>Total do pedido</span><span>25 × R$ 4,20 = R$ 105,00</span>
      </div>
      <div className="row" style={{ justifyContent: 'flex-end', gap: 16 }}>
        <Link className="btn sec" href="/dashboard">Cancelar</Link>
        <Link className="btn pri" href="/credits/billing">Continuar para faturamento</Link>
      </div>
    </form>
  </ScreenView>;
}
