// ===== Contas: bancos, carteira, poupança... =====
// Tudo fica salvo só neste aparelho (localStorage do navegador).
import { carregar, dataDeHoje, lancamentosDoMes, mesFinanceiro, novoId } from './lancamentos.js';
import { inicioDoMes } from './preferencias.js';

const CHAVE = 'cifra:contas';

export const TIPOS = ['Conta corrente', 'Poupança', 'Carteira', 'Investimento', 'Outra'];

// Cores (tons pastel) que a pessoa pode escolher para cada conta
export const CORES = ['#D9CCF0', '#F5C08F', '#A8D5A2', '#9EC5E8', '#E7AFC3', '#F3DE8A', '#EEE6D8'];

// Versões antigas vinham com 3 contas de exemplo (Nubank, Inter e Carteira).
// Elas são tiradas, menos as que a pessoa já usou em algum lançamento dela:
// essas ficam, mas com saldo inicial zerado.
function semExemplos(contas) {
  const usadas = new Set(carregar().map((l) => l.conta));
  return contas
    .filter((c) => !c.exemplo || usadas.has(c.nome))
    .map((c) => (c.exemplo ? { ...c, exemplo: false, saldoInicial: 0 } : c));
}

// Um usuário novo começa sem nenhuma conta
export function carregarContas() {
  try {
    const salvo = localStorage.getItem(CHAVE);
    if (salvo) return semExemplos(JSON.parse(salvo));
  } catch {
    /* sem acesso ao armazenamento */
  }
  return [];
}

export function salvarContas(contas) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(contas));
  } catch {
    /* sem acesso ao armazenamento: os dados ficam só até fechar a página */
  }
}

// Só os nomes (usado nos formulários de lançamento e do calendário)
export function nomesDasContas() {
  return carregarContas().map((c) => c.nome);
}

// Compara nomes sem ligar para maiúsculas, acentos e espaços ("nubank " = "Nubank")
function mesmoNome(a, b) {
  const limpar = (t) => t.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return limpar(a) === limpar(b);
}

// Garante que a conta existe: se a pessoa digitou uma conta nova num lançamento,
// ela é criada na tela de Contas (saldo inicial R$ 0,00).
// Devolve o nome certinho da conta (do jeito que está cadastrada) e se ela foi criada agora.
export function garantirConta(nome) {
  const limpo = nome.trim().replace(/\s+/g, ' ');
  const contas = carregarContas();
  const existente = contas.find((c) => mesmoNome(c.nome, limpo));
  if (existente) return { nome: existente.nome, criada: false };

  const nova = {
    id: novoId(),
    nome: limpo,
    tipo: /carteira|dinheiro/i.test(limpo) ? 'Carteira' : 'Conta corrente',
    saldoInicial: 0,
    cor: CORES[contas.length % CORES.length],
    noTotal: true,
  };
  salvarContas([...contas, nova]);
  return { nome: nova.nome, criada: true };
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
