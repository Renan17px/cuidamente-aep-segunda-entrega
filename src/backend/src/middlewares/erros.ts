import { NextFunction, Request, RequestHandler, Response } from 'express';

/** Erro de aplicação com status HTTP definido. */
export class ErroApp extends Error {
  public readonly status: number;

  public constructor(mensagem: string, status = 400) {
    super(mensagem);
    this.name = 'ErroApp';
    this.status = status;
  }
}

export class ErroNaoEncontrado extends ErroApp {
  public constructor(recurso: string) {
    super(`${recurso} não encontrado(a).`, 404);
    this.name = 'ErroNaoEncontrado';
  }
}

export class ErroAcessoNegado extends ErroApp {
  public constructor(mensagem = 'Acesso negado.') {
    super(mensagem, 403);
    this.name = 'ErroAcessoNegado';
  }
}

/** Repassa erros de handlers assíncronos para o middleware de erro. */
export function tratarAsync(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}

export function middlewareDeErro(erro: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (erro instanceof ErroApp) {
    res.status(erro.status).json({ erro: erro.message });
    return;
  }
  const codigo = (erro as { code?: string }).code;
  if (codigo === 'ER_DUP_ENTRY') {
    res.status(409).json({ erro: 'Registro duplicado: este e-mail já está cadastrado.' });
    return;
  }
  const errosDeBanco: Record<string, string> = {
    ECONNREFUSED: 'O MySQL não está rodando ou a porta (DB_PORT) está errada.',
    ETIMEDOUT: 'O MySQL não respondeu. Confira DB_HOST e DB_PORT no .env.',
    ENOTFOUND: 'Endereço do MySQL (DB_HOST) não encontrado.',
    ER_ACCESS_DENIED_ERROR: 'Usuário ou senha do MySQL incorretos no arquivo src/backend/.env.',
    ER_BAD_DB_ERROR: 'O banco "cuidamente" ainda não existe. Rode: npm run db:init',
    ER_NO_SUCH_TABLE: 'As tabelas não foram criadas. Rode: npm run db:init',
  };
  if (codigo && errosDeBanco[codigo]) {
    console.error('[banco] Falha:', codigo);
    res.status(503).json({ erro: `Banco de dados indisponível: ${errosDeBanco[codigo]}` });
    return;
  }
  // Erros de validação lançados pelos modelos (new Error('...'))
  if (erro instanceof Error && erro.constructor === Error && !codigo) {
    res.status(400).json({ erro: erro.message });
    return;
  }
  console.error(erro);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
}
