import { NivelResultado } from './tipos';

/**
 * INTERFACE «Avaliavel» do diagrama de classes.
 * Todo questionário avaliável precisa saber calcular sua pontuação
 * e classificar o resultado em Bem, Atenção ou Crise.
 */
export interface Avaliavel {
  calcularPontuacao(): number;
  calcularNivel(): NivelResultado;
}
