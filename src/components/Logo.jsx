import logoCifra from '../assets/cifra-logo.png';
import './Logo.css';

export default function Logo() {
  return (
    <span className="logo">
      {/* alt vazio: o nome "cifra" ao lado já identifica a marca */}
      <img className="logo__marca" src={logoCifra} alt="" />
      <span className="logo__nome">cifra</span>
    </span>
  );
}
