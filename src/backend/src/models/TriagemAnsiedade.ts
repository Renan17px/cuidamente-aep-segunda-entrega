import { Triagem, DadosTriagem } from './Triagem';
import { NivelResultado, Pergunta, TipoTriagem } from './tipos';

/**
 * Triagem de sintomas de ansiedade baseada no GAD-7
 * (Spitzer et al., 2006). Período de referência: últimas 2 semanas.
 */
export class TriagemAnsiedade extends Triagem {
  public static readonly PERGUNTAS: ReadonlyArray<Pergunta> = [
    { id: 1, texto: 'Se sentir nervoso(a), ansioso(a) ou muito tenso(a)' },
    { id: 2, texto: 'Não ser capaz de impedir ou de controlar as preocupações' },
    { id: 3, texto: 'Se preocupar muito com diversas coisas' },
    { id: 4, texto: 'Dificuldade para relaxar' },
    { id: 5, texto: 'Ficar tão agitado(a) que se torna difícil permanecer sentado(a)' },
    { id: 6, texto: 'Ficar facilmente aborrecido(a) ou irritado(a)' },
    { id: 7, texto: 'Sentir medo como se algo horrível fosse acontecer' },
  ];

  public constructor(dados: DadosTriagem) {
    super(dados);
  }

  public override getTipo(): TipoTriagem {
    return TipoTriagem.ANSIEDADE;
  }

  public override getInstrumento(): string {
    return 'GAD-7';
  }

  public override getPerguntas(): ReadonlyArray<Pergunta> {
    return TriagemAnsiedade.PERGUNTAS;
  }

  /**
   * Regra do GAD-7 (0 a 21 pontos):
   *  - CRISE: 15 pontos ou mais (ansiedade grave);
   *  - ATENÇÃO: 5 a 14 pontos (leve a moderada);
   *  - BEM: 0 a 4 pontos (mínima).
   */
  public override calcularNivel(): NivelResultado {
    const pontuacao = this.calcularPontuacao();
    if (pontuacao >= 15) {
      return NivelResultado.CRISE;
    }
    if (pontuacao >= 5) {
      return NivelResultado.ATENCAO;
    }
    return NivelResultado.BEM;
  }
}
