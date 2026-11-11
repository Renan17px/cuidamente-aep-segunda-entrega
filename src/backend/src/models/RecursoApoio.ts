export interface DadosRecurso {
  id?: number;
  nome: string;
  tipo: string;
  contato: string;
  cidade: string;
  gratuito?: boolean;
}

/** Tipos de serviço aceitos no catálogo (RF04). */
export const TIPOS_RECURSO = ['CVV', 'CAPS', 'UBS', 'EMERGENCIA', 'TELEATENDIMENTO', 'CLINICA_ESCOLA', 'OUTRO'] as const;

/**
 * Canal de apoio psicológico gratuito ou de baixo custo (CVV, CAPS, UBS...).
 * Gerenciado pelo Administrador (relacionamento "gerencia" 1 : N).
 */
export class RecursoApoio {
  private id?: number;
  private nome: string;
  private tipo: string;
  private contato: string;
  private cidade: string;
  private gratuito: boolean;

  public constructor(dados: DadosRecurso) {
    this.id = dados.id;
    this.nome = (dados.nome ?? '').trim();
    this.tipo = (dados.tipo ?? '').trim().toUpperCase();
    this.contato = (dados.contato ?? '').trim();
    this.cidade = (dados.cidade ?? '').trim();
    this.gratuito = dados.gratuito ?? true;
  }

  public validar(): void {
    if (this.nome.length < 2 || this.nome.length > 150) throw new Error('Nome do recurso inválido (2 a 150 caracteres).');
    if (!(TIPOS_RECURSO as readonly string[]).includes(this.tipo)) {
      throw new Error(`Tipo inválido. Use um de: ${TIPOS_RECURSO.join(', ')}.`);
    }
    if (this.contato.length < 2 || this.contato.length > 100) throw new Error('Contato inválido (2 a 100 caracteres).');
    if (this.cidade.length < 2 || this.cidade.length > 100) throw new Error('Cidade inválida (2 a 100 caracteres).');
  }

  /** Serviços nacionais (CVV, SAMU...) valem para qualquer cidade. */
  public isNacional(): boolean {
    return this.cidade.toLowerCase() === 'nacional';
  }

  public getId(): number | undefined {
    return this.id;
  }

  public setId(id: number): void {
    this.id = id;
  }

  public getNome(): string {
    return this.nome;
  }

  public getTipo(): string {
    return this.tipo;
  }

  public getContato(): string {
    return this.contato;
  }

  public getCidade(): string {
    return this.cidade;
  }

  public isGratuito(): boolean {
    return this.gratuito;
  }

  public toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      nome: this.nome,
      tipo: this.tipo,
      contato: this.contato,
      cidade: this.cidade,
      gratuito: this.gratuito,
    };
  }
}
