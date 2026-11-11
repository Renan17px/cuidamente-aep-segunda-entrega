import { useEffect, useRef, useState } from 'react';
import { Link, useOutletContext, useSearchParams } from 'react-router-dom';
import { api, mensagemDeErro } from '../api';
import { ContextoLayout } from '../components/Layout';
import { SeloNivel, TEXTO_NIVEL } from '../components/SeloNivel';
import { NOME_TRIAGEM, Questionario, TipoTriagem, Triagem as TriagemModelo } from '../tipos';

interface Mensagem {
  id: number;
  autor: 'bot' | 'usuario';
  texto: string;
}

type Fase = 'escolha' | 'perguntas' | 'enviando' | 'resultado';

let proximoId = 1;
const msg = (autor: Mensagem['autor'], texto: string): Mensagem => ({ id: proximoId++, autor, texto });

const BOAS_VINDAS = [
  'Oi! Eu sou o assistente do CuidaMente. 💚',
  'Vou fazer algumas perguntas rápidas sobre as últimas 2 semanas. Não existe resposta certa ou errada, e isto não é um diagnóstico: é um jeito de você se observar.',
  'Sobre o que você quer conversar hoje?',
];

/** RF01 — chatbot que aplica o questionário de triagem (PHQ-9 ou GAD-7). */
export function Triagem() {
  const { abrirCrise } = useOutletContext<ContextoLayout>();
  const [params] = useSearchParams();
  const [fase, setFase] = useState<Fase>('escolha');
  const [mensagens, setMensagens] = useState<Mensagem[]>(() => BOAS_VINDAS.map((t) => msg('bot', t)));
  const [questionario, setQuestionario] = useState<Questionario | null>(null);
  const [respostas, setRespostas] = useState<number[]>([]);
  const [resultado, setResultado] = useState<TriagemModelo | null>(null);
  const [erro, setErro] = useState('');
  const fimRef = useRef<HTMLDivElement>(null);
  const iniciouPorParametro = useRef(false);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [mensagens, fase]);

  useEffect(() => {
    const tipo = params.get('tipo');
    if (!iniciouPorParametro.current && (tipo === 'DEPRESSAO' || tipo === 'ANSIEDADE')) {
      iniciouPorParametro.current = true;
      void escolher(tipo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function escolher(tipo: TipoTriagem) {
    setErro('');
    try {
      const q = await api.get<Questionario>(`/triagens/questionarios/${tipo}`);
      setQuestionario(q);
      setRespostas([]);
      setResultado(null);
      setMensagens((m) => [
        ...m,
        msg('usuario', tipo === 'DEPRESSAO' ? 'Quero falar sobre meu humor' : 'Quero falar sobre ansiedade'),
        msg('bot', `Combinado. São ${q.perguntas.length} perguntas do questionário ${q.instrumento}.`),
        msg('bot', q.enunciado),
        msg('bot', `1. ${q.perguntas[0].texto}`),
      ]);
      setFase('perguntas');
    } catch (e) {
      setErro(mensagemDeErro(e));
    }
  }

  async function responder(valor: number, texto: string) {
    if (!questionario) return;
    const novas = [...respostas, valor];
    setRespostas(novas);
    const indice = novas.length;
    const total = questionario.perguntas.length;

    if (indice < total) {
      const incentivo = indice === Math.floor(total / 2) ? [msg('bot', 'Você está indo bem. Falta pouco.')] : [];
      setMensagens((m) => [...m, msg('usuario', texto), ...incentivo, msg('bot', `${indice + 1}. ${questionario.perguntas[indice].texto}`)]);
      return;
    }

    setMensagens((m) => [...m, msg('usuario', texto), msg('bot', 'Obrigado por compartilhar. Estou calculando seu resultado...')]);
    setFase('enviando');
    try {
      const salvo = await api.post<TriagemModelo>('/triagens', {
        tipo: questionario.tipo,
        respostas: novas.map((v, i) => ({ perguntaId: questionario.perguntas[i].id, valor: v })),
      });
      setResultado(salvo);
      setFase('resultado');
      setMensagens((m) => [...m, msg('bot', TEXTO_NIVEL[salvo.nivelResultado])]);
      if (salvo.nivelResultado === 'CRISE') abrirCrise();
    } catch (e) {
      setErro(mensagemDeErro(e));
      setFase('perguntas');
      setRespostas(novas.slice(0, -1));
      setMensagens((m) => m.slice(0, -2));
    }
  }

  function voltar() {
    if (respostas.length === 0) return;
    setRespostas((r) => r.slice(0, -1));
    // Remove a pergunta seguinte, o possível incentivo e a última resposta do usuário.
    // A pergunta anterior continua na tela e volta a ser a pergunta atual.
    setMensagens((m) => {
      const copia = [...m];
      while (copia.length && copia[copia.length - 1].autor === 'bot') copia.pop();
      copia.pop();
      return copia;
    });
  }

  function recomecar() {
    setFase('escolha');
    setQuestionario(null);
    setRespostas([]);
    setResultado(null);
    setMensagens((m) => [...m, msg('bot', 'Quer fazer outra triagem? Escolha abaixo.')]);
  }

  const outroTipo: TipoTriagem | null = resultado ? (resultado.tipo === 'DEPRESSAO' ? 'ANSIEDADE' : 'DEPRESSAO') : null;

  return (
    <div className="pagina pagina-chat">
      <header className="cabecalho-pagina">
        <div>
          <h1>Triagem</h1>
          <p className="subtitulo">Converse com o assistente no seu ritmo. Suas respostas ficam salvas no seu histórico.</p>
        </div>
        {questionario && fase === 'perguntas' && (
          <span className="progresso" aria-label="Progresso">
            {respostas.length + 1} / {questionario.perguntas.length}
          </span>
        )}
      </header>

      <section className="chat cartao" aria-live="polite">
        {mensagens.map((m) => (
          <div key={m.id} className={`balao balao-${m.autor}`}>
            {m.texto}
          </div>
        ))}

        {fase === 'resultado' && resultado && (
          <div className="balao balao-bot resultado-chat">
            <p className="linha-resultado">
              <SeloNivel nivel={resultado.nivelResultado} />
              <span>
                {NOME_TRIAGEM[resultado.tipo]}: {resultado.pontuacao} de {resultado.pontuacaoMaxima} pontos
              </span>
            </p>
          </div>
        )}
        <div ref={fimRef} />
      </section>

      {erro && <p className="erro" role="alert">{erro}</p>}

      <section className="opcoes-chat">
        {fase === 'escolha' && (
          <>
            <button className="botao" onClick={() => escolher('DEPRESSAO')}>
              Meu humor (PHQ-9)
            </button>
            <button className="botao secundario" onClick={() => escolher('ANSIEDADE')}>
              Ansiedade (GAD-7)
            </button>
          </>
        )}

        {fase === 'perguntas' &&
          questionario?.opcoes.map((o) => (
            <button key={o.valor} className="botao opcao" onClick={() => responder(o.valor, o.texto)}>
              {o.texto}
            </button>
          ))}
        {fase === 'perguntas' && respostas.length > 0 && (
          <button className="botao fantasma" onClick={voltar}>
            ← Voltar uma pergunta
          </button>
        )}

        {fase === 'enviando' && <p>Salvando...</p>}

        {fase === 'resultado' && (
          <>
            {outroTipo && (
              <button className="botao" onClick={() => escolher(outroTipo)}>
                Fazer a triagem de {NOME_TRIAGEM[outroTipo]}
              </button>
            )}
            <Link className="botao secundario" to="/">
              Ver meu painel
            </Link>
            <Link className="botao fantasma" to="/apoio">
              Canais de apoio
            </Link>
            <button className="botao fantasma" onClick={recomecar}>
              Recomeçar
            </button>
          </>
        )}
      </section>
    </div>
  );
}
