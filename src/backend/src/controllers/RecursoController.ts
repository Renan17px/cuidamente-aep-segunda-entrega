import { Request, Response } from 'express';
import { recursoRepository } from '../container';
import { idDaRota, usuarioLogado } from '../middlewares/autenticacao';
import { ErroAcessoNegado, ErroNaoEncontrado } from '../middlewares/erros';
import { Administrador } from '../models/Administrador';
import { RecursoApoio, TIPOS_RECURSO } from '../models/RecursoApoio';

/** Catálogo de canais de apoio (RF04) e contatos de emergência (RF06). */
export class RecursoController {
  /** GET /api/recursos?tipo=CAPS&cidade=Maringá&gratuito=true */
  public async listar(req: Request, res: Response): Promise<void> {
    const { tipo, cidade, gratuito } = req.query;
    const recursos = await recursoRepository.listarComFiltro({
      tipo: typeof tipo === 'string' && tipo ? tipo : undefined,
      cidade: typeof cidade === 'string' && cidade ? cidade : undefined,
      gratuito: gratuito === 'true' ? true : gratuito === 'false' ? false : undefined,
    });
    res.json(recursos);
  }

  /** GET /api/recursos/filtros — cidades e tipos para os filtros da tela */
  public async filtros(_req: Request, res: Response): Promise<void> {
    res.json({ cidades: await recursoRepository.listarCidades(), tipos: TIPOS_RECURSO });
  }

  /** GET /api/recursos/emergencia?cidade=Maringá — contatos do modal de crise (RF06) */
  public async emergencia(req: Request, res: Response): Promise<void> {
    const cidade = typeof req.query.cidade === 'string' ? req.query.cidade : '';
    const nacionais = (await recursoRepository.listarComFiltro({ cidade: 'Nacional' })).filter((r) =>
      ['CVV', 'EMERGENCIA'].includes(r.getTipo()),
    );
    const capsLocal = cidade
      ? (await recursoRepository.listarComFiltro({ tipo: 'CAPS', cidade })).filter((r) => !r.isNacional())
      : [];
    res.json({ nacionais, capsLocal });
  }

  /** GET /api/recursos/:id */
  public async buscar(req: Request, res: Response): Promise<void> {
    const recurso = await recursoRepository.buscarPorId(idDaRota(req));
    if (!recurso) throw new ErroNaoEncontrado('Recurso');
    res.json(recurso);
  }

  /** POST /api/recursos (admin) */
  public async criar(req: Request, res: Response): Promise<void> {
    const recurso = this.administrador(req).gerenciarRecursos(this.montar(req));
    res.status(201).json(await recursoRepository.criar(recurso));
  }

  /** PUT /api/recursos/:id (admin) */
  public async atualizar(req: Request, res: Response): Promise<void> {
    const id = idDaRota(req);
    if (!(await recursoRepository.buscarPorId(id))) throw new ErroNaoEncontrado('Recurso');
    const recurso = this.administrador(req).gerenciarRecursos(this.montar(req, id));
    res.json(await recursoRepository.atualizar(recurso));
  }

  /** DELETE /api/recursos/:id (admin) */
  public async excluir(req: Request, res: Response): Promise<void> {
    this.administrador(req);
    const removido = await recursoRepository.excluir(idDaRota(req));
    if (!removido) throw new ErroNaoEncontrado('Recurso');
    res.status(204).end();
  }

  private montar(req: Request, id?: number): RecursoApoio {
    const { nome, tipo, contato, cidade, gratuito } = req.body ?? {};
    return new RecursoApoio({ id, nome, tipo, contato, cidade, gratuito: gratuito === undefined ? true : Boolean(gratuito) });
  }

  private administrador(req: Request): Administrador {
    const usuario = usuarioLogado(req);
    if (!(usuario instanceof Administrador)) throw new ErroAcessoNegado('Apenas administradores gerenciam recursos.');
    return usuario;
  }
}
