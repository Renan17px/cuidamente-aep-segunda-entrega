import { FormEvent, useState } from 'react';
import { api, mensagemDeErro } from '../api';
import { useAuth } from '../AuthContext';
import { Usuario, formatarData } from '../tipos';

/** RF02 — Read / Update / Delete da própria conta. */
export function Conta() {
  const { usuario, atualizarUsuario, sair } = useAuth();
  const [nome, setNome] = useState(usuario?.nome ?? '');
  const [email, setEmail] = useState(usuario?.email ?? '');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [senhaExclusao, setSenhaExclusao] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  if (!usuario) return null;

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setErro('');
    setMensagem('');
    try {
      const corpo: Record<string, string> = { nome, email };
      if (novaSenha) Object.assign(corpo, { senhaAtual, novaSenha });
      const atualizado = await api.put<Usuario>('/usuarios/me', corpo);
      atualizarUsuario(atualizado);
      setSenhaAtual('');
      setNovaSenha('');
      setMensagem('Dados atualizados.');
    } catch (err) {
      setErro(mensagemDeErro(err));
    }
  }

  async function excluirConta(e: FormEvent) {
    e.preventDefault();
    setErro('');
    if (!window.confirm('Excluir sua conta apaga também todas as triagens e lembretes. Continuar?')) return;
    try {
      await api.delete('/usuarios/me', { senha: senhaExclusao });
      sair();
    } catch (err) {
      setErro(mensagemDeErro(err));
    }
  }

  return (
    <div className="pagina estreita">
      <header className="cabecalho-pagina">
        <div>
          <h1>Minha conta</h1>
          <p className="subtitulo">
            {usuario.descricaoPerfil} desde {formatarData(usuario.criadoEm)}
          </p>
        </div>
      </header>

      {mensagem && <p className="sucesso">{mensagem}</p>}
      {erro && <p className="erro">{erro}</p>}

      <form className="cartao" onSubmit={salvar}>
        <h2 className="titulo-cartao">Dados pessoais</h2>
        <label className="campo">
          <span>Nome</span>
          <input value={nome} onChange={(e) => setNome(e.target.value)} required minLength={2} maxLength={100} />
        </label>
        <label className="campo">
          <span>E-mail</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={100} />
        </label>
        <h2 className="titulo-cartao">Trocar senha (opcional)</h2>
        <label className="campo">
          <span>Senha atual</span>
          <input type="password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} autoComplete="current-password" />
        </label>
        <label className="campo">
          <span>Nova senha</span>
          <input type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} minLength={6} maxLength={72} autoComplete="new-password" />
        </label>
        <button className="botao">Salvar alterações</button>
      </form>

      <form className="cartao zona-perigo" onSubmit={excluirConta}>
        <h2 className="titulo-cartao">Excluir conta</h2>
        <p className="dica">Remove permanentemente seu cadastro, histórico de triagens e lembretes.</p>
        <label className="campo">
          <span>Confirme sua senha</span>
          <input type="password" value={senhaExclusao} onChange={(e) => setSenhaExclusao(e.target.value)} required />
        </label>
        <button className="botao perigo">Excluir minha conta</button>
      </form>
    </div>
  );
}
