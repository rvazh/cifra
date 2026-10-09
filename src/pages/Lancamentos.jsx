import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import MenuLateral from '../components/MenuLateral.jsx';
import { IconeSeta, IconeBusca } from '../components/Icones.jsx';
import { reais } from '../components/Graficos.jsx';
import { nomesDasContas } from '../dados/contas.js';
import {
  carregarCategorias,
  salvarCategorias,
  CONTAS,
  categoria,
  carregar,
  salvar,
  novoId,
  lerFrase,
  dataCurta,
  dataPorExtenso,
  dataDeHoje,
  nomeDoMes,
  mudarMes,
  mesFinanceiro,
  periodoDoMes,
} from '../dados/lancamentos.js';
import './Painel.css';
import './Lancamentos.css';

// Opções para criar uma categoria nova
const EMOJIS = ['🐶', '🎓', '👕', '💡', '📱', '🎁', '✈️', '💪', '🧾', '💼', '🏦', '🍔'];
const CORES_CATEGORIA = ['#A8D5A2', '#9EC5E8', '#F5C08F', '#E7AFC3', '#D9CCF0', '#F3DE8A', '#CDEBD6', '#EEE6D8'];

const SUGESTOES = ['Recebi R$ 500 de freela', 'Paguei a conta de luz R$ 189,40', 'Mercado R$ 200 no Nubank'];

// Tira acentos e deixa minúsculo, para a busca achar "farmacia" em "Farmácia"
function simplificar(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function valorComSinal(valor) {
  return `${valor >= 0 ? '+ ' : '− '}${reais(Math.abs(valor))}`;
}

export default function Lancamentos() {
  const [lista, setLista] = useState(carregar);
  const [mes, setMes] = useState(() => mesFinanceiro(dataDeHoje()));
  const [frase, setFrase] = useState('');
  const [erro, setErro] = useState('');
  const [filtro, setFiltro] = useState(null); // categoria escolhida nos atalhos
  const [selecionadoId, setSelecionadoId] = useState(null);
  const [editando, setEditando] = useState(null); // cópia do lançamento sendo editado
  const [categorias, setCategorias] = useState(carregarCategorias);
  const [busca, setBusca] = useState('');
  const campoBusca = useRef(null);
  const local = useLocation();

  // Vindo da lupa do Painel: já coloca o cursor na busca
  useEffect(() => {
    if (local.state?.buscar) campoBusca.current?.focus();
  }, [local.state]);
  const [removendo, setRemovendo] = useState(false); // modo "Remover categoria"
  const [novaCategoria, setNovaCategoria] = useState(null); // formulário "Adicionar categoria"
  const [erroCategoria, setErroCategoria] = useState('');

  // Sempre que a lista mudar, salva no aparelho
  useEffect(() => salvar(lista), [lista]);

  // Nomes das contas cadastradas na tela de Contas
  const [contas] = useState(nomesDasContas);

  const previa = useMemo(() => lerFrase(frase, contas), [frase, contas]);

  const doMes = useMemo(
    () =>
      lista
        .filter((l) => mesFinanceiro(l.data) === mes)
        .sort((a, b) => b.data.localeCompare(a.data)),
    [lista, mes]
  );
  const termo = simplificar(busca.trim());
  const visiveis = doMes
    .filter((l) => !filtro || l.categoria === filtro)
    .filter((l) => !termo || simplificar(`${l.descricao} ${l.categoria} ${l.conta}`).includes(termo));
  const saldoDoMes = doMes.reduce((soma, l) => soma + l.valor, 0);
  const selecionado = lista.find((l) => l.id === selecionadoId) || null;

  function lancar(evento) {
    evento.preventDefault();
    if (!previa || !previa.valor) {
      setErro('Coloque um valor na frase, por exemplo: "Gastei R$ 45 no almoço".');
      return;
    }
    const novo = {
      id: novoId(),
      data: previa.data,
      descricao: previa.descricao,
      categoria: previa.categoria,
      conta: previa.conta,
      valor: previa.tipo === 'receita' ? previa.valor : -previa.valor,
      pago: true,
      repete: false,
      observacao: '',
    };
    setLista((atual) => [novo, ...atual]);
    setMes(mesFinanceiro(novo.data));
    setSelecionadoId(novo.id);
    setEditando(null);
    setFrase('');
    setErro('');
  }

  // ----- Categorias: adicionar e remover -----
  function abrirNovaCategoria() {
    setRemovendo(false);
    setErroCategoria('');
    setNovaCategoria({ nome: '', emoji: EMOJIS[0], cor: CORES_CATEGORIA[0], tipo: 'despesa' });
  }

  function criarCategoria(evento) {
    evento.preventDefault();
    const nome = novaCategoria.nome.trim();
    if (!nome) return setErroCategoria('Dê um nome para a categoria.');
    if (categorias.some((c) => c.nome.toLowerCase() === nome.toLowerCase())) {
      return setErroCategoria('Já existe uma categoria com esse nome.');
    }
    const nova = { ...novaCategoria, nome };
    const atualizadas = [...categorias.filter((c) => c.nome !== 'Outros'), nova];
    salvarCategorias(atualizadas);
    setCategorias(carregarCategorias());
    setNovaCategoria(null);
    return undefined;
  }

  function removerCategoria(c) {
    const quantos = lista.filter((l) => l.categoria === c.nome).length;
    const aviso =
      quantos > 0
        ? `Remover a categoria "${c.nome}"? Os ${quantos} lançamentos dela passam para "Outros".`
        : `Remover a categoria "${c.nome}"?`;
    if (!window.confirm(aviso)) return;
    salvarCategorias(categorias.filter((item) => item.nome !== c.nome));
    setCategorias(carregarCategorias());
    if (quantos > 0) setLista((atual) => atual.map((l) => (l.categoria === c.nome ? { ...l, categoria: 'Outros' } : l)));
    if (filtro === c.nome) setFiltro(null);
  }

  // Fecha a janela de nova categoria com Esc
  useEffect(() => {
    if (!novaCategoria) return undefined;
    const aoTeclar = (e) => e.key === 'Escape' && setNovaCategoria(null);
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [novaCategoria]);

  function excluir(id) {
    if (!window.confirm('Excluir este lançamento?')) return;
    setLista((atual) => atual.filter((l) => l.id !== id));
    setSelecionadoId(null);
    setEditando(null);
  }

  function salvarEdicao(evento) {
    evento.preventDefault();
    const valor = Math.abs(parseFloat(String(editando.valorTexto).replace(/\./g, '').replace(',', '.')));
    if (!Number.isFinite(valor) || valor === 0) return;
    const atualizado = {
      ...editando,
      valor: editando.tipo === 'receita' ? valor : -valor,
      exemplo: false,
    };
    delete atualizado.valorTexto;
    delete atualizado.tipo;
    setLista((atual) => atual.map((l) => (l.id === atualizado.id ? atualizado : l)));
    setEditando(null);
  }

  function comecarEdicao(l) {
    setEditando({
      ...l,
      tipo: l.valor >= 0 ? 'receita' : 'despesa',
      valorTexto: Math.abs(l.valor).toFixed(2).replace('.', ','),
    });
  }


  return (
    <div className="pp-app">
      <MenuLateral />

      <main className="pp lanc">
        <div className="pp__topo">
          <div>
            <h1 className="pp__titulo">Lançamentos</h1>
            <p className="pp__subtitulo">
              {nomeDoMes(mes)}
              {periodoDoMes(mes) && ` (${periodoDoMes(mes)})`} · saldo do mês{' '}
              <b className={saldoDoMes >= 0 ? 'valor--entrada' : 'valor--saida'}>{valorComSinal(saldoDoMes)}</b>
            </p>
          </div>
          <div className="lanc__mes">
            <button type="button" className="lanc__mes-botao" onClick={() => setMes(mudarMes(mes, -1))} aria-label="Mês anterior">
              ‹
            </button>
            <b>{nomeDoMes(mes)}</b>
            <button type="button" className="lanc__mes-botao" onClick={() => setMes(mudarMes(mes, 1))} aria-label="Próximo mês">
              ›
            </button>
          </div>
        </div>


        {/* ===== Lançamento rápido ===== */}
        <form className="rapido" onSubmit={lancar}>
          <div className="rapido__topo">
            <label htmlFor="frase" className="rapido__titulo">
              Lançamento rápido
            </label>
            <span className="rapido__dica">Escreva do seu jeito, a CIFRA organiza</span>
          </div>
          <div className="rapido__linha">
            <input
              id="frase"
              className="rapido__campo"
              type="text"
              autoComplete="off"
              placeholder="Ex.: Gastei R$ 45 no almoço com Nubank"
              value={frase}
              onChange={(e) => {
                setFrase(e.target.value);
                setErro('');
              }}
            />
            <button type="submit" className="rapido__botao">
              Lançar
              <IconeSeta tamanho={18} espessura={2.4} />
            </button>
          </div>

          {/* Mostra como a frase foi entendida antes de lançar */}
          {previa && previa.valor ? (
            <div className="rapido__previa" aria-live="polite">
              <span className={previa.tipo === 'receita' ? 'previa previa--receita' : 'previa previa--despesa'}>
                {previa.tipo === 'receita' ? 'Receita' : 'Despesa'}
              </span>
              <span className="previa">{reais(previa.valor)}</span>
              <span className="previa">{previa.descricao}</span>
              <span className="previa">
                {categoria(previa.categoria).emoji} {previa.categoria}
              </span>
              <span className="previa">{previa.conta}</span>
              <span className="previa">{dataCurta(previa.data)}</span>
            </div>
          ) : (
            <div className="rapido__sugestoes">
              {SUGESTOES.map((s) => (
                <button key={s} type="button" className="rapido__sugestao" onClick={() => setFrase(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}
          {erro && <p className="rapido__erro">{erro}</p>}
        </form>

        {/* ===== Atalhos de categoria (filtram a lista) + adicionar/remover ===== */}
        <div className="atalhos" role="group" aria-label={removendo ? 'Remover categoria' : 'Filtrar por categoria'}>
          {categorias
            .filter((c) => c.nome !== 'Outros')
            .map((c) => (
              <button
                key={c.nome}
                type="button"
                className={[
                  'atalho',
                  filtro === c.nome && !removendo ? 'atalho--ativo' : '',
                  removendo ? 'atalho--removendo' : '',
                ].join(' ')}
                aria-pressed={removendo ? undefined : filtro === c.nome}
                aria-label={removendo ? `Remover ${c.nome}` : undefined}
                onClick={() => (removendo ? removerCategoria(c) : setFiltro(filtro === c.nome ? null : c.nome))}
              >
                <span className="atalho__icone" style={{ background: c.cor }}>
                  {c.emoji}
                  {removendo && <span className="atalho__x" aria-hidden="true">×</span>}
                </span>
                {c.nome}
              </button>
            ))}
          <button type="button" className="atalho atalho--acao" onClick={abrirNovaCategoria}>
            <span className="atalho__icone atalho__icone--acao" aria-hidden="true">
              +
            </span>
            Adicionar
          </button>
          <button
            type="button"
            className={removendo ? 'atalho atalho--acao atalho--ativo' : 'atalho atalho--acao'}
            aria-pressed={removendo}
            onClick={() => setRemovendo(!removendo)}
          >
            <span className="atalho__icone atalho__icone--acao" aria-hidden="true">
              {removendo ? '✓' : '−'}
            </span>
            {removendo ? 'Pronto' : 'Remover'}
          </button>
        </div>
        {removendo && <p className="atalhos__dica">Toque na categoria que quer remover. Os lançamentos dela vão para “Outros”.</p>}

        <div className="lanc__colunas">
          {/* ===== Lista ===== */}
          <section className="cartao lanc__lista">
            <div className="cartao__titulo-linha">
              <h2 className="cartao__titulo">{filtro ? `Lançamentos · ${filtro}` : 'Lançamentos do mês'}</h2>
              <div className="lanc__ferramentas">
                {filtro && (
                  <button type="button" className="lanc__limpar" onClick={() => setFiltro(null)}>
                    Ver todos
                  </button>
                )}
                <label className="lanc__busca">
                  <IconeBusca tamanho={16} espessura={2.2} />
                  <input
                    ref={campoBusca}
                    type="search"
                    placeholder="Buscar"
                    aria-label="Buscar lançamento"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                  />
                </label>
              </div>
            </div>

            {visiveis.length === 0 ? (
              <p className="lanc__vazio">{busca ? `Nada encontrado para “${busca}” neste mês.` : 'Nenhum lançamento por aqui ainda. Use o lançamento rápido acima.'}</p>
            ) : (
              <ul className="movs">
                {visiveis.map((l) => (
                  <li key={l.id}>
                    <button
                      type="button"
                      className={l.id === selecionadoId ? 'mov mov--ativa' : 'mov'}
                      onClick={() => {
                        setSelecionadoId(l.id);
                        setEditando(null);
                        // Em telas pequenas os detalhes ficam embaixo da lista: rola até eles
                        if (window.innerWidth <= 1100) {
                          setTimeout(() => document.querySelector('.detalhe')?.scrollIntoView({ behavior: 'smooth' }), 50);
                        }
                      }}
                    >
                      <span className="mov__cor" style={{ background: categoria(l.categoria).cor }} />
                      <span className="mov__data">{dataCurta(l.data)}</span>
                      <b className="mov__nome">{l.descricao}</b>
                      <span className="mov__categoria">{l.categoria}</span>
                      <b className={l.valor >= 0 ? 'mov__valor valor--entrada' : 'mov__valor valor--saida'}>
                        {valorComSinal(l.valor)}
                      </b>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* ===== Detalhes / edição ===== */}
          <aside className={selecionado ? 'cartao detalhe' : 'cartao detalhe detalhe--sem-selecao'} aria-live="polite">
            {!selecionado && (
              <div className="detalhe__vazio">
                <span className="detalhe__vazio-icone">👆</span>
                Clique em um lançamento para ver os detalhes.
              </div>
            )}

            {selecionado && !editando && (
              <>
                <div className="detalhe__topo">
                  <span className="detalhe__rotulo">Detalhes</span>
                  <button type="button" className="detalhe__fechar" onClick={() => setSelecionadoId(null)} aria-label="Fechar detalhes">
                    ×
                  </button>
                </div>
                <div className="detalhe__cabecalho">
                  <span className="detalhe__icone" style={{ background: categoria(selecionado.categoria).cor }}>
                    {categoria(selecionado.categoria).emoji}
                  </span>
                  <div>
                    <b className="detalhe__nome">{selecionado.descricao}</b>
                    <div className="detalhe__cat">{selecionado.categoria}</div>
                  </div>
                </div>
                <div className={selecionado.valor >= 0 ? 'detalhe__valor valor--entrada' : 'detalhe__valor valor--saida'}>
                  {valorComSinal(selecionado.valor)}
                </div>
                <dl className="detalhe__dados">
                  <div>
                    <dt>Data</dt>
                    <dd>{dataPorExtenso(selecionado.data)}</dd>
                  </div>
                  <div>
                    <dt>Conta</dt>
                    <dd>{selecionado.conta}</dd>
                  </div>
                  <div>
                    <dt>Situação</dt>
                    <dd>
                      <span className="detalhe__status">
                        {selecionado.pago ? (selecionado.valor >= 0 ? 'Recebido' : 'Pago') : 'Pendente'}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt>Repete</dt>
                    <dd>{selecionado.repete ? 'Todo mês' : 'Não'}</dd>
                  </div>
                  <div>
                    <dt>Observação</dt>
                    <dd>{selecionado.observacao || '—'}</dd>
                  </div>
                </dl>
                <div className="detalhe__acoes">
                  <button type="button" className="detalhe__editar" onClick={() => comecarEdicao(selecionado)}>
                    Editar
                  </button>
                  <button type="button" className="detalhe__excluir" onClick={() => excluir(selecionado.id)}>
                    Excluir
                  </button>
                </div>
              </>
            )}

            {editando && (
              <form className="edicao" onSubmit={salvarEdicao}>
                <div className="detalhe__topo">
                  <span className="detalhe__rotulo">Editar lançamento</span>
                  <button type="button" className="detalhe__fechar" onClick={() => setEditando(null)} aria-label="Cancelar edição">
                    ×
                  </button>
                </div>

                <div className="edicao__tipo" role="group" aria-label="Tipo">
                  {['receita', 'despesa'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={editando.tipo === t}
                      className={editando.tipo === t ? `edicao__tipo-botao edicao__tipo-botao--${t}` : 'edicao__tipo-botao'}
                      onClick={() => setEditando({ ...editando, tipo: t })}
                    >
                      {t === 'receita' ? 'Receita' : 'Despesa'}
                    </button>
                  ))}
                </div>

                <label className="edicao__campo">
                  Descrição
                  <input value={editando.descricao} onChange={(e) => setEditando({ ...editando, descricao: e.target.value })} required />
                </label>
                <div className="edicao__dupla">
                  <label className="edicao__campo">
                    Valor (R$)
                    <input inputMode="decimal" value={editando.valorTexto} onChange={(e) => setEditando({ ...editando, valorTexto: e.target.value })} required />
                  </label>
                  <label className="edicao__campo">
                    Data
                    <input type="date" value={editando.data} onChange={(e) => setEditando({ ...editando, data: e.target.value })} required />
                  </label>
                </div>
                <div className="edicao__dupla">
                  <label className="edicao__campo">
                    Categoria
                    <select value={editando.categoria} onChange={(e) => setEditando({ ...editando, categoria: e.target.value })}>
                      {categorias.map((c) => (
                        <option key={c.nome}>{c.nome}</option>
                      ))}
                    </select>
                  </label>
                  <label className="edicao__campo">
                    Conta
                    <select value={editando.conta} onChange={(e) => setEditando({ ...editando, conta: e.target.value })}>
                      {[...new Set([...(contas.length ? contas : CONTAS), editando.conta])].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="edicao__campo">
                  Observação
                  <input value={editando.observacao} onChange={(e) => setEditando({ ...editando, observacao: e.target.value })} />
                </label>
                <label className="edicao__check">
                  <input type="checkbox" checked={editando.pago} onChange={(e) => setEditando({ ...editando, pago: e.target.checked })} />
                  Já foi pago / recebido
                </label>
                <label className="edicao__check">
                  <input type="checkbox" checked={editando.repete} onChange={(e) => setEditando({ ...editando, repete: e.target.checked })} />
                  Repete todo mês
                </label>

                <div className="detalhe__acoes">
                  <button type="submit" className="detalhe__editar">
                    Salvar
                  </button>
                  <button type="button" className="detalhe__cancelar" onClick={() => setEditando(null)}>
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </aside>
        </div>

        {/* ===== Janela: nova categoria ===== */}
        {novaCategoria && (
          <div className="cat-fundo" onClick={() => setNovaCategoria(null)}>
            <form
              className="cat-janela"
              role="dialog"
              aria-modal="true"
              aria-labelledby="cat-titulo"
              onSubmit={criarCategoria}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="cat-janela__topo">
                <h2 id="cat-titulo">Nova categoria</h2>
                <button type="button" className="cat-janela__fechar" onClick={() => setNovaCategoria(null)} aria-label="Fechar">
                  ×
                </button>
              </div>

              <div className="cat-previa">
                <span className="atalho__icone" style={{ background: novaCategoria.cor }}>
                  {novaCategoria.emoji}
                </span>
                <b>{novaCategoria.nome.trim() || 'Nome da categoria'}</b>
              </div>

              <label className="cat-campo">
                Nome
                <input
                  autoFocus
                  placeholder="Ex.: Pet, Educação, Roupas"
                  maxLength={20}
                  value={novaCategoria.nome}
                  onChange={(e) => {
                    setNovaCategoria({ ...novaCategoria, nome: e.target.value });
                    setErroCategoria('');
                  }}
                />
              </label>

              <div className="edicao__tipo" role="group" aria-label="Tipo">
                {['despesa', 'receita'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={novaCategoria.tipo === t}
                    className={novaCategoria.tipo === t ? `edicao__tipo-botao edicao__tipo-botao--${t}` : 'edicao__tipo-botao'}
                    onClick={() => setNovaCategoria({ ...novaCategoria, tipo: t })}
                  >
                    {t === 'receita' ? 'Receita' : 'Despesa'}
                  </button>
                ))}
              </div>

              <fieldset className="cat-opcoes">
                <legend>Ícone</legend>
                {EMOJIS.map((emoji) => (
                  <label key={emoji} className="cat-opcao">
                    <input
                      type="radio"
                      name="emoji"
                      checked={novaCategoria.emoji === emoji}
                      onChange={() => setNovaCategoria({ ...novaCategoria, emoji })}
                    />
                    <span aria-hidden="true">{emoji}</span>
                  </label>
                ))}
              </fieldset>

              <fieldset className="cat-opcoes">
                <legend>Cor</legend>
                {CORES_CATEGORIA.map((cor) => (
                  <label key={cor} className="cat-opcao cat-opcao--cor" style={{ background: cor }}>
                    <input
                      type="radio"
                      name="cor"
                      checked={novaCategoria.cor === cor}
                      onChange={() => setNovaCategoria({ ...novaCategoria, cor })}
                      aria-label={`Cor ${cor}`}
                    />
                  </label>
                ))}
              </fieldset>

              {erroCategoria && <p className="cat-erro">{erroCategoria}</p>}

              <div className="detalhe__acoes">
                <button type="submit" className="detalhe__editar">
                  Criar categoria
                </button>
                <button type="button" className="detalhe__cancelar" onClick={() => setNovaCategoria(null)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
