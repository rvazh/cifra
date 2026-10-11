import { useEffect, useMemo, useState } from 'react';
import { reais } from './Graficos.jsx';
import { carregarCategorias, categoria as dadosDaCategoria, dataCurta, dataPorExtenso } from '../dados/lancamentos.js';
import { mesmoNome } from '../dados/contas.js';
import { aprenderDoHistorico, sugerirCategoria } from '../dados/ofx.js';
import './ImportarOFX.css';

// Como a categoria foi encontrada (aparece como uma etiqueta pequena)
const ORIGEM = {
  historico: 'como você já lançou',
  nome: 'pelo nome da categoria',
  palavra: 'pela descrição',
};

function valorComSinal(valor) {
  return `${valor >= 0 ? '+ ' : '− '}${reais(Math.abs(valor))}`;
}

// Nome sugerido para a conta: uma conta sua que bate com o banco do extrato, ou o nome do banco
function contaSugerida(extrato, contas) {
  const nome = extrato.cartao
    ? `Cartão ${extrato.banco || 'de crédito'}`.trim()
    : extrato.banco || 'Conta importada';
  const existente =
    contas.find((c) => mesmoNome(c.nome, nome)) ||
    (!extrato.cartao && extrato.banco && contas.find((c) => c.nome.toLowerCase().includes(extrato.banco.toLowerCase())));
  return existente ? existente.nome : nome;
}

// Janela de conferência: mostra o que veio do extrato antes de virar lançamento
export default function ImportarOFX({ extrato, contas, lancamentos, aoConfirmar, aoFechar }) {
  const categorias = carregarCategorias();
  const [conta, setConta] = useState(() => contaSugerida(extrato, contas));
  const [ajustarSaldo, setAjustarSaldo] = useState(extrato.saldo !== null);
  const [escolhas, setEscolhas] = useState({}); // o que a pessoa mudou: { [chave]: { incluir, categoria } }

  // Fecha com Esc
  useEffect(() => {
    const aoTeclar = (e) => e.key === 'Escape' && aoFechar();
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [aoFechar]);

  // Categoria sugerida para cada movimentação (aprende com o que você já lançou)
  const sugestoes = useMemo(() => {
    const historico = aprenderDoHistorico(lancamentos);
    return Object.fromEntries(extrato.transacoes.map((t) => [t.chave, sugerirCategoria(t.original, t.valor, historico, categorias)]));
  }, [extrato, lancamentos]); // eslint-disable-line react-hooks/exhaustive-deps

  // Situação de cada movimentação: nova, já importada antes ou parecida com um lançamento que você fez à mão
  const linhas = useMemo(
    () =>
      extrato.transacoes.map((t) => {
        let situacao = 'nova';
        if (lancamentos.some((l) => l.ofx === t.chave)) situacao = 'importada';
        else if (
          lancamentos.some(
            (l) => !l.ofx && mesmoNome(l.conta, conta) && l.data === t.data && Math.abs(l.valor - t.valor) < 0.005
          )
        ) {
          situacao = 'parecida';
        }
        const sugestao = sugestoes[t.chave];
        const escolha = escolhas[t.chave] || {};
        return {
          ...t,
          situacao,
          incluir: escolha.incluir ?? situacao === 'nova',
          categoria: escolha.categoria ?? sugestao.categoria,
          como: escolha.categoria ? 'voce' : sugestao.como,
        };
      }),
    [extrato, lancamentos, conta, sugestoes, escolhas]
  );

  const marcadas = linhas.filter((l) => l.incluir);
  const entradas = marcadas.filter((l) => l.valor > 0).reduce((s, l) => s + l.valor, 0);
  const saidas = marcadas.filter((l) => l.valor < 0).reduce((s, l) => s - l.valor, 0);
  const identificadas = linhas.filter((l) => l.como).length;
  const jaImportadas = linhas.filter((l) => l.situacao === 'importada').length;
  const parecidas = linhas.filter((l) => l.situacao === 'parecida').length;
  const contaExiste = contas.some((c) => mesmoNome(c.nome, conta));

  function mudar(chave, mudanca) {
    setEscolhas((atual) => ({ ...atual, [chave]: { ...atual[chave], ...mudanca } }));
  }

  function marcarTodas(incluir) {
    setEscolhas((atual) => {
      const novo = { ...atual };
      linhas.forEach((l) => {
        if (l.situacao !== 'importada') novo[l.chave] = { ...novo[l.chave], incluir };
      });
      return novo;
    });
  }

  function confirmar(e) {
    e.preventDefault();
    if (!conta.trim() || !marcadas.length) return;
    aoConfirmar({
      conta: conta.trim().replace(/\s+/g, ' '),
      cartao: extrato.cartao,
      itens: marcadas.map((l) => ({ chave: l.chave, data: l.data, descricao: l.descricao, valor: l.valor, categoria: l.categoria })),
      saldo: ajustarSaldo ? extrato.saldo : null,
      saldoData: extrato.saldoData || extrato.fim,
    });
  }

  return (
    <div className="ofx-fundo" onClick={aoFechar}>
      <form
        className="ofx"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ofx-titulo"
        onSubmit={confirmar}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ===== Topo ===== */}
        <div className="ofx__topo">
          <div>
            <h2 id="ofx-titulo">Importar extrato</h2>
            <p className="ofx__sub">
              {extrato.banco || 'Banco não informado'}
              {extrato.cartao ? ' · cartão de crédito' : ''} · {dataCurta(extrato.inicio)} a {dataCurta(extrato.fim)} ·{' '}
              {extrato.transacoes.length} {extrato.transacoes.length === 1 ? 'movimentação' : 'movimentações'}
            </p>
          </div>
          <button type="button" className="ofx__fechar" onClick={aoFechar} aria-label="Fechar">
            ×
          </button>
        </div>

        {/* ===== Conta e saldo ===== */}
        <div className="ofx__config">
          <label className="ofx__campo">
            Para qual conta?
            <input list="ofx-contas" value={conta} onChange={(e) => setConta(e.target.value)} autoComplete="off" required />
            <datalist id="ofx-contas">
              {contas.map((c) => (
                <option key={c.id} value={c.nome} />
              ))}
            </datalist>
            <small>{contaExiste ? 'Conta já cadastrada' : 'Conta nova: será criada em Contas'}</small>
          </label>

          {extrato.saldo !== null && (
            <label className="ofx__saldo">
              <input type="checkbox" checked={ajustarSaldo} onChange={(e) => setAjustarSaldo(e.target.checked)} />
              <span>
                <b>Deixar o saldo igual ao do banco</b>
                Saldo do extrato: {valorComSinal(extrato.saldo).replace('+ ', '')} em{' '}
                {dataPorExtenso(extrato.saldoData || extrato.fim)}
              </span>
            </label>
          )}
        </div>

        {/* ===== Resumo ===== */}
        <div className="ofx__resumo">
          <span>
            <b>{marcadas.length}</b> para importar
          </span>
          <span className="valor--entrada">
            <b>{reais(entradas)}</b> entradas
          </span>
          <span className="valor--saida">
            <b>{reais(saidas)}</b> saídas
          </span>
          <span>
            Categoria identificada em <b>{identificadas}</b> de {linhas.length}
          </span>
        </div>
        {(jaImportadas > 0 || parecidas > 0) && (
          <p className="ofx__aviso">
            {jaImportadas > 0 && `${jaImportadas} já ${jaImportadas === 1 ? 'foi importada' : 'foram importadas'} antes e não entram de novo. `}
            {parecidas > 0 &&
              `${parecidas} ${parecidas === 1 ? 'parece' : 'parecem'} com lançamentos que você já fez à mão (mesmo dia e valor): ficaram desmarcadas.`}
          </p>
        )}

        {/* ===== Lista ===== */}
        <div className="ofx__lista-topo">
          <span>Confira as categorias. Você pode trocar qualquer uma.</span>
          <span className="ofx__marcar">
            <button type="button" onClick={() => marcarTodas(true)}>
              Marcar todas
            </button>
            <button type="button" onClick={() => marcarTodas(false)}>
              Desmarcar
            </button>
          </span>
        </div>
        <ul className="ofx__lista">
          {linhas.map((l) => (
            <li key={l.chave} className={l.incluir ? 'ofx-linha' : 'ofx-linha ofx-linha--fora'}>
              <input
                type="checkbox"
                className="ofx-linha__check"
                checked={l.incluir}
                disabled={l.situacao === 'importada'}
                onChange={(e) => mudar(l.chave, { incluir: e.target.checked })}
                aria-label={`Importar ${l.descricao}`}
              />
              <span className="ofx-linha__data">{dataCurta(l.data)}</span>
              <span className="ofx-linha__textos">
                <b title={l.original}>{l.descricao}</b>
                <small>
                  {l.situacao === 'importada' && <span className="ofx-tag ofx-tag--cinza">Já importada</span>}
                  {l.situacao === 'parecida' && <span className="ofx-tag ofx-tag--alerta">Parece repetida</span>}
                  {l.como === 'voce' && <span className="ofx-tag">Você escolheu</span>}
                  {l.como && l.como !== 'voce' && <span className="ofx-tag ofx-tag--ok">Identificada {ORIGEM[l.como]}</span>}
                  {!l.como && <span className="ofx-tag ofx-tag--cinza">Não identificada</span>}
                </small>
              </span>
              <label className="ofx-linha__categoria">
                <span className="ofx-linha__cor" style={{ background: dadosDaCategoria(l.categoria).cor }} aria-hidden="true">
                  {dadosDaCategoria(l.categoria).emoji}
                </span>
                <select
                  value={l.categoria}
                  onChange={(e) => mudar(l.chave, { categoria: e.target.value })}
                  aria-label={`Categoria de ${l.descricao}`}
                  disabled={l.situacao === 'importada'}
                >
                  {categorias.map((c) => (
                    <option key={c.nome} value={c.nome}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </label>
              <b className={l.valor >= 0 ? 'ofx-linha__valor valor--entrada' : 'ofx-linha__valor valor--saida'}>
                {valorComSinal(l.valor)}
              </b>
            </li>
          ))}
        </ul>

        {/* ===== Rodapé ===== */}
        <div className="ofx__rodape">
          <p>Tudo entra como já pago/recebido e atualiza Contas, Lançamentos, Painel e Relatórios.</p>
          <div className="ofx__botoes">
            <button type="button" className="ofx__cancelar" onClick={aoFechar}>
              Cancelar
            </button>
            <button type="submit" className="ofx__importar" disabled={!marcadas.length || !conta.trim()}>
              Importar {marcadas.length} {marcadas.length === 1 ? 'lançamento' : 'lançamentos'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
