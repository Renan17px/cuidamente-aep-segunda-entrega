/**
 * Tipos e enumerações compartilhados pelo domínio do CuidaMente.
 */

export enum TipoUsuario {
  PACIENTE = 'PACIENTE',
  ADMIN = 'ADMIN',
}

export enum TipoTriagem {
  DEPRESSAO = 'DEPRESSAO',
  ANSIEDADE = 'ANSIEDADE',
}

/** Níveis de resultado definidos no RF01: Bem, Atenção ou Crise. */
export enum NivelResultado {
  BEM = 'BEM',
  ATENCAO = 'ATENCAO',
  CRISE = 'CRISE',
}

/** Opções de resposta padronizadas dos instrumentos PHQ-9 e GAD-7. */
export const OPCOES_RESPOSTA: ReadonlyArray<{ valor: number; texto: string }> = [
  { valor: 0, texto: 'Nenhuma vez' },
  { valor: 1, texto: 'Vários dias' },
  { valor: 2, texto: 'Mais da metade dos dias' },
  { valor: 3, texto: 'Quase todos os dias' },
];

export interface Pergunta {
  id: number;
  texto: string;
}
