import { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { RepositorioBase } from './RepositorioBase';
import { Lembrete } from '../models/Lembrete';

/** CRUD da tabela lembretes (RF03). */
export class LembreteRepository extends RepositorioBase<Lembrete> {
  public constructor(pool: Pool) {
    super(pool);
  }

  protected override getTabela(): string {
    return 'lembretes';
  }

  protected override getChavePrimaria(): string {
    return 'lembretes_id';
  }

  protected override getOrdenacao(): string {
    return 'horario ASC';
  }

  protected override mapearLinha(linha: RowDataPacket): Lembrete {
    return new Lembrete({
      id: Number(linha.lembretes_id),
      descricao: String(linha.descricao),
      horario: String(linha.horario),
      ativo: this.paraBooleano(linha.ativo),
      usuarioId: Number(linha.usuario_id),
    });
  }

  public override async criar(lembrete: Lembrete): Promise<Lembrete> {
    const [resultado] = await this.pool.execute<ResultSetHeader>(
      'INSERT INTO lembretes (descricao, horario, ativo, usuario_id) VALUES (?, ?, ?, ?)',
      [lembrete.getDescricao(), lembrete.getHorario(), lembrete.isAtivo(), lembrete.getUsuarioId()],
    );
    lembrete.setId(resultado.insertId);
    return lembrete;
  }

  public override async atualizar(lembrete: Lembrete): Promise<Lembrete> {
    await this.pool.execute(
      'UPDATE lembretes SET descricao = ?, horario = ?, ativo = ? WHERE lembretes_id = ?',
      [lembrete.getDescricao(), lembrete.getHorario(), lembrete.isAtivo(), this.idObrigatorio(lembrete.getId())],
    );
    return lembrete;
  }

  public async listarPorUsuario(usuarioId: number): Promise<Lembrete[]> {
    const [linhas] = await this.pool.query<RowDataPacket[]>(
      `SELECT * FROM lembretes WHERE usuario_id = ? ORDER BY ${this.getOrdenacao()}`,
      [usuarioId],
    );
    return linhas.map((linha) => this.mapearLinha(linha));
  }
}
