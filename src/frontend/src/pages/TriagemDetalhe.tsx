import { useEffect, useState } from 'react';
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { api, mensagemDeErro } from '../api';
import { ContextoLayout } from '../components/Layout';
import { SeloNivel, TEXTO_NIVEL } from '../components/SeloNivel';
import { NOME_TRIAGEM, Questionario, Triagem, formatarData } from '../tipos';

/** Read / Update / Delete de uma triagem: ver respostas, corrigir e recalcular. */
export function TriagemDetalhe() {
  const { id } = useParams();
  const navegar = useNavigate();
  const { abrirCrise } = useOutletContext<ContextoLayout>();
  const [triagem, setTriagem] = useState<Triagem | null>(null);
  const [questionario, setQuestionario] = useState<Questionario | null>(null);
  const [valores, setValores] = useState<Record<number, number>>({});
  const [editando, setEditando] = useState(false);
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    api
      .get<Triagem>(`/triagens/${id}`)
      .then(async (t) => {
        setTriagem(t);
        setValores(Object.fromEntries(t.respostas.map((r) => [r.perguntaId, r.valorResposta])));
        setQuestionario(await api.get<Questionario>(`/triagens/questionarios/${t.tipo}`));
      })
      .catch((e) => setErro(mensagemDeErro(e)));
  }, [id]);

  async function salvar() {
    if (!questionario) return;
    setErro('');
    try {
      const atualizada = await api.put<Triagem>(`/triagens/${id}`, {
        respostas: questionario.perguntas.map((p) => ({ perguntaId: p.id, valor: valores[p.id] })),
      });
      setTriagem(atualizada);
      setEditando(false);
      setAviso('Respostas corrigidas e resultado recalculado.');
      if (atualizada.nivelResultado === 'CRISE') abrirCrise();
    } catch (e) {
      setErro(mensagemDeErro(e));
    }
  }

  async function excluir() {
    if (!window.confirm('Excluir esta triagem do seu histórico? Essa ação não pode ser desfeita.')) return;
    try {
      await api.delete(`/triagens/${id}`);
      navegar('/');
    } catch (e) {
      setErro(mensagemDeErro(e));
    }
  }

  if (erro && !triagem) {
    return (
      <div className="pagina">
        <p className="erro">{erro}</p>
        <Link to="/">Voltar ao painel</Link>
      </div>
    );
  }
  if (!triagem || !questionario) return <div className="pagina">Carregando...</div>;

  return (
    <div className="pagina">
      <Link to="/" className="voltar">
        ← Painel
      </Link>
      <header className="cabecalho-pagina">
        <div>
          <h1>{NOME_TRIAGEM[triagem.tipo]}</h1>
          <p className="subtitulo">Realizada em {formatarData(triagem.dataTriagem)}</p>
        </div>
        <p className="linha-resultado">
          <SeloNivel nivel={triagem.nivelResultado} />
          <span>
            {triagem.pontuacao} de {triagem.pontuacaoMaxima} pontos
          </span>
        </p>
      </header>

      <p className="cartao dica">{TEXTO_NIVEL[triagem.nivelResultado]}</p>
      {aviso && <p className="sucesso">{aviso}</p>}
      {erro && <p className="erro">{erro}</p>}

      <section className="cartao">
        <h2 className="titulo-cartao">{questionario.enunciado}</h2>
        <ol className="lista-respostas">
          {questionario.perguntas.map((p) => (
            <li key={p.id}>
              <span>{p.texto}</span>
              {editando ? (
                <select
                  value={valores[p.id] ?? 0}
                  onChange={(e) => setValores((v) => ({ ...v, [p.id]: Number(e.target.value) }))}
                  aria-label={`Resposta da pergunta ${p.id}`}
                >
                  {questionario.opcoes.map((o) => (
                    <option key={o.valor} value={o.valor}>
                      {o.texto}
                    </option>
                  ))}
                </select>
              ) : (
                <strong>{questionario.opcoes.find((o) => o.valor === valores[p.id])?.texto ?? '-'}</strong>
              )}
            </li>
          ))}
        </ol>
        <div className="linha-botoes">
          {editando ? (
            <>
              <button className="botao" onClick={salvar}>
                Salvar correção
              </button>
              <button
                className="botao fantasma"
                onClick={() => {
                  setEditando(false);
                  setValores(Object.fromEntries(triagem.respostas.map((r) => [r.perguntaId, r.valorResposta])));
                }}
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button className="botao secundario" onClick={() => { setAviso(''); setEditando(true); }}>
                Corrigir respostas
              </button>
              <button className="botao perigo" onClick={excluir}>
                Excluir triagem
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
