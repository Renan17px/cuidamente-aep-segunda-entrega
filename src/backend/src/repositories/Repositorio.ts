/**
 * Contrato genérico de CRUD (Create, Read, Update, Delete).
 * Cada entidade persistida possui um repositório que implementa esta interface.
 */
export interface Repositorio<T> {
  criar(entidade: T): Promise<T>;
  buscarPorId(id: number): Promise<T | null>;
  listar(): Promise<T[]>;
  atualizar(entidade: T): Promise<T>;
  excluir(id: number): Promise<boolean>;
}
