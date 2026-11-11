import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { mensagemDeErro } from '../api';

/** RF02 — cadastro e login. */
export function Entrar() {
  const { entrar, cadastrar } = useAuth();
  const navegar = useNavigate();
  const [modo, setModo] = useState<'login' | 'cadastro'>('login');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      if (modo === 'login') await entrar(email, senha);
      else await cadastrar(nome, email, senha);
      navegar('/', { replace: true });
    } catch (err) {
      setErro(mensagemDeErro(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="tela-entrada">
      <section className="entrada-apresentacao">
        <span className="marca grande">
          <span className="marca-icone" aria-hidden="true">
            ♥
          </span>
          CuidaMente
        </span>
        <h1>Um espaço acolhedor para entender como você está.</h1>
        <p>
          Responda a uma triagem guiada, acompanhe sua evolução, crie lembretes de autocuidado e encontre canais de
          apoio gratuitos perto de você.
        </p>
        <p className="aviso-ajuda">
          Precisa conversar agora? Ligue <a href="tel:188">188 (CVV)</a>, gratuito e 24 horas.
        </p>
      </section>

      <form className="cartao formulario-entrada" onSubmit={enviar}>
        <div className="abas" role="tablist">
          <button type="button" role="tab" aria-selected={modo === 'login'} onClick={() => setModo('login')}>
            Entrar
          </button>
          <button type="button" role="tab" aria-selected={modo === 'cadastro'} onClick={() => setModo('cadastro')}>
            Criar conta
          </button>
        </div>

        {modo === 'cadastro' && (
          <label className="campo">
            <span>Nome</span>
            <input value={nome} onChange={(e) => setNome(e.target.value)} required minLength={2} maxLength={100} autoComplete="name" />
          </label>
        )}
        <label className="campo">
          <span>E-mail</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={100} autoComplete="email" />
        </label>
        <label className="campo">
          <span>Senha</span>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            minLength={6}
            maxLength={72}
            autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
          />
        </label>
        {modo === 'cadastro' && <p className="dica">Mínimo de 6 caracteres. Seus dados ficam guardados com segurança.</p>}
        {erro && <p className="erro" role="alert">{erro}</p>}
        <button className="botao largo" disabled={enviando}>
          {enviando ? 'Aguarde...' : modo === 'login' ? 'Entrar' : 'Criar minha conta'}
        </button>
      </form>
    </div>
  );
}
