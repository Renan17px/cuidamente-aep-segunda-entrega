import { FormEvent, useEffect, useState } from 'react';
import { api, mensagemDeErro } from '../api';
import { NOME_TIPO_RECURSO, Recurso } from '../tipos';

type Formulario = Omit<Recurso, 'id'>;
const VAZIO: Formulario = { nome: '', tipo: 'CAPS', contato: '', cidade: '', gratuito: true };

/** Administrador.gerenciarRecursos() — CRUD do catálogo de canais de apoio. */
export function AdminRecursos() {
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [tipos, setTipos] = useState<string[]>([]);
  const [form, setForm] = useState<Formulario>(VAZIO);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [erro, setErro] = useState('');

  function carregar() {
    api.get<Recurso[]>('/recursos').then(setRecursos).catch((e) => setErro(mensagemDeErro(e)));
  }

  useEffect(() => {
    carregar();
    api.get<{ tipos: string[] }>('/recursos/filtros').then((f) => setTipos(f.tipos)).catch(() => undefined);
  }, []);

  function alterar<K extends keyof Formulario>(campo: K, valor: Formulario[K]) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setErro('');
    try {
      if (editandoId) await api.put(`/recursos/${editandoId}`, form);
      else await api.post('/recursos', form);
      setForm(VAZIO);
      setEditandoId(null);
      carregar();
    } catch (err) {
      setErro(mensagemDeErro(err));
    }
  }

  async function excluir(r: Recurso) {
    if (!window.confirm(`Excluir "${r.nome}"?`)) return;
    try {
      await api.delete(`/recursos/${r.id}`);
      carregar();
    } catch (err) {
      setErro(mensagemDeErro(err));
    }
  }

  return (
    <div className="pagina">
      <header className="cabecalho-pagina">
        <div>
          <h1>Gerenciar recursos de apoio</h1>
          <p className="subtitulo">Use a cidade "Nacional" para serviços que atendem todo o país.</p>
        </div>
      </header>

      <form className="cartao grade-formulario" onSubmit={salvar}>
        <label className="campo">
          <span>Nome</span>
          <input value={form.nome} onChange={(e) => alterar('nome', e.target.value)} required minLength={2} maxLength={150} />
        </label>
        <label className="campo">
          <span>Tipo</span>
          <select value={form.tipo} onChange={(e) => alterar('tipo', e.target.value)}>
            {tipos.map((t) => (
              <option key={t} value={t}>
                {NOME_TIPO_RECURSO[t] ?? t}
              </option>
            ))}
          </select>
        </label>
        <label className="campo">
          <span>Contato</span>
          <input value={form.contato} onChange={(e) => alterar('contato', e.target.value)} required minLength={2} maxLength={100} />
        </label>
        <label className="campo">
          <span>Cidade</span>
          <input value={form.cidade} onChange={(e) => alterar('cidade', e.target.value)} required minLength={2} maxLength={100} />
        </label>
        <label className="caixa-marcacao">
          <input type="checkbox" checked={form.gratuito} onChange={(e) => alterar('gratuito', e.target.checked)} />
          Gratuito
        </label>
        <div className="linha-botoes">
          <button className="botao">{editandoId ? 'Salvar alterações' : 'Cadastrar recurso'}</button>
          {editandoId && (
            <button type="button" className="botao fantasma" onClick={() => { setEditandoId(null); setForm(VAZIO); }}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      {erro && <p className="erro">{erro}</p>}

      <section className="cartao tabela-rolagem">
        <table className="tabela">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Contato</th>
              <th>Cidade</th>
              <th>Gratuito</th>
              <th aria-label="Ações" />
            </tr>
          </thead>
          <tbody>
            {recursos.map((r) => (
              <tr key={r.id}>
                <td>{r.nome}</td>
                <td>{NOME_TIPO_RECURSO[r.tipo] ?? r.tipo}</td>
                <td>{r.contato}</td>
                <td>{r.cidade}</td>
                <td>{r.gratuito ? 'Sim' : 'Não'}</td>
                <td className="acoes">
                  <button
                    className="link"
                    onClick={() => {
                      setEditandoId(r.id);
                      setForm({ nome: r.nome, tipo: r.tipo, contato: r.contato, cidade: r.cidade, gratuito: r.gratuito });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    Editar
                  </button>
                  <button className="link-perigo" onClick={() => excluir(r)}>
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
