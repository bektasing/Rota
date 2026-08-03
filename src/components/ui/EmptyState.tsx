import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { cx } from "@/utils/cx";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Kart yerine sade bir blok olarak göster (başka bir kartın içindeyken). */
  bare?: boolean;
  action?: ReactNode;
  className?: string;
}

/** Boş durumlar bilinçli olarak kompakt tutulur; ekranı doldurmazlar. */
export function EmptyState({ icon: Icon, title, description, bare, action, className }: EmptyStateProps) {
  const content = (
    <div className="flex flex-col items-center gap-2 py-2 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mx-auto max-w-sm text-[13px] leading-relaxed text-muted-foreground">{description}</p>
      {action && <div className="pt-1">{action}</div>}
    </div>
  );

  if (bare) {
    return <div className={cx("px-3 py-4", className)}>{content}</div>;
  }

  return (
    <Card variant="muted" padding="lg" className={cx("w-full max-w-2xl", className)}>
      {content}
    </Card>
  );
}
