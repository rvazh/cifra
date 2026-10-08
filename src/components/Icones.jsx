// Ícones em SVG (traço). Herdam a cor pelo "stroke" passado via props.
function Svg({ children, tamanho = 24, cor = 'currentColor', espessura = 2 }) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke={cor}
      strokeWidth={espessura}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const IconeSeta = (p) => (
  <Svg {...p}>
    <path d="M5 12h14" />
    <path d="M13 6l6 6-6 6" />
  </Svg>
);

export const IconeMais = (p) => (
  <Svg {...p}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </Svg>
);

export const IconeCarteira = (p) => (
  <Svg {...p}>
    <path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    <path d="M21 11h-5a2 2 0 0 0 0 4h5z" />
  </Svg>
);

export const IconeGrafico = (p) => (
  <Svg {...p}>
    <path d="M4 20V10" />
    <path d="M10 20V4" />
    <path d="M16 20v-7" />
    <path d="M22 20H2" />
  </Svg>
);

export const IconeBanco = (p) => (
  <Svg {...p}>
    <path d="M3 10l9-6 9 6" />
    <path d="M5 10v9h14v-9" />
    <path d="M10 19v-5h4v5" />
  </Svg>
);

export const IconeDinheiro = (p) => (
  <Svg {...p}>
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="2.5" />
  </Svg>
);
