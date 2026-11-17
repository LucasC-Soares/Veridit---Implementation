'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { creditsService } from '@/services/credits.service';
import type { CreditPackage } from '@/types/veridit';
import { ScreenView } from './screen-view';

const formatCurrency = (cents: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);

export function Credits() {
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<number>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    void creditsService
      .listPackages()
      .then((items) => {
        setPackages(items);
        setSelectedPackageId(items[0]?.id);
      })
      .catch((cause: unknown) => {
        setError(
          cause instanceof Error
            ? cause.message
            : 'Não foi possível carregar os pacotes.',
        );
      });
  }, []);

  const selectedPackage = packages.find(
    (item) => item.id === selectedPackageId,
  );

  return (
    <ScreenView
      active="credits"
      eyebrow="Escolha um pacote. Se a captura falhar, nada é debitado."
      title="Comprar créditos"
    >
      <div style={{ width: '100%' }}>
        <div className="steps">
          <b>01 · PACOTE</b>
          <span>02 · FATURAMENTO</span>
          <span>03 · PAGAMENTO</span>
        </div>
      </div>
      <form className="col" style={{ gap: 20 }}>
        <div className="box" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="tbl" style={{ minWidth: 720 }}>
            <thead>
              <tr>
                <th>Pacote</th>
                <th>Créditos</th>
                <th>Valor por crédito</th>
                <th>Benefícios</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((item) => (
                <tr key={item.id}>
                  <td>
                    <label className="rd" htmlFor={`package-${item.id}`}>
                      <input
                        type="radio"
                        name="pacote"
                        id={`package-${item.id}`}
                        checked={item.id === selectedPackageId}
                        onChange={() => setSelectedPackageId(item.id)}
                      />
                      {item.name}
                    </label>
                  </td>
                  <td>{item.credits}</td>
                  <td>{formatCurrency(item.pricePerCreditCents)}</td>
                  <td>{item.benefitsDescription}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {error && <p className="error">{error}</p>}
          {!packages.length && !error && <p>Carregando pacotes...</p>}
        </div>
        <div
          className="box dash row"
          style={{
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            padding: '14px 22px',
          }}
        >
          <span>Total do pedido</span>
          <span>
            {selectedPackage
              ? `${selectedPackage.credits} × ${formatCurrency(selectedPackage.pricePerCreditCents)} = ${formatCurrency(selectedPackage.credits * selectedPackage.pricePerCreditCents)}`
              : 'Selecione um pacote'}
          </span>
        </div>
        <div className="row" style={{ justifyContent: 'flex-end', gap: 16 }}>
          <Link className="btn sec" href="/dashboard">
            Cancelar
          </Link>
          <Link
            className="btn pri"
            href={
              selectedPackageId
                ? `/credits/billing?packageId=${selectedPackageId}`
                : '/credits'
            }
            aria-disabled={!selectedPackageId}
          >
            Continuar para faturamento
          </Link>
        </div>
      </form>
    </ScreenView>
  );
}
