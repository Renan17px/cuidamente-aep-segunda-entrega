import { TriagemRepository } from '../repositories/TriagemRepository';
import { Triagem } from '../models/Triagem';
import { TriagemFactory } from '../models/TriagemFactory';
import { Paciente } from '../models/Paciente';
import { Usuario } from '../models/Usuario';
import { OPCOES_RESPOSTA, TipoTriagem } from '../models/tipos';
import { ErroAcessoNegado, ErroApp, ErroNaoEncontrado } from '../middlewares/erros';

export interface RespostaEntrada {
  perguntaId: number;
  valor: number;
}

/** Regras de negócio da triagem (RF01, RF02, RF05 e RF06). */
export class TriagemService {
  public constructor(private readonly triagens: TriagemRepository) {}

  /** Questionário que o chatbot apresenta ao usuário. */
  public obterQuestionario(tipo: string): Record<string, unknown> {
    const modelo = TriagemFactory.criar(tipo.toUpperCase(), { usuarioId: 0 });
    return {
      tipo: modelo.getTipo(),
      instrumento: modelo.getInstrumento(),
      enunciado: 'Nas últimas 2 semanas, com que frequência você foi incomodado(a) por:',
      perguntas: modelo.getPerguntas(),
      opcoes: OPCOES_RESPOSTA,
    };
  }

  public listarQuestionarios(): Array<Record<string, unknown>> {
    return TriagemFactory.tiposDisponiveis().map((tipo) => this.obterQuestionario(tipo));
  }

  // CREATE
  public async realizar(usuario: Usuario, tipo: string, respostas: RespostaEntrada[]): Promise<Triagem> {
    if (!(usuario instanceof Paciente)) {
      throw new ErroAcessoNegado('Somente pacientes realizam triagens.');
    }
    const lista = this.normalizarRespostas(respostas);
    const triagem = usuario.realizarTriagem(String(tipo).toUpperCase() as TipoTriagem, lista);
    return this.triagens.criar(triagem);
  }

  // READ
  public async listarDoUsuario(usuario: Usuario, tipo?: string): Promise<Triagem[]> {
    return this.triagens.listarPorUsuario(usuario.getId() as number, tipo ? tipo.toUpperCase() : undefined);
  }

  public async buscar(usuario: Usuario, id: number): Promise<Triagem> {
    const triagem = await this.triagens.buscarPorId(id);
    if (!triagem) throw new ErroNaoEncontrado('Triagem');
    if (triagem.getUsuarioId() !== usuario.getId()) {
      throw new ErroAcessoNegado('Esta triagem pertence a outro usuário.');
    }
    return triagem;
  }

  // UPDATE: corrige as respostas e recalcula o nível automaticamente
  public async corrigir(usuario: Usuario, id: number, respostas: RespostaEntrada[]): Promise<Triagem> {
    const triagem = await this.buscar(usuario, id);
    triagem.limparRespostas();
    for (const r of this.normalizarRespostas(respostas)) {
      triagem.adicionarResposta(r.perguntaId, r.valor);
    }
    triagem.validarCompleta();
    return this.triagens.atualizar(triagem);
  }

  // DELETE
  public async excluir(usuario: Usuario, id: number): Promise<void> {
    await this.buscar(usuario, id);
    await this.triagens.excluir(id);
  }

  /** Resumo usado no painel (RF05). */
  public async resumo(usuario: Usuario): Promise<Record<string, unknown>> {
    const historico = await this.listarDoUsuario(usuario);
    const ultimaPorTipo: Record<string, unknown> = {};
    for (const triagem of historico) {
      ultimaPorTipo[triagem.getTipo()] = triagem.toJSON();
    }
    return {
      totalTriagens: historico.length,
      ultimaPorTipo,
      historico: historico.map((t) => t.toJSON()),
    };
  }

  private normalizarRespostas(respostas: unknown): RespostaEntrada[] {
    if (!Array.isArray(respostas) || respostas.length === 0) {
      throw new ErroApp('Envie a lista de respostas do questionário.');
    }
    return respostas.map((r) => ({
      perguntaId: Number((r as RespostaEntrada).perguntaId),
      valor: Number((r as RespostaEntrada).valor),
    }));
  }
}
