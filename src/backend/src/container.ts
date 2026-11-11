import { pool } from './config/database';
import { UsuarioRepository } from './repositories/UsuarioRepository';
import { TriagemRepository } from './repositories/TriagemRepository';
import { LembreteRepository } from './repositories/LembreteRepository';
import { RecursoRepository } from './repositories/RecursoRepository';
import { AuthService } from './services/AuthService';
import { TriagemService } from './services/TriagemService';

/** Instâncias únicas compartilhadas pela aplicação (injeção de dependência simples). */
export const usuarioRepository = new UsuarioRepository(pool);
export const triagemRepository = new TriagemRepository(pool);
export const lembreteRepository = new LembreteRepository(pool);
export const recursoRepository = new RecursoRepository(pool);

export const authService = new AuthService(usuarioRepository);
export const triagemService = new TriagemService(triagemRepository);
