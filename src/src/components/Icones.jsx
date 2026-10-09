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

export const IconeCoracao = (p) => (
  <Svg {...p}>
    <path d="M19.5 12.6L12 20l-7.5-7.4A4.8 4.8 0 0 1 12 6.3a4.8 4.8 0 0 1 7.5 6.3z" />
  </Svg>
);

export const IconeBandeira = (p) => (
  <Svg {...p}>
    <path d="M5 21V4" />
    <path d="M5 4h11l-2 4 2 4H5" />
  </Svg>
);

export const IconeRepetir = (p) => (
  <Svg {...p}>
    <path d="M17 2l3 3-3 3" />
    <path d="M4 11V9a4 4 0 0 1 4-4h12" />
    <path d="M7 22l-3-3 3-3" />
    <path d="M20 13v2a4 4 0 0 1-4 4H4" />
  </Svg>
);

export const IconeCartao = (p) => (
  <Svg {...p}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
    <path d="M6 15h4" />
  </Svg>
);

export const IconeCalendario = (p) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18" />
    <path d="M8 3v4" />
    <path d="M16 3v4" />
  </Svg>
);

export const IconeBackup = (p) => (
  <Svg {...p}>
    <path d="M12 3v12" />
    <path d="M7 10l5 5 5-5" />
    <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
  </Svg>
);

export const IconeCadeado = (p) => (
  <Svg {...p}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </Svg>
);

export const IconeSorriso = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 14a4 4 0 0 0 7 0" />
    <path d="M9 9.5h.01" />
    <path d="M15 9.5h.01" />
  </Svg>
);

export const IconeMonitor = (p) => (
  <Svg {...p}>
    <rect x="2" y="4" width="20" height="13" rx="2" />
    <path d="M8 21h8" />
    <path d="M12 17v4" />
  </Svg>
);

export const IconeCelular = (p) => (
  <Svg {...p}>
    <rect x="6" y="2" width="12" height="20" rx="2.5" />
    <path d="M11 18h2" />
  </Svg>
);

export const IconePizza = (p) => (
  <Svg {...p}>
    <path d="M21 12a9 9 0 1 1-9-9v9z" />
    <path d="M14 3.2A9 9 0 0 1 20.8 10H14z" />
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
