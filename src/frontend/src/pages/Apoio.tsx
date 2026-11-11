import { useEffect, useState } from 'react';
import { api, mensagemDeErro } from '../api';
import { NOME_TIPO_RECURSO, Recurso } from '../tipos';

/** RF04 — canais de apoio filtráveis por tipo de serviço e localização. */
export function Apoio() {
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [cidades, setCidades] = useState<string[]>([]);
  const [tipos, setTipos] = useState<string[]>([]);
  const [tipo, setTipo] = useState('');
  const [cidade, setCidade] = useState('');
  const [soGratuitos, setSoGratuitos] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    api
      .get<{ cidades: string[]; tipos: string[] }>('/recursos/filtros')
      .then((f) => {
        setCidades(f.cidades);
        setTipos(f.tipos);
      })
      .catch((e) => setErro(mensagemDeErro(e)));
  }, []);

  useEffect(() => {
    const busca = new URLSearchParams();
    if (tipo) busca.set('tipo', tipo);
    if (cidade) busca.set('cidade', cidade);
    if (soGratuitos) busca.set('gratuito', 'true');
    api
      .get<Recurso[]>(`/recursos?${busca.toString()}`)
      .then(setRecursos)
      .catch((e) => setErro(mensagemDeErro(e)));
  }, [tipo, cidade, soGratuitos]);

  return (
    <div className="pagina">
      <header className="cabecalho-pagina">
        <div>
          <h1>Canais de apoio</h1>
          <p className="subtitulo">Serviços gratuitos ou de baixo custo. Os nacionais aparecem em qualquer cidade.</p>
        </div>
      </header>

      <div className="cartao formulario-linha">
        <label className="campo">
          <span>Tipo de serviço</span>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">Todos</option>
            {tipos.map((t) => (
              <option key={t} value={t}>
                {NOME_TIPO_RECURSO[t] ?? t}
              </option>
            ))}
          </select>
        </label>
        <label className="campo">
          <span>Cidade</span>
          <select value={cidade} onChange={(e) => setCidade(e.target.value)}>
            <option value="">Todas</option>
            {cidades.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="caixa-marcacao alinhar-base">
          <input type="checkbox" checked={soGratuitos} onChange={(e) => setSoGratuitos(e.target.checked)} />
          Somente gratuitos
        </label>
      </div>

      {erro && <p className="erro">{erro}</p>}

      <section className="grade-recursos">
        {recursos.length === 0 && <p className="dica">Nenhum serviço encontrado com esses filtros.</p>}
        {recursos.map((r) => (
          <article key={r.id} className="cartao recurso">
            <div className="recurso-topo">
              <span className="etiqueta">{NOME_TIPO_RECURSO[r.tipo] ?? r.tipo}</span>
              <span className={r.gratuito ? 'etiqueta gratuito' : 'etiqueta'}>{r.gratuito ? 'Gratuito' : 'Baixo custo'}</span>
            </div>
            <h2>{r.nome}</h2>
            <p>{r.contato}</p>
            <p className="dica">{r.cidade === 'Nacional' ? 'Atendimento em todo o Brasil' : r.cidade}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
