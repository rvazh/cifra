import { useEffect, useState } from 'react';
import MenuLateral from '../components/MenuLateral.jsx';
import { IconeMais } from '../components/Icones.jsx';
import { reais } from '../components/Graficos.jsx';
import { novoId } from '../dados/lancamentos.js';
import {
  ICONES,
  carregarObjetivos,
  salvarObjetivos,
  prazoCurto,
  situacaoDoObjetivo,
} from '../dados/objetivos.js';
import './Painel.css';
import './Objetivos.css';

// "1.234,56" -> 1234.56
function lerNumero(texto) {
  const numero = parseFloat(String(texto).replace(/\s|R\$/gi, '').replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(numero) ? numero : null;
}

const numeroParaTexto = (n) => n.toFixed(2).replace('.', ',');

const PASSOS = [
  { titulo: 'Crie um objetivo', texto: 'Dê um nome, diga quanto quer juntar e até quando.' },
  { titulo: 'Guarde aos poucos', texto: 'Cada vez que separar dinheiro, toque em "Guardar".' },
  { titulo: 'Acompanhe', texto: 'A CIFRA mostra quanto falta e quanto guardar por mês.' },
];

// Frase que explica a situação de cada objetivo
function Explicacao({ objetivo }) {
  const s = situacaoDoObjetivo(objetivo);
  if (s.estado === 'alcancado') return <p className="obj-cartao__frase obj-cartao__frase--ok">Você chegou lá! 🎉</p>;
  if (s.estado === 'sem-prazo')
    return (
      <p className="obj-cartao__frase">
        Faltam <b>{reais(s.falta)}</b>. Escolha um prazo para saber quanto guardar por mês.
      </p>
    );
  if (s.estado === 'atrasado')
    return (
      <p className="obj-cartao__frase obj-cartao__frase--alerta">
        O prazo ({prazoCurto(objetivo.prazo)}) já passou e faltam <b>{reais(s.falta)}</b>. Que tal escolher uma nova data?
      </p>
    );
  return (
    <p className="obj-cartao__frase">
      Faltam {reais(s.falta)}. Guardando <b>{reais(s.porMes)} por mês</b>, você chega lá em {prazoCurto(objetivo.prazo)}.
    </p>
  );
}

export default function Objetivos() {
  const [objetivos, setObjetivos] = useState(carregarObjetivos);
  const [formulario, setFormulario] = useState(null); // objetivo sendo criado ou editado
  const [erro, setErro] = useState('');
  const [movimento, setMovimento] = useState(null); // { id, tipo: 'guardar' | 'retirar', texto }

  useEffect(() => salvarObjetivos(objetivos), [objetivos]);

  // Fecha o formulário com a tecla Esc
  useEffect(() => {
    if (!formulario) return undefined;
    const aoTeclar = (e) => e.key === 'Escape' && setFormulario(null);
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [formulario]);

  const totalGuardado = objetivos.reduce((s, o) => s + o.guardado, 0);
  const totalMeta = objetivos.reduce((s, o) => s + o.meta, 0);
  const porcentoTotal = totalMeta > 0 ? Math.min((totalGuardado / totalMeta) * 100, 100) : 0;

  // Muda um campo do formulário e apaga a mensagem de erro
  function atualizar(mudanca) {
    setFormulario({ ...formulario, ...mudanca });
    setErro('');
  }

  function abrirNovo() {
    setErro('');
    setFormulario({ nome: '', icone: ICONES[0], metaTexto: '', guardadoTexto: '0,00', prazo: '' });
  }

  function abrirEdicao(o) {
    setErro('');
    setFormulario({ ...o, metaTexto: numeroParaTexto(o.meta), guardadoTexto: numeroParaTexto(o.guardado) });
  }

  function salvarFormulario(evento) {
    evento.preventDefault();
    const nome = formulario.nome.trim();
    const meta = lerNumero(formulario.metaTexto);
    const guardado = lerNumero(formulario.guardadoTexto || '0');
    if (!nome) return setErro('Dê um nome para o objetivo.');
    if (!meta || meta <= 0) return setErro('Diga quanto você quer juntar, por exemplo 5.000,00.');
    if (guardado === null || guardado < 0) return setErro('O valor já guardado precisa ser um número, por exemplo 0,00.');

    const objetivo = { id: formulario.id || novoId(), nome, icone: formulario.icone, meta, guardado, prazo: formulario.prazo };
    setObjetivos((atual) =>
      formulario.id ? atual.map((o) => (o.id === objetivo.id ? objetivo : o)) : [...atual, objetivo]
    );
    setFormulario(null);
    return undefined;
  }

  function excluir() {
    if (!window.confirm(`Excluir o objetivo "${formulario.nome}"?`)) return;
    setObjetivos((atual) => atual.filter((o) => o.id !== formulario.id));
    setFormulario(null);
  }

  function confirmarMovimento(evento, o) {
    evento.preventDefault();
    const valor = lerNumero(movimento.texto);
    if (!valor || valor <= 0) return;
    const novoValor = movimento.tipo === 'guardar' ? o.guardado + valor : Math.max(o.guardado - valor, 0);
    setObjetivos((atual) => atual.map((item) => (item.id === o.id ? { ...item, guardado: novoValor, exemplo: false } : item)));
    setMovimento(null);
  }

  return (
    <div className="pp-app">
      <MenuLateral />

      <main className="pp obj">
        <div className="pp__topo">
          <div>
            <h1 className="pp__titulo">Objetivos</h1>
            <p className="pp__subtitulo">Separe dinheiro para o que importa e veja quanto falta para chegar lá</p>
          </div>
          <div className="pp__acoes">
            <button type="button" className="pp__novo obj__novo" onClick={abrirNovo}>
              <IconeMais tamanho={18} espessura={2.6} />
              Novo objetivo
            </button>
          </div>
        </div>

        {/* ===== Como funciona ===== */}
        <ol className="obj-passos">
          {PASSOS.map((p, i) => (
            <li key={p.titulo} className="obj-passo">
              <span className="obj-passo__numero">{i + 1}</span>
              <div>
                <b>{p.titulo}</b>
                <span>{p.texto}</span>
              </div>
            </li>
          ))}
        </ol>

        {objetivos.length > 0 && (
          <>
            {/* ===== Total ===== */}
            <section className="obj-total">
              <div className="obj-total__texto">
                <span>Guardado nos seus objetivos</span>
                <b>
                  {reais(totalGuardado)} <small>de {reais(totalMeta)}</small>
                </b>
              </div>
              <div className="obj-total__barra" aria-hidden="true">
                <span style={{ width: `${porcentoTotal}%` }} />
              </div>
              <span className="obj-total__porcento">{Math.round(porcentoTotal)}%</span>
            </section>

          </>
        )}

        {/* ===== Objetivos ===== */}
        {objetivos.length === 0 ? (
          <section className="obj-vazio">
            <span className="obj-vazio__icone">🌱</span>
            <h2>Qual é o seu próximo sonho?</h2>
            <p>Uma viagem, uma reserva para emergências, um curso... Crie um objetivo e acompanhe cada passo.</p>
            <button type="button" className="obj-vazio__botao" onClick={abrirNovo}>
              Criar meu primeiro objetivo
            </button>
          </section>
        ) : (
          <div className="obj__grade">
            {objetivos.map((o) => {
              const s = situacaoDoObjetivo(o);
              const aberto = movimento && movimento.id === o.id;
              return (
                <article key={o.id} className={s.estado === 'alcancado' ? 'obj-cartao obj-cartao--ok' : 'obj-cartao'}>
                  <div className="obj-cartao__topo">
                    <span className="obj-cartao__icone" aria-hidden="true">
                      {o.icone}
                    </span>
                    <div className="obj-cartao__titulos">
                      <h2>{o.nome}</h2>
                      <span>{o.prazo ? `até ${prazoCurto(o.prazo)}` : 'sem prazo'}</span>
                    </div>
                    <button type="button" className="obj-cartao__editar" onClick={() => abrirEdicao(o)}>
                      Editar
                    </button>
                  </div>

                  <div className="obj-cartao__valores">
                    <b>{reais(o.guardado)}</b>
                    <span>de {reais(o.meta)}</span>
                  </div>

                  <div className="obj-cartao__progresso">
                    <div
                      className="obj-cartao__trilho"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(s.porcento)}
                      aria-label={`${o.nome}: ${Math.round(s.porcento)}% guardado`}
                    >
                      <span style={{ width: `${s.porcento}%` }} />
                    </div>
                    <b>{Math.round(s.porcento)}%</b>
                  </div>

                  <Explicacao objetivo={o} />

                  {aberto ? (
                    <form className="obj-movimento" onSubmit={(e) => confirmarMovimento(e, o)}>
                      <label htmlFor={`valor-${o.id}`}>
                        {movimento.tipo === 'guardar' ? 'Quanto você guardou?' : 'Quanto você vai retirar?'}
                      </label>
                      <div className="obj-movimento__linha">
                        <input
                          id={`valor-${o.id}`}
                          autoFocus
                          inputMode="decimal"
                          placeholder="R$ 0,00"
                          value={movimento.texto}
                          onChange={(e) => setMovimento({ ...movimento, texto: e.target.value })}
                        />
                        <button type="submit" className="obj-botao obj-botao--principal">
                          Confirmar
                        </button>
                        <button type="button" className="obj-botao" onClick={() => setMovimento(null)}>
                          Cancelar
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="obj-cartao__acoes">
                      <button
                        type="button"
                        className="obj-botao obj-botao--principal"
                        onClick={() => setMovimento({ id: o.id, tipo: 'guardar', texto: '' })}
                      >
                        Guardar
                      </button>
                      <button
                        type="button"
                        className="obj-botao"
                        disabled={o.guardado <= 0}
                        onClick={() => setMovimento({ id: o.id, tipo: 'retirar', texto: '' })}
                      >
                        Retirar
                      </button>
                    </div>
                  )}
                </article>
              );
            })}

            <button type="button" className="obj-adicionar" onClick={abrirNovo}>
              <IconeMais tamanho={22} espessura={2.4} />
              Novo objetivo
            </button>
          </div>
        )}

        <p className="obj__nota">
          Os valores dos objetivos são um controle seu: eles não mudam o saldo das suas contas. Assim você separa o dinheiro
          para cada sonho sem precisar abrir outra conta.
        </p>

        {/* ===== Formulário (novo / editar) ===== */}
        {formulario && (
          <div className="obj-fundo" onClick={() => setFormulario(null)}>
            <form
              className="obj-form"
              role="dialog"
              aria-modal="true"
              aria-labelledby="obj-form-titulo"
              onSubmit={salvarFormulario}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="obj-form__topo">
                <h2 id="obj-form-titulo">{formulario.id ? 'Editar objetivo' : 'Novo objetivo'}</h2>
                <button type="button" className="obj-form__fechar" onClick={() => setFormulario(null)} aria-label="Fechar">
                  ×
                </button>
              </div>

              <fieldset className="obj-form__icones">
                <legend>Ícone</legend>
                {ICONES.map((icone) => (
                  <label key={icone} className="obj-form__icone">
                    <input
                      type="radio"
                      name="icone"
                      checked={formulario.icone === icone}
                      onChange={() => atualizar({ icone })}
                    />
                    <span aria-hidden="true">{icone}</span>
                  </label>
                ))}
              </fieldset>

              <label className="obj-form__campo">
                Nome do objetivo
                <input
                  autoFocus
                  placeholder="Ex.: Viagem de férias"
                  value={formulario.nome}
                  onChange={(e) => atualizar({ nome: e.target.value })}
                />
              </label>

              <div className="obj-form__dupla">
                <label className="obj-form__campo">
                  Quanto quer juntar (R$)
                  <input
                    inputMode="decimal"
                    placeholder="5.000,00"
                    value={formulario.metaTexto}
                    onChange={(e) => atualizar({ metaTexto: e.target.value })}
                  />
                </label>
                <label className="obj-form__campo">
                  Já guardado (R$)
                  <input
                    inputMode="decimal"
                    value={formulario.guardadoTexto}
                    onChange={(e) => atualizar({ guardadoTexto: e.target.value })}
                  />
                </label>
              </div>

              <label className="obj-form__campo">
                Até quando? (opcional)
                <input type="month" value={formulario.prazo} onChange={(e) => atualizar({ prazo: e.target.value })} />
              </label>

              {erro && <p className="obj-form__erro">{erro}</p>}

              <div className="obj-form__acoes">
                <button type="submit" className="obj-botao obj-botao--principal">
                  Salvar
                </button>
                <button type="button" className="obj-botao" onClick={() => setFormulario(null)}>
                  Cancelar
                </button>
              </div>
              {formulario.id && (
                <button type="button" className="obj-form__excluir" onClick={excluir}>
                  Excluir objetivo
                </button>
              )}
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
