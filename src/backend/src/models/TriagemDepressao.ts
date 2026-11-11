import { Triagem, DadosTriagem } from './Triagem';
import { NivelResultado, Pergunta, TipoTriagem } from './tipos';

/**
 * Triagem de sintomas depressivos baseada no PHQ-9
 * (Kroenke, Spitzer & Williams, 2001). Período de referência: últimas 2 semanas.
 */
export class TriagemDepressao extends Triagem {
  /** Pergunta 9 do PHQ-9: pensamentos de autolesão. */
  public static readonly PERGUNTA_RISCO = 9;

  public static readonly PERGUNTAS: ReadonlyArray<Pergunta> = [
    { id: 1, texto: 'Pouco interesse ou pouco prazer em fazer as coisas' },
    { id: 2, texto: 'Se sentir para baixo, deprimido(a) ou sem perspectiva' },
    { id: 3, texto: 'Dificuldade para pegar no sono ou permanecer dormindo, ou dormir mais do que de costume' },
    { id: 4, texto: 'Se sentir cansado(a) ou com pouca energia' },
    { id: 5, texto: 'Falta de apetite ou comer demais' },
    { id: 6, texto: 'Se sentir mal consigo mesmo(a), achar que é um fracasso ou que decepcionou sua família ou você mesmo(a)' },
    { id: 7, texto: 'Dificuldade para se concentrar nas coisas, como ler ou assistir televisão' },
    { id: 8, texto: 'Ficar tão lento(a) para se mover ou falar que outras pessoas percebem, ou o contrário: ficar tão agitado(a) que se movimenta muito mais que o normal' },
    { id: 9, texto: 'Pensar em se ferir de alguma maneira ou que seria melhor estar morto(a)' },
  ];

  public constructor(dados: DadosTriagem) {
    super(dados);
  }

  public override getTipo(): TipoTriagem {
    return TipoTriagem.DEPRESSAO;
  }

  public override getInstrumento(): string {
    return 'PHQ-9';
  }

  public override getPerguntas(): ReadonlyArray<Pergunta> {
    return TriagemDepressao.PERGUNTAS;
  }

  /**
   * Regra do PHQ-9 (0 a 27 pontos):
   *  - CRISE: 15 pontos ou mais (moderadamente grave/grave) OU qualquer
   *    resposta diferente de "Nenhuma vez" na pergunta 9 (risco de autolesão);
   *  - ATENÇÃO: 5 a 14 pontos (leve a moderado);
   *  - BEM: 0 a 4 pontos (mínimo).
   */
  public override calcularNivel(): NivelResultado {
    const pontuacao = this.calcularPontuacao();
    if (pontuacao >= 15 || this.getValorDaPergunta(TriagemDepressao.PERGUNTA_RISCO) > 0) {
      return NivelResultado.CRISE;
    }
    if (pontuacao >= 5) {
      return NivelResultado.ATENCAO;
    }
    return NivelResultado.BEM;
  }
}
