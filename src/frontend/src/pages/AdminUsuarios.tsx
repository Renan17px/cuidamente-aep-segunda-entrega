import { useEffect, useState } from 'react';
import { api, mensagemDeErro } from '../api';
import { useAuth } from '../AuthContext';
import { Usuario, formatarData } from '../tipos';

/** Listagem e remoção de usuários pelo administrador. */
export function AdminUsuarios() {
  const { usuario: logado } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [erro, setErro] = useState('');

  function carregar() {
    api.get<Usuario[]>('/usuarios').then(setUsuarios).catch((e) => setErro(mensagemDeErro(e)));
  }

  useEffect(carregar, []);

  async function excluir(u: Usuario) {
    if (!window.confirm(`Excluir ${u.nome} e todo o histórico dessa pessoa?`)) return;
    try {
      await api.delete(`/usuarios/${u.id}`);
      carregar();
    } catch (e) {
      setErro(mensagemDeErro(e));
    }
  }

  return (
    <div className="pagina">
      <header className="cabecalho-pagina">
        <div>
          <h1>Usuários</h1>
          <p className="subtitulo">{usuarios.length} cadastrados. Por privacidade, as triagens dos pacientes não aparecem aqui.</p>
        </div>
      </header>
      {erro && <p className="erro">{erro}</p>}
      <section className="cartao tabela-rolagem">
        <table className="tabela">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Perfil</th>
              <th>Desde</th>
              <th aria-label="Ações" />
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.nome}</td>
                <td>{u.email}</td>
                <td>{u.descricaoPerfil}</td>
                <td>{formatarData(u.criadoEm)}</td>
                <td className="acoes">
                  {u.id !== logado?.id && (
                    <button className="link-perigo" onClick={() => excluir(u)}>
                      Excluir
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
