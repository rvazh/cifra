// ===== Contas: bancos, carteira, poupança... =====
// Tudo fica salvo só neste aparelho (localStorage do navegador).
import { dataDeHoje, lancamentosDoMes, mesFinanceiro } from './lancamentos.js';
import { inicioDoMes } from './preferencias.js';

const CHAVE = 'cifra:contas';

export const TIPOS = ['Conta corrente', 'Poupança', 'Carteira', 'Investimento', 'Outra'];

// Cores (tons pastel) que a pessoa pode escolher para cada conta
export const CORES = ['#D9CCF0', '#F5C08F', '#A8D5A2', '#9EC5E8', '#E7AFC3', '#F3DE8A', '#EEE6D8'];

// Contas de exemplo (aparecem só na primeira vez).
// Os nomes batem com os lançamentos de exemplo, então o saldo de cada uma já vem calculado.
function exemplos() {
  return [
    { id: 'conta-exemplo-1', nome: 'Nubank', tipo: 'Conta corrente', saldoInicial: 1950, cor: '#D9CCF0', noTotal: true, exemplo: true },
    { id: 'conta-exemplo-2', nome: 'Inter', tipo: 'Conta corrente', saldoInicial: 1459.6, cor: '#F5C08F', noTotal: true, exemplo: true },
    { id: 'conta-exemplo-3', nome: 'Carteira', tipo: 'Carteira', saldoInicial: 1080, cor: '#A8D5A2', noTotal: true, exemplo: true },
  ];
}

export function carregarContas() {
  try {
    const salvo = localStorage.getItem(CHAVE);
    if (salvo) return JSON.parse(salvo);
  } catch {
    /* sem acesso ao armazenamento */
  }
  return exemplos();
}

export function salvarContas(contas) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(contas));
  } catch {
    /* sem acesso ao armazenamento: os dados ficam só até fechar a página */
  }
}

// Só os nomes (usado no lançamento rápido e na edição de lançamentos)
export function nomesDasContas() {
  return carregarContas().map((c) => c.nome);
}

// Números de uma conta a partir dos lançamentos
export function resumoDaConta(conta, lancamentos) {
  const hoje = dataDeHoje();
  const mes = mesFinanceiro(hoje);
  const daConta = lancamentos.filter((l) => l.conta === conta.nome);

  // Saldo atual: saldo inicial + tudo o que já foi pago/recebido
  const saldo = daConta.filter((l) => l.pago).reduce((s, l) => s + l.valor, conta.saldoInicial);

  // Previsto para o fim do mês: soma o que ainda vai entrar/sair neste mês (inclui os que se repetem)
  const pendentesDoMes = lancamentosDoMes(lancamentos, mes, inicioDoMes()).filter((l) => l.conta === conta.nome && !l.pago);
  const previsto = pendentesDoMes.reduce((s, l) => s + l.valor, saldo);

  const doMes = daConta.filter((l) => mesFinanceiro(l.data) === mes && l.pago);
  const entradas = doMes.filter((l) => l.valor > 0).reduce((s, l) => s + l.valor, 0);
  const saidas = doMes.filter((l) => l.valor < 0).reduce((s, l) => s - l.valor, 0);

  // Últimas movimentações: só o que já foi pago ou recebido
  const ultimos = daConta
    .filter((l) => l.pago)
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, 3);

  return { saldo, previsto, entradas, saidas, ultimos, quantidade: daConta.length };
}
