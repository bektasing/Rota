import type { ButtonHTMLAttributes } from "react";

import { cx } from "@/utils/cx";

interface QuickChoiceChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

/** Hızlı Planla gibi dokunmatik-öncelikli seçim akışlarında kullanılan tek tip seçim çipi. */
export function QuickChoiceChip({ active = false, className, children, ...rest }: QuickChoiceChipProps) {
  return (
    <button
      type="button"
      className={cx(
        "press min-h-10 rounded-full border px-3.5 text-[13px] font-semibold",
        active
          ? "border-primary bg-primary-soft text-primary"
          : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
