import Link from "next/link";

type GenerationBlockedNoticeProps = {
  message: string;
  variant: "limit" | "inactive";
  onDismiss?: () => void;
};

export function GenerationBlockedNotice({
  message,
  variant,
  onDismiss,
}: GenerationBlockedNoticeProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-card-border bg-card p-6 text-center shadow-sm">
      <p className="whitespace-pre-line text-base text-foreground">{message}</p>

      {variant === "inactive" ? (
        <Link
          href="/planos"
          className="mx-auto flex min-h-[48px] items-center justify-center rounded-2xl bg-primary px-6 font-semibold text-primary-foreground"
        >
          Ver planos
        </Link>
      ) : (
        <button
          type="button"
          onClick={onDismiss}
          className="mx-auto flex min-h-[48px] items-center justify-center rounded-2xl bg-primary px-6 font-semibold text-primary-foreground"
        >
          Entendi
        </button>
      )}
    </div>
  );
}
