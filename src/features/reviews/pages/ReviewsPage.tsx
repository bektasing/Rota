import { useEffect, useState } from "react";
import { CalendarClock, CheckCircle2, Plus, RefreshCw, SkipForward } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { REVIEW_STAGE_LABELS } from "@/constants/review";
import { ROUTES } from "@/constants/routes";
import { ReviewFormPanel } from "@/features/reviews/components/ReviewFormPanel";
import { useSubjects } from "@/hooks/useSubjects";
import type { ReviewItem } from "@/models/ReviewItem";
import { reviewItemRepository } from "@/repositories/reviewItemRepository";
import { completeReviewItem, postponeReviewItem } from "@/services/reviewService";
import { cx } from "@/utils/cx";
import { toDateKey } from "@/utils/date";

const REVIEW_DATE_FORMATTER = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long" });

type SectionTone = "today" | "overdue" | "upcoming" | "done";

const SECTION_ACCENT: Record<SectionTone, string> = {
  today: "text-primary",
  overdue: "text-warning",
  upcoming: "text-foreground",
  done: "text-muted-foreground",
};

interface ReviewCardProps {
  item: ReviewItem;
  subjectName: string;
  showActions: boolean;
  muted?: boolean;
  onComplete: (item: ReviewItem) => void;
  onPostpone: (item: ReviewItem) => void;
}

function ReviewCard({ item, subjectName, showActions, muted, onComplete, onPostpone }: ReviewCardProps) {
  return (
    <Card className={cx("flex flex-col gap-3", muted && "bg-surface-subtle")}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={cx("truncate text-sm font-bold", muted ? "text-muted-foreground" : "text-foreground")}>
            {item.title}
          </p>
          <p className="text-xs text-muted-foreground">
            {subjectName} · {REVIEW_DATE_FORMATTER.format(new Date(`${item.scheduledDate}T00:00:00`))}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-bold text-primary">
          {REVIEW_STAGE_LABELS[item.stage]}
        </span>
      </div>

      {showActions ? (
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" className="flex-1" onClick={() => onPostpone(item)}>
            <SkipForward className="h-4 w-4" aria-hidden />1 gün ertele
          </Button>
          <Button size="sm" className="flex-1" onClick={() => onComplete(item)}>
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            Tamamla
          </Button>
        </div>
      ) : (
        item.mistakeId && (
          <Link to={ROUTES.moreMistakes} className="text-[13px] font-semibold text-primary hover:underline">
            Yanlışa git
          </Link>
        )
      )}
    </Card>
  );
}

export function ReviewsPage() {
  const { subjects } = useSubjects();
  const activeSubjects = subjects.filter((s) => s.active);
  const subjectsById = new Map(subjects.map((s) => [s.id, s]));

  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  async function reload() {
    const all = await reviewItemRepository.getAll();
    setItems(all);
  }

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  async function handleComplete(item: ReviewItem) {
    await completeReviewItem(item);
    await reload();
  }

  async function handlePostpone(item: ReviewItem) {
    await postponeReviewItem(item);
    await reload();
  }

  async function handleSave(item: ReviewItem) {
    await reviewItemRepository.add(item);
    setFormOpen(false);
    await reload();
  }

  const today = toDateKey(new Date());
  const pending = items.filter((i) => i.status === "pending");
  const todayItems = pending.filter((i) => i.scheduledDate === today);
  const overdueItems = pending
    .filter((i) => i.scheduledDate < today)
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
  const upcomingItems = pending
    .filter((i) => i.scheduledDate > today)
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
  const completedItems = items
    .filter((i) => i.status === "completed")
    .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""));

  const hasAnything = items.length > 0;

  function renderSection(
    title: string,
    tone: SectionTone,
    sectionItems: ReviewItem[],
    options: { showActions: boolean; muted?: boolean; emptyText?: string },
  ) {
    if (sectionItems.length === 0 && !options.emptyText) return null;

    return (
      <section className="flex flex-col gap-2.5">
        <h2 className={cx("flex items-center gap-1.5 text-sm font-bold", SECTION_ACCENT[tone])}>
          {tone === "today" && <CalendarClock className="h-4 w-4" aria-hidden />}
          {title} ({sectionItems.length})
        </h2>
        {sectionItems.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">{options.emptyText}</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {sectionItems.map((item) => (
              <ReviewCard
                key={item.id}
                item={item}
                subjectName={subjectsById.get(item.subjectId)?.name ?? "Ders silinmiş"}
                showActions={options.showActions}
                muted={options.muted}
                onComplete={handleComplete}
                onPostpone={handlePostpone}
              />
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <PageHeader
        title="Tekrarlar"
        description="1 · 3 · 7 · 14 · 30 günlük aralıklarla ilerleyen tekrar kuyruğun."
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden />
            Tekrar ekle
          </Button>
        }
      />

      {loading ? (
        <p className="text-sm text-muted-foreground">Yükleniyor…</p>
      ) : !hasAnything ? (
        <EmptyState
          icon={RefreshCw}
          title="Henüz tekrar yok"
          description="Bir yanlış eklediğinde ilk tekrar otomatik oluşacak; istersen manuel de ekleyebilirsin."
        />
      ) : (
        <div className="flex flex-col gap-6">
          {renderSection("Bugün", "today", todayItems, {
            showActions: true,
            emptyText: "Bugün için bekleyen tekrar yok.",
          })}
          {renderSection("Gecikmiş", "overdue", overdueItems, { showActions: true })}
          {renderSection("Yaklaşan", "upcoming", upcomingItems, { showActions: false })}
          {renderSection("Tamamlananlar", "done", completedItems, { showActions: false, muted: true })}
        </div>
      )}

      {formOpen && (
        <ReviewFormPanel subjects={activeSubjects} onClose={() => setFormOpen(false)} onSave={handleSave} />
      )}
    </div>
  );
}
