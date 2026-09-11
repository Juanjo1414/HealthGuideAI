/**
 * Iconos SVG inline — nada de emojis como icono de UI (ui-ux-pro-max:
 * "no-emoji-icons"). viewBox fijo 24x24 para tamaño consistente.
 */

const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function IconCheckCircle(props) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

export function IconInfo(props) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

export function IconAlertTriangle(props) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export function IconAlertCircle(props) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

export function IconStethoscope(props) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <path d="M4.8 2.3A.3.3 0 1 0 4.2 2.3.3.3 0 0 0 4.8 2.3Z" />
      <path d="M8 2v6a4 4 0 0 0 8 0V2" />
      <path d="M16 8a6 6 0 0 1-12 0" />
      <path d="M12 14v3a4 4 0 0 0 8 0v-1.34" />
      <circle cx="20" cy="15" r="2" />
    </svg>
  );
}

export function IconLoader(props) {
  return (
    <svg
      {...base}
      aria-hidden="true"
      {...props}
      style={{ animation: "spin 0.8s linear infinite", ...props.style }}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
