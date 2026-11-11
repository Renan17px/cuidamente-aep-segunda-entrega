import { useEffect, useRef, useState } from 'react';
import { api } from '../api';
import { Lembrete } from '../tipos';

interface Alerta {
  chave: string;
  descricao: string;
  horario: string;
}

function horaAtual(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function hoje(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/**
 * RF03 — exibe notificações na plataforma no horário definido em cada lembrete.
 * Verifica a cada 15 segundos e recarrega a lista do banco a cada minuto
 * (ou imediatamente quando a tela de lembretes avisa que algo mudou).
 */
export function AlertasLembrete() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const lembretes = useRef<Lembrete[]>([]);
  const disparados = useRef<Set<string>>(new Set());

  useEffect(() => {
    const verificar = () => {
      const hora = horaAtual();
      for (const l of lembretes.current) {
        const chave = `${l.id}-${hoje()}-${hora}`;
        if (l.ativo && l.horario === hora && !disparados.current.has(chave)) {
          disparados.current.add(chave);
          setAlertas((atual) => [...atual, { chave, descricao: l.descricao, horario: l.horario }]);
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('CuidaMente', { body: `${l.horario} · ${l.descricao}` });
          }
        }
      }
    };

    // Recarrega do banco e já verifica, para não perder um lembrete criado para este minuto.
    const recarregar = () => {
      api
        .get<Lembrete[]>('/lembretes')
        .then((lista) => {
          lembretes.current = lista;
          verificar();
        })
        .catch(() => undefined);
    };

    recarregar();
    const intervaloLista = window.setInterval(recarregar, 60_000);
    const intervaloVerificacao = window.setInterval(verificar, 15_000);
    window.addEventListener('cuidamente:lembretes-alterados', recarregar);

    return () => {
      window.clearInterval(intervaloLista);
      window.clearInterval(intervaloVerificacao);
      window.removeEventListener('cuidamente:lembretes-alterados', recarregar);
    };
  }, []);

  if (alertas.length === 0) return null;

  return (
    <div className="pilha-alertas" aria-live="polite">
      {alertas.map((a) => (
        <div key={a.chave} className="alerta-lembrete" role="status">
          <span className="alerta-icone" aria-hidden="true">
            ⏰
          </span>
          <div>
            <strong>Hora do autocuidado</strong>
            <p>
              {a.horario} · {a.descricao}
            </p>
          </div>
          <button
            className="botao-icone"
            aria-label="Dispensar lembrete"
            onClick={() => setAlertas((atual) => atual.filter((x) => x.chave !== a.chave))}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
