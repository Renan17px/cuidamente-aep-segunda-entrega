import { Triagem, DadosTriagem } from './Triagem';
import { TriagemDepressao } from './TriagemDepressao';
import { TriagemAnsiedade } from './TriagemAnsiedade';
import { TipoTriagem } from './tipos';

/**
 * Fábrica que devolve a subclasse correta de Triagem.
 * Todo o restante do sistema trabalha com a abstração Triagem.
 */
export class TriagemFactory {
  public static criar(tipo: TipoTriagem | string, dados: DadosTriagem): Triagem {
    switch (tipo) {
      case TipoTriagem.DEPRESSAO:
        return new TriagemDepressao(dados);
      case TipoTriagem.ANSIEDADE:
        return new TriagemAnsiedade(dados);
      default:
        throw new Error(`Tipo de triagem desconhecido: ${tipo}. Use DEPRESSAO ou ANSIEDADE.`);
    }
  }

  public static tiposDisponiveis(): TipoTriagem[] {
    return [TipoTriagem.DEPRESSAO, TipoTriagem.ANSIEDADE];
  }
}
