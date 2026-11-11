/**
 * Resposta individual de uma pergunta da triagem.
 * Faz parte da COMPOSIÇÃO Triagem 1 ──◆ N Resposta: é criada pela própria
 * Triagem (Triagem.adicionarResposta) e não existe fora dela.
 */
export class Resposta {
  private id?: number;
  private readonly perguntaId: number;
  private readonly valorResposta: number;

  public constructor(perguntaId: number, valorResposta: number, id?: number) {
    if (!Number.isInteger(perguntaId) || perguntaId < 1) {
      throw new Error('Identificador de pergunta inválido.');
    }
    if (!Number.isInteger(valorResposta) || valorResposta < 0 || valorResposta > 3) {
      throw new Error('Cada resposta deve valer de 0 a 3.');
    }
    this.perguntaId = perguntaId;
    this.valorResposta = valorResposta;
    this.id = id;
  }

  public getId(): number | undefined {
    return this.id;
  }

  public setId(id: number): void {
    this.id = id;
  }

  public getPerguntaId(): number {
    return this.perguntaId;
  }

  public getValorResposta(): number {
    return this.valorResposta;
  }

  public toJSON(): Record<string, unknown> {
    return { id: this.id, perguntaId: this.perguntaId, valorResposta: this.valorResposta };
  }
}
