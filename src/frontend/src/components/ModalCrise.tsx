import { useEffect, useState } from 'react';
import { api } from '../api';
import { Recurso } from '../tipos';

const CHAVE_CIDADE = 'cuidamente.cidade';

function lerCidade(): string {
  try {
    return localStorage.getItem(CHAVE_CIDADE) ?? '';
  } catch {
    return '';
  }
}

interface Props {
  aberto: boolean;
  aoFechar: () => void;
}

/**
 * RF06 — modal de alerta com os contatos de emergência
 * (CVV 188, SAMU 192 e CAPS da cidade do usuário).
 */
export function ModalCrise({ aberto, aoFechar }: Props) {
  const [cidades, setCidades] = useState<string[]>([]);
  const [cidade, setCidade] = useState<string>(lerCidade);
  const [caps, setCaps] = useState<Recurso[]>([]);

  useEffect(() => {
    if (!aberto) return;
    api.get<{ cidades: string[] }>('/recursos/filtros').then((r) => setCidades(r.cidades)).catch(() => undefined);
  }, [aberto]);

  useEffect(() => {
    if (!aberto) return;
    try {
      localStorage.setItem(CHAVE_CIDADE, cidade);
    } catch {
      /* ignora */
    }
    if (!cidade) {
      setCaps([]);
      return;
    }
    api
      .get<{ capsLocal: Recurso[] }>(`/recursos/emergencia?cidade=${encodeURIComponent(cidade)}`)
      .then((r) => setCaps(r.capsLocal))
      .catch(() => setCaps([]));
  }, [aberto, cidade]);

  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e: KeyboardEvent) => e.key === 'Escape' && aoFechar();
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [aberto, aoFechar]);

  if (!aberto) return null;

  return (
    <div className="modal-fundo" role="presentation" onClick={aoFechar}>
      <div
        className="modal modal-crise"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="titulo-crise"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="titulo-crise">Você não está sozinho(a)</h2>
        <p>
          Pelo que você respondeu, este pode ser um momento difícil. Conversar com alguém agora pode ajudar.
          Esses serviços são gratuitos e sigilosos:
        </p>

        <div className="contatos-emergencia">
          <a className="contato-grande" href="tel:188">
            <span className="numero">188</span>
            <span>
              <strong>CVV</strong>
              <br />
              Apoio emocional 24h, por telefone ou chat em cvv.org.br
            </span>
          </a>
          <a className="contato-grande urgente" href="tel:192">
            <span className="numero">192</span>
            <span>
              <strong>SAMU</strong>
              <br />
              Se você corre risco imediato
            </span>
          </a>
        </div>

        <label className="campo">
          <span>CAPS da sua cidade</span>
          <select value={cidade} onChange={(e) => setCidade(e.target.value)}>
            <option value="">Selecione a cidade</option>
            {cidades.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        {cidade && caps.length === 0 && (
          <p className="dica">Ainda não há CAPS cadastrado para {cidade}. Procure a UBS mais próxima ou ligue 136.</p>
        )}
        {caps.map((c) => (
          <div key={c.id} className="caps-item">
            <strong>{c.nome}</strong>
            <span>{c.contato}</span>
          </div>
        ))}

        <p className="dica">Se puder, avise alguém de confiança e não fique sozinho(a) agora.</p>
        <button className="botao" onClick={aoFechar}>
          Entendi
        </button>
      </div>
    </div>
  );
}
