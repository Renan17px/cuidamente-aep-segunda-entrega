import { Request, Response } from 'express';
import { authService } from '../container';

export class AuthController {
  /** POST /api/auth/cadastro */
  public async cadastrar(req: Request, res: Response): Promise<void> {
    const { nome, email, senha } = req.body ?? {};
    const { usuario, token } = await authService.cadastrar(nome, email, senha);
    res.status(201).json({ usuario, token });
  }

  /** POST /api/auth/login */
  public async login(req: Request, res: Response): Promise<void> {
    const { email, senha } = req.body ?? {};
    const { usuario, token } = await authService.login(email, senha);
    res.json({ usuario, token });
  }
}
