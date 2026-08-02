import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { cx } from "@/utils/cx";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, className }: EmptyStateProps) {
  return (
    <Card className={cx("flex flex-col items-center gap-3 py-10 text-center", className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-6 w-6" aria-hidden />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="mx-auto max-w-xs text-sm text-muted-foreground">{description}</p>
      </div>
    </Card>
  );
}
