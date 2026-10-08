import { Link } from 'react-router-dom';
import './EmBreve.css';

// Página provisória para as seções que ainda vamos construir
export default function EmBreve({ titulo }) {
  return (
    <section className="em-breve container">
      <h1 className="em-breve__titulo">{titulo}</h1>
      <p className="em-breve__texto">Esta página está em construção.</p>
      <Link to="/" className="em-breve__voltar">
        Voltar para o início
      </Link>
    </section>
  );
}
