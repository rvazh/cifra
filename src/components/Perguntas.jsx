import { useState } from 'react';
import { Link } from 'react-router-dom';
import { IconeMais } from './Icones.jsx';
import './Perguntas.css';

const perguntas = [
  {
    pergunta: 'O que é o CIFRA?',
    resposta:
      'O CIFRA é um app de gestão financeira pessoal. Com ele você registra receitas e despesas, acompanha o saldo das suas contas e cartões e entende para onde vai o seu dinheiro.',
  },
  {
    pergunta: 'Posso usar o CIFRA no celular e no computador?',
    resposta:
      'Sim. O CIFRA funciona direto no navegador, tanto no celular quanto no computador, sem precisar instalar nada. O app para celular está a caminho.',
  },
  {
    pergunta: 'Meus dados estão seguros?',
    resposta:
      'Seus dados ficam guardados no próprio aparelho que você usa. Por isso, recomendamos fazer backups de vez em quando para não perder o seu histórico.',
  },
  {
    pergunta: 'O CIFRA coleta dados financeiros para vender?',
    resposta:
      'Não. Suas informações financeiras são suas e não são vendidas nem compartilhadas com ninguém.',
  },
  {
    pergunta: 'Quanto custa o CIFRA?',
    resposta: 'Durante a versão de teste, o CIFRA é gratuito e todos os recursos ficam liberados.',
  },
  {
    pergunta: 'O CIFRA se conecta com o meu banco?',
    resposta:
      'Não. Você registra os seus lançamentos no app, sem precisar informar senhas ou dados de acesso do seu banco.',
  },
  {
    pergunta: 'Como entro em contato com a equipe do CIFRA?',
    resposta: 'Você pode falar com a gente pela página Quem somos. Respondemos o mais rápido possível.',
  },
];

export default function Perguntas() {
  // Guarda qual pergunta está aberta (null = todas fechadas)
  const [aberta, setAberta] = useState(null);

  function alternar(indice) {
    setAberta(aberta === indice ? null : indice);
  }

  return (
    <section className="faq">
      <div className="container faq__conteudo">
        <div className="faq__cabecalho">
          <span className="faq__rotulo">Dúvidas</span>
          <h2 className="faq__titulo">Perguntas frequentes</h2>
        </div>

        <div className="faq__lista">
          {perguntas.map((item, indice) => {
            const estaAberta = aberta === indice;
            return (
              <div key={item.pergunta} className={estaAberta ? 'faq-item faq-item--aberta' : 'faq-item'}>
                <button
                  type="button"
                  className="faq-item__pergunta"
                  aria-expanded={estaAberta}
                  aria-controls={`resposta-${indice}`}
                  onClick={() => alternar(indice)}
                >
                  {item.pergunta}
                  <span className="faq-item__icone">
                    <IconeMais tamanho={18} cor="currentColor" espessura={2.2} />
                  </span>
                </button>
                {estaAberta && (
                  <p id={`resposta-${indice}`} className="faq-item__resposta">
                    {item.resposta}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="faq__ajuda">
          <div className="faq__ajuda-textos">
            <h3 className="faq__ajuda-titulo">Ainda com dúvidas?</h3>
            <p className="faq__ajuda-texto">
              Se restou alguma dúvida, entre em contato pelos nossos canais de comunicação. A CIFRA
              vai te ajudar ao máximo com o seu planejamento!
            </p>
          </div>
          <Link to="/quem-somos" className="faq__ajuda-botao">
            Fale conosco
          </Link>
        </div>
      </div>
    </section>
  );
}
