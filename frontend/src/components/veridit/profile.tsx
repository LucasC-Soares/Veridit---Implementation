import { ScreenView } from './screen-view';

export function Profile() {
  return <ScreenView eyebrow="Conta" title="Perfil e configurações"><div className="panel">
    <label>Nome<input defaultValue="Lucas Costa Soares" /></label>
    <label>Email<input defaultValue="lucas@email.com" /></label>
    <label>Perfil<select defaultValue="LAWYER"><option value="LAWYER">Advogado</option><option value="COMMON_USER">Usuário comum</option></select></label>
    <button>Salvar alterações</button>
  </div></ScreenView>;
}
