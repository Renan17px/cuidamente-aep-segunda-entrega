import { Request, Response } from 'express';
import { authService, usuarioRepository } from '../container';
import { idDaRota, usuarioLogado } from '../middlewares/autenticacao';
import { ErroApp, ErroNaoEncontrado } from '../middlewares/erros';
import { Administrador } from '../models/Administrador';
import { Usuario } from '../models/Usuario';

/** CRUD de usuários (RF02). Create fica no AuthController (cadastro). */
export class UsuarioController {
  /** GET /api/usuarios/me */
  public async perfil(req: Request, res: Response): Promise<void> {
    res.json(usuarioLogado(req));
  }

  /** PUT /api/usuarios/me — altera nome, e-mail e (opcionalmente) a senha */
  public async atualizarPerfil(req: Request, res: Response): Promise<void> {
    const usuario = usuarioLogado(req);
    const { nome, email, senhaAtual, novaSenha } = req.body ?? {};

    if (email !== undefined && String(email).trim().toLowerCase() !== usuario.getEmail()) {
      const existente = await usuarioRepository.buscarPorEmail(String(email));
      if (existente) throw new ErroApp('Este e-mail já está em uso.', 409);
      usuario.setEmail(String(email));
    }
    if (nome !== undefined) usuario.setNome(String(nome));
    if (novaSenha) {
      if (!(await authService.confirmarSenha(usuario, senhaAtual))) {
        throw new ErroApp('A senha atual está incorreta.');
      }
      usuario.setSenha(await authService.gerarHash(String(novaSenha)));
    }
    res.json(await usuarioRepository.atualizar(usuario));
  }

  /** DELETE /api/usuarios/me — exclui a conta e todo o histórico (cascade) */
  public async excluirConta(req: Request, res: Response): Promise<void> {
    const usuario = usuarioLogado(req);
    if (!(await authService.confirmarSenha(usuario, req.body?.senha))) {
      throw new ErroApp('Confirme sua senha para excluir a conta.');
    }
    await this.garantirOutroAdmin(usuario);
    await usuarioRepository.excluir(usuario.getId() as number);
    res.status(204).end();
  }

  /** GET /api/usuarios (admin) */
  public async listar(_req: Request, res: Response): Promise<void> {
    res.json(await usuarioRepository.listar());
  }

  /** DELETE /api/usuarios/:id (admin) */
  public async excluir(req: Request, res: Response): Promise<void> {
    const id = idDaRota(req);
    if (id === usuarioLogado(req).getId()) {
      throw new ErroApp('Use a opção "Minha conta" para excluir o próprio usuário.');
    }
    const alvo = await usuarioRepository.buscarPorId(id);
    if (!alvo) throw new ErroNaoEncontrado('Usuário');
    await this.garantirOutroAdmin(alvo);
    await usuarioRepository.excluir(id);
    res.status(204).end();
  }

  private async garantirOutroAdmin(usuario: Usuario): Promise<void> {
    if (usuario instanceof Administrador && (await usuarioRepository.contarAdministradores()) <= 1) {
      throw new ErroApp('Não é possível excluir o único administrador do sistema.');
    }
  }
}
