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

// ----- Lançamentos de exemplo (aparecem só na primeira vez) -----
function exemplos() {
  const mes = dataDeHoje().slice(0, 8); // "2026-10-"
  const hoje = Number(dataDeHoje().slice(8));
  // [dia, descrição, categoria, conta, valor, repete todo mês?]
  const itens = [
    ['09', 'Salário', 'Salário', 'Nubank', 5200, true],
    ['08', 'Mercado', 'Alimentação', 'Nubank', -812.9],
    ['07', 'Parcela do carro', 'Transporte', 'Nubank', -1390.99, true],
    ['06', 'Freela', 'Extra', 'Inter', 500],
    ['05', 'Conta de luz', 'Moradia', 'Nubank', -189.4],
    ['05', 'Aluguel', 'Moradia', 'Nubank', -1400, true],
    ['04', 'Restaurante', 'Alimentação', 'Carteira', -200],
    ['03', 'Venda (OLX)', 'Extra', 'Carteira', 407.2],
    ['03', 'Internet', 'Moradia', 'Inter', -99.9, true],
    ['02', 'Farmácia', 'Saúde', 'Carteira', -87.16],
    ['01', 'Pix da Adriana', 'Extra', 'Nubank', 312.8],
    // Contas que ainda vão vencer (aparecem no calendário como "a pagar")
    ['15', 'Condomínio', 'Moradia', 'Nubank', -450, true],
    ['18', 'Netflix', 'Lazer', 'Nubank', -44.9, true],
    ['20', 'Academia', 'Saúde', 'Inter', -99.9, true],
    ['22', 'Fatura do cartão', 'Outros', 'Nubank', -1250],
    ['28', 'Seguro do carro', 'Transporte', 'Inter', -210],
  ];
  const doMes = itens.map(([dia, descricao, cat, conta, valor, repete = false], i) => ({
    id: `exemplo-${i}`,
    data: mes + dia,
    descricao,
    categoria: cat,
    conta,
    valor,
    pago: Number(dia) <= hoje, // o que já passou está pago; o resto fica "a pagar"
    repete,
    observacao: '',
    exemplo: true,
  }));
  return [...doMes, ...historicoDeExemplo()];
}

// Cinco meses anteriores de exemplo, para os relatórios terem o que comparar.
// Os valores mudam um pouco de mês para mês, como na vida real.
function historicoDeExemplo() {
  const variacoes = [
    // mercado, luz, fatura, restaurante, gasolina, freela, farmácia, lazer
    [742.3, 176.8, 340.4, 186.5, 230, 650, 64.9, 120],
    [815.6, 201.35, 420.1, 240, 260.4, 0, 0, 89.9],
    [698.9, 168.2, 365.75, 152.3, 215.8, 900, 112.4, 210],
    [776.45, 189.9, 510.3, 264.8, 248, 400, 0, 75],
    [731.2, 214.6, 388.6, 198.9, 236.5, 550, 58.3, 160],
  ];
  const itens = [];
  variacoes.forEach(([mercado, luz, fatura, restaurante, gasolina, freela, farmacia, lazer], i) => {
    const mes = mudarMes(dataDeHoje().slice(0, 7), -(i + 1)) + '-';
    const linhas = [
      ['05', 'Salário', 'Salário', 'Nubank', 5200],
      ['05', 'Aluguel', 'Moradia', 'Nubank', -1400],
      ['07', 'Parcela do carro', 'Transporte', 'Nubank', -1390.99],
      ['03', 'Internet', 'Moradia', 'Inter', -99.9],
      ['15', 'Condomínio', 'Moradia', 'Nubank', -450],
      ['18', 'Netflix', 'Lazer', 'Nubank', -44.9],
      ['20', 'Academia', 'Saúde', 'Inter', -99.9],
      ['10', 'Mercado', 'Alimentação', 'Nubank', -mercado],
      ['12', 'Conta de luz', 'Moradia', 'Nubank', -luz],
      ['22', 'Fatura do cartão', 'Outros', 'Nubank', -fatura],
      ['16', 'Restaurante', 'Alimentação', 'Nubank', -restaurante],
      ['13', 'Gasolina', 'Transporte', 'Inter', -gasolina],
      ['25', 'Freela', 'Extra', 'Inter', freela],
      ['09', 'Farmácia', 'Saúde', 'Carteira', -farmacia],
      ['26', 'Cinema', 'Lazer', 'Carteira', -lazer],
    ];
    linhas
      .filter((l) => l[4] !== 0 && l[4] !== -0)
      .forEach(([dia, descricao, cat, conta, valor], j) =>
        itens.push({
          id: `exemplo-h${i}-${j}`,
          data: mes + dia,
          descricao,
          categoria: cat,
          conta,
          valor,
          pago: true,
          repete: false,
          observacao: '',
          exemplo: true,
        })
      );
  });
  return itens;
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

// ----- Ler e salvar -----
export function carregar() {
  try {
    const salvo = localStorage.getItem(CHAVE);
    if (salvo) return JSON.parse(salvo);
  } catch {
    /* sem acesso ao armazenamento */
  }
  return exemplos();
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
