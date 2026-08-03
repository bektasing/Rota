import type { ButtonHTMLAttributes } from "react";

import { cx } from "@/utils/cx";

export type ButtonVariant = "primary" | "secondary" | "soft" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "bg-brand-gradient text-primary-foreground shadow-brand hover:brightness-105",
  secondary: "border border-border bg-surface text-foreground hover:border-border-strong hover:bg-surface-muted",
  soft: "bg-primary-soft text-primary hover:brightness-95 dark:hover:brightness-110",
  ghost: "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
  danger: "bg-danger text-danger-foreground hover:brightness-105",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "min-h-9 gap-1.5 rounded-full px-3.5 text-[13px]",
  md: "min-h-11 gap-2 rounded-full px-4 text-sm",
  lg: "min-h-13 gap-2 rounded-2xl px-5 text-base",
};

/** Buton görünümünü `Link` gibi buton olmayan öğelerde kullanmak için. */
export function buttonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
): string {
  return cx(
    "press inline-flex items-center justify-center font-semibold disabled:cursor-not-allowed disabled:opacity-50",
    VARIANT_CLASS[variant],
    SIZE_CLASS[size],
    className,
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button type={type} className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}
