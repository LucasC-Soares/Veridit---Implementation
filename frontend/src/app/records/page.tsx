import { ScreenView } from '@/components/veridit/screen-view';

export default function Page() {
  return (
    <ScreenView active="records" eyebrow="Registros realizados pelo usuário." title="Meus registros">
      <div className="box" style={{ overflowX: 'auto' }}>
        <table className="tbl" style={{ minWidth: 720 }}>
          <thead><tr><th>Título</th><th>Início</th><th>Status</th><th /></tr></thead>
          <tbody>
            <tr><td colSpan={4}>Você ainda não possui registros.</td></tr>
          </tbody>
        </table>
      </div>
    </ScreenView>
  );
}
