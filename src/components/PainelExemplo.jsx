import { IconeBanco, IconeCarteira, IconeDinheiro } from './Icones.jsx';
import './PainelExemplo.css';

// Dados de exemplo só para ilustrar o app na página inicial
const contas = [
  { nome: 'Conta corrente', valor: 'R$ 3.210,45', Icone: IconeBanco, fundo: '#fbebd2', cor: '#8c5a10' },
  { nome: 'Poupança', valor: 'R$ 8.640,00', Icone: IconeCarteira, fundo: '#efebe4', cor: '#141414' },
  { nome: 'Carteira', valor: 'R$ 500,45', Icone: IconeDinheiro, fundo: '#f6e3c6', cor: '#6b4410' },
];

const lancamentos = [
  { nome: 'Mercado', valor: '− R$ 312,80', tipo: 'saida' },
  { nome: 'Conta de luz', valor: '− R$ 189,40', tipo: 'saida' },
  { nome: 'Salário', valor: '+ R$ 5.200,00', tipo: 'entrada' },
];

export default function PainelExemplo() {
  return (
    <div className="painel" aria-label="Exemplo da tela do CIFRA" role="img">
      <div className="painel__enfeite" />

      <div className="painel__janela">
        <div className="painel__topo">
          <span className="painel__marca">cifra</span>
          <span className="painel__abas">
            <span className="painel__aba painel__aba--ativa">visão geral</span>
            <span className="painel__aba">lançamentos</span>
            <span className="painel__aba">relatórios</span>
          </span>
        </div>

        <div className="painel__corpo">
          <div className="painel__card painel__resumo">
            <div>
              <div className="painel__legenda">Boa tarde Helena!</div>
              <div className="painel__resumo-titulo">Resumo de outubro</div>
            </div>
            <div className="painel__totais">
              <div>
                <div className="painel__legenda painel__legenda--p">Receita do mês</div>
                <div className="painel__valor painel__valor--entrada">R$ 6.420,00</div>
              </div>
              <div>
                <div className="painel__legenda painel__legenda--p">Despesa do mês</div>
                <div className="painel__valor painel__valor--saida">R$ 4.180,35</div>
              </div>
            </div>
          </div>

          <div className="painel__card painel__contas">
            <div className="painel__saldo">
              <span className="painel__legenda">Saldo geral</span>
              <span className="painel__saldo-valor">R$ 12.350,90</span>
            </div>
            <div className="painel__divisor" />
            <div className="painel__subtitulo">Minhas contas</div>
            {contas.map(({ nome, valor, Icone, fundo, cor }) => (
              <div key={nome} className="conta">
                <span className="conta__icone" style={{ background: fundo }}>
                  <Icone tamanho={18} cor={cor} />
                </span>
                <span className="conta__nome">{nome}</span>
                <span className="conta__valor">{valor}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="painel__ultimos">
        <div className="painel__ultimos-titulo">Últimos lançamentos</div>
        {lancamentos.map(({ nome, valor, tipo }) => (
          <div key={nome} className="lancamento">
            <span className="lancamento__nome">{nome}</span>
            <span className={`lancamento__valor lancamento__valor--${tipo}`}>{valor}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
