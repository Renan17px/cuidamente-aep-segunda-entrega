/** Cliente HTTP da API REST do CuidaMente. */

const CHAVE_TOKEN = 'cuidamente.token';

export class ErroApi extends Error {
  public readonly status: number;

  public constructor(mensagem: string, status: number) {
    super(mensagem);
    this.status = status;
  }
}

export function obterToken(): string | null {
  try {
    return localStorage.getItem(CHAVE_TOKEN);
  } catch {
    return null;
  }
}

export function salvarToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(CHAVE_TOKEN, token);
    else localStorage.removeItem(CHAVE_TOKEN);
  } catch {
    /* navegador sem armazenamento: a sessão dura até fechar a aba */
  }
}

async function requisitar<T>(metodo: string, caminho: string, corpo?: unknown): Promise<T> {
  const cabecalhos: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = obterToken();
  if (token) cabecalhos.Authorization = `Bearer ${token}`;

  let resposta: Response;
  try {
    resposta = await fetch(`/api${caminho}`, {
      method: metodo,
      headers: cabecalhos,
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    });
  } catch {
    throw new ErroApi('Não foi possível falar com o servidor. Verifique se a API está rodando.', 0);
  }

  if (resposta.status === 204) return undefined as T;
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    if (resposta.status === 401 && token) {
      salvarToken(null);
      window.dispatchEvent(new Event('cuidamente:sessao-expirada'));
    }
    const mensagemApi = (dados as { erro?: string }).erro;
    if (!mensagemApi && resposta.status >= 500) {
      throw new ErroApi(
        'A API não respondeu. Confira no terminal se o back-end ([api]) está rodando na porta 3333.',
        resposta.status,
      );
    }
    throw new ErroApi(mensagemApi ?? 'Algo deu errado. Tente novamente.', resposta.status);
  }
  return dados as T;
}

export const api = {
  get: <T>(caminho: string) => requisitar<T>('GET', caminho),
  post: <T>(caminho: string, corpo?: unknown) => requisitar<T>('POST', caminho, corpo),
  put: <T>(caminho: string, corpo?: unknown) => requisitar<T>('PUT', caminho, corpo),
  delete: <T = void>(caminho: string, corpo?: unknown) => requisitar<T>('DELETE', caminho, corpo),
};

export function mensagemDeErro(erro: unknown): string {
  return erro instanceof Error ? erro.message : 'Algo deu errado. Tente novamente.';
}
