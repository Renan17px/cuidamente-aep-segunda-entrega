import { Avaliavel } from './Avaliavel';
import { Resposta } from './Resposta';
import { NivelResultado, Pergunta, TipoTriagem } from './tipos';
import { hojeLocal } from './datas';

export interface DadosTriagem {
  id?: number;
  usuarioId: number;
  dataTriagem?: string;
}

/**
 * Classe base ABSTRATA das triagens. Implementa a interface Avaliavel e
 * concentra o que é comum a TriagemDepressao e TriagemAnsiedade:
 *  - a COMPOSIÇÃO 1:N com Resposta (a lista de respostas pertence à triagem);
 *  - o cálculo da pontuação total.
 * O cálculo do NÍVEL é abstrato: cada instrumento sobrescreve calcularNivel()
 * com a sua própria regra (polimorfismo via override).
 */
export abstract class Triagem implements Avaliavel {
  private id?: number;
  private readonly usuarioId: number;
  private readonly dataTriagem: string;
  private readonly respostas: Resposta[] = [];

  protected constructor(dados: DadosTriagem) {
    this.id = dados.id;
    this.usuarioId = dados.usuarioId;
    this.dataTriagem = dados.dataTriagem ?? hojeLocal();
  }

  // ---------- contrato que cada instrumento precisa cumprir ----------

  public abstract getTipo(): TipoTriagem;

  /** Nome do instrumento validado (PHQ-9, GAD-7...). */
  public abstract getInstrumento(): string;

  public abstract getPerguntas(): ReadonlyArray<Pergunta>;

  /** Implementação da interface Avaliavel — varia por instrumento. */
  public abstract calcularNivel(): NivelResultado;

  // ---------- comportamento comum ----------

  /** Implementação da interface Avaliavel — soma das respostas. */
  public calcularPontuacao(): number {
    return this.respostas.reduce((total, r) => total + r.getValorResposta(), 0);
  }

  public getPontuacaoMaxima(): number {
    return this.getPerguntas().length * 3;
  }

  /** Composição: a própria triagem cria a Resposta que a compõe. */
  public adicionarResposta(perguntaId: number, valor: number, idResposta?: number): void {
    const existe = this.getPerguntas().some((p) => p.id === perguntaId);
    if (!existe) {
      throw new Error(`A pergunta ${perguntaId} não pertence ao questionário ${this.getInstrumento()}.`);
    }
    if (this.respostas.some((r) => r.getPerguntaId() === perguntaId)) {
      throw new Error(`A pergunta ${perguntaId} já foi respondida.`);
    }
    this.respostas.push(new Resposta(perguntaId, valor, idResposta));
  }

  public limparRespostas(): void {
    this.respostas.length = 0;
  }

  public validarCompleta(): void {
    const total = this.getPerguntas().length;
    if (this.respostas.length !== total) {
      throw new Error(`O questionário ${this.getInstrumento()} exige ${total} respostas.`);
    }
  }

  protected getValorDaPergunta(perguntaId: number): number {
    return this.respostas.find((r) => r.getPerguntaId() === perguntaId)?.getValorResposta() ?? 0;
  }

  // ---------- getters ----------

  public getId(): number | undefined {
    return this.id;
  }

  public setId(id: number): void {
    this.id = id;
  }

  public getUsuarioId(): number {
    return this.usuarioId;
  }

  public getDataTriagem(): string {
    return this.dataTriagem;
  }

  /** Cópia defensiva: ninguém de fora altera a lista diretamente. */
  public getRespostas(): Resposta[] {
    return [...this.respostas];
  }

  public toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      tipo: this.getTipo(),
      instrumento: this.getInstrumento(),
      dataTriagem: this.dataTriagem,
      usuarioId: this.usuarioId,
      pontuacao: this.calcularPontuacao(),
      pontuacaoMaxima: this.getPontuacaoMaxima(),
      nivelResultado: this.calcularNivel(),
      respostas: this.respostas.map((r) => r.toJSON()),
    };
  }
}
