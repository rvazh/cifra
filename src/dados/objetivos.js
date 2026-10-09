// ===== Objetivos: dinheiro separado para um sonho ou uma meta =====
// Tudo fica salvo só neste aparelho (localStorage do navegador).
import { dataDeHoje, mudarMes } from './lancamentos.js';

const CHAVE = 'cifra:objetivos';

// Ícones que a pessoa pode escolher para cada objetivo
export const ICONES = ['✈️', '🛟', '💻', '🏠', '🚗', '🎓', '💍', '🎁', '📱', '🌱'];

// Objetivos de exemplo (aparecem só na primeira vez)
function exemplos() {
  const mes = dataDeHoje().slice(0, 7);
  return [
    { id: 'objetivo-exemplo-1', nome: 'Viagem de férias', icone: '✈️', meta: 5000, guardado: 3400, prazo: mudarMes(mes, 9), exemplo: true },
    { id: 'objetivo-exemplo-2', nome: 'Reserva de emergência', icone: '🛟', meta: 10000, guardado: 7200, prazo: mudarMes(mes, 14), exemplo: true },
    { id: 'objetivo-exemplo-3', nome: 'Notebook novo', icone: '💻', meta: 4500, guardado: 1200, prazo: mudarMes(mes, 5), exemplo: true },
  ];
}

export function carregarObjetivos() {
  try {
    const salvo = localStorage.getItem(CHAVE);
    if (salvo) return JSON.parse(salvo);
  } catch {
    /* sem acesso ao armazenamento */
  }
  return exemplos();
}

export function salvarObjetivos(lista) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(lista));
  } catch {
    /* sem acesso ao armazenamento: os dados ficam só até fechar a página */
  }
}

// Quantos meses faltam até o prazo ("2027-07"), contando o mês atual
export function mesesAte(prazo) {
  const [ano, mes] = dataDeHoje().slice(0, 7).split('-').map(Number);
  const [anoFim, mesFim] = prazo.split('-').map(Number);
  return (anoFim - ano) * 12 + (mesFim - mes) + 1;
}

// "2027-07" -> "jul/2027"
export function prazoCurto(prazo) {
  const [ano, mes] = prazo.split('-').map(Number);
  const nome = new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
  return `${nome}/${ano}`;
}

// Situação do objetivo, em uma frase simples
export function situacaoDoObjetivo(o) {
  const falta = Math.max(o.meta - o.guardado, 0);
  const porcento = o.meta > 0 ? Math.min((o.guardado / o.meta) * 100, 100) : 0;
  if (falta === 0) return { porcento, falta, estado: 'alcancado' };
  if (!o.prazo) return { porcento, falta, estado: 'sem-prazo' };
  const meses = mesesAte(o.prazo);
  if (meses <= 0) return { porcento, falta, estado: 'atrasado' };
  return { porcento, falta, estado: 'andando', meses, porMes: falta / meses };
}
