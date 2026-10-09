import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import MenuLateral from '../components/MenuLateral.jsx';
import { IconeMais } from '../components/Icones.jsx';
import { reais } from '../components/Graficos.jsx';
import { nomesDasContas } from '../dados/contas.js';
import { carregarPreferencias, valoresEscondidos } from '../dados/preferencias.js';
import {
  categoria,
  carregar,
  salvar,
  novoId,
  lerFrase,
  dataDeHoje,
  nomeDoMes,
  mudarMes,
  diasNoMes,
  lancamentosDoMes,
} from '../dados/lancamentos.js';
import './Painel.css';
import './Calendario.css';

const DIAS_DA_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES_CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

// Valor curto para caber no quadradinho do dia: "−1.400" ou "+5.200"
function valorCurto(valor) {
  if (valoresEscondidos()) return '••••';
  return `${valor >= 0 ? '+' : '−'}${Math.round(Math.abs(valor)).toLocaleString('pt-BR')}`;
}

function valorComSinal(valor) {
  return `${valor >= 0 ? '+ ' : '− '}${reais(Math.abs(valor))}`;
}

// "2026-10-09" -> "Sexta-feira, 9 de outubro"
function diaPorExtenso(data) {
  const [ano, mes, dia] = data.split('-').map(Number);
  const texto = new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// Quantos dias faltam de hoje até a data
function diasAte(data) {
  const [ano, mes, dia] = data.split('-').map(Number);
  const [ha, hm, hd] = dataDeHoje().split('-').map(Number);
  return Math.round((new Date(ano, mes - 1, dia) - new Date(ha, hm - 1, hd)) / 86400000);
}

function quandoVence(data) {
  const dias = diasAte(data);
  if (dias < 0) return dias === -1 ? 'Venceu ontem' : `Venceu há ${-dias} dias`;
  if (dias === 0) return 'Vence hoje';
  if (dias === 1) return 'Vence amanhã';
  return `Vence em ${dias} dias`;
}

// Situação de cada lançamento: pago, a pagar, atrasado ou previsto
function situacao(l, hoje) {
  if (l.pago) return { classe: 'pago', texto: l.valor >= 0 ? 'Recebido' : 'Pago' };
  if (l.data < hoje) return { classe: 'atrasado', texto: 'Atrasado' };
  if (l.previsto) return { classe: 'previsto', texto: 'Previsto' };
  return { classe: 'pendente', texto: l.valor >= 0 ? 'A receber' : 'A pagar' };
}

export default function Calendario() {
  const hoje = dataDeHoje();
  const [lista, setLista] = useState(carregar);
  const [mes, setMes] = useState(hoje.slice(0, 7));
  const [diaEscolhido, setDiaEscolhido] = useState(hoje);
  const [frase, setFrase] = useState('');
  const [erro, setErro] = useState('');

  // Sempre que a lista mudar, salva no aparelho
  useEffect(() => salvar(lista), [lista]);

  const itensDoMes = useMemo(() => lancamentosDoMes(lista, mes), [lista, mes]);

  // Agrupa os lançamentos por dia: { "2026-10-05": [...] }
  const porDia = useMemo(() => {
    const grupos = {};
    itensDoMes.forEach((l) => {
      (grupos[l.data] = grupos[l.data] || []).push(l);
    });
    Object.values(grupos).forEach((g) => g.sort((a, b) => Math.abs(b.valor) - Math.abs(a.valor)));
    return grupos;
  }, [itensDoMes]);

  // Quadradinhos do mês: espaços vazios antes do dia 1 e depois do último dia
  const [ano, numeroMes] = mes.split('-').map(Number);
  // A semana começa no domingo ou na segunda, conforme as Configurações
  const comecaNa = carregarPreferencias().primeiroDiaDaSemana;
  const diasDaSemana = [...DIAS_DA_SEMANA.slice(comecaNa), ...DIAS_DA_SEMANA.slice(0, comecaNa)];
  const primeiroDiaDaSemana = (new Date(ano, numeroMes - 1, 1).getDay() - comecaNa + 7) % 7;
  const totalDias = diasNoMes(mes);
  const quadros = [];
  for (let i = 0; i < primeiroDiaDaSemana; i++) quadros.push(null);
  for (let d = 1; d <= totalDias; d++) quadros.push(`${mes}-${String(d).padStart(2, '0')}`);
  while (quadros.length % 7 !== 0) quadros.push(null);

  // Resumo do mês
  const entradas = itensDoMes.filter((l) => l.valor > 0).reduce((s, l) => s + l.valor, 0);
  const saidas = itensDoMes.filter((l) => l.valor < 0).reduce((s, l) => s - l.valor, 0);
  const aPagar = itensDoMes.filter((l) => l.valor < 0 && !l.pago).reduce((s, l) => s - l.valor, 0);
  const atrasadas = itensDoMes.filter((l) => !l.pago && l.data < hoje).length;

  // Próximos vencimentos: contas em aberto deste mês e do próximo (as atrasadas primeiro)
  const proximos = useMemo(() => {
    const mesAtual = hoje.slice(0, 7);
    return [...lancamentosDoMes(lista, mesAtual), ...lancamentosDoMes(lista, mudarMes(mesAtual, 1))]
      .filter((l) => l.valor < 0 && !l.pago)
      .filter((l) => diasAte(l.data) <= 30)
      .sort((a, b) => a.data.localeCompare(b.data))
      .slice(0, 5);
  }, [lista, hoje]);

  const doDia = (diaEscolhido.startsWith(mes) && porDia[diaEscolhido]) || [];
  const saldoDoDia = doDia.reduce((s, l) => s + l.valor, 0);

  function irPara(data) {
    setMes(data.slice(0, 7));
    setDiaEscolhido(data);
  }

  function trocarMes(quanto) {
    const novo = mudarMes(mes, quanto);
    setMes(novo);
    // Escolhe hoje, se estiver no mês, ou o dia 1
    setDiaEscolhido(hoje.startsWith(novo) ? hoje : `${novo}-01`);
  }

  // Marca como pago/recebido (ou desfaz). Um lançamento "previsto" vira um lançamento de verdade.
  function alternarPago(l) {
    if (l.previsto) {
      const confirmado = { ...l, id: novoId(), pago: true, repete: false, previsto: false, exemplo: false };
      delete confirmado.previsto;
      setLista((atual) => [confirmado, ...atual]);
      return;
    }
    setLista((atual) => atual.map((item) => (item.id === l.id ? { ...item, pago: !item.pago } : item)));
  }

  function adicionar(evento) {
    evento.preventDefault();
    const lido = lerFrase(frase, nomesDasContas());
    if (!lido || !lido.valor) {
      setErro('Coloque um valor, por exemplo: "Dentista R$ 150".');
      return;
    }
    const novo = {
      id: novoId(),
      data: diaEscolhido,
      descricao: lido.descricao,
      categoria: lido.categoria,
      conta: lido.conta,
      valor: lido.tipo === 'receita' ? lido.valor : -lido.valor,
      pago: diaEscolhido <= hoje, // data futura fica "a pagar"
      repete: false,
      observacao: '',
    };
    setLista((atual) => [novo, ...atual]);
    setFrase('');
    setErro('');
  }

  function escolherDia(data) {
    setDiaEscolhido(data);
    // Em telas pequenas o painel do dia fica embaixo do calendário: rola até ele
    if (window.innerWidth <= 1100) {
      setTimeout(() => document.querySelector('.cal-dia')?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }

  return (
    <div className="pp-app">
      <MenuLateral />

      <main className="pp cal">
        <div className="pp__topo">
          <div>
            <h1 className="pp__titulo">Calendário</h1>
            <p className="pp__subtitulo">Veja quando cada conta vence e o que já foi pago</p>
          </div>
          <div className="cal__navegacao">
            <button type="button" className="cal__hoje" onClick={() => irPara(hoje)}>
              Hoje
            </button>
            <button type="button" className="cal__seta" onClick={() => trocarMes(-1)} aria-label="Mês anterior">
              ‹
            </button>
            <b className="cal__mes">{nomeDoMes(mes)}</b>
            <button type="button" className="cal__seta" onClick={() => trocarMes(1)} aria-label="Próximo mês">
              ›
            </button>
          </div>
        </div>


        {/* ===== Resumo do mês ===== */}
        <div className="cal__resumos">
          <div className="cal-resumo">
            <span className="cal-resumo__rotulo">Entradas do mês</span>
            <b className="cal-resumo__valor valor--entrada">{reais(entradas)}</b>
          </div>
          <div className="cal-resumo">
            <span className="cal-resumo__rotulo">Saídas do mês</span>
            <b className="cal-resumo__valor valor--saida">{reais(saidas)}</b>
          </div>
          <div className="cal-resumo cal-resumo--destaque">
            <span className="cal-resumo__rotulo">Ainda a pagar</span>
            <b className="cal-resumo__valor">{reais(aPagar)}</b>
            {atrasadas > 0 && (
              <span className="cal-resumo__alerta">
                {atrasadas} {atrasadas === 1 ? 'conta atrasada' : 'contas atrasadas'}
              </span>
            )}
          </div>
          <div className="cal-resumo">
            <span className="cal-resumo__rotulo">Saldo previsto</span>
            <b className={entradas - saidas >= 0 ? 'cal-resumo__valor valor--entrada' : 'cal-resumo__valor valor--saida'}>
              {valorComSinal(entradas - saidas)}
            </b>
          </div>
        </div>

        <div className="cal__colunas">
          {/* ===== Grade do mês ===== */}
          <section className="cartao cal-grade">
            <div className="cal-grade__semana" aria-hidden="true">
              {diasDaSemana.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
            <div className="cal-grade__dias">
              {quadros.map((data, i) => {
                if (!data) return <span key={`vazio-${i}`} className="cal-quadro cal-quadro--vazio" />;
                const itens = porDia[data] || [];
                const classes = ['cal-quadro'];
                if (data === hoje) classes.push('cal-quadro--hoje');
                if (data === diaEscolhido) classes.push('cal-quadro--escolhido');
                if (itens.some((l) => !l.pago && l.data < hoje)) classes.push('cal-quadro--atrasado');
                return (
                  <button
                    key={data}
                    type="button"
                    className={classes.join(' ')}
                    onClick={() => escolherDia(data)}
                    aria-pressed={data === diaEscolhido}
                    aria-label={`${diaPorExtenso(data)}: ${itens.length} ${itens.length === 1 ? 'lançamento' : 'lançamentos'}`}
                  >
                    <span className="cal-quadro__numero">{Number(data.slice(8))}</span>

                    {/* Computador: etiquetas com nome e valor */}
                    <span className="cal-quadro__itens">
                      {itens.slice(0, 2).map((l) => (
                        <span
                          key={l.id}
                          className={`cal-etiqueta cal-etiqueta--${situacao(l, hoje).classe}`}
                          style={{ '--cor': categoria(l.categoria).cor }}
                        >
                          <span className="cal-etiqueta__nome">{l.descricao}</span>
                          <span className={l.valor >= 0 ? 'cal-etiqueta__valor valor--entrada' : 'cal-etiqueta__valor'}>
                            {valorCurto(l.valor)}
                          </span>
                        </span>
                      ))}
                      {itens.length > 2 && <span className="cal-quadro__mais">+ {itens.length - 2} mais</span>}
                    </span>

                    {/* Celular: só bolinhas coloridas */}
                    <span className="cal-quadro__pontos">
                      {itens.slice(0, 4).map((l) => (
                        <span
                          key={l.id}
                          className={`cal-ponto cal-ponto--${situacao(l, hoje).classe}`}
                          style={{ '--cor': categoria(l.categoria).cor }}
                        />
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="cal-legenda">
              <span className="cal-legenda__item">
                <span className="cal-legenda__amostra cal-legenda__amostra--pago" /> Pago / recebido
              </span>
              <span className="cal-legenda__item">
                <span className="cal-legenda__amostra cal-legenda__amostra--pendente" /> A pagar
              </span>
              <span className="cal-legenda__item">
                <span className="cal-legenda__amostra cal-legenda__amostra--previsto" /> Previsto (repete todo mês)
              </span>
              <span className="cal-legenda__item">
                <span className="cal-legenda__amostra cal-legenda__amostra--atrasado" /> Atrasado
              </span>
            </div>
          </section>

          <div className="cal__lado">
            {/* ===== Dia escolhido ===== */}
            <section className="cartao cal-dia" aria-live="polite">
              <div className="cal-dia__topo">
                <h2 className="cartao__titulo">{diaPorExtenso(diaEscolhido)}</h2>
                {doDia.length > 0 && (
                  <b className={saldoDoDia >= 0 ? 'cal-dia__saldo valor--entrada' : 'cal-dia__saldo valor--saida'}>
                    {valorComSinal(saldoDoDia)}
                  </b>
                )}
              </div>

              {doDia.length === 0 ? (
                <p className="cal-dia__vazio">Nada marcado para este dia.</p>
              ) : (
                <ul className="cal-dia__lista">
                  {doDia.map((l) => {
                    const s = situacao(l, hoje);
                    return (
                      <li key={l.id} className="cal-item">
                        <span className="cal-item__icone" style={{ background: categoria(l.categoria).cor }}>
                          {categoria(l.categoria).emoji}
                        </span>
                        <span className="cal-item__textos">
                          <b className="cal-item__nome">{l.descricao}</b>
                          <span className="cal-item__detalhe">
                            {l.categoria} · {l.conta}
                          </span>
                          <span className={`cal-selo cal-selo--${s.classe}`}>{s.texto}</span>
                        </span>
                        <span className="cal-item__direita">
                          <b className={l.valor >= 0 ? 'cal-item__valor valor--entrada' : 'cal-item__valor valor--saida'}>
                            {valorComSinal(l.valor)}
                          </b>
                          <button type="button" className="cal-item__acao" onClick={() => alternarPago(l)}>
                            {l.pago ? 'Desfazer' : l.valor >= 0 ? 'Marcar recebido' : 'Marcar pago'}
                          </button>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* Adicionar algo neste dia, com a mesma frase do lançamento rápido */}
              <form className="cal-dia__novo" onSubmit={adicionar}>
                <label htmlFor="frase-dia" className="cal-dia__novo-rotulo">
                  Adicionar neste dia
                </label>
                <div className="cal-dia__novo-linha">
                  <input
                    id="frase-dia"
                    type="text"
                    autoComplete="off"
                    placeholder="Ex.: Dentista R$ 150"
                    value={frase}
                    onChange={(e) => {
                      setFrase(e.target.value);
                      setErro('');
                    }}
                  />
                  <button type="submit" aria-label="Adicionar">
                    <IconeMais tamanho={18} espessura={2.6} />
                  </button>
                </div>
                {erro && <p className="cal-dia__erro">{erro}</p>}
              </form>
            </section>

            {/* ===== Próximos vencimentos ===== */}
            <section className="cartao">
              <div className="cartao__titulo-linha">
                <h2 className="cartao__titulo">Próximos vencimentos</h2>
                <Link to="/painel/lancamentos" className="cartao__link">
                  Lançamentos
                </Link>
              </div>
              {proximos.length === 0 ? (
                <p className="cal-dia__vazio">Nenhuma conta em aberto nos próximos 30 dias. 🎉</p>
              ) : (
                <ul className="cal-proximos">
                  {proximos.map((l) => {
                    const [, m, d] = l.data.split('-');
                    const atrasado = l.data < hoje;
                    return (
                      <li key={l.id}>
                        <button type="button" className="cal-proximo" onClick={() => irPara(l.data)}>
                          <span className={atrasado ? 'vencimento cal-proximo__data--atrasado' : 'vencimento'}>
                            <b>{Number(d)}</b>
                            {MESES_CURTOS[Number(m) - 1]}
                          </span>
                          <span className="cal-proximo__textos">
                            <b className="cal-proximo__nome">{l.descricao}</b>
                            <span className={atrasado ? 'cal-proximo__quando valor--saida' : 'cal-proximo__quando'}>
                              {quandoVence(l.data)}
                            </span>
                          </span>
                          <b className="cal-proximo__valor">{reais(Math.abs(l.valor))}</b>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
