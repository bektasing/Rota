import type { ReactNode } from "react";

import { cx } from "@/utils/cx";

interface ProgressRingProps {
  /** 0–100 arası tamamlanma yüzdesi. */
  percent: number;
  size?: number;
  thickness?: number;
  children?: ReactNode;
  className?: string;
  /** İzin verilen tema sınıfı, örn. "text-primary-foreground". */
  trackClassName?: string;
  indicatorClassName?: string;
}

/**
 * Harici kütüphane olmadan, saf SVG dairesel ilerleme göstergesi.
 * Ortasına istenen içerik (dakika, yüzde) yerleştirilebilir.
 */
export function ProgressRing({
  percent,
  size = 112,
  thickness = 10,
  children,
  className,
  trackClassName = "text-border",
  indicatorClassName = "text-primary",
}: ProgressRingProps) {
  const safePercent = Math.max(0, Math.min(100, Number.isFinite(percent) ? percent : 0));
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - safePercent / 100);

  return (
    <div className={cx("relative inline-flex shrink-0 items-center justify-center", className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={thickness}
          className={trackClassName}
          stroke="currentColor"
          opacity={0.35}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className={cx(indicatorClassName, "transition-[stroke-dashoffset] duration-500 ease-out")}
          stroke="currentColor"
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
      )}
    </div>
  );
}
