import { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { RepositorioBase } from './RepositorioBase';
import { Usuario } from '../models/Usuario';
import { Paciente } from '../models/Paciente';
import { Administrador } from '../models/Administrador';
import { TipoUsuario } from '../models/tipos';

/** CRUD da tabela usuarios (herança single-table via tipo_usuario). */
export class UsuarioRepository extends RepositorioBase<Usuario> {
  public constructor(pool: Pool) {
    super(pool);
  }

  protected override getTabela(): string {
    return 'usuarios';
  }

  protected override getChavePrimaria(): string {
    return 'usuario_id';
  }

  protected override getOrdenacao(): string {
    return 'nome ASC';
  }

  /** Cria o objeto da subclasse correta conforme tipo_usuario. */
  protected override mapearLinha(linha: RowDataPacket): Usuario {
    const dados = {
      id: Number(linha.usuario_id),
      nome: String(linha.nome),
      email: String(linha.email),
      senha: String(linha.senha),
      criadoEm: String(linha.criado_em),
    };
    return linha.tipo_usuario === TipoUsuario.ADMIN ? new Administrador(dados) : new Paciente(dados);
  }

  public override async criar(usuario: Usuario): Promise<Usuario> {
    const [resultado] = await this.pool.execute<ResultSetHeader>(
      'INSERT INTO usuarios (nome, email, senha, tipo_usuario, criado_em) VALUES (?, ?, ?, ?, ?)',
      [usuario.getNome(), usuario.getEmail(), usuario.getSenha(), usuario.getTipo(), usuario.getCriadoEm()],
    );
    usuario.setId(resultado.insertId);
    return usuario;
  }

  public override async atualizar(usuario: Usuario): Promise<Usuario> {
    await this.pool.execute(
      'UPDATE usuarios SET nome = ?, email = ?, senha = ? WHERE usuario_id = ?',
      [usuario.getNome(), usuario.getEmail(), usuario.getSenha(), this.idObrigatorio(usuario.getId())],
    );
    return usuario;
  }

  public async buscarPorEmail(email: string): Promise<Usuario | null> {
    const [linhas] = await this.pool.query<RowDataPacket[]>('SELECT * FROM usuarios WHERE email = ?', [
      email.trim().toLowerCase(),
    ]);
    return linhas.length > 0 ? this.mapearLinha(linhas[0]) : null;
  }

  public async contarAdministradores(): Promise<number> {
    const [linhas] = await this.pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS total FROM usuarios WHERE tipo_usuario = 'ADMIN'",
    );
    return Number(linhas[0].total);
  }
}
