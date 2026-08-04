import { Heart, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
  DEPARTMENT_CATEGORY_LABELS,
  DEPARTMENT_TAG_LABELS,
  type Department,
} from "@/constants/departments";
import { cx } from "@/utils/cx";

interface DepartmentDetailPanelProps {
  department: Department;
  favorite: boolean;
  onToggleFavorite: () => void;
  onClose: () => void;
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      <h3 className="text-[13px] font-semibold text-foreground">{title}</h3>
      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-[13px] leading-relaxed text-muted-foreground">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50" aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Salt okunur bölüm detayı; uygulama bölüm kararı vermez, yalnızca bilgi sunar. */
export function DepartmentDetailPanel({
  department,
  favorite,
  onToggleFavorite,
  onClose,
}: DepartmentDetailPanelProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 backdrop-blur-[2px] md:items-center md:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={department.name}
    >
      <div className="animate-rise flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-panel border border-border bg-surface shadow-lifted md:rounded-panel">
        <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3.5 md:px-6">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-foreground">{department.name}</h2>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              {DEPARTMENT_CATEGORY_LABELS[department.category]} · {department.durationYears} yıl
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="press flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-muted hover:text-foreground"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 md:px-6">
          <p className="text-[13px] leading-relaxed text-muted-foreground">{department.description}</p>

          <Section title="Öne çıkan dersler ve ilgi alanları" items={department.interests} />
          <Section title="Olası çalışma alanları" items={department.workAreas} />
          <Section title="Kimlere uygun olabilir?" items={department.suitableFor} />

          <div className="flex flex-wrap gap-1.5">
            {department.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-surface-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground"
              >
                {DEPARTMENT_TAG_LABELS[tag] ?? tag}
              </span>
            ))}
          </div>

          <p className="rounded-xl border border-border bg-surface-subtle px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
            Bu bilgiler genel tanıtım amaçlıdır. Taban puan, sıralama ve kontenjan gibi her yıl değişen veriler
            bilinçli olarak gösterilmez; güncel bilgi için ÖSYM ve üniversite kaynaklarına bakabilirsin.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-surface-subtle px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-6">
          <Button variant={favorite ? "soft" : "secondary"} onClick={onToggleFavorite}>
            <Heart className={cx("h-4 w-4", favorite && "fill-current")} aria-hidden />
            {favorite ? "Favorilerden çıkar" : "Favorilere ekle"}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Kapat
          </Button>
        </div>
      </div>
    </div>
  );
}
