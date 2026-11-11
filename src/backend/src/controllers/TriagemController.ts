import { Request, Response } from 'express';
import { triagemService } from '../container';
import { idDaRota, usuarioLogado } from '../middlewares/autenticacao';

/** CRUD da entidade principal: Triagem (RF01, RF02, RF05). */
export class TriagemController {
  /** GET /api/triagens/questionarios */
  public async questionarios(_req: Request, res: Response): Promise<void> {
    res.json(triagemService.listarQuestionarios());
  }

  /** GET /api/triagens/questionarios/:tipo */
  public async questionario(req: Request, res: Response): Promise<void> {
    res.json(triagemService.obterQuestionario(String(req.params.tipo)));
  }

  /** POST /api/triagens  { tipo: 'DEPRESSAO' | 'ANSIEDADE', respostas: [{ perguntaId, valor }] } */
  public async criar(req: Request, res: Response): Promise<void> {
    const { tipo, respostas } = req.body ?? {};
    const triagem = await triagemService.realizar(usuarioLogado(req), String(tipo ?? ''), respostas);
    res.status(201).json(triagem);
  }

  /** GET /api/triagens?tipo=DEPRESSAO */
  public async listar(req: Request, res: Response): Promise<void> {
    const tipo = typeof req.query.tipo === 'string' ? req.query.tipo : undefined;
    res.json(await triagemService.listarDoUsuario(usuarioLogado(req), tipo));
  }

  /** GET /api/triagens/resumo */
  public async resumo(req: Request, res: Response): Promise<void> {
    res.json(await triagemService.resumo(usuarioLogado(req)));
  }

  /** GET /api/triagens/:id */
  public async buscar(req: Request, res: Response): Promise<void> {
    res.json(await triagemService.buscar(usuarioLogado(req), idDaRota(req)));
  }

  /** PUT /api/triagens/:id  { respostas: [...] } */
  public async atualizar(req: Request, res: Response): Promise<void> {
    res.json(await triagemService.corrigir(usuarioLogado(req), idDaRota(req), req.body?.respostas));
  }

  /** DELETE /api/triagens/:id */
  public async excluir(req: Request, res: Response): Promise<void> {
    await triagemService.excluir(usuarioLogado(req), idDaRota(req));
    res.status(204).end();
  }
}
