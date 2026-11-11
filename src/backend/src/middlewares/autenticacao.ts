import { NextFunction, Request, Response } from 'express';
import { Usuario } from '../models/Usuario';
import { authService, usuarioRepository } from '../container';
import { ErroAcessoNegado, ErroApp, tratarAsync } from './erros';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      usuario?: Usuario;
    }
  }
}

/** Exige um token válido e carrega o usuário (Paciente ou Administrador). */
export const autenticar = tratarAsync(async (req: Request, _res: Response, next: NextFunction) => {
  const cabecalho = req.headers.authorization ?? '';
  const [esquema, token] = cabecalho.split(' ');
  if (esquema !== 'Bearer' || !token) {
    throw new ErroApp('Faça login para continuar.', 401);
  }
  const payload = authService.verificarToken(token);
  const usuario = await usuarioRepository.buscarPorId(payload.sub);
  if (!usuario) {
    throw new ErroApp('Usuário não encontrado. Faça login novamente.', 401);
  }
  req.usuario = usuario;
  next();
});

/** Exige que o usuário logado tenha a permissão informada. */
export function exigirPermissao(permissao: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.usuario?.possuiPermissao(permissao)) {
      next(new ErroAcessoNegado('Você não tem permissão para esta ação.'));
      return;
    }
    next();
  };
}

/** Obtém o usuário autenticado já tipado. */
export function usuarioLogado(req: Request): Usuario {
  if (!req.usuario) throw new ErroApp('Faça login para continuar.', 401);
  return req.usuario;
}

export function idDaRota(req: Request): number {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) throw new ErroApp('Identificador inválido.');
  return id;
}
