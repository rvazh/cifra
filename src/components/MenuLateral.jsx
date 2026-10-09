import { Link, NavLink, useNavigate } from 'react-router-dom';
import logoCifra from '../assets/cifra-logo.png';
import {
  IconeCasa,
  IconeLista,
  IconeCarteira,
  IconeGrafico,
  IconeAlvo,
  IconeCalendario,
  IconeConfig,
  IconeSair,
  IconeOlho,
  IconeLivro,
} from './Icones.jsx';
import { valoresEscondidos, alternarValores } from '../dados/preferencias.js';
import { encerrarSessao } from '../dados/acesso.js';
import './MenuLateral.css';

// Itens do menu lateral do sistema (usado no Painel, Lançamentos...)
const menu = [
  { para: '/painel', texto: 'Visão geral', Icone: IconeCasa },
  { para: '/painel/lancamentos', texto: 'Lançamentos', Icone: IconeLista },
  { para: '/painel/contas', texto: 'Contas', Icone: IconeCarteira },
  { para: '/painel/relatorios', texto: 'Relatórios', Icone: IconeGrafico },
  { para: '/painel/objetivos', texto: 'Objetivos', Icone: IconeAlvo },
  { para: '/painel/calendario', texto: 'Calendário', Icone: IconeCalendario },
  { para: '/painel/cursos', texto: 'Cursos', Icone: IconeLivro },
];

export default function MenuLateral() {
  const navegar = useNavigate();

  // Sai da conta (os dados continuam salvos neste aparelho)
  function sair() {
    encerrarSessao();
    navegar('/entrar');
  }

  return (
    <aside className="lateral">
      <Link to="/painel" className="lateral__marca" aria-label="CIFRA — visão geral">
        <span className="lateral__logo">
          <img src={logoCifra} alt="" />
        </span>
        Cifra
      </Link>

      <nav className="lateral__menu" aria-label="Menu do sistema">
        {menu.map(({ para, texto, Icone }) => (
          <NavLink key={para} to={para} end className="lateral__item">
            <Icone tamanho={18} espessura={2.2} />
            {texto}
          </NavLink>
        ))}
      </nav>

      <div className="lateral__fim">
        <div className="lateral__plano">
          <span className="lateral__plano-rotulo">Seu plano</span>
          <b>Plano Gratuito</b>
          <Link to="/planos" className="lateral__plano-link">
            Conhecer os planos →
          </Link>
        </div>
        <button
          type="button"
          className="lateral__extra"
          onClick={alternarValores}
          aria-pressed={valoresEscondidos()}
          title={valoresEscondidos() ? 'Mostrar valores' : 'Esconder valores'}
        >
          <IconeOlho tamanho={18} espessura={2.2} fechado={!valoresEscondidos()} />
          <span className="lateral__texto">{valoresEscondidos() ? 'Mostrar valores' : 'Esconder valores'}</span>
        </button>
        <NavLink to="/painel/configuracoes" className="lateral__extra" title="Configurações">
          <IconeConfig tamanho={18} espessura={2.2} />
          <span className="lateral__texto">Configurações</span>
        </NavLink>
        <button type="button" className="lateral__extra" onClick={sair} title="Sair">
          <IconeSair tamanho={18} espessura={2.2} />
          <span className="lateral__texto">Sair</span>
        </button>
      </div>
    </aside>
  );
}
