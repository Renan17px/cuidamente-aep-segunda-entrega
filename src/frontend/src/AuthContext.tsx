import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, obterToken, salvarToken } from './api';
import { Usuario } from './tipos';

interface ContextoAuth {
  usuario: Usuario | null;
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  cadastrar: (nome: string, email: string, senha: string) => Promise<void>;
  sair: () => void;
  atualizarUsuario: (usuario: Usuario) => void;
}

const Contexto = createContext<ContextoAuth | null>(null);

export function ProvedorAuth({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);

  useEffect(() => {
    if (!obterToken()) {
      setCarregando(false);
      return;
    }
    api
      .get<Usuario>('/usuarios/me')
      .then(setUsuario)
      .catch(() => salvarToken(null))
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => {
    const aoExpirar = () => setUsuario(null);
    window.addEventListener('cuidamente:sessao-expirada', aoExpirar);
    return () => window.removeEventListener('cuidamente:sessao-expirada', aoExpirar);
  }, []);

  const entrar = useCallback(async (email: string, senha: string) => {
    const r = await api.post<{ usuario: Usuario; token: string }>('/auth/login', { email, senha });
    salvarToken(r.token);
    setUsuario(r.usuario);
  }, []);

  const cadastrar = useCallback(async (nome: string, email: string, senha: string) => {
    const r = await api.post<{ usuario: Usuario; token: string }>('/auth/cadastro', { nome, email, senha });
    salvarToken(r.token);
    setUsuario(r.usuario);
  }, []);

  const sair = useCallback(() => {
    salvarToken(null);
    setUsuario(null);
  }, []);

  const valor = useMemo(
    () => ({ usuario, carregando, entrar, cadastrar, sair, atualizarUsuario: setUsuario }),
    [usuario, carregando, entrar, cadastrar, sair],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useAuth(): ContextoAuth {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error('useAuth precisa estar dentro de ProvedorAuth');
  return ctx;
}
