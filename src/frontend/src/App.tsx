import { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Layout } from './components/Layout';
import { Entrar } from './pages/Entrar';
import { Painel } from './pages/Painel';
import { Triagem } from './pages/Triagem';
import { TriagemDetalhe } from './pages/TriagemDetalhe';
import { Lembretes } from './pages/Lembretes';
import { Apoio } from './pages/Apoio';
import { Conta } from './pages/Conta';
import { AdminRecursos } from './pages/AdminRecursos';
import { AdminUsuarios } from './pages/AdminUsuarios';

function SomentePaciente({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();
  return usuario?.tipoUsuario === 'ADMIN' ? <Navigate to="/admin/recursos" replace /> : <>{children}</>;
}

function SomenteAdmin({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();
  return usuario?.tipoUsuario === 'ADMIN' ? <>{children}</> : <Navigate to="/" replace />;
}

export function App() {
  const { usuario, carregando } = useAuth();

  if (carregando) return <div className="carregando-tela">Carregando...</div>;
  if (!usuario) return <Entrar />;

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<SomentePaciente><Painel /></SomentePaciente>} />
        <Route path="triagem" element={<SomentePaciente><Triagem /></SomentePaciente>} />
        <Route path="triagens/:id" element={<SomentePaciente><TriagemDetalhe /></SomentePaciente>} />
        <Route path="lembretes" element={<SomentePaciente><Lembretes /></SomentePaciente>} />
        <Route path="apoio" element={<Apoio />} />
        <Route path="conta" element={<Conta />} />
        <Route path="admin/recursos" element={<SomenteAdmin><AdminRecursos /></SomenteAdmin>} />
        <Route path="admin/usuarios" element={<SomenteAdmin><AdminUsuarios /></SomenteAdmin>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
