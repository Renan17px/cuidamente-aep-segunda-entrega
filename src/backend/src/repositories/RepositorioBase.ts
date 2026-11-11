import { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { Repositorio } from './Repositorio';

/**
 * Classe ABSTRATA que implementa as operações de CRUD comuns a todas as
 * tabelas (buscar por id, listar e excluir). As subclasses informam a
 * tabela, a chave primária e como transformar uma linha do banco em objeto
 * (mapearLinha), além de implementarem criar() e atualizar().
 */
export abstract class RepositorioBase<T> implements Repositorio<T> {
  protected readonly pool: Pool;

  protected constructor(pool: Pool) {
    this.pool = pool;
  }

  protected abstract getTabela(): string;

  protected abstract getChavePrimaria(): string;

  protected abstract mapearLinha(linha: RowDataPacket): T;

  public abstract criar(entidade: T): Promise<T>;

  public abstract atualizar(entidade: T): Promise<T>;

  /** Coluna de ordenação padrão; pode ser sobrescrita. */
  protected getOrdenacao(): string {
    return `${this.getChavePrimaria()} ASC`;
  }

  public async buscarPorId(id: number): Promise<T | null> {
    const [linhas] = await this.pool.query<RowDataPacket[]>(
      `SELECT * FROM ${this.getTabela()} WHERE ${this.getChavePrimaria()} = ?`,
      [id],
    );
    return linhas.length > 0 ? this.mapearLinha(linhas[0]) : null;
  }

  public async listar(): Promise<T[]> {
    const [linhas] = await this.pool.query<RowDataPacket[]>(
      `SELECT * FROM ${this.getTabela()} ORDER BY ${this.getOrdenacao()}`,
    );
    return linhas.map((linha) => this.mapearLinha(linha));
  }

  public async excluir(id: number): Promise<boolean> {
    const [resultado] = await this.pool.execute<ResultSetHeader>(
      `DELETE FROM ${this.getTabela()} WHERE ${this.getChavePrimaria()} = ?`,
      [id],
    );
    return resultado.affectedRows > 0;
  }

  /** Garante que a entidade já foi gravada (possui id) antes de UPDATE/relacionamentos. */
  protected idObrigatorio(id: number | undefined): number {
    if (id === undefined) {
      throw new Error(`Registro de ${this.getTabela()} sem identificador.`);
    }
    return id;
  }

  /** MySQL devolve BOOLEAN como TINYINT (0/1). */
  protected paraBooleano(valor: unknown): boolean {
    return valor === true || valor === 1 || valor === '1';
  }
}
