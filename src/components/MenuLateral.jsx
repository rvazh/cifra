import { useLayoutEffect, useRef } from 'react';
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
  IconeChecklist,
  IconeRecibo,
  IconeJornal,
} from './Icones.jsx';
import { valoresEscondidos, alternarValores } from '../dados/preferencias.js';
import { encerrarSessao } from '../dados/acesso.js';
import './MenuLateral.css';

// Itens do menu lateral do sistema (usado no Painel, Lançamentos...)
const menu = [
  { para: '/painel', texto: 'Visão geral', Icone: IconeCasa },
  { para: '/painel/lancamentos', texto: 'Lançamentos', Icone: IconeLista },
  { para: '/painel/contas', texto: 'Contas', Icone: IconeCarteira },
  { para: '/painel/checklist', texto: 'Checklist', Icone: IconeChecklist },
  { para: '/painel/calendario', texto: 'Calendário', Icone: IconeCalendario },
  { para: '/painel/comprovantes', texto: 'Comprovantes', Icone: IconeRecibo },
  { para: '/painel/relatorios', texto: 'Relatórios', Icone: IconeGrafico },
  { para: '/painel/objetivos', texto: 'Objetivos', Icone: IconeAlvo },
  { para: '/painel/noticias', texto: 'Notícias', Icone: IconeJornal },
  { para: '/painel/cursos', texto: 'Cursos', Icone: IconeLivro },
];

// No celular o menu vira uma barra que rola para o lado. Guardamos a posição
// para a barra não voltar ao começo cada vez que a pessoa troca de aba.
const CHAVE_ROLAGEM = 'cifra:menu-rolagem';

export default function MenuLateral() {
  const navegar = useNavigate();
  const barra = useRef(null);

  // Antes de desenhar a tela: volta a barra para onde estava e garante que a aba aberta apareça
  useLayoutEffect(() => {
    const el = barra.current;
    if (!el || el.scrollWidth <= el.clientWidth) return; // computador: menu na lateral, sem rolagem
    try {
      el.scrollLeft = Number(sessionStorage.getItem(CHAVE_ROLAGEM)) || 0;
    } catch {
      /* sem acesso ao armazenamento */
    }
    const ativa = el.querySelector('.lateral__item.active, .lateral__extra.active');
    if (ativa) {
      // posição da aba dentro da barra (contando o que já rolou)
      const inicio = ativa.getBoundingClientRect().left - el.getBoundingClientRect().left + el.scrollLeft;
      const fim = inicio + ativa.offsetWidth;
      if (inicio < el.scrollLeft || fim > el.scrollLeft + el.clientWidth) {
        el.scrollLeft = inicio - (el.clientWidth - ativa.offsetWidth) / 2; // centraliza a aba aberta
      }
    }
  }, []);

  function guardarRolagem(evento) {
    try {
      sessionStorage.setItem(CHAVE_ROLAGEM, String(Math.round(evento.currentTarget.scrollLeft)));
    } catch {
      /* sem acesso ao armazenamento */
    }
  }

  // Sai da conta (os dados continuam salvos neste aparelho)
  function sair() {
    encerrarSessao();
    navegar('/entrar');
  }

  return (
    <aside className="lateral" ref={barra} onScroll={guardarRolagem}>
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
