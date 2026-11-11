export interface DadosLembrete {
  id?: number;
  descricao: string;
  horario: string; // HH:MM ou HH:MM:SS
  ativo?: boolean;
  usuarioId: number;
}

/**
 * Lembrete de autocuidado configurado pelo paciente (RF03).
 * Relacionamento "possui": Paciente 1 : N Lembrete.
 */
export class Lembrete {
  private id?: number;
  private descricao: string;
  private horario: string;
  private ativo: boolean;
  private readonly usuarioId: number;

  public constructor(dados: DadosLembrete) {
    this.id = dados.id;
    this.descricao = Lembrete.validarDescricao(dados.descricao);
    this.horario = Lembrete.normalizarHorario(dados.horario);
    this.ativo = dados.ativo ?? true;
    this.usuarioId = dados.usuarioId;
  }

  /** Verifica se o lembrete deve disparar no horário informado (HH:MM). */
  public deveDisparar(horaMinuto: string): boolean {
    return this.ativo && this.horario.slice(0, 5) === horaMinuto;
  }

  public alternar(): void {
    this.ativo = !this.ativo;
  }

  public getId(): number | undefined {
    return this.id;
  }

  public setId(id: number): void {
    this.id = id;
  }

  public getDescricao(): string {
    return this.descricao;
  }

  public setDescricao(descricao: string): void {
    this.descricao = Lembrete.validarDescricao(descricao);
  }

  public getHorario(): string {
    return this.horario;
  }

  public setHorario(horario: string): void {
    this.horario = Lembrete.normalizarHorario(horario);
  }

  public isAtivo(): boolean {
    return this.ativo;
  }

  public setAtivo(ativo: boolean): void {
    this.ativo = ativo;
  }

  public getUsuarioId(): number {
    return this.usuarioId;
  }

  public toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      descricao: this.descricao,
      horario: this.horario.slice(0, 5),
      ativo: this.ativo,
      usuarioId: this.usuarioId,
    };
  }

  private static validarDescricao(descricao: string): string {
    const limpa = (descricao ?? '').trim();
    if (limpa.length < 2 || limpa.length > 255) {
      throw new Error('A descrição do lembrete deve ter entre 2 e 255 caracteres.');
    }
    return limpa;
  }

  private static normalizarHorario(horario: string): string {
    const match = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.exec((horario ?? '').trim());
    if (!match) {
      throw new Error('Horário inválido. Use o formato HH:MM.');
    }
    return `${match[1]}:${match[2]}:${match[3] ?? '00'}`;
  }
}
