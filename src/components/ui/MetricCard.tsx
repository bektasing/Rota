import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Card } from "@/components/ui/Card";
import { cx } from "@/utils/cx";

export type MetricTone = "primary" | "accent" | "success" | "warning" | "neutral";

const TONE_CLASS: Record<MetricTone, string> = {
  primary: "bg-primary-soft text-primary",
  accent: "bg-accent-soft text-accent",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  neutral: "bg-surface-muted text-muted-foreground",
};

interface MetricCardProps {
  label: string;
  value: ReactNode;
  unit?: string;
  hint?: string;
  icon: LucideIcon;
  tone?: MetricTone;
  footer?: ReactNode;
  className?: string;
}

/** Tek bir sayıyı öne çıkaran kompakt metrik kartı. */
export function MetricCard({
  label,
  value,
  unit,
  hint,
  icon: Icon,
  tone = "primary",
  footer,
  className,
}: MetricCardProps) {
  return (
    <Card variant="raised" className={cx("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-muted-foreground">{label}</span>
        <span className={cx("flex h-8 w-8 items-center justify-center rounded-xl", TONE_CLASS[tone])}>
          <Icon className="h-4 w-4" aria-hidden />
        </span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-bold tabular-nums leading-none text-foreground">{value}</span>
        {unit && <span className="text-sm font-medium text-muted-foreground">{unit}</span>}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {footer}
    </Card>
  );
}
