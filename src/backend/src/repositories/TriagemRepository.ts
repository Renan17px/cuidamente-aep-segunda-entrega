import { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { RepositorioBase } from './RepositorioBase';
import { Triagem } from '../models/Triagem';
import { TriagemFactory } from '../models/TriagemFactory';

/**
 * CRUD da entidade principal (Triagem) e de suas Respostas.
 * Como Triagem e Resposta formam uma composição, ambas são gravadas
 * dentro da mesma TRANSAÇÃO: ou tudo é salvo, ou nada é salvo.
 */
export class TriagemRepository extends RepositorioBase<Triagem> {
  public constructor(pool: Pool) {
    super(pool);
  }

  protected override getTabela(): string {
    return 'triagens';
  }

  protected override getChavePrimaria(): string {
    return 'triagem_id';
  }

  protected override getOrdenacao(): string {
    return 'data_triagem ASC, triagem_id ASC';
  }

  /** Cria a subclasse certa (TriagemDepressao/TriagemAnsiedade) sem respostas. */
  protected override mapearLinha(linha: RowDataPacket): Triagem {
    return TriagemFactory.criar(String(linha.tipo), {
      id: Number(linha.triagem_id),
      usuarioId: Number(linha.usuario_id),
      dataTriagem: String(linha.data_triagem),
    });
  }

  // ------------------------------- CREATE -------------------------------

  public override async criar(triagem: Triagem): Promise<Triagem> {
    return this.emTransacao(async (conexao) => {
      const [resultado] = await conexao.execute<ResultSetHeader>(
        'INSERT INTO triagens (tipo, nivel_resultado, data_triagem, usuario_id) VALUES (?, ?, ?, ?)',
        [triagem.getTipo(), triagem.calcularNivel(), triagem.getDataTriagem(), triagem.getUsuarioId()],
      );
      triagem.setId(resultado.insertId);
      await this.inserirRespostas(conexao, triagem);
      return triagem;
    });
  }

  // -------------------------------- READ --------------------------------

  public override async buscarPorId(id: number): Promise<Triagem | null> {
    const triagem = await super.buscarPorId(id);
    if (!triagem) return null;
    await this.carregarRespostas([triagem]);
    return triagem;
  }

  public override async listar(): Promise<Triagem[]> {
    const triagens = await super.listar();
    await this.carregarRespostas(triagens);
    return triagens;
  }

  /** Histórico do usuário em ordem cronológica (RF02 / RF05). */
  public async listarPorUsuario(usuarioId: number, tipo?: string): Promise<Triagem[]> {
    const filtros: Array<string | number> = [usuarioId];
    let sql = 'SELECT * FROM triagens WHERE usuario_id = ?';
    if (tipo) {
      sql += ' AND tipo = ?';
      filtros.push(tipo);
    }
    sql += ` ORDER BY ${this.getOrdenacao()}`;
    const [linhas] = await this.pool.query<RowDataPacket[]>(sql, filtros);
    const triagens = linhas.map((linha) => this.mapearLinha(linha));
    await this.carregarRespostas(triagens);
    return triagens;
  }

  // ------------------------------- UPDATE -------------------------------

  /** Substitui as respostas e grava o novo nível recalculado. */
  public override async atualizar(triagem: Triagem): Promise<Triagem> {
    return this.emTransacao(async (conexao) => {
      await conexao.execute('UPDATE triagens SET nivel_resultado = ? WHERE triagem_id = ?', [
        triagem.calcularNivel(),
        this.idObrigatorio(triagem.getId()),
      ]);
      await conexao.execute('DELETE FROM respostas WHERE triagem_id = ?', [this.idObrigatorio(triagem.getId())]);
      await this.inserirRespostas(conexao, triagem);
      return triagem;
    });
  }

  // DELETE: herdado de RepositorioBase. As respostas são removidas pelo
  // ON DELETE CASCADE do banco (a parte não existe sem o todo).

  // ------------------------------ auxiliares ------------------------------

  private async inserirRespostas(conexao: PoolConnection, triagem: Triagem): Promise<void> {
    for (const resposta of triagem.getRespostas()) {
      const [resultado] = await conexao.execute<ResultSetHeader>(
        'INSERT INTO respostas (pergunta_id, valor_resposta, triagem_id) VALUES (?, ?, ?)',
        [resposta.getPerguntaId(), resposta.getValorResposta(), this.idObrigatorio(triagem.getId())],
      );
      resposta.setId(resultado.insertId);
    }
  }

  /** Busca as respostas de várias triagens com uma única consulta. */
  private async carregarRespostas(triagens: Triagem[]): Promise<void> {
    if (triagens.length === 0) return;
    const ids = triagens.map((t) => t.getId());
    const [linhas] = await this.pool.query<RowDataPacket[]>(
      'SELECT * FROM respostas WHERE triagem_id IN (?) ORDER BY pergunta_id ASC',
      [ids],
    );
    const porId = new Map(triagens.map((t) => [t.getId(), t]));
    for (const linha of linhas) {
      porId
        .get(Number(linha.triagem_id))
        ?.adicionarResposta(Number(linha.pergunta_id), Number(linha.valor_resposta), Number(linha.respostas_id));
    }
  }

  private async emTransacao<R>(operacao: (conexao: PoolConnection) => Promise<R>): Promise<R> {
    const conexao = await this.pool.getConnection();
    try {
      await conexao.beginTransaction();
      const resultado = await operacao(conexao);
      await conexao.commit();
      return resultado;
    } catch (erro) {
      await conexao.rollback();
      throw erro;
    } finally {
      conexao.release();
    }
  }
}
