import { TipoUsuario } from './tipos';
import { hojeLocal } from './datas';

export interface DadosUsuario {
  id?: number;
  nome: string;
  email: string;
  senha: string; // sempre o hash bcrypt, nunca a senha em texto puro
  criadoEm?: string;
}

/**
 * Superclasse ABSTRATA do diagrama de classes.
 * Centraliza os atributos comuns (id, nome, email, senha) e obriga as
 * subclasses (Paciente e Administrador) a definirem seu próprio tipo e
 * suas permissões. Não pode ser instanciada diretamente.
 */
export abstract class Usuario {
  private id?: number;
  private nome: string;
  private email: string;
  private senha: string;
  private readonly criadoEm: string;

  protected constructor(dados: DadosUsuario) {
    this.id = dados.id;
    this.nome = Usuario.validarNome(dados.nome);
    this.email = Usuario.validarEmail(dados.email);
    this.senha = dados.senha;
    this.criadoEm = dados.criadoEm ?? hojeLocal();
  }

  // ---------- métodos abstratos (polimorfismo) ----------

  /** Cada subtipo informa como é gravado na coluna tipo_usuario. */
  public abstract getTipo(): TipoUsuario;

  /** Cada perfil possui um conjunto diferente de permissões. */
  public abstract getPermissoes(): string[];

  /** Texto exibido na interface para apresentar o perfil. */
  public abstract getDescricaoPerfil(): string;

  // ---------- comportamento comum ----------

  public possuiPermissao(permissao: string): boolean {
    return this.getPermissoes().includes(permissao);
  }

  /** Representação pública: nunca expõe o hash da senha. */
  public toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      nome: this.nome,
      email: this.email,
      tipoUsuario: this.getTipo(),
      descricaoPerfil: this.getDescricaoPerfil(),
      permissoes: this.getPermissoes(),
      criadoEm: this.criadoEm,
    };
  }

  // ---------- getters / setters com encapsulamento ----------

  public getId(): number | undefined {
    return this.id;
  }

  public setId(id: number): void {
    this.id = id;
  }

  public getNome(): string {
    return this.nome;
  }

  public setNome(nome: string): void {
    this.nome = Usuario.validarNome(nome);
  }

  public getEmail(): string {
    return this.email;
  }

  public setEmail(email: string): void {
    this.email = Usuario.validarEmail(email);
  }

  public getSenha(): string {
    return this.senha;
  }

  public setSenha(hash: string): void {
    this.senha = hash;
  }

  public getCriadoEm(): string {
    return this.criadoEm;
  }

  // ---------- validações ----------

  private static validarNome(nome: string): string {
    const limpo = (nome ?? '').trim();
    if (limpo.length < 2 || limpo.length > 100) {
      throw new Error('O nome deve ter entre 2 e 100 caracteres.');
    }
    return limpo;
  }

  private static validarEmail(email: string): string {
    const limpo = (email ?? '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpo) || limpo.length > 100) {
      throw new Error('Informe um e-mail válido.');
    }
    return limpo;
  }
}
