type ProgressBarProps = {
  percent: number;
};

export function ProgressBar({ percent }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-2 w-full overflow-hidden rounded-full bg-card-active"
    >
      <div
        className="h-full rounded-full bg-accent transition-[width]"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
