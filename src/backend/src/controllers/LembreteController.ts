import { Request, Response } from 'express';
import { lembreteRepository } from '../container';
import { idDaRota, usuarioLogado } from '../middlewares/autenticacao';
import { ErroAcessoNegado, ErroNaoEncontrado } from '../middlewares/erros';
import { Lembrete } from '../models/Lembrete';

/** CRUD de lembretes de autocuidado (RF03). */
export class LembreteController {
  /** GET /api/lembretes */
  public async listar(req: Request, res: Response): Promise<void> {
    res.json(await lembreteRepository.listarPorUsuario(usuarioLogado(req).getId() as number));
  }

  /** POST /api/lembretes  { descricao, horario: 'HH:MM', ativo? } */
  public async criar(req: Request, res: Response): Promise<void> {
    const { descricao, horario, ativo } = req.body ?? {};
    const lembrete = new Lembrete({
      descricao,
      horario,
      ativo: ativo === undefined ? true : Boolean(ativo),
      usuarioId: usuarioLogado(req).getId() as number,
    });
    res.status(201).json(await lembreteRepository.criar(lembrete));
  }

  /** GET /api/lembretes/:id */
  public async buscar(req: Request, res: Response): Promise<void> {
    res.json(await this.buscarDoUsuario(req));
  }

  /** PUT /api/lembretes/:id */
  public async atualizar(req: Request, res: Response): Promise<void> {
    const lembrete = await this.buscarDoUsuario(req);
    const { descricao, horario, ativo } = req.body ?? {};
    if (descricao !== undefined) lembrete.setDescricao(String(descricao));
    if (horario !== undefined) lembrete.setHorario(String(horario));
    if (ativo !== undefined) lembrete.setAtivo(Boolean(ativo));
    res.json(await lembreteRepository.atualizar(lembrete));
  }

  /** DELETE /api/lembretes/:id */
  public async excluir(req: Request, res: Response): Promise<void> {
    const lembrete = await this.buscarDoUsuario(req);
    await lembreteRepository.excluir(lembrete.getId() as number);
    res.status(204).end();
  }

  private async buscarDoUsuario(req: Request): Promise<Lembrete> {
    const lembrete = await lembreteRepository.buscarPorId(idDaRota(req));
    if (!lembrete) throw new ErroNaoEncontrado('Lembrete');
    if (lembrete.getUsuarioId() !== usuarioLogado(req).getId()) {
      throw new ErroAcessoNegado('Este lembrete pertence a outro usuário.');
    }
    return lembrete;
  }
}
