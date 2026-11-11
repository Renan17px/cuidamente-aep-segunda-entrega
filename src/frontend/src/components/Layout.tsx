import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { ModalCrise } from './ModalCrise';
import { AlertasLembrete } from './AlertasLembrete';

export function Layout() {
  const { usuario, sair } = useAuth();
  const [criseAberta, setCriseAberta] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const ehAdmin = usuario?.tipoUsuario === 'ADMIN';

  const links = ehAdmin
    ? [
        { para: '/admin/recursos', texto: 'Recursos' },
        { para: '/admin/usuarios', texto: 'Usuários' },
        { para: '/apoio', texto: 'Canais de apoio' },
        { para: '/conta', texto: 'Minha conta' },
      ]
    : [
        { para: '/', texto: 'Painel' },
        { para: '/triagem', texto: 'Triagem' },
        { para: '/lembretes', texto: 'Lembretes' },
        { para: '/apoio', texto: 'Canais de apoio' },
        { para: '/conta', texto: 'Minha conta' },
      ];

  return (
    <div className="app">
      <header className="topo">
        <div className="topo-conteudo">
          <NavLink to={ehAdmin ? '/admin/recursos' : '/'} className="marca" onClick={() => setMenuAberto(false)}>
            <span className="marca-icone" aria-hidden="true">
              ♥
            </span>
            CuidaMente
          </NavLink>
          <button
            className="botao-menu"
            aria-expanded={menuAberto}
            aria-label="Abrir menu"
            onClick={() => setMenuAberto((v) => !v)}
          >
            ☰
          </button>
          <nav className={menuAberto ? 'menu aberto' : 'menu'}>
            {links.map((l) => (
              <NavLink key={l.para} to={l.para} end onClick={() => setMenuAberto(false)}>
                {l.texto}
              </NavLink>
            ))}
            <button className="link-sair" onClick={sair}>
              Sair
            </button>
          </nav>
        </div>
      </header>

      <main className="conteudo">
        <Outlet context={{ abrirCrise: () => setCriseAberta(true) }} />
      </main>

      <button className="botao-ajuda" onClick={() => setCriseAberta(true)}>
        Preciso de ajuda agora
      </button>

      <footer className="rodape">
        CuidaMente · ODS 3 — Saúde e Bem-Estar. A triagem não substitui avaliação profissional.
      </footer>

      {!ehAdmin && <AlertasLembrete />}
      <ModalCrise aberto={criseAberta} aoFechar={() => setCriseAberta(false)} />
    </div>
  );
}

export interface ContextoLayout {
  abrirCrise: () => void;
}
