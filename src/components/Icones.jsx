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

export const IconeCategorias = (p) => (
  <Svg {...p}>
    <rect x="4" y="4" width="6" height="6" rx="1.5" />
    <rect x="14" y="4" width="6" height="6" rx="1.5" />
    <rect x="4" y="14" width="6" height="6" rx="1.5" />
    <path d="M17 14v6" />
    <path d="M14 17h6" />
  </Svg>
);

export const IconeAlvo = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1" />
  </Svg>
);

export const IconeSino = (p) => (
  <Svg {...p}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </Svg>
);

export const IconeMoeda = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .9-3 2.1 0 2.8 6 1.3 6 4 0 1.2-1.3 2-3 2-1.4 0-2.5-.5-3-1.6" />
    <path d="M12 6.5V8" />
    <path d="M12 16v1.5" />
  </Svg>
);

export const IconeDispositivos = (p) => (
  <Svg {...p}>
    <rect x="2" y="4" width="14" height="10" rx="2" />
    <path d="M6 18h6" />
    <path d="M9 14v4" />
    <rect x="17" y="9" width="5" height="11" rx="1.5" />
  </Svg>
);

export const IconeTransferir = (p) => (
  <Svg {...p}>
    <path d="M7 7h11l-3-3" />
    <path d="M17 17H6l3 3" />
  </Svg>
);

export const IconeCheck = (p) => (
  <Svg {...p}>
    <path d="M20 6L9 17l-5-5" />
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
