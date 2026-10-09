import { Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Inicio from './pages/Inicio.jsx';
import EmBreve from './pages/EmBreve.jsx';

export default function App() {
  return (
    <div className="app">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/quem-somos" element={<EmBreve titulo="Quem somos" />} />
          <Route path="/planos" element={<EmBreve titulo="Planos" />} />
          <Route path="/blog" element={<EmBreve titulo="Blog" />} />
          <Route path="/entrar" element={<EmBreve titulo="Entrar" />} />
          <Route path="/privacidade" element={<EmBreve titulo="Política de Privacidade" />} />
          <Route path="/termos" element={<EmBreve titulo="Termos de Uso" />} />
          <Route path="*" element={<EmBreve titulo="Página não encontrada" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
