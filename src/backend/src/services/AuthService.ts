import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { UsuarioRepository } from '../repositories/UsuarioRepository';
import { Paciente } from '../models/Paciente';
import { Usuario } from '../models/Usuario';
import { ErroApp } from '../middlewares/erros';

export interface PayloadToken {
  sub: number;
  tipo: string;
}

/** Regras de cadastro, login e senha (RF02). */
export class AuthService {
  private static readonly RODADAS_HASH = 10;

  public constructor(private readonly usuarios: UsuarioRepository) {}

  public static validarSenha(senha: string): void {
    if (typeof senha !== 'string' || senha.length < 6 || senha.length > 72) {
      throw new ErroApp('A senha deve ter entre 6 e 72 caracteres.');
    }
  }

  public async gerarHash(senha: string): Promise<string> {
    AuthService.validarSenha(senha);
    return bcrypt.hash(senha, AuthService.RODADAS_HASH);
  }

  /** Todo cadastro público cria um Paciente. Administradores vêm do seed. */
  public async cadastrar(nome: string, email: string, senha: string): Promise<{ usuario: Usuario; token: string }> {
    const hash = await this.gerarHash(senha);
    const paciente = new Paciente({ nome, email, senha: hash });
    if (await this.usuarios.buscarPorEmail(paciente.getEmail())) {
      throw new ErroApp('Este e-mail já está cadastrado.', 409);
    }
    const criado = await this.usuarios.criar(paciente);
    return { usuario: criado, token: this.gerarToken(criado) };
  }

  public async login(email: string, senha: string): Promise<{ usuario: Usuario; token: string }> {
    const usuario = email ? await this.usuarios.buscarPorEmail(String(email)) : null;
    const senhaConfere = usuario ? await bcrypt.compare(String(senha ?? ''), usuario.getSenha()) : false;
    if (!usuario || !senhaConfere) {
      throw new ErroApp('E-mail ou senha incorretos.', 401);
    }
    return { usuario, token: this.gerarToken(usuario) };
  }

  public async confirmarSenha(usuario: Usuario, senha: string): Promise<boolean> {
    return bcrypt.compare(String(senha ?? ''), usuario.getSenha());
  }

  public gerarToken(usuario: Usuario): string {
    const payload = { sub: usuario.getId(), tipo: usuario.getTipo() };
    return jwt.sign(payload, env.jwtSegredo, { expiresIn: env.jwtExpiracao } as SignOptions);
  }

  public verificarToken(token: string): PayloadToken {
    try {
      const dados = jwt.verify(token, env.jwtSegredo) as unknown as PayloadToken;
      return { sub: Number(dados.sub), tipo: String(dados.tipo) };
    } catch {
      throw new ErroApp('Sessão expirada ou inválida. Faça login novamente.', 401);
    }
  }
}
