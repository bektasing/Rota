import type { ReactNode } from "react";

import { cx } from "@/utils/cx";

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Sağda gösterilecek birincil aksiyon(lar). */
  actions?: ReactNode;
  className?: string;
}

/** Tüm ekranlarda tutarlı başlık alanı. */
export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cx("flex flex-wrap items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{title}</h1>
        {description && <p className="mt-1 max-w-prose text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
