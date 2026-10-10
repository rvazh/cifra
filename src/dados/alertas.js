// ===== Alertas de vencimento =====
// Roda sozinho em segundo plano enquanto a CIFRA está aberta.
// Para cada conta a pagar, dispara 2 avisos: 3 dias antes e 1 dia antes do vencimento.
// Cada aviso só é disparado uma vez (fica anotado neste aparelho).

import { carregar, lancamentosDoMes, dataDeHoje, mudarMes, diasAte, dataCurta } from './lancamentos.js';
import { carregarPreferencias, valoresEscondidos } from './preferencias.js';

const CHAVE_DISPARADOS = 'cifra:alertas';
export const ANTECEDENCIAS = [3, 1]; // dias antes do vencimento

function lerDisparados() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_DISPARADOS) || '[]');
  } catch {
    return [];
  }
}

function anotarDisparado(chave) {
  const lista = [...lerDisparados(), chave].slice(-400); // guarda só os mais recentes
  try {
    localStorage.setItem(CHAVE_DISPARADOS, JSON.stringify(lista));
  } catch {
    /* sem acesso ao armazenamento */
  }
}

// Quais avisos precisam sair agora
export function alertasParaDisparar(lista = carregar()) {
  const mes = dataDeHoje().slice(0, 7);
  const ja = new Set(lerDisparados());
  const alertas = [];

  [...lancamentosDoMes(lista, mes), ...lancamentosDoMes(lista, mudarMes(mes, 1))]
    .filter((l) => l.valor < 0 && !l.pago)
    .filter((l) => !l.exemplo && !String(l.origem || '').startsWith('exemplo')) // não avisa dos exemplos
    .forEach((l) => {
      const faltam = diasAte(l.data);
      if (faltam < 0) return; // já venceu: o aviso de atrasadas fica no Painel
      // Aviso de 1 dia (vale para "amanhã" e "hoje") ou de 3 dias (vale de 3 até 2 dias antes)
      const antecedencia = faltam <= 1 ? 1 : faltam <= 3 ? 3 : null;
      if (!antecedencia) return;
      const chave = `${l.origem || l.id}|${l.data}|${antecedencia}`;
      if (ja.has(chave)) return;
      alertas.push({ chave, lancamento: l, faltam });
    });

  return alertas;
}

function textoDoPrazo(faltam) {
  if (faltam === 0) return 'vence hoje';
  if (faltam === 1) return 'vence amanhã';
  return `vence em ${faltam} dias`;
}

export function textoDoAlerta({ lancamento: l, faltam }) {
  const valor = valoresEscondidos()
    ? ''
    : ` · ${Math.abs(l.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
  return {
    titulo: `${l.descricao} ${textoDoPrazo(faltam)}`,
    corpo: `Vencimento em ${dataCurta(l.data)}${valor} · ${l.conta}`,
  };
}

// Avisa o sistema de alertas que algo mudou (ex.: evento novo no calendário)
export function conferirAlertasAgora() {
  setTimeout(() => window.dispatchEvent(new Event('cifra:conferir-alertas')), 100);
}

// ----- Notificação do navegador -----
export function podeNotificar() {
  return typeof Notification !== 'undefined' && Notification.permission === 'granted';
}

// Pede permissão para mostrar notificações (o navegador só pergunta uma vez)
export function pedirPermissaoDeAviso() {
  try {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  } catch {
    /* navegador sem notificações */
  }
}

async function mostrarNotificacao(titulo, corpo) {
  const opcoes = { body: corpo, icon: './favicon.png', tag: titulo, data: { url: './#/painel/calendario' } };
  // No celular (Android) a notificação precisa sair pelo service worker
  try {
    const registro = await navigator.serviceWorker?.getRegistration();
    if (registro) {
      await registro.showNotification(`CIFRA · ${titulo}`, opcoes);
      return true;
    }
  } catch {
    /* tenta o jeito simples abaixo */
  }
  try {
    new Notification(`CIFRA · ${titulo}`, opcoes); // eslint-disable-line no-new
    return true;
  } catch {
    return false;
  }
}

// Confere e dispara. "mostrarNaTela" é usado quando o navegador não deixa notificar.
export async function verificarAlertas(mostrarNaTela) {
  if (!carregarPreferencias().avisarContas) return;
  const alertas = alertasParaDisparar();
  // Anota antes de mostrar, para o mesmo aviso nunca sair duas vezes
  alertas.forEach((alerta) => anotarDisparado(alerta.chave));
  for (const alerta of alertas) {
    const { titulo, corpo } = textoDoAlerta(alerta);
    const foi = podeNotificar() && (await mostrarNotificacao(titulo, corpo));
    if (!foi && mostrarNaTela) mostrarNaTela({ id: alerta.chave, titulo, corpo });
  }
}
