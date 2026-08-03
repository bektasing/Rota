import { cx } from "@/utils/cx";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  /** İsteğe bağlı küçük sayaç rozeti. */
  badge?: number;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
  className?: string;
}

/** Sekme benzeri filtre/görünüm seçici. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cx(
        // Seçenekler sığmazsa sayfayı yatay kaydırmak yerine kontrolün kendi içinde kayar.
        "inline-flex w-full max-w-md items-center gap-1 overflow-x-auto rounded-full border border-border bg-surface-muted p-1",
        "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cx(
              "press flex min-h-9 flex-1 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 text-[13px] font-semibold",
              active
                ? "bg-surface text-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
            {option.badge != null && option.badge > 0 && (
              <span
                className={cx(
                  "rounded-full px-1.5 text-[11px] font-bold tabular-nums",
                  active ? "bg-primary-soft text-primary" : "bg-surface text-muted-foreground",
                )}
              >
                {option.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
