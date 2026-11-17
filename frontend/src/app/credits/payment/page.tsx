'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ScreenView } from '@/components/veridit/screen-view';
import { creditsService } from '@/services/credits.service';

type PurchaseDraft = {
  packageId: number;
  billing: Parameters<typeof creditsService.createPurchase>[1];
};

export default function Page() {
  const router = useRouter();
  const [draft, setDraft] = useState<PurchaseDraft>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('veridit.creditPurchase');
    if (!raw) {
      router.replace('/credits');
      return;
    }
    try {
      setDraft(JSON.parse(raw) as PurchaseDraft);
    } catch {
      sessionStorage.removeItem('veridit.creditPurchase');
      router.replace('/credits');
    }
  }, [router]);

  async function createPendingPurchase() {
    if (!draft) return;
    setError(undefined);
    setLoading(true);
    try {
      const purchase = await creditsService.createPurchase(draft.packageId, draft.billing);
      sessionStorage.removeItem('veridit.creditPurchase');
      router.replace(`/credits/confirmed?purchaseId=${purchase.id}`);
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível criar o pedido.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenView active="credits" eyebrow="Escolha uma forma de pagamento." title="Pagamento">
      <div style={{ width: '100%' }}><div className="steps"><span>01 · PACOTE</span><span>02 · FATURAMENTO</span><b>03 · PAGAMENTO</b></div></div>
      <div className="row" style={{ gap: 28 }}>
        <section className="box col" style={{ flex: '1 1 440px' }}>
          <h3>Opção A</h3><h2>Mercado Pago</h2>
          <p>O pedido será criado como pendente enquanto a integração de pagamento é preparada.</p>
          <button className="btn pri" type="button" onClick={() => void createPendingPurchase()} disabled={loading || !draft}>
            {loading ? 'Criando pedido...' : 'Continuar com Mercado Pago'}
          </button>
        </section>
        <section className="box col" style={{ flex: '1 1 440px' }}>
          <h3>Opção B</h3><h2>Pix próprio</h2>
          <p>A geração do QR Code será conectada à confirmação de pagamento.</p>
          <button className="btn sec" type="button" onClick={() => void createPendingPurchase()} disabled={loading || !draft}>
            {loading ? 'Criando pedido...' : 'Continuar com Pix'}
          </button>
        </section>
      </div>
      {error && <p className="error">{error}</p>}
      <Link className="lk" href="/credits">Voltar aos pacotes</Link>
    </ScreenView>
  );
}
