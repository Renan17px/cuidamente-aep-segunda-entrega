import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api, mensagemDeErro } from '../api';
import { useAuth } from '../AuthContext';
import { SeloNivel, TEXTO_NIVEL } from '../components/SeloNivel';
import { NOME_TRIAGEM, Triagem, TipoTriagem, formatarData } from '../tipos';

interface Resumo {
  totalTriagens: number;
  ultimaPorTipo: Partial<Record<TipoTriagem, Triagem>>;
  historico: Triagem[];
}

const CORES: Record<TipoTriagem, string> = { DEPRESSAO: '#2f6f5e', ANSIEDADE: '#c06b3e' };

/** RF05 — painel com o histórico de triagens em gráfico de linha. */
export function Painel() {
  const { usuario } = useAuth();
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [erro, setErro] = useState('');

  function carregar() {
    api.get<Resumo>('/triagens/resumo').then(setResumo).catch((e) => setErro(mensagemDeErro(e)));
  }

  useEffect(carregar, []);

  async function excluir(t: Triagem) {
    if (!window.confirm(`Excluir a triagem de ${NOME_TRIAGEM[t.tipo]} do dia ${formatarData(t.dataTriagem)}?`)) return;
    try {
      await api.delete(`/triagens/${t.id}`);
      carregar();
    } catch (e) {
      setErro(mensagemDeErro(e));
    }
  }

  // Uma linha por instrumento, em percentual da pontuação máxima para ficarem comparáveis.
  const dadosGrafico = useMemo(() => {
    if (!resumo) return [];
    return resumo.historico.map((t, i) => ({
      rotulo: `${formatarData(t.dataTriagem).slice(0, 5)} #${i + 1}`,
      [t.tipo]: Math.round((t.pontuacao / t.pontuacaoMaxima) * 100),
      pontos: `${t.pontuacao}/${t.pontuacaoMaxima}`,
    }));
  }, [resumo]);

  const primeiroNome = usuario?.nome.split(' ')[0] ?? '';

  return (
    <div className="pagina">
      <header className="cabecalho-pagina">
        <div>
          <h1>Olá, {primeiroNome}</h1>
          <p className="subtitulo">Acompanhe como você tem se sentido ao longo das semanas.</p>
        </div>
        <Link className="botao" to="/triagem">
          Fazer uma triagem
        </Link>
      </header>

      {erro && <p className="erro">{erro}</p>}
      {!resumo && !erro && <p>Carregando...</p>}

      {resumo && (
        <>
          <section className="grade-cartoes">
            {(['DEPRESSAO', 'ANSIEDADE'] as TipoTriagem[]).map((tipo) => {
              const ultima = resumo.ultimaPorTipo[tipo];
              return (
                <article key={tipo} className="cartao">
                  <h2 className="titulo-cartao">{NOME_TRIAGEM[tipo]}</h2>
                  {ultima ? (
                    <>
                      <p className="linha-resultado">
                        <SeloNivel nivel={ultima.nivelResultado} />
                        <span>
                          {ultima.pontuacao} de {ultima.pontuacaoMaxima} pontos · {formatarData(ultima.dataTriagem)}
                        </span>
                      </p>
                      <p className="dica">{TEXTO_NIVEL[ultima.nivelResultado]}</p>
                    </>
                  ) : (
                    <p className="dica">
                      Você ainda não fez esta triagem. <Link to={`/triagem?tipo=${tipo}`}>Começar agora</Link>
                    </p>
                  )}
                </article>
              );
            })}
          </section>

          <section className="cartao">
            <h2 className="titulo-cartao">Evolução</h2>
            {dadosGrafico.length < 2 ? (
              <p className="dica">O gráfico aparece a partir da segunda triagem. Que tal repetir a triagem em alguns dias?</p>
            ) : (
              <div className="area-grafico">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dadosGrafico} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e0d6" />
                    <XAxis dataKey="rotulo" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(valor, nome, item) => [`${valor}% (${item.payload.pontos} pts)`, NOME_TRIAGEM[nome as TipoTriagem] ?? nome]} />
                    <Legend formatter={(nome) => NOME_TRIAGEM[nome as TipoTriagem] ?? nome} />
                    {(['DEPRESSAO', 'ANSIEDADE'] as TipoTriagem[]).map((tipo) => (
                      <Line key={tipo} type="monotone" dataKey={tipo} stroke={CORES[tipo]} strokeWidth={3} dot={{ r: 4 }} connectNulls />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
                <p className="dica">Quanto mais baixo, menos sintomas. Valores em % da pontuação máxima de cada questionário.</p>
              </div>
            )}
          </section>

          <section className="cartao">
            <h2 className="titulo-cartao">Histórico ({resumo.totalTriagens})</h2>
            {resumo.historico.length === 0 ? (
              <p className="dica">Nenhuma triagem registrada ainda.</p>
            ) : (
              <div className="tabela-rolagem">
                <table className="tabela">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Questionário</th>
                      <th>Pontos</th>
                      <th>Nível</th>
                      <th aria-label="Ações" />
                    </tr>
                  </thead>
                  <tbody>
                    {[...resumo.historico].reverse().map((t) => (
                      <tr key={t.id}>
                        <td>{formatarData(t.dataTriagem)}</td>
                        <td>{NOME_TRIAGEM[t.tipo]}</td>
                        <td>
                          {t.pontuacao}/{t.pontuacaoMaxima}
                        </td>
                        <td>
                          <SeloNivel nivel={t.nivelResultado} />
                        </td>
                        <td className="acoes">
                          <Link to={`/triagens/${t.id}`}>Ver / corrigir</Link>
                          <button className="link-perigo" onClick={() => excluir(t)}>
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
