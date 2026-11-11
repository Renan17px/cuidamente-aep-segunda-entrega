import { Usuario, DadosUsuario } from './Usuario';
import { TipoTriagem, TipoUsuario } from './tipos';
import { Triagem } from './Triagem';
import { TriagemFactory } from './TriagemFactory';

/**
 * Paciente HERDA de Usuario.
 * É o perfil que realiza triagens, acompanha o histórico e configura lembretes.
 */
export class Paciente extends Usuario {
  public constructor(dados: DadosUsuario) {
    super(dados);
  }

  public override getTipo(): TipoUsuario {
    return TipoUsuario.PACIENTE;
  }

  public override getPermissoes(): string[] {
    return ['REALIZAR_TRIAGEM', 'VER_HISTORICO', 'GERENCIAR_LEMBRETES', 'VER_RECURSOS'];
  }

  public override getDescricaoPerfil(): string {
    return 'Paciente';
  }

  /**
   * realizarTriagem() do diagrama de classes.
   * Cria a triagem correta (PHQ-9 ou GAD-7) e já a compõe com as respostas.
   * O retorno é do tipo abstrato Triagem: quem chama não precisa saber
   * qual subclasse foi criada (polimorfismo).
   */
  public realizarTriagem(tipo: TipoTriagem, respostas: Array<{ perguntaId: number; valor: number }>): Triagem {
    const id = this.getId();
    if (id === undefined) {
      throw new Error('O paciente precisa estar cadastrado para realizar uma triagem.');
    }
    const triagem = TriagemFactory.criar(tipo, { usuarioId: id });
    for (const r of respostas) {
      triagem.adicionarResposta(r.perguntaId, r.valor);
    }
    triagem.validarCompleta();
    return triagem;
  }
}
