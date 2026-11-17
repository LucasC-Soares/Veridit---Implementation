import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="pg">
      <div className="auth-content">
        <section className="box col" style={{ maxWidth: 560 }}>
          <h1>Página não encontrada</h1>
          <p className="mut">O endereço acessado não existe ou foi removido.</p>
          <Link className="btn pri" href="/login">Ir para o login</Link>
        </section>
      </div>
    </main>
  );
}
