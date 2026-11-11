import { Usuario, DadosUsuario } from './Usuario';
import { TipoUsuario } from './tipos';
import { RecursoApoio } from './RecursoApoio';

/**
 * Administrador HERDA de Usuario.
 * É o perfil responsável por manter o catálogo de canais de apoio (RF04).
 */
export class Administrador extends Usuario {
  public constructor(dados: DadosUsuario) {
    super(dados);
  }

  public override getTipo(): TipoUsuario {
    return TipoUsuario.ADMIN;
  }

  public override getPermissoes(): string[] {
    return ['GERENCIAR_RECURSOS', 'GERENCIAR_USUARIOS', 'VER_RECURSOS'];
  }

  public override getDescricaoPerfil(): string {
    return 'Administrador';
  }

  /**
   * gerenciarRecursos() do diagrama de classes.
   * Valida e prepara um recurso para ser gravado no catálogo.
   */
  public gerenciarRecursos(recurso: RecursoApoio): RecursoApoio {
    if (!this.possuiPermissao('GERENCIAR_RECURSOS')) {
      throw new Error('Usuário sem permissão para gerenciar recursos.');
    }
    recurso.validar();
    return recurso;
  }
}
