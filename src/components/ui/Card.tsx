import type { HTMLAttributes } from "react";

import { cx } from "@/utils/cx";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, children, ...rest }: CardProps) {
  return (
    <div
      className={cx(
        "rounded-2xl border border-border bg-surface p-4 shadow-sm shadow-black/[0.03]",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
