import { NOME_NIVEL, NivelResultado } from '../tipos';

export function SeloNivel({ nivel }: { nivel: NivelResultado }) {
  return <span className={`selo selo-${nivel.toLowerCase()}`}>{NOME_NIVEL[nivel]}</span>;
}

export const TEXTO_NIVEL: Record<NivelResultado, string> = {
  BEM: 'Seus sinais estão em um nível baixo. Continue cuidando de você com pequenas pausas e hábitos saudáveis.',
  ATENCAO:
    'Alguns sinais merecem atenção. Vale conversar com alguém de confiança e considerar procurar a UBS ou um profissional de psicologia.',
  CRISE:
    'Suas respostas indicam um momento de sofrimento importante. Procure apoio hoje: o CVV atende 24h pelo 188 e o CAPS da sua cidade pode acolher você.',
};
