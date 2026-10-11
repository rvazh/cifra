// ===== Lançamentos: categorias, contas, leitura da frase e armazenamento =====
// Tudo fica salvo só neste aparelho (localStorage do navegador).

import { inicioDoMes } from './preferencias.js';

const CHAVE = 'cifra:lancamentos';

// Categorias com cor (tons pastel) e um emoji para os atalhos.
// Estas são as que vêm de fábrica; a pessoa pode adicionar e remover na tela de Lançamentos.
export const CATEGORIAS_PADRAO = [
  { nome: 'Alimentação', emoji: '🛒', cor: '#A8D5A2', tipo: 'despesa' },
  { nome: 'Moradia', emoji: '🏠', cor: '#9EC5E8', tipo: 'despesa' },
  { nome: 'Transporte', emoji: '🚗', cor: '#F5C08F', tipo: 'despesa' },
  { nome: 'Saúde', emoji: '💊', cor: '#E7AFC3', tipo: 'despesa' },
  { nome: 'Lazer', emoji: '🎬', cor: '#D9CCF0', tipo: 'despesa' },
  { nome: 'Salário', emoji: '💰', cor: '#CDEBD6', tipo: 'receita' },
  { nome: 'Extra', emoji: '✨', cor: '#CDEBD6', tipo: 'receita' },
  { nome: 'Outros', emoji: '📦', cor: '#EEE6D8', tipo: 'ambos' },
];

// "Outros" sempre existe: é para onde vão os lançamentos de uma categoria removida
const OUTROS = CATEGORIAS_PADRAO[CATEGORIAS_PADRAO.length - 1];
const CHAVE_CATEGORIAS = 'cifra:categorias';
let categoriasGuardadas = null;

export function carregarCategorias() {
  if (categoriasGuardadas) return categoriasGuardadas;
  let lista = CATEGORIAS_PADRAO;
  try {
    const salvo = localStorage.getItem(CHAVE_CATEGORIAS);
    if (salvo) lista = JSON.parse(salvo);
  } catch {
    /* sem acesso ao armazenamento */
  }
  categoriasGuardadas = [...lista.filter((c) => c.nome !== 'Outros'), OUTROS];
  return categoriasGuardadas;
}

export function salvarCategorias(lista) {
  categoriasGuardadas = [...lista.filter((c) => c.nome !== 'Outros'), OUTROS];
  try {
    localStorage.setItem(CHAVE_CATEGORIAS, JSON.stringify(categoriasGuardadas));
  } catch {
    /* sem acesso ao armazenamento */
  }
}

export const CONTAS = ['Nubank', 'Inter', 'Itaú', 'Bradesco', 'Santander', 'Caixa', 'Carteira'];

export function categoria(nome) {
  return carregarCategorias().find((c) => c.nome === nome) || OUTROS;
}

// ----- Datas -----
// Guardamos a data como texto "2026-10-09" (ano-mês-dia)
export function dataDeHoje(diasAtras = 0) {
  const d = new Date();
  d.setDate(d.getDate() - diasAtras);
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

// Quantos dias faltam de hoje até a data (negativo = já passou)
export function diasAte(data) {
  const [ano, mes, dia] = data.split('-').map(Number);
  const [ha, hm, hd] = dataDeHoje().split('-').map(Number);
  return Math.round((new Date(ano, mes - 1, dia) - new Date(ha, hm - 1, hd)) / 86400000);
}

export function dataCurta(data) {
  const [, mes, dia] = data.split('-');
  return `${dia}/${mes}`;
}

export function dataPorExtenso(data) {
  const [ano, mes, dia] = data.split('-').map(Number);
  return new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// ----- Meses -----
// "2026-10" -> "Outubro 2026"
export function nomeDoMes(mes) {
  const [ano, m] = mes.split('-').map(Number);
  const nome = new Date(ano, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long' });
  return `${nome.charAt(0).toUpperCase()}${nome.slice(1)} ${ano}`;
}

// Anda "quanto" meses para frente (ou para trás, se for negativo)
export function mudarMes(mes, quanto) {
  const [ano, m] = mes.split('-').map(Number);
  const d = new Date(ano, m - 1 + quanto, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// Quantos dias tem o mês ("2026-02" -> 28)
export function diasNoMes(mes) {
  const [ano, m] = mes.split('-').map(Number);
  return new Date(ano, m, 0).getDate();
}

// ----- Mês financeiro -----
// Nas Configurações a pessoa pode dizer que o mês dela começa em outro dia (ex.: dia 5, quando cai o salário).
// Aí "outubro" vai de 5/out a 4/nov. Com o dia 1 (padrão), é o mês normal do calendário.
export function mesFinanceiro(data, inicio = inicioDoMes()) {
  const mes = data.slice(0, 7);
  return Number(data.slice(8)) >= inicio ? mes : mudarMes(mes, -1);
}

// "5/out a 4/nov" (ou vazio, quando o mês começa no dia 1)
export function periodoDoMes(mes, inicio = inicioDoMes()) {
  if (inicio === 1) return '';
  const curto = (m) => new Date(Number(m.slice(0, 4)), Number(m.slice(5, 7)) - 1, 1).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
  return `${inicio}/${curto(mes)} a ${inicio - 1}/${curto(mudarMes(mes, 1))}`;
}

// ----- Lançamentos de um mês, incluindo os que se repetem -----
// Um lançamento marcado como "Repete todo mês" aparece nos meses seguintes como "previsto".
// Quando o previsto é confirmado, vira um lançamento normal com "origem" apontando para o original.
// "inicio" = dia em que o mês começa (o Calendário usa sempre o dia 1).
export function lancamentosDoMes(lista, mes, inicio = 1) {
  const doMes = lista.filter((l) => mesFinanceiro(l.data, inicio) === mes);

  const previstos = lista
    .filter((l) => l.repete && mesFinanceiro(l.data, inicio) < mes)
    .filter((l) => !doMes.some((outro) => outro.origem === l.id))
    .map((l) => {
      const diaOriginal = Number(l.data.slice(8));
      const mesDoCalendario = diaOriginal >= inicio ? mes : mudarMes(mes, 1);
      const dia = Math.min(diaOriginal, diasNoMes(mesDoCalendario));
      return {
        ...l,
        id: `${l.id}@${mes}`,
        data: `${mesDoCalendario}-${String(dia).padStart(2, '0')}`,
        pago: false,
        previsto: true,
        origem: l.id,
      };
    });

  return [...doMes, ...previstos];
}

// ----- Situação de uma conta: pago, guardado ou pendente -----
// "Guardado" = o dinheiro já foi separado, mas a conta ainda não foi paga.
export function situacaoDe(l) {
  if (l.pago) return 'pago';
  if (l.guardado) return 'guardado';
  return 'pendente';
}

// Devolve a lista com a situação do lançamento trocada.
// Um "previsto" (conta que se repete) vira um lançamento de verdade ao mudar de situação.
export function comSituacao(lista, item, situacao) {
  if (situacaoDe(item) === situacao) return lista;
  const campos = { pago: situacao === 'pago', guardado: situacao === 'guardado' };
  if (item.previsto) {
    const real = { ...item, ...campos, id: novoId(), repete: false };
    delete real.previsto;
    return [real, ...lista];
  }
  return lista.map((l) => (l.id === item.id ? { ...l, ...campos } : l));
}

// ----- Ler e salvar -----
// Versões antigas da CIFRA vinham com lançamentos de exemplo: eles são tirados aqui
export function ehExemplo(l) {
  return Boolean(l.exemplo) || String(l.origem || '').startsWith('exemplo') || String(l.id || '').startsWith('exemplo');
}

// Um usuário novo começa com a lista vazia
export function carregar() {
  try {
    const salvo = localStorage.getItem(CHAVE);
    if (salvo) return JSON.parse(salvo).filter((l) => !ehExemplo(l));
  } catch {
    /* sem acesso ao armazenamento */
  }
  return [];
}

export function salvar(lista) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(lista));
  } catch {
    /* sem acesso ao armazenamento: os dados ficam só até fechar a página */
  }
}

export function novoId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ===== Lançamento rápido: entende frases como "Gastei R$ 45 no almoço com Nubank" =====

// Palavras que indicam cada categoria
const PALAVRAS = {
  Alimentação: ['almoço', 'almoco', 'jantar', 'lanche', 'mercado', 'supermercado', 'restaurante', 'ifood', 'padaria', 'café', 'cafe', 'pizza', 'açougue', 'feira'],
  Moradia: ['aluguel', 'luz', 'energia', 'água', 'agua', 'internet', 'condomínio', 'condominio', 'gás', 'gas', 'iptu'],
  Transporte: ['uber', 'gasolina', 'combustível', 'combustivel', 'ônibus', 'onibus', 'metrô', 'metro', 'carro', 'estacionamento', 'pedágio', 'pedagio'],
  Saúde: ['farmácia', 'farmacia', 'remédio', 'remedio', 'médico', 'medico', 'dentista', 'academia', 'consulta', 'exame'],
  Lazer: ['cinema', 'show', 'viagem', 'bar', 'festa', 'netflix', 'spotify', 'jogo', 'passeio'],
  Salário: ['salário', 'salario', 'pagamento do trabalho'],
  Extra: ['freela', 'extra', 'bico', 'venda', 'vendi', 'pix', 'presente', 'reembolso'],
};

// Descrições mais completas para algumas palavras
const NOMES_BONITOS = {
  luz: 'Conta de luz',
  energia: 'Conta de luz',
  água: 'Conta de água',
  agua: 'Conta de água',
  gás: 'Conta de gás',
  gas: 'Conta de gás',
  ifood: 'iFood',
};

const PALAVRAS_RECEITA = ['recebi', 'ganhei', 'entrou', 'caiu', 'vendi', 'salário', 'salario', 'freela'];

// Transforma "1.234,56" ou "45" ou "45.90" em número
function lerValor(texto) {
  const achado = texto.match(/(?:r\$\s*)?(\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?|\d+(?:[.,]\d{1,2})?)/i);
  if (!achado) return null;
  let numero = achado[1];
  if (numero.includes(',')) numero = numero.replace(/\./g, '').replace(',', '.');
  else if (/\.\d{3}$/.test(numero)) numero = numero.replace(/\./g, '');
  const valor = parseFloat(numero);
  return Number.isFinite(valor) && valor > 0 ? valor : null;
}

function primeiraLetraMaiuscula(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// Deixa um nome seguro para usar dentro de uma expressão regular
function escapar(texto) {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// "contasDoUsuario" são os nomes das contas cadastradas na tela de Contas
export function lerFrase(frase, contasDoUsuario = []) {
  const texto = frase.trim();
  const minusculo = texto.toLowerCase();
  if (!texto) return null;

  const valor = lerValor(minusculo);
  const receita = PALAVRAS_RECEITA.some((p) => minusculo.includes(p));

  // Conta: procura o nome de alguma conta cadastrada (sem contas cadastradas, usa os bancos conhecidos)
  const candidatas = contasDoUsuario.length ? contasDoUsuario : CONTAS;
  const contaPadrao = contasDoUsuario.includes('Carteira') ? 'Carteira' : contasDoUsuario[0] || 'Carteira';
  const conta =
    candidatas.find((c) =>
      new RegExp(`(^|[^\\wÀ-ú])${escapar(c.toLowerCase())}([^\\wÀ-ú]|$)`).test(minusculo)
    ) || contaPadrao;

  // Categoria: a primeira palavra-chave encontrada
  let cat = receita ? 'Extra' : 'Outros';
  let palavraAchada = '';
  for (const [nome, palavras] of Object.entries(PALAVRAS)) {
    const p = palavras.find((palavra) => new RegExp(`(^|\\s)${palavra}(\\s|$|[.,!])`, 'i').test(minusculo));
    if (p) {
      cat = nome;
      palavraAchada = p;
      break;
    }
  }

  // Descrição: a palavra da categoria ou o texto sem o valor e sem a conta
  let descricao = palavraAchada
    ? NOMES_BONITOS[palavraAchada] || primeiraLetraMaiuscula(palavraAchada)
    : texto
        .replace(/(?:r\$\s*)?\d[\d.,]*/i, '')
        .replace(new RegExp(escapar(conta), 'i'), '')
        .replace(/(^|\s)(gastei|paguei|comprei|recebi|ganhei|com|no|na|em|de|do|da|pelo|pela|reais|um|uma|o|a|os|as)(?=\s|$)/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
  if (!descricao) descricao = receita ? 'Receita' : 'Despesa';

  const ontem = /\bontem\b/i.test(minusculo);

  // Categorias criadas pela pessoa: se o nome aparece na frase, usa ela
  if (!palavraAchada) {
    const criada = carregarCategorias().find(
      (c) => c.nome !== 'Outros' && new RegExp(`(^|\\s)${escapar(c.nome.toLowerCase())}(\\s|$|[.,!])`).test(minusculo)
    );
    if (criada) {
      cat = criada.nome;
      palavraAchada = criada.nome.toLowerCase();
    }
  }

  // Se a pessoa removeu essa categoria, o lançamento vai para "Outros"
  if (!carregarCategorias().some((c) => c.nome === cat)) cat = 'Outros';

  return {
    valor,
    tipo: receita ? 'receita' : 'despesa',
    categoria: cat,
    conta,
    descricao: primeiraLetraMaiuscula(descricao),
    data: dataDeHoje(ontem ? 1 : 0),
  };
}
