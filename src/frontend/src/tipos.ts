/** Tipos espelhando o JSON devolvido pela API (models do back-end). */

export type TipoUsuario = 'PACIENTE' | 'ADMIN';
export type TipoTriagem = 'DEPRESSAO' | 'ANSIEDADE';
export type NivelResultado = 'BEM' | 'ATENCAO' | 'CRISE';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipoUsuario: TipoUsuario;
  descricaoPerfil: string;
  permissoes: string[];
  criadoEm: string;
}

export interface Resposta {
  id?: number;
  perguntaId: number;
  valorResposta: number;
}

export interface Triagem {
  id: number;
  tipo: TipoTriagem;
  instrumento: string;
  dataTriagem: string;
  usuarioId: number;
  pontuacao: number;
  pontuacaoMaxima: number;
  nivelResultado: NivelResultado;
  respostas: Resposta[];
}

export interface Pergunta {
  id: number;
  texto: string;
}

export interface Questionario {
  tipo: TipoTriagem;
  instrumento: string;
  enunciado: string;
  perguntas: Pergunta[];
  opcoes: Array<{ valor: number; texto: string }>;
}

export interface Lembrete {
  id: number;
  descricao: string;
  horario: string;
  ativo: boolean;
  usuarioId: number;
}

export interface Recurso {
  id: number;
  nome: string;
  tipo: string;
  contato: string;
  cidade: string;
  gratuito: boolean;
}

export const NOME_TRIAGEM: Record<TipoTriagem, string> = {
  DEPRESSAO: 'Humor (PHQ-9)',
  ANSIEDADE: 'Ansiedade (GAD-7)',
};

export const NOME_NIVEL: Record<NivelResultado, string> = {
  BEM: 'Bem',
  ATENCAO: 'Atenção',
  CRISE: 'Crise',
};

export const NOME_TIPO_RECURSO: Record<string, string> = {
  CVV: 'CVV',
  CAPS: 'CAPS',
  UBS: 'UBS',
  EMERGENCIA: 'Emergência',
  TELEATENDIMENTO: 'Teleatendimento',
  CLINICA_ESCOLA: 'Clínica-escola',
  OUTRO: 'Outro',
};

export function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}
