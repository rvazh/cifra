import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import MenuLateral from '../components/MenuLateral.jsx';
import {
  IconeCalendario,
  IconeOlho,
  IconeEtiqueta,
  IconeCarteira,
  IconeSino,
  IconeBaixar,
  IconeEnviar,
  IconeLixeira,
  IconeEstrela,
  IconeInfo,
  IconeEscudo,
  IconeDireita,
} from '../components/Icones.jsx';
import { carregarCategorias, carregar, salvar, nomeDoMes } from '../dados/lancamentos.js';
import { carregarContas, salvarContas } from '../dados/contas.js';
import { carregarObjetivos, salvarObjetivos } from '../dados/objetivos.js';
import { carregarPreferencias, salvarPreferencias } from '../dados/preferencias.js';
import { EMAIL_CONTATO } from '../config.js';
import { pedirPermissaoDeAviso } from '../dados/alertas.js';
import { apagarTodosComprovantes } from '../dados/comprovantes.js';
import './Painel.css';
import './Configuracoes.css';

const VERSAO = '1.0';

function lerNome() {
  try {
    return localStorage.getItem('cifra:usuario') || '';
  } catch {
    return '';
  }
}

// Todas as informações da CIFRA guardadas neste navegador (chaves que começam com "cifra:")
function chavesDaCifra() {
  try {
    return Object.keys(localStorage).filter((k) => k.startsWith('cifra:'));
  } catch {
    return [];
  }
}

// ===== Uma linha da lista =====
function Linha({ Icone, titulo, sub, perigo, children }) {
  return (
    <>
      <span className={perigo ? 'cfg-linha__icone cfg-linha__icone--perigo' : 'cfg-linha__icone'}>
        <Icone tamanho={17} espessura={2.2} />
      </span>
      <span className="cfg-linha__textos">
        <span className={perigo ? 'cfg-linha__titulo cfg-linha__titulo--perigo' : 'cfg-linha__titulo'}>{titulo}</span>
        {sub && <span className="cfg-linha__sub">{sub}</span>}
      </span>
      {children}
    </>
  );
}

const Seta = () => (
  <span className="cfg-linha__seta">
    <IconeDireita tamanho={18} espessura={2} />
  </span>
);

function Grupo({ titulo, children }) {
  return (
    <section className="cfg-grupo">
      <h2 className="cfg-grupo__titulo">{titulo}</h2>
      <div className="cfg-grupo__lista">{children}</div>
    </section>
  );
}

// Interruptor liga/desliga (é um checkbox por baixo, então funciona no teclado)
function Interruptor({ ligado, aoMudar, rotulo }) {
  return (
    <span className="cfg-interruptor">
      <input type="checkbox" role="switch" checked={ligado} onChange={(e) => aoMudar(e.target.checked)} aria-label={rotulo} />
      <span className="cfg-interruptor__trilho" aria-hidden="true">
        <span className="cfg-interruptor__bola" />
      </span>
    </span>
  );
}

export default function Configuracoes() {
  const [preferencias, setPreferencias] = useState(carregarPreferencias);
  const [nome, setNome] = useState(lerNome);
  const [janela, setJanela] = useState(null); // 'perfil' | 'categorias'
  const [rascunho, setRascunho] = useState({ nome: '', email: '' });
  const [mensagem, setMensagem] = useState('');
  const arquivoBackup = useRef(null);

  const [contagem, setContagem] = useState(() => contar());

  function contar() {
    const lancamentos = carregar();
    const contas = carregarContas();
    const objetivos = carregarObjetivos();
    return {
      contas: contas.length,
      lancamentos: lancamentos.length,
      exemplos:
        lancamentos.filter((l) => l.exemplo).length +
        contas.filter((c) => c.exemplo).length +
        objetivos.filter((o) => o.exemplo).length,
      porCategoria: lancamentos.reduce((g, l) => ({ ...g, [l.categoria]: (g[l.categoria] || 0) + 1 }), {}),
    };
  }

  // Cada mudança é salva na hora
  function mudar(campo, valor) {
    const novas = { ...preferencias, [campo]: valor };
    setPreferencias(novas);
    salvarPreferencias(novas);
  }

  // Mensagem rápida no rodapé ("Backup baixado" etc.)
  useEffect(() => {
    if (!mensagem) return undefined;
    const tempo = setTimeout(() => setMensagem(''), 3500);
    return () => clearTimeout(tempo);
  }, [mensagem]);

  // Fecha a janela com Esc
  useEffect(() => {
    if (!janela) return undefined;
    const aoTeclar = (e) => e.key === 'Escape' && setJanela(null);
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [janela]);

  function abrirPerfil() {
    setRascunho({ nome, email: preferencias.email });
    setJanela('perfil');
  }

  function salvarPerfil(evento) {
    evento.preventDefault();
    const novoNome = rascunho.nome.trim();
    try {
      localStorage.setItem('cifra:usuario', novoNome);
    } catch {
      /* sem acesso ao armazenamento */
    }
    setNome(novoNome);
    mudar('email', rascunho.email.trim());
    setJanela(null);
    setMensagem('Perfil atualizado.');
  }

  // ----- Backup -----
  function baixarBackup() {
    // Lê pelas funções de cada parte: assim entram também os dados que ainda não foram salvos (ex.: os exemplos)
    const dados = {
      'cifra:lancamentos': carregar(),
      'cifra:contas': carregarContas(),
      'cifra:objetivos': carregarObjetivos(),
      'cifra:preferencias': preferencias,
    };
    chavesDaCifra().forEach((k) => {
      if (k in dados) return;
      try {
        dados[k] = JSON.parse(localStorage.getItem(k));
      } catch {
        dados[k] = localStorage.getItem(k);
      }
    });
    const conteudo = { app: 'CIFRA', versao: VERSAO, criadoEm: new Date().toISOString(), dados };
    const arquivo = new Blob([JSON.stringify(conteudo, null, 2)], { type: 'application/json' });
    const endereco = URL.createObjectURL(arquivo);
    const link = document.createElement('a');
    link.href = endereco;
    link.download = `cifra-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(endereco);
    setMensagem('Backup baixado. Guarde o arquivo em um lugar seguro.');
  }

  function restaurarBackup(evento) {
    const arquivo = evento.target.files[0];
    evento.target.value = ''; // permite escolher o mesmo arquivo de novo
    if (!arquivo) return;
    const leitor = new FileReader();
    leitor.onload = () => {
      let conteudo;
      try {
        conteudo = JSON.parse(leitor.result);
      } catch {
        conteudo = null;
      }
      if (!conteudo || conteudo.app !== 'CIFRA' || typeof conteudo.dados !== 'object') {
        setMensagem('Esse arquivo não é um backup da CIFRA.');
        return;
      }
      if (!window.confirm('Restaurar este backup? Os dados atuais deste aparelho serão substituídos pelos do arquivo.')) return;
      try {
        chavesDaCifra().forEach((k) => localStorage.removeItem(k));
        Object.entries(conteudo.dados)
          .filter(([k]) => k.startsWith('cifra:'))
          .forEach(([k, v]) => localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)));
      } catch {
        setMensagem('Não foi possível restaurar neste navegador.');
        return;
      }
      window.location.reload();
    };
    leitor.readAsText(arquivo);
  }

  // ----- Apagar -----
  function apagarExemplos() {
    if (contagem.exemplos === 0) {
      setMensagem('Não há dados de exemplo para apagar.');
      return;
    }
    salvar(carregar().filter((l) => !l.exemplo && !String(l.origem || '').startsWith('exemplo')));
    salvarContas(carregarContas().filter((c) => !c.exemplo));
    salvarObjetivos(carregarObjetivos().filter((o) => !o.exemplo));
    setContagem(contar());
    setMensagem('Dados de exemplo apagados.');
  }

  async function apagarTudo() {
    const certeza = window.confirm(
      'Apagar todos os dados deste aparelho?\n\nContas, lançamentos, objetivos, comprovantes e preferências serão apagados. Não tem volta.'
    );
    if (!certeza) return;
    try {
      chavesDaCifra().forEach((k) => localStorage.removeItem(k));
    } catch {
      /* sem acesso ao armazenamento */
    }
    // Listas vazias, para os exemplos não voltarem
    salvar([]);
    salvarContas([]);
    salvarObjetivos([]);
    await apagarTodosComprovantes();
    window.location.hash = '#/entrar';
    window.location.reload();
  }

  const diasDeAviso = [1, 3, 5, 7];
  const inicio = preferencias.inicioDoMes;

  return (
    <div className="pp-app">
      <MenuLateral />

      <main className="pp cfg">
        <div>
          <h1 className="pp__titulo">Configurações</h1>
          <p className="pp__subtitulo">Ajuste a CIFRA do seu jeito</p>
        </div>

        <div className="cfg__coluna">
          {/* ===== Perfil ===== */}
          <section className="cfg-perfil">
            <span className="cfg-perfil__avatar" aria-hidden="true">
              {(nome || 'C').charAt(0).toUpperCase()}
            </span>
            <div className="cfg-perfil__textos">
              <b className="cfg-perfil__nome">{nome || 'Sem nome'}</b>
              <span className="cfg-perfil__plano">
                Plano Gratuito · usando a CIFRA desde {nomeDoMes(preferencias.desde).toLowerCase().replace(' ', ' de ')}
              </span>
              <div className="cfg-perfil__chips">
                <span>
                  <b>{contagem.contas}</b> {contagem.contas === 1 ? 'conta' : 'contas'}
                </span>
                <span>
                  <b>{contagem.lancamentos}</b> {contagem.lancamentos === 1 ? 'lançamento' : 'lançamentos'}
                </span>
              </div>
            </div>
            <button type="button" className="cfg-perfil__editar" onClick={abrirPerfil}>
              Editar perfil
            </button>
          </section>

          {/* ===== Preferências ===== */}
          <Grupo titulo="Preferências">
            <label className="cfg-linha">
              <Linha Icone={IconeCalendario} titulo="Primeiro dia da semana" sub="Muda a ordem dos dias no calendário">
                <span className="cfg-linha__valor">
                  <select value={preferencias.primeiroDiaDaSemana} onChange={(e) => mudar('primeiroDiaDaSemana', Number(e.target.value))}>
                    <option value={0}>Domingo</option>
                    <option value={1}>Segunda</option>
                  </select>
                  <Seta />
                </span>
              </Linha>
            </label>
            <label className="cfg-linha">
              <Linha
                Icone={IconeCalendario}
                titulo="Meu mês começa no dia"
                sub={inicio === 1 ? 'Útil se o seu salário cai depois do dia 1' : `Cada mês vai do dia ${inicio} ao dia ${inicio - 1} do mês seguinte`}
              >
                <span className="cfg-linha__valor">
                  <select value={inicio} onChange={(e) => mudar('inicioDoMes', Number(e.target.value))}>
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>
                        Dia {d}
                      </option>
                    ))}
                  </select>
                  <Seta />
                </span>
              </Linha>
            </label>
            <label className="cfg-linha">
              <Linha Icone={IconeOlho} titulo="Esconder valores ao abrir" sub="Mostra •••• até você tocar no olho do menu">
                <Interruptor
                  rotulo="Esconder valores ao abrir"
                  ligado={preferencias.esconderValores}
                  aoMudar={(v) => mudar('esconderValores', v)}
                />
              </Linha>
            </label>
          </Grupo>

          {/* ===== Organização ===== */}
          <Grupo titulo="Organização">
            <button type="button" className="cfg-linha" onClick={() => setJanela('categorias')}>
              <Linha Icone={IconeEtiqueta} titulo="Categorias">
                <span className="cfg-linha__valor">
                  {carregarCategorias().length}
                  <Seta />
                </span>
              </Linha>
            </button>
            <Link to="/painel/contas" className="cfg-linha">
              <Linha Icone={IconeCarteira} titulo="Contas">
                <span className="cfg-linha__valor">
                  {contagem.contas}
                  <Seta />
                </span>
              </Linha>
            </Link>
          </Grupo>

          {/* ===== Lembretes ===== */}
          <Grupo titulo="Lembretes">
            <label className="cfg-linha">
              <Linha
                Icone={IconeSino}
                titulo="Avisar contas a vencer"
                sub="Notificação 3 dias e 1 dia antes, e aviso no topo do painel"
              >
                <Interruptor
                  rotulo="Avisar contas a vencer"
                  ligado={preferencias.avisarContas}
                  aoMudar={(v) => {
                    mudar('avisarContas', v);
                    if (v) pedirPermissaoDeAviso();
                  }}
                />
              </Linha>
            </label>
            <label className={preferencias.avisarContas ? 'cfg-linha' : 'cfg-linha cfg-linha--desligada'}>
              <Linha Icone={IconeCalendario} titulo="Aviso no painel com">
                <span className="cfg-linha__valor">
                  <select
                    value={preferencias.diasDeAviso}
                    disabled={!preferencias.avisarContas}
                    onChange={(e) => mudar('diasDeAviso', Number(e.target.value))}
                  >
                    {diasDeAviso.map((d) => (
                      <option key={d} value={d}>
                        {d} {d === 1 ? 'dia' : 'dias'} de antecedência
                      </option>
                    ))}
                  </select>
                  <Seta />
                </span>
              </Linha>
            </label>
          </Grupo>

          {/* ===== Seus dados ===== */}
          <Grupo titulo="Seus dados">
            <button type="button" className="cfg-linha" onClick={baixarBackup}>
              <Linha Icone={IconeBaixar} titulo="Baixar backup" sub="Uma cópia dos seus dados (os comprovantes ficam de fora)">
                <span className="cfg-linha__valor">
                  arquivo .json
                  <Seta />
                </span>
              </Linha>
            </button>
            <button type="button" className="cfg-linha" onClick={() => arquivoBackup.current?.click()}>
              <Linha Icone={IconeEnviar} titulo="Restaurar backup" sub="Substitui os dados deste aparelho pelos do arquivo">
                <Seta />
              </Linha>
            </button>
            <input ref={arquivoBackup} type="file" accept=".json,application/json" hidden onChange={restaurarBackup} />
            <button type="button" className="cfg-linha" onClick={apagarExemplos}>
              <Linha Icone={IconeLixeira} titulo="Apagar dados de exemplo" sub="O que você cadastrou continua salvo">
                <span className="cfg-linha__valor">
                  {contagem.exemplos === 0 ? 'nenhum' : contagem.exemplos}
                  <Seta />
                </span>
              </Linha>
            </button>
          </Grupo>

          {/* ===== Sobre ===== */}
          <Grupo titulo="Sobre">
            <Link to="/planos" className="cfg-linha">
              <Linha Icone={IconeEstrela} titulo="Plano">
                <span className="cfg-linha__valor">
                  Gratuito
                  <Seta />
                </span>
              </Linha>
            </Link>
            <Link to="/termos" className="cfg-linha">
              <Linha Icone={IconeInfo} titulo="Termos de uso">
                <Seta />
              </Linha>
            </Link>
            <Link to="/privacidade" className="cfg-linha">
              <Linha Icone={IconeEscudo} titulo="Política de privacidade">
                <Seta />
              </Linha>
            </Link>
            <a href={`mailto:${EMAIL_CONTATO}`} className="cfg-linha">
              <Linha Icone={IconeSino} titulo="Fale conosco">
                <span className="cfg-linha__valor">
                  <span className="cfg-linha__email">{EMAIL_CONTATO}</span>
                  <Seta />
                </span>
              </Linha>
            </a>
          </Grupo>

          {/* ===== Cuidado ===== */}
          <Grupo titulo="Cuidado">
            <button type="button" className="cfg-linha" onClick={apagarTudo}>
              <Linha Icone={IconeLixeira} titulo="Apagar todos os dados" sub="Não tem volta. Baixe um backup antes." perigo />
            </button>
          </Grupo>

          <p className="cfg__versao">CIFRA · versão {VERSAO}</p>
        </div>

        {/* Mensagem rápida */}
        <p className={mensagem ? 'cfg-mensagem cfg-mensagem--visivel' : 'cfg-mensagem'} role="status" aria-live="polite">
          {mensagem}
        </p>

        {/* ===== Janela: editar perfil ===== */}
        {janela === 'perfil' && (
          <div className="cfg-fundo" onClick={() => setJanela(null)}>
            <form
              className="cfg-janela"
              role="dialog"
              aria-modal="true"
              aria-labelledby="cfg-perfil-titulo"
              onSubmit={salvarPerfil}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="cfg-janela__topo">
                <h2 id="cfg-perfil-titulo">Editar perfil</h2>
                <button type="button" className="cfg-janela__fechar" onClick={() => setJanela(null)} aria-label="Fechar">
                  ×
                </button>
              </div>
              <label className="cfg-campo">
                Nome
                <input autoFocus value={rascunho.nome} onChange={(e) => setRascunho({ ...rascunho, nome: e.target.value })} />
                <span>É o nome do “Boa tarde, …!” no painel.</span>
              </label>
              <label className="cfg-campo">
                E-mail (opcional)
                <input
                  type="email"
                  placeholder="voce@email.com"
                  value={rascunho.email}
                  onChange={(e) => setRascunho({ ...rascunho, email: e.target.value })}
                />
                <span>Fica só neste aparelho. A CIFRA não envia e-mails.</span>
              </label>
              <div className="cfg-janela__acoes">
                <button type="submit" className="cfg-botao cfg-botao--principal">
                  Salvar
                </button>
                <button type="button" className="cfg-botao" onClick={() => setJanela(null)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ===== Janela: categorias ===== */}
        {janela === 'categorias' && (
          <div className="cfg-fundo" onClick={() => setJanela(null)}>
            <div
              className="cfg-janela"
              role="dialog"
              aria-modal="true"
              aria-labelledby="cfg-cat-titulo"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="cfg-janela__topo">
                <h2 id="cfg-cat-titulo">Categorias</h2>
                <button type="button" className="cfg-janela__fechar" onClick={() => setJanela(null)} aria-label="Fechar">
                  ×
                </button>
              </div>
              <ul className="cfg-categorias">
                {carregarCategorias().map((c) => (
                  <li key={c.nome}>
                    <span className="cfg-categorias__icone" style={{ background: c.cor }}>
                      {c.emoji}
                    </span>
                    <span className="cfg-categorias__nome">
                      {c.nome}
                      <small>{c.tipo === 'receita' ? 'Receita' : c.tipo === 'despesa' ? 'Despesa' : 'Receita ou despesa'}</small>
                    </span>
                    <span className="cfg-categorias__qtd">
                      {contagem.porCategoria[c.nome] || 0} {contagem.porCategoria[c.nome] === 1 ? 'lançamento' : 'lançamentos'}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="cfg-janela__nota">
                Para criar ou remover categorias, use os botões “Adicionar” e “Remover” na tela de{' '}
                <Link to="/painel/lancamentos">Lançamentos</Link>.
              </p>
              <button type="button" className="cfg-botao" onClick={() => setJanela(null)}>
                Fechar
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
