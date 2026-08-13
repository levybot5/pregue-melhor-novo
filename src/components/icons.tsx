type IconProps = {
  className?: string;
};

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function MessageIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 5h16v11H8l-4 4V5Z" />
      <path d="M8 9h8M8 12h5" />
    </svg>
  );
}

export function ListIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <circle cx="4.5" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="18" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TransformIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 7h9m0 0-3-3m3 3-3 3" />
      <path d="M20 17h-9m0 0 3 3m-3-3 3-3" />
    </svg>
  );
}

export function OpenBookIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 6c-1.5-1.2-4-2-8-2v13c4 0 6.5.8 8 2 1.5-1.2 4-2 8-2V4c-4 0-6.5.8-8 2Z" />
      <path d="M12 6v13" />
    </svg>
  );
}

export function LibraryIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M5 4h4v16H5z" />
      <path d="M11 4h4v16h-4z" />
      <path d="m17.5 4.3 3 15.7-4 .7-3-15.7z" />
    </svg>
  );
}

export function StarIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.9L12 3.5Z" />
    </svg>
  );
}

export function ClipboardListIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="6" y="4" width="12" height="16" rx="2" />
      <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
      <path d="M9 10h6M9 14h6M9 18h3" />
    </svg>
  );
}

export function HeartIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 20s-7-4.35-9.5-8.5C1 8.5 2.5 5 6 5c2 0 3.5 1.2 4 2.5.5-1.3 2-2.5 4-2.5 3.5 0 5 3.5 3.5 6.5C19 15.65 12 20 12 20Z" />
    </svg>
  );
}

export function LifebuoyIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="m6.5 6.5 2.3 2.3M17.5 6.5l-2.3 2.3M6.5 17.5l2.3-2.3M17.5 17.5l-2.3-2.3" />
    </svg>
  );
}

export function ChevronLeftIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function PodiumIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6 21h12" />
      <path d="M8 21V9a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v12" />
      <path d="M9 8V4h6v4" />
      <path d="M10 12h4" />
    </svg>
  );
}

export function PdfIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M14 3v4h4" />
      <path d="M9 17v-4h1.5a1.5 1.5 0 0 1 0 3H9M13 17v-4h2M13 15h1.5M17 13v4" />
    </svg>
  );
}

export function CopyIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="9" y="9" width="11" height="11" rx="1.5" />
      <path d="M5 15V5a1 1 0 0 1 1-1h10" />
    </svg>
  );
}

// Use com "animate-spin" no elemento pai/próprio className para indicar
// carregamento — só o traço arqueado gira, sem preencher o círculo todo.
export function SpinnerIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M21 12a9 9 0 1 1-9-9" />
    </svg>
  );
}
