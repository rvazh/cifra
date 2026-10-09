import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MenuLateral from '../components/MenuLateral.jsx';
import { IconeMais, IconeCima, IconeBaixo } from '../components/Icones.jsx';
import { reais } from '../components/Graficos.jsx';
import { carregar, salvar, novoId, dataCurta } from '../dados/lancamentos.js';
import { TIPOS, CORES, carregarContas, salvarContas, resumoDaConta } from '../dados/contas.js';
import './Painel.css';
import './Contas.css';

function valorComSinal(valor) {
  return `${valor >= 0 ? '+ ' : '− '}${reais(Math.abs(valor))}`;
}

// Saldo pode ser negativo (cheque especial): mostra o sinal de menos
function saldoTexto(valor) {
  return valor < 0 ? `− ${reais(Math.abs(valor))}` : reais(valor);
}

// "1.234,56" -> 1234.56 (aceita sinal de menos)
function lerNumero(texto) {
  const limpo = String(texto).replace(/\s|R\$/gi, '').replace(/\./g, '').replace(',', '.');
  const numero = parseFloat(limpo);
  return Number.isFinite(numero) ? numero : null;
}

const CONTA_VAZIA = { nome: '', tipo: 'Conta corrente', saldoTexto: '0,00', cor: CORES[0], noTotal: true };

export default function Contas() {
  const [contas, setContas] = useState(carregarContas);
  const [lancamentos, setLancamentos] = useState(carregar);
  const [formulario, setFormulario] = useState(null); // conta sendo criada ou editada
  const [erro, setErro] = useState('');

  // Sempre que algo mudar, salva no aparelho
  useEffect(() => salvarContas(contas), [contas]);
  useEffect(() => salvar(lancamentos), [lancamentos]);

  // Fecha o formulário com a tecla Esc
  useEffect(() => {
    if (!formulario) return undefined;
    const aoTeclar = (e) => e.key === 'Escape' && setFormulario(null);
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [formulario]);

  const comResumo = contas.map((c) => ({ ...c, ...resumoDaConta(c, lancamentos) }));
  const noTotal = comResumo.filter((c) => c.noTotal);
  const saldoTotal = noTotal.reduce((s, c) => s + c.saldo, 0);
  const previstoTotal = noTotal.reduce((s, c) => s + c.previsto, 0);
  const entradasMes = noTotal.reduce((s, c) => s + c.entradas, 0);
  const saidasMes = noTotal.reduce((s, c) => s + c.saidas, 0);
  const positivos = noTotal.filter((c) => c.saldo > 0);
  const somaPositivos = positivos.reduce((s, c) => s + c.saldo, 0);

  function abrirNova() {
    setErro('');
    setFormulario({ ...CONTA_VAZIA, cor: CORES[contas.length % CORES.length] });
  }

  function abrirEdicao(conta) {
    setErro('');
    setFormulario({
      ...conta,
      saldoTexto: conta.saldoInicial.toFixed(2).replace('.', ','),
    });
  }

  function salvarFormulario(evento) {
    evento.preventDefault();
    const nome = formulario.nome.trim();
    const saldoInicial = lerNumero(formulario.saldoTexto);
    if (!nome) return setErro('Dê um nome para a conta.');
    if (saldoInicial === null) return setErro('O saldo inicial precisa ser um número, por exemplo 1.250,00.');
    const repetida = contas.some((c) => c.nome.toLowerCase() === nome.toLowerCase() && c.id !== formulario.id);
    if (repetida) return setErro('Já existe uma conta com esse nome.');

    const conta = {
      id: formulario.id || novoId(),
      nome,
      tipo: formulario.tipo,
      saldoInicial,
      cor: formulario.cor,
      noTotal: formulario.noTotal,
    };

    if (formulario.id) {
      const antiga = contas.find((c) => c.id === formulario.id);
      setContas((atual) => atual.map((c) => (c.id === conta.id ? conta : c)));
      // Se o nome mudou, os lançamentos dessa conta passam a usar o nome novo
      if (antiga && antiga.nome !== nome) {
        setLancamentos((atual) => atual.map((l) => (l.conta === antiga.nome ? { ...l, conta: nome } : l)));
      }
    } else {
      setContas((atual) => [...atual, conta]);
    }
    setFormulario(null);
    return undefined;
  }

  function excluir(conta) {
    const quantos = conta.quantidade;
    const aviso =
      quantos > 0
        ? `Excluir a conta "${conta.nome}"? Os ${quantos} lançamentos dela continuam salvos na tela de Lançamentos.`
        : `Excluir a conta "${conta.nome}"?`;
    if (!window.confirm(aviso)) return;
    setContas((atual) => atual.filter((c) => c.id !== conta.id));
  }

  return (
    <div className="pp-app">
      <MenuLateral />

      <main className="pp ct">
        <div className="pp__topo">
          <div>
            <h1 className="pp__titulo">Contas</h1>
            <p className="pp__subtitulo">Seus bancos, carteira e investimentos em um só lugar</p>
          </div>
          <div className="pp__acoes">
            <button type="button" className="pp__novo ct__novo" onClick={abrirNova}>
              <IconeMais tamanho={18} espessura={2.6} />
              Nova conta
            </button>
          </div>
        </div>


        {/* ===== Saldo total ===== */}
        <div className="ct__resumo">
          <section className="ct-total">
            <span className="ct-total__rotulo">Saldo total</span>
            <b className="ct-total__valor">{saldoTexto(saldoTotal)}</b>
            <span className="ct-total__previsto">
              Previsto para o fim do mês: <b>{saldoTexto(previstoTotal)}</b>
            </span>

            {/* Barra mostrando quanto do dinheiro está em cada conta */}
            {somaPositivos > 0 && (
              <>
                <div className="ct-total__barra" aria-hidden="true">
                  {positivos.map((c) => (
                    <span key={c.id} style={{ width: `${(c.saldo / somaPositivos) * 100}%`, background: c.cor }} />
                  ))}
                </div>
                <ul className="ct-total__legenda">
                  {positivos.map((c) => (
                    <li key={c.id}>
                      <span className="ct-total__cor" style={{ background: c.cor }} />
                      {c.nome} <b>{Math.round((c.saldo / somaPositivos) * 100)}%</b>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          <div className="ct__mini">
            <div className="ct-mini">
              <span className="ct-mini__icone ct-mini__icone--entrada">
                <IconeCima tamanho={18} espessura={2.2} />
              </span>
              <div>
                <span className="ct-mini__rotulo">Entrou este mês</span>
                <b className="ct-mini__valor valor--entrada">{reais(entradasMes)}</b>
              </div>
            </div>
            <div className="ct-mini">
              <span className="ct-mini__icone ct-mini__icone--saida">
                <IconeBaixo tamanho={18} espessura={2.2} />
              </span>
              <div>
                <span className="ct-mini__rotulo">Saiu este mês</span>
                <b className="ct-mini__valor valor--saida">{reais(saidasMes)}</b>
              </div>
            </div>
            <div className="ct-mini">
              <span className="ct-mini__icone ct-mini__icone--contas">{contas.length}</span>
              <div>
                <span className="ct-mini__rotulo">Contas cadastradas</span>
                <b className="ct-mini__valor">{noTotal.length} somam no total</b>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Cartões das contas ===== */}
        <div className="ct__grade">
          {comResumo.map((c) => (
            <article key={c.id} className="ct-conta" style={{ '--cor': c.cor }}>
              <div className="ct-conta__topo">
                <span className="ct-conta__avatar" aria-hidden="true">
                  {c.nome.charAt(0).toUpperCase()}
                </span>
                <div className="ct-conta__titulos">
                  <h2 className="ct-conta__nome">{c.nome}</h2>
                  <span className="ct-conta__tipo">{c.tipo}</span>
                </div>
                {!c.noTotal && <span className="ct-conta__fora">Fora do total</span>}
              </div>

              <div className="ct-conta__saldo">
                <span>Saldo atual</span>
                <b className={c.saldo < 0 ? 'valor--saida' : ''}>{saldoTexto(c.saldo)}</b>
              </div>

              <div className="ct-conta__linha">
                <span>Previsto no fim do mês</span>
                <b>{saldoTexto(c.previsto)}</b>
              </div>

              <div className="ct-conta__mes">
                <span className="ct-conta__chip ct-conta__chip--entrada">
                  <IconeCima tamanho={14} espessura={2.4} /> {reais(c.entradas)}
                </span>
                <span className="ct-conta__chip ct-conta__chip--saida">
                  <IconeBaixo tamanho={14} espessura={2.4} /> {reais(c.saidas)}
                </span>
                <span className="ct-conta__chip-legenda">neste mês</span>
              </div>

              <div className="ct-conta__ultimos">
                <span className="ct-conta__subtitulo">Últimas movimentações</span>
                {c.ultimos.length === 0 ? (
                  <p className="ct-conta__vazio">Nenhum lançamento nesta conta ainda.</p>
                ) : (
                  <ul>
                    {c.ultimos.map((l) => (
                      <li key={l.id}>
                        <span className="ct-conta__data">{dataCurta(l.data)}</span>
                        <span className="ct-conta__desc">{l.descricao}</span>
                        <b className={l.valor >= 0 ? 'valor--entrada' : 'valor--saida'}>{valorComSinal(l.valor)}</b>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="ct-conta__acoes">
                <button type="button" className="ct-conta__botao" onClick={() => abrirEdicao(c)}>
                  Editar
                </button>
                <Link to="/painel/lancamentos" className="ct-conta__botao">
                  Lançamentos
                </Link>
                <button type="button" className="ct-conta__botao ct-conta__botao--excluir" onClick={() => excluir(c)}>
                  Excluir
                </button>
              </div>
            </article>
          ))}

          <button type="button" className="ct-adicionar" onClick={abrirNova}>
            <span className="ct-adicionar__mais">
              <IconeMais tamanho={22} espessura={2.4} />
            </span>
            Adicionar conta
            <small>Banco, carteira, poupança ou investimento</small>
          </button>
        </div>

        {/* ===== Formulário (nova conta / editar) ===== */}
        {formulario && (
          <div className="ct-fundo" onClick={() => setFormulario(null)}>
            <form
              className="ct-form"
              role="dialog"
              aria-modal="true"
              aria-labelledby="ct-form-titulo"
              onSubmit={salvarFormulario}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="ct-form__topo">
                <h2 id="ct-form-titulo">{formulario.id ? 'Editar conta' : 'Nova conta'}</h2>
                <button type="button" className="ct-form__fechar" onClick={() => setFormulario(null)} aria-label="Fechar">
                  ×
                </button>
              </div>

              <label className="ct-form__campo">
                Nome da conta
                <input
                  autoFocus
                  placeholder="Ex.: Nubank, Poupança, Carteira"
                  value={formulario.nome}
                  onChange={(e) => setFormulario({ ...formulario, nome: e.target.value })}
                />
              </label>

              <div className="ct-form__dupla">
                <label className="ct-form__campo">
                  Tipo
                  <select value={formulario.tipo} onChange={(e) => setFormulario({ ...formulario, tipo: e.target.value })}>
                    {TIPOS.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </label>
                <label className="ct-form__campo">
                  Saldo inicial (R$)
                  <input
                    inputMode="decimal"
                    value={formulario.saldoTexto}
                    onChange={(e) => setFormulario({ ...formulario, saldoTexto: e.target.value })}
                  />
                </label>
              </div>
              <p className="ct-form__dica">
                O saldo inicial é quanto havia na conta antes dos lançamentos. O saldo atual soma tudo o que já foi pago e
                recebido nela.
              </p>

              <fieldset className="ct-form__cores">
                <legend>Cor</legend>
                {CORES.map((cor) => (
                  <label key={cor} className="ct-form__cor" style={{ background: cor }}>
                    <input
                      type="radio"
                      name="cor"
                      value={cor}
                      checked={formulario.cor === cor}
                      onChange={() => setFormulario({ ...formulario, cor })}
                      aria-label={`Cor ${cor}`}
                    />
                  </label>
                ))}
              </fieldset>

              <label className="ct-form__check">
                <input
                  type="checkbox"
                  checked={formulario.noTotal}
                  onChange={(e) => setFormulario({ ...formulario, noTotal: e.target.checked })}
                />
                Somar esta conta no saldo total
              </label>

              {erro && <p className="ct-form__erro">{erro}</p>}

              <div className="ct-form__acoes">
                <button type="submit" className="ct-form__salvar">
                  Salvar
                </button>
                <button type="button" className="ct-form__cancelar" onClick={() => setFormulario(null)}>
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
