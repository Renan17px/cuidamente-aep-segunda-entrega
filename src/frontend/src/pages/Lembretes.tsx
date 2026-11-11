import { FormEvent, useEffect, useState } from 'react';
import { api, mensagemDeErro } from '../api';
import { Lembrete } from '../tipos';

const SUGESTOES = ['Meditar por 5 minutos', 'Beber um copo de água', 'Pausa longe da tela', 'Caminhada leve', 'Alongar o corpo'];

function avisarAlteracao() {
  window.dispatchEvent(new Event('cuidamente:lembretes-alterados'));
}

/** RF03 — CRUD de lembretes de autocuidado. */
export function Lembretes() {
  const [lembretes, setLembretes] = useState<Lembrete[]>([]);
  const [descricao, setDescricao] = useState('');
  const [horario, setHorario] = useState('09:00');
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [erro, setErro] = useState('');
  const [permissao, setPermissao] = useState<string>(() => ('Notification' in window ? Notification.permission : 'indisponivel'));

  function carregar() {
    api.get<Lembrete[]>('/lembretes').then(setLembretes).catch((e) => setErro(mensagemDeErro(e)));
  }

  useEffect(carregar, []);

  function limpar() {
    setDescricao('');
    setHorario('09:00');
    setEditandoId(null);
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setErro('');
    try {
      if (editandoId) await api.put(`/lembretes/${editandoId}`, { descricao, horario });
      else await api.post('/lembretes', { descricao, horario });
      limpar();
      carregar();
      avisarAlteracao();
    } catch (err) {
      setErro(mensagemDeErro(err));
    }
  }

  async function alternar(l: Lembrete) {
    try {
      await api.put(`/lembretes/${l.id}`, { ativo: !l.ativo });
      carregar();
      avisarAlteracao();
    } catch (err) {
      setErro(mensagemDeErro(err));
    }
  }

  async function excluir(l: Lembrete) {
    if (!window.confirm(`Excluir o lembrete "${l.descricao}"?`)) return;
    try {
      await api.delete(`/lembretes/${l.id}`);
      if (editandoId === l.id) limpar();
      carregar();
      avisarAlteracao();
    } catch (err) {
      setErro(mensagemDeErro(err));
    }
  }

  function editar(l: Lembrete) {
    setEditandoId(l.id);
    setDescricao(l.descricao);
    setHorario(l.horario);
  }

  async function pedirPermissao() {
    if ('Notification' in window) setPermissao(await Notification.requestPermission());
  }

  return (
    <div className="pagina">
      <header className="cabecalho-pagina">
        <div>
          <h1>Lembretes de autocuidado</h1>
          <p className="subtitulo">Com a plataforma aberta, avisamos você no horário escolhido.</p>
        </div>
        {permissao === 'default' && (
          <button className="botao fantasma" onClick={pedirPermissao}>
            Ativar avisos do navegador
          </button>
        )}
      </header>

      <form className="cartao formulario-linha" onSubmit={salvar}>
        <label className="campo crescer">
          <span>{editandoId ? 'Editar lembrete' : 'Novo lembrete'}</span>
          <input value={descricao} onChange={(e) => setDescricao(e.target.value)} required minLength={2} maxLength={255} placeholder="Ex.: Beber um copo de água" list="sugestoes-lembrete" />
          <datalist id="sugestoes-lembrete">
            {SUGESTOES.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </label>
        <label className="campo">
          <span>Horário</span>
          <input type="time" value={horario} onChange={(e) => setHorario(e.target.value)} required />
        </label>
        <div className="linha-botoes alinhar-base">
          <button className="botao">{editandoId ? 'Salvar' : 'Adicionar'}</button>
          {editandoId && (
            <button type="button" className="botao fantasma" onClick={limpar}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      {erro && <p className="erro">{erro}</p>}

      <section className="cartao">
        {lembretes.length === 0 ? (
          <p className="dica">Nenhum lembrete ainda. Comece por algo simples, como uma pausa para respirar.</p>
        ) : (
          <ul className="lista-lembretes">
            {lembretes.map((l) => (
              <li key={l.id} className={l.ativo ? '' : 'inativo'}>
                <span className="hora">{l.horario}</span>
                <span className="crescer">{l.descricao}</span>
                <label className="interruptor">
                  <input type="checkbox" checked={l.ativo} onChange={() => alternar(l)} />
                  <span>{l.ativo ? 'Ativo' : 'Pausado'}</span>
                </label>
                <button className="link" onClick={() => editar(l)}>
                  Editar
                </button>
                <button className="link-perigo" onClick={() => excluir(l)}>
                  Excluir
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
