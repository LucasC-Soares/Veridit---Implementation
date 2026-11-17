'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ScreenView } from '@/components/veridit/screen-view';
import type { CreditBilling } from '@/types/veridit';

const fields: Array<{ key: keyof CreditBilling; label: string; required?: boolean }> = [
  { key: 'fullName', label: 'Nome completo', required: true },
  { key: 'email', label: 'E-mail', required: true },
  { key: 'phone', label: 'Telefone', required: true },
  { key: 'cpf', label: 'CPF', required: true },
  { key: 'postalCode', label: 'CEP', required: true },
  { key: 'address', label: 'Endereço', required: true },
  { key: 'number', label: 'Número', required: true },
  { key: 'complement', label: 'Complemento' },
  { key: 'neighborhood', label: 'Bairro', required: true },
  { key: 'city', label: 'Cidade', required: true },
  { key: 'state', label: 'Estado', required: true },
];

export default function Page() {
  const router = useRouter();
  const [packageId, setPackageId] = useState<number>();
  const [billing, setBilling] = useState<CreditBilling>({
    fullName: '',
    email: '',
    phone: '',
    cpf: '',
    postalCode: '',
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  });
  const [validationError, setValidationError] = useState<string>();

  useEffect(() => {
    const value = Number(new URLSearchParams(window.location.search).get('packageId'));
    if (Number.isInteger(value) && value > 0) {
      setPackageId(value);
    } else {
      router.replace('/credits');
    }
  }, [router]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!packageId) return;
    const normalizedCpf = billing.cpf.replace(/\D/g, '');
    const state = billing.state.trim().toUpperCase();
    setValidationError(undefined);
    if (normalizedCpf.length !== 11) {
      setValidationError('CPF deve conter exatamente 11 dígitos.');
      return;
    }
    if (!/^[A-Z]{2}$/.test(state)) {
      setValidationError('Estado deve ser informado com a UF de 2 letras, por exemplo: SP.');
      return;
    }
    sessionStorage.setItem(
      'veridit.creditPurchase',
      JSON.stringify({
        packageId,
        billing: { ...billing, cpf: normalizedCpf, state },
      }),
    );
    router.push('/credits/payment');
  }

  return (
    <ScreenView active="credits" eyebrow="Usados para emitir a cobrança." title="Dados da compra">
      <div style={{ width: '100%' }}><div className="steps"><span>01 · PACOTE</span><b>02 · FATURAMENTO</b><span>03 · PAGAMENTO</span></div></div>
      <form className="box col" style={{ width: '100%', gap: 22 }} onSubmit={submit}>
        <div className="g2">
          {fields.map(({ key, label, required }) => (
            <div className="fld" key={key}>
              <label className="lb" htmlFor={key}>{label}</label>
              <input
                className="in"
                id={key}
                type={key === 'email' ? 'email' : 'text'}
                maxLength={key === 'state' ? 2 : undefined}
                minLength={key === 'state' ? 2 : undefined}
                pattern={key === 'state' ? '[A-Za-z]{2}' : undefined}
                title={key === 'state' ? 'Informe a UF com exatamente 2 letras, por exemplo: SP.' : undefined}
                value={billing[key] ?? ''}
                onChange={(event) => setBilling((current) => ({ ...current, [key]: event.target.value }))}
                required={required}
              />
            </div>
          ))}
        </div>
        {validationError && <p className="error">{validationError}</p>}
        <div className="row" style={{ gap: 16 }}>
          <Link className="btn sec" href="/credits">Voltar</Link>
          <button className="btn pri" type="submit">Continuar para pagamento</button>
        </div>
      </form>
    </ScreenView>
  );
}
