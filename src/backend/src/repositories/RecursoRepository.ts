import { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { RepositorioBase } from './RepositorioBase';
import { RecursoApoio } from '../models/RecursoApoio';

export interface FiltroRecursos {
  tipo?: string;
  cidade?: string;
  gratuito?: boolean;
}

/** CRUD da tabela recursos (RF04). */
export class RecursoRepository extends RepositorioBase<RecursoApoio> {
  public constructor(pool: Pool) {
    super(pool);
  }

  protected override getTabela(): string {
    return 'recursos';
  }

  protected override getChavePrimaria(): string {
    return 'recursos_id';
  }

  /** Serviços nacionais aparecem primeiro, depois por cidade e nome. */
  protected override getOrdenacao(): string {
    return "(cidade = 'Nacional') DESC, cidade ASC, nome ASC";
  }

  protected override mapearLinha(linha: RowDataPacket): RecursoApoio {
    return new RecursoApoio({
      id: Number(linha.recursos_id),
      nome: String(linha.nome),
      tipo: String(linha.tipo),
      contato: String(linha.contato),
      cidade: String(linha.cidade),
      gratuito: this.paraBooleano(linha.gratuito),
    });
  }

  public override async criar(recurso: RecursoApoio): Promise<RecursoApoio> {
    const [resultado] = await this.pool.execute<ResultSetHeader>(
      'INSERT INTO recursos (nome, tipo, contato, cidade, gratuito) VALUES (?, ?, ?, ?, ?)',
      [recurso.getNome(), recurso.getTipo(), recurso.getContato(), recurso.getCidade(), recurso.isGratuito()],
    );
    recurso.setId(resultado.insertId);
    return recurso;
  }

  public override async atualizar(recurso: RecursoApoio): Promise<RecursoApoio> {
    await this.pool.execute(
      'UPDATE recursos SET nome = ?, tipo = ?, contato = ?, cidade = ?, gratuito = ? WHERE recursos_id = ?',
      [recurso.getNome(), recurso.getTipo(), recurso.getContato(), recurso.getCidade(), recurso.isGratuito(), this.idObrigatorio(recurso.getId())],
    );
    return recurso;
  }

  /**
   * Lista filtrando por tipo de serviço e localização.
   * Ao filtrar por cidade, os serviços nacionais também são incluídos.
   */
  public async listarComFiltro(filtro: FiltroRecursos): Promise<RecursoApoio[]> {
    const condicoes: string[] = [];
    const valores: Array<string | number> = [];
    if (filtro.tipo) {
      condicoes.push('tipo = ?');
      valores.push(filtro.tipo.toUpperCase());
    }
    if (filtro.cidade) {
      condicoes.push("(cidade = ? OR cidade = 'Nacional')");
      valores.push(filtro.cidade);
    }
    if (filtro.gratuito !== undefined) {
      condicoes.push('gratuito = ?');
      valores.push(filtro.gratuito ? 1 : 0);
    }
    const where = condicoes.length > 0 ? `WHERE ${condicoes.join(' AND ')}` : '';
    const [linhas] = await this.pool.query<RowDataPacket[]>(
      `SELECT * FROM recursos ${where} ORDER BY ${this.getOrdenacao()}`,
      valores,
    );
    return linhas.map((linha) => this.mapearLinha(linha));
  }

  public async listarCidades(): Promise<string[]> {
    const [linhas] = await this.pool.query<RowDataPacket[]>(
      "SELECT DISTINCT cidade FROM recursos WHERE cidade <> 'Nacional' ORDER BY cidade ASC",
    );
    return linhas.map((linha) => String(linha.cidade));
  }
}
