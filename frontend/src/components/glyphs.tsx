/**
 * Mark do Aporte: bloco lima com a linha de alta em preto-oliva.
 * A seta sobe e termina em ponta — "aporte que cresce".
 */
export function AporteMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <rect width="32" height="32" rx="10" className="fill-lime" />
      <path
        d="M 7.5 21 L 13.5 14.5 L 17.5 18 L 24 10.5"
        fill="none"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-dark"
      />
      <path
        d="M 18.5 10.5 H 24 V 16"
        fill="none"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-dark"
      />
    </svg>
  );
}

/** Asterisco de 6 hastes — o glifo decorativo da identidade visual */
export function Asterisk({
  size = 22,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
    >
      <path
        d="M12 2 v20 M3.3 7 l17.4 10 M3.3 17 L20.7 7"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
