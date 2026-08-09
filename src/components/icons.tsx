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
