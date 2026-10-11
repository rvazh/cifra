// ===== Acesso (login) =====
// O usuário e a senha NÃO ficam escritos aqui. Guardamos só o "hash" SHA-256 deles:
// uma impressão digital embaralhada que não dá para desfazer de volta no texto original.
// Na hora de entrar, o navegador calcula o hash do que foi digitado e compara com este.
//
// Atenção: isto é uma verificação simples, feita no próprio navegador. Para um login
// de verdade (com várias pessoas, troca de senha etc.), a conferência precisa ser feita
// num servidor.

const SAL = 'cifra:2026'; // texto extra misturado antes de calcular o hash
const HASH_DO_ACESSO = 'f71a180b18c2566e6e136dddf2e392d181dd89236110a9573567e8223bd9c20b';
const CHAVE_SESSAO = 'cifra:sessao';

// Calcula o SHA-256 de um texto e devolve em hexadecimal
async function sha256(texto) {
  const bytes = new TextEncoder().encode(texto);
  const resumo = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(resumo))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// true se usuário e senha estão certos. O usuário não diferencia maiúsculas e ignora espaços nas pontas.
export async function conferirAcesso(usuario, senha) {
  if (!window.crypto?.subtle) throw new Error('sem-crypto'); // só funciona em https ou localhost
  const hash = await sha256(`${SAL}|${usuario.trim().toLowerCase()}|${senha}`);
  return hash === HASH_DO_ACESSO;
}

export function estaLogado() {
  try {
    return localStorage.getItem(CHAVE_SESSAO) === 'ativa';
  } catch {
    return false;
  }
}

export function iniciarSessao() {
  try {
    localStorage.setItem(CHAVE_SESSAO, 'ativa');
  } catch {
    /* sem acesso ao armazenamento */
  }
}

export function encerrarSessao() {
  try {
    localStorage.removeItem(CHAVE_SESSAO);
  } catch {
    /* sem acesso ao armazenamento */
  }
}
