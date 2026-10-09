import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Inicio from './pages/Inicio.jsx';
import Entrar from './pages/Entrar.jsx';
import Planos from './pages/Planos.jsx';
import QuemSomos from './pages/QuemSomos.jsx';
import Privacidade from './pages/Privacidade.jsx';
import Termos from './pages/Termos.jsx';
import EmBreve from './pages/EmBreve.jsx';

// Páginas que aparecem sem o cabeçalho e o rodapé do site
const telasSemMenu = ['/entrar', '/privacidade', '/termos'];

export default function App() {
  const { pathname } = useLocation();
  const mostrarMenu = !telasSemMenu.includes(pathname);

  // Ao trocar de página, volta para o topo
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="app">
      {mostrarMenu && <Header />}
      <main>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/quem-somos" element={<QuemSomos />} />
          <Route path="/planos" element={<Planos />} />
          <Route path="/blog" element={<EmBreve titulo="Blog" />} />
          <Route path="/entrar" element={<Entrar />} />
          <Route path="/painel" element={<EmBreve titulo="Painel" />} />
          <Route path="/cadastro" element={<EmBreve titulo="Criar conta" />} />
          <Route path="/recuperar-senha" element={<EmBreve titulo="Recuperar senha" />} />
          <Route path="/privacidade" element={<Privacidade />} />
          <Route path="/termos" element={<Termos />} />
          <Route path="*" element={<EmBreve titulo="Página não encontrada" />} />
        </Routes>
      </main>
      {mostrarMenu && <Footer />}
    </div>
  );
}
