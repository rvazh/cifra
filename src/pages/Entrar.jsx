import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logoCifra from '../assets/cifra-logo.png';
import { IconeSeta, IconeCheck } from '../components/Icones.jsx';
import { conferirAcesso, iniciarSessao } from '../dados/acesso.js';
import './Entrar.css';

// Ícone do Google (src/assets/google.png), mostrado à direita do texto do botão.
// Se o arquivo for apagado, o botão continua funcionando só com o texto.
const arquivosGoogle = import.meta.glob('../assets/google.{svg,png}', { eager: true, import: 'default' });
const iconeGoogle = Object.values(arquivosGoogle)[0];

// Ícones de olho (mostrar/esconder senha)
function IconeOlho({ aberto }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
      {!aberto && <path d="M3 3l18 18" />}
    </svg>
  );
}

// Altura das barrinhas do gráfico "Gastos da semana"
const barras = [
  { altura: 40 },
  { altura: 65 },
  { altura: 50 },
  { altura: 90, cor: 'dourado' },
  { altura: 35 },
  { altura: 55 },
  { altura: 25, cor: 'preto' },
];

export default function Entrar() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [conferindo, setConferindo] = useState(false);
  const navegar = useNavigate();
  const local = useLocation();

  async function enviar(evento) {
    evento.preventDefault(); // impede a página de recarregar
    if (!usuario.trim() || !senha) {
      setErro('Preencha o usuário e a senha.');
      return;
    }
    setConferindo(true);
    let certo = false;
    try {
      certo = await conferirAcesso(usuario, senha);
    } catch {
      setConferindo(false);
      setErro('Não foi possível conferir o acesso neste navegador. Abra o site pelo endereço com https.');
      return;
    }
    setConferindo(false);
    if (!certo) {
      setErro('Usuário ou senha incorretos.');
      setSenha('');
      return;
    }
    iniciarSessao();
    // Volta para a tela que a pessoa tentou abrir, ou vai para o painel
    navegar(local.state?.de || '/painel', { replace: true });
  }

  function entrarComGoogle() {
    // O login com o Google ainda não está ligado
    setErro('Entrar com o Google ainda não está disponível. Use o usuário e a senha.');
  }

  return (
    <div className="entrar">
      {/* ===== Lado esquerdo: formulário ===== */}
      <div className="entrar__lado">
        <Link to="/" className="entrar__voltar">
          <span className="entrar__voltar-seta">
            <IconeSeta tamanho={18} cor="#141414" espessura={2.2} />
          </span>
          Voltar para o site
        </Link>

        <form className="entrar__form" onSubmit={enviar}>
          <img className="entrar__logo" src={logoCifra} alt="CIFRA" />

          <div className="entrar__campo">
            <label htmlFor="usuario" className="entrar__rotulo">
              Usuário
            </label>
            <input
              id="usuario"
              className="entrar__input"
              type="text"
              autoComplete="username"
              value={usuario}
              onChange={(e) => {
                setUsuario(e.target.value);
                setErro('');
              }}
              aria-invalid={erro ? 'true' : undefined}
              aria-describedby={erro ? 'erro-acesso' : undefined}
            />
          </div>

          <div className="entrar__campo">
            <div className="entrar__rotulo-linha">
              <label htmlFor="senha" className="entrar__rotulo">
                Senha
              </label>
              <Link to="/recuperar-senha" className="entrar__link-pequeno">
                Esqueci minha senha
              </Link>
            </div>
            <div className="entrar__senha">
              <input
                id="senha"
                className="entrar__input"
                type={mostrarSenha ? 'text' : 'password'}
                autoComplete="current-password"
                value={senha}
                onChange={(e) => {
                  setSenha(e.target.value);
                  setErro('');
                }}
                aria-invalid={erro ? 'true' : undefined}
                aria-describedby={erro ? 'erro-acesso' : undefined}
              />
              <button
                type="button"
                className="entrar__olho"
                aria-label={mostrarSenha ? 'Esconder senha' : 'Mostrar senha'}
                aria-pressed={mostrarSenha}
                onClick={() => setMostrarSenha(!mostrarSenha)}
              >
                <IconeOlho aberto={mostrarSenha} />
              </button>
            </div>
          </div>

          {erro && (
            <p id="erro-acesso" className="entrar__erro" role="alert">
              {erro}
            </p>
          )}

          <button type="button" className="entrar__google" onClick={entrarComGoogle}>
            Entrar com o Google
            {iconeGoogle && <img className="entrar__google-icone" src={iconeGoogle} alt="" />}
          </button>

          <button type="submit" className="entrar__botao" disabled={conferindo}>
            {conferindo ? 'Conferindo…' : 'Entrar'}
            <IconeSeta tamanho={20} cor="#141414" espessura={2.2} />
          </button>

          <p className="entrar__cadastro">
            Ainda não tem conta?{' '}
            <Link to="/cadastro" className="entrar__link-forte">
              Criar conta
            </Link>
          </p>
        </form>

        <p className="entrar__rodape">© 2026 CIFRA Tech Ltda.</p>
      </div>

      {/* ===== Lado direito: vitrine do app (só enfeite) ===== */}
      <div className="entrar__vitrine" aria-hidden="true">
        <span className="entrar__enfeite entrar__enfeite--dourado" />
        <span className="entrar__enfeite entrar__enfeite--linha" />

        <div className="vitrine">
          <div className="vitrine__topo">
            <span className="vitrine__marca">CIFRA</span>
            <div className="vitrine__abas">
              <span className="vitrine__aba vitrine__aba--ativa">Visão geral</span>
              <span className="vitrine__aba">Lançamentos</span>
              <span className="vitrine__aba">Relatórios</span>
            </div>
          </div>

          <div className="vitrine__corpo">
            <div className="vitrine__saldo">
              <div>
                <div className="vitrine__legenda">Saldo geral</div>
                <div className="vitrine__saldo-valor">R$ 12.350,90</div>
              </div>
              <span className="vitrine__selo">+ 8% no mês</span>
            </div>

            <div className="vitrine__resumo">
              <div className="vitrine__cartao">
                <div className="vitrine__legenda">Receitas</div>
                <div className="vitrine__valor vitrine__valor--positivo">R$ 6.420,00</div>
              </div>
              <div className="vitrine__cartao">
                <div className="vitrine__legenda">Despesas</div>
                <div className="vitrine__valor vitrine__valor--negativo">R$ 4.180,35</div>
              </div>
            </div>

            <div className="vitrine__cartao">
              <div className="vitrine__grafico-titulo">Gastos da semana</div>
              <div className="vitrine__grafico">
                {barras.map((barra, i) => (
                  <span
                    key={i}
                    className={`vitrine__barra ${barra.cor ? `vitrine__barra--${barra.cor}` : ''}`}
                    style={{ height: `${barra.altura}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="vitrine__flutuante vitrine__flutuante--salario">
          <span className="vitrine__check">
            <IconeCheck tamanho={18} cor="#141414" espessura={2.2} />
          </span>
          <div>
            <div className="vitrine__flutuante-legenda">Salário</div>
            <div className="vitrine__flutuante-valor">+ R$ 5.200,00</div>
          </div>
        </div>

        <div className="vitrine__flutuante vitrine__flutuante--meta">
          <div className="vitrine__meta-linha">
            <span>Viagem de férias</span>
            <span>68%</span>
          </div>
          <div className="vitrine__meta-trilho">
            <div className="vitrine__meta-barra" />
          </div>
        </div>

        <div className="vitrine__flutuante vitrine__flutuante--guardar">
          <div className="vitrine__meta-linha">
            <span>Guardar</span>
            <span>54%</span>
          </div>
          <div className="vitrine__meta-trilho">
            <div className="vitrine__meta-barra" style={{ width: '54%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
