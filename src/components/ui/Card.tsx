import type { HTMLAttributes } from "react";

import { cx } from "@/utils/cx";

/**
 * Kart hiyerarşisi:
 * - `plain`   : varsayılan yüzey, ince sınır (liste ve içerik kartları)
 * - `raised`  : biraz daha belirgin gölge (önemli metrikler)
 * - `muted`   : arka planla kaynaşan sakin yüzey (ikincil bilgi)
 * - `brand`   : gradyanlı vurgu yüzeyi (yalnızca hero gibi tek noktalar)
 */
export type CardVariant = "plain" | "raised" | "muted" | "brand";
export type CardPadding = "none" | "sm" | "md" | "lg";

const VARIANT_CLASS: Record<CardVariant, string> = {
  plain: "border border-border bg-surface shadow-soft",
  raised: "border border-border bg-surface-raised shadow-card",
  muted: "border border-border/70 bg-surface-subtle",
  brand: "border border-transparent bg-brand-gradient text-primary-foreground shadow-brand",
};

const PADDING_CLASS: Record<CardPadding, string> = {
  none: "",
  sm: "p-3.5",
  md: "p-4 md:p-5",
  lg: "p-5 md:p-6",
};

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  /** Kart tıklanabilirse hafif hover/press geri bildirimi ekler. */
  interactive?: boolean;
}

export function Card({
  className,
  children,
  variant = "plain",
  padding = "md",
  interactive = false,
  ...rest
}: CardProps) {
  return (
    <div
      className={cx(
        "rounded-card",
        VARIANT_CLASS[variant],
        PADDING_CLASS[padding],
        interactive && "press cursor-pointer hover:border-border-strong hover:shadow-card",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
