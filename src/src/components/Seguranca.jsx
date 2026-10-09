import { Link } from 'react-router-dom';
import {
  IconeCheck,
  IconeSeta,
  IconeMonitor,
  IconeCelular,
  IconePizza,
  IconeCadeado,
  IconeCartao,
  IconeSino,
} from './Icones.jsx';
import './Seguranca.css';

// Lista com ✓ (o último item fica em destaque)
const vantagens = [
  'Sem anúncios dentro do seu sistema. Livre de poluição visual',
  'Registre os seus gastos a qualquer momento e em qualquer lugar',
  'Gerencie os seus cartões em um só lugar',
  'Receba lembretes de contas a pagar e nunca mais pague juros por atraso',
];
const vantagemDestaque =
  'Segurança, planejamento e direção. Tudo o que você precisa em um só lugar';

// Dados de exemplo do painel
const abas = ['visão geral', 'lançamentos', 'relatórios', 'Calendário'];

const contas = [
  { nome: 'NuBank', valor: 'R$ 2.705,39', cor: '#fbebd2' },
  { nome: 'Inter', valor: 'R$ 300,01', cor: '#efebe4' },
  { nome: 'Santander', valor: 'R$ 1.200,50', cor: '#f6e3c6' },
];

const cartoes = [
  { nome: 'Cartão NuBank', fatura: 'R$ 1.215,60' },
  { nome: 'Cartão Inter', fatura: 'R$ 631,60' },
];

export default function Seguranca() {
  return (
    <section className="seg">
      <div className="container">
        <span className="seg__rotulo">Facilidade com o que importa</span>
        <h2 className="seg__titulo">Tenha a sua gestão financeira com tranquilidade</h2>

        <div className="seg__conteudo">
          {/* ===== Texto ===== */}
          <div className="seg__texto">

            <ul className="seg__lista">
              {vantagens.map((item) => (
                <li key={item} className="seg__item">
                  <span className="seg__check">
                    <IconeCheck tamanho={13} cor="#8c5a10" espessura={3} />
                  </span>
                  {item}
                </li>
              ))}
              <li className="seg__item seg__item--destaque">
                <span className="seg__check seg__check--destaque">
                  <IconeCheck tamanho={13} cor="#eaaf5a" espessura={3} />
                </span>
                {vantagemDestaque}
              </li>
            </ul>

            <Link to="/entrar" className="seg__botao">
              Se planeje agora, para o futuro
              <IconeSeta tamanho={22} cor="#141414" espessura={2.2} />
            </Link>

            <div className="seg__plataformas">
              <span className="seg__plataforma-icone">
                <IconeMonitor tamanho={22} cor="#141414" espessura={1.8} />
              </span>
              <strong className="seg__plataforma-texto">Disponível na Web e no App, acesse!</strong>
              <span className="seg__plataforma-icone">
                <IconeCelular tamanho={22} cor="#141414" espessura={1.8} />
              </span>
            </div>
          </div>

          {/* ===== Painel do CIFRA no computador ===== */}
          <div className="seg__visual">
            <span className="seg__selo seg__selo--grafico" aria-hidden="true">
              <IconePizza tamanho={28} cor="#141414" />
            </span>
            <span className="seg__selo seg__selo--cadeado" aria-hidden="true">
              <IconeCadeado tamanho={28} cor="#eaaf5a" />
            </span>
            <span className="seg__selo seg__selo--cartao" aria-hidden="true">
              <IconeCartao tamanho={56} cor="#8c5a10" espessura={1.8} />
            </span>

            <div className="painel-pc" role="img" aria-label="Exemplo do painel do CIFRA no computador">
              <div className="painel-pc__topo">
                <span className="painel-pc__marca">CIFRA</span>
                <span className="painel-pc__abas">
                  {abas.map((aba, i) => (
                    <span key={aba} className={i === 0 ? 'painel-pc__aba painel-pc__aba--ativa' : 'painel-pc__aba'}>
                      {aba}
                    </span>
                  ))}
                </span>
                <IconeSino tamanho={16} cor="#cfc6b6" />
              </div>

              <div className="painel-pc__corpo">
                <div className="painel-pc__card painel-pc__resumo">
                  <div>
                    <div className="painel-pc__legenda">Boa tarde,</div>
                    <div className="painel-pc__nome">Ryan</div>
                  </div>
                  <div className="painel-pc__totais">
                    <div>
                      <div className="painel-pc__legenda">Receita mensal</div>
                      <div className="painel-pc__valor painel-pc__valor--entrada">R$ 6.420,00</div>
                    </div>
                    <div>
                      <div className="painel-pc__legenda">Despesa mensal</div>
                      <div className="painel-pc__valor painel-pc__valor--saida">R$ 4.180,35</div>
                    </div>
                  </div>
                </div>

                <div className="painel-pc__grade">
                  <div className="painel-pc__card painel-pc__coluna">
                    <div className="painel-pc__total painel-pc__total--dourado">
                      <div className="painel-pc__legenda">Saldo geral</div>
                      <div className="painel-pc__total-valor">R$ 4.205,90</div>
                    </div>
                    <div className="painel-pc__subtitulo">Minhas contas</div>
                    {contas.map((conta) => (
                      <div key={conta.nome} className="painel-pc__conta">
                        <span className="painel-pc__bolinha" style={{ background: conta.cor }} />
                        <span className="painel-pc__conta-nome">{conta.nome}</span>
                        <span className="painel-pc__conta-valor">{conta.valor}</span>
                      </div>
                    ))}
                  </div>

                  <div className="painel-pc__card painel-pc__coluna">
                    <div className="painel-pc__total painel-pc__total--vermelho">
                      <div className="painel-pc__legenda">Faturas de outubro</div>
                      <div className="painel-pc__total-valor painel-pc__valor--saida">R$ 1.847,20</div>
                    </div>
                    <div className="painel-pc__subtitulo">Meus cartões</div>
                    {cartoes.map((cartao) => (
                      <div key={cartao.nome} className="painel-pc__cartao">
                        <div className="painel-pc__cartao-topo">
                          <span className="painel-pc__cartao-nome">{cartao.nome}</span>
                          <span className="painel-pc__ver">Ver fatura</span>
                        </div>
                        <div className="painel-pc__cartao-linha">
                          <span>Fatura atual</span>
                          <strong>{cartao.fatura}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
