'use client';

import Link from 'next/link';
import { ScreenView } from '@/components/veridit/screen-view';

export default function Page() {
  return (
    <ScreenView active="capture" eyebrow="O conteúdo pode ser uma tela de um site ou vídeo de navegação." title="Novo registro">
      <form className="box col" style={{ maxWidth: 700, gap: 22 }}>
        <div className="fld">
          <label className="lb" htmlFor="title">Título do registro</label>
          <input className="in" id="title" type="text" placeholder="Ex.: Página de produto" />
        </div>
        <div className="fld">
          <label className="lb" htmlFor="url">Endereço do site</label>
          <input className="in" id="url" type="url" placeholder="https://exemplo.com" />
        </div>
        <div className="row" style={{ gap: 16 }}>
          <Link className="btn sec" href="/dashboard">Cancelar</Link>
          <button className="btn pri" type="submit">Iniciar registro</button>
        </div>
      </form>
    </ScreenView>
  );
}
