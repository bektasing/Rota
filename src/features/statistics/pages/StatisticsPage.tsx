import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BookMarked,
  CheckCircle2,
  ClipboardList,
  FileText,
  HelpCircle,
  RefreshCw,
  Target,
  Timer as TimerIcon,
  TrendingUp,
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useSubjects } from "@/hooks/useSubjects";
import { examResultRepository } from "@/repositories/examResultRepository";
import { goalRepository } from "@/repositories/goalRepository";
import { mistakeRecordRepository } from "@/repositories/mistakeRecordRepository";
import { reviewItemRepository } from "@/repositories/reviewItemRepository";
import { studyResourceRepository } from "@/repositories/studyResourceRepository";
import { studySessionRepository } from "@/repositories/studySessionRepository";
import { studyTaskRepository } from "@/repositories/studyTaskRepository";
import {
  buildDailyBars,
  buildExamTrend,
  buildSubjectTotals,
  computeSummary,
  rangeStartKey,
  type StatsRange,
  type StatsSource,
} from "@/services/statisticsService";
import { formatNet } from "@/utils/exam";
import { toDateKey } from "@/utils/date";

const EMPTY_SOURCE: StatsSource = {
  sessions: [],
  tasks: [],
  exams: [],
  mistakes: [],
  reviews: [],
  goals: [],
  resources: [],
};

const RANGE_LABELS: Record<StatsRange, string> = {
  "7": "Son 7 gün",
  "30": "Son 30 gün",
  all: "Tümü",
};

/** Saat + dakika biçiminde okunur süre. */
function formatMinutes(totalMinutes: number): string {
  if (totalMinutes < 60) return `${totalMinutes} dk`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes === 0 ? `${hours} sa` : `${hours} sa ${minutes} dk`;
}

export function StatisticsPage() {
  const { subjects } = useSubjects();
  const [source, setSource] = useState<StatsSource>(EMPTY_SOURCE);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<StatsRange>("7");

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      studySessionRepository.getAll(),
      studyTaskRepository.getAll(),
      examResultRepository.getAll(),
      mistakeRecordRepository.getAll(),
      reviewItemRepository.getAll(),
      goalRepository.getAll(),
      studyResourceRepository.getAll(),
    ])
      .then(([sessions, tasks, exams, mistakes, reviews, goals, resources]) => {
        if (cancelled) return;
        setSource({ sessions, tasks, exams, mistakes, reviews, goals, resources });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const today = useMemo(() => new Date(), []);
  const summary = useMemo(() => computeSummary(source, range, today), [source, range, today]);
  const barDays = range === "7" ? 7 : 30;
  const dailyBars = useMemo(
    () => buildDailyBars(source.sessions, barDays, today),
    [source.sessions, barDays, today],
  );
  const subjectTotals = useMemo(
    () => buildSubjectTotals(source.sessions, subjects, range, today),
    [source.sessions, subjects, range, today],
  );
  const examTrend = useMemo(() => buildExamTrend(source.exams, range, today), [source.exams, range, today]);

  const maxBarMinutes = Math.max(...dailyBars.map((bar) => bar.minutes), 0);
  const maxSubjectMinutes = Math.max(...subjectTotals.map((entry) => entry.minutes), 0);
  const hasAnySession = source.sessions.length > 0;
  const todayKey = toDateKey(today);
  const startKey = rangeStartKey(range, today);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Yükleniyor…</p>;
  }

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <PageHeader
        title="İlerleme"
        description="Tüm sayılar kendi kayıtlarından hesaplanır."
      />

      <Card padding="sm">
        <SegmentedControl
          ariaLabel="Tarih aralığı"
          value={range}
          onChange={setRange}
          options={[
            { value: "7", label: "Son 7 gün" },
            { value: "30", label: "Son 30 gün" },
            { value: "all", label: "Tümü" },
          ]}
        />
      </Card>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        <MetricCard
          label="Toplam çalışma"
          value={formatMinutes(summary.totalMinutes)}
          icon={TimerIcon}
          tone="primary"
          hint={`Günlük ortalama ${summary.averageMinutesPerDay} dk`}
        />
        <MetricCard
          label="Çalışma oturumu"
          value={summary.sessionCount}
          icon={RefreshCw}
          tone="neutral"
        />
        <MetricCard
          label="Çözülen soru"
          value={summary.questionCount}
          icon={HelpCircle}
          tone="accent"
        />
        <MetricCard
          label="Tamamlanan görev"
          value={summary.completedTaskCount}
          icon={CheckCircle2}
          tone="success"
          hint={`Tamamlama oranı %${summary.taskCompletionRate}`}
        />
        <MetricCard label="Deneme" value={summary.examCount} icon={ClipboardList} tone="primary" />
        <MetricCard
          label="Son deneme neti"
          value={summary.lastExamNet != null ? formatNet(summary.lastExamNet) : "—"}
          icon={FileText}
          tone="success"
          hint={summary.lastExamTitle ?? "Bu aralıkta deneme yok"}
        />
        <MetricCard
          label="Açık yanlış"
          value={summary.openMistakeCount}
          icon={AlertTriangle}
          tone="warning"
        />
        <MetricCard
          label="Tamamlanan tekrar"
          value={summary.completedReviewCount}
          icon={RefreshCw}
          tone="success"
        />
        <MetricCard
          label="Aktif hedef"
          value={summary.activeGoalCount}
          icon={Target}
          tone="primary"
          hint={`${summary.completedGoalCount} hedef tamamlandı`}
        />
        <MetricCard
          label="Devam eden kaynak"
          value={summary.inProgressResourceCount}
          icon={BookMarked}
          tone="neutral"
        />
      </div>

      {/* Günlük çalışma süreleri — saf CSS sütunlar, harici grafik kütüphanesi yok. */}
      <Card variant="raised" className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-[15px] font-bold text-foreground">Günlük çalışma</h2>
          <span className="text-xs text-muted-foreground">Son {barDays} gün</span>
        </div>

        {!hasAnySession || maxBarMinutes === 0 ? (
          <EmptyState
            bare
            icon={TimerIcon}
            title="Henüz çalışma kaydın yok"
            description="Çalış ekranından bir oturum tamamladığında günlük süreler burada görünecek."
          />
        ) : (
          <>
            <div className="flex h-36 items-end gap-[3px]">
              {dailyBars.map((bar) => {
                const heightPercent = maxBarMinutes > 0 ? Math.round((bar.minutes / maxBarMinutes) * 100) : 0;
                return (
                  <div
                    key={bar.dateKey}
                    className="flex min-w-0 flex-1 flex-col justify-end"
                    title={`${bar.label}: ${bar.minutes} dk`}
                  >
                    <div
                      className={
                        bar.minutes > 0
                          ? "bg-brand-gradient w-full rounded-t-md"
                          : "w-full rounded-t-md bg-surface-muted"
                      }
                      style={{ height: `${bar.minutes > 0 ? Math.max(4, heightPercent) : 3}%` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{dailyBars[0]?.label}</span>
              <span>En yüksek {maxBarMinutes} dk</span>
              <span>{dailyBars[dailyBars.length - 1]?.label}</span>
            </div>
          </>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Deneme net trendi — saf SVG çizgi. */}
        <Card className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-[15px] font-bold text-foreground">Deneme netleri</h2>
            <span className="text-xs text-muted-foreground">{RANGE_LABELS[range]}</span>
          </div>

          {examTrend.length === 0 ? (
            <EmptyState
              bare
              icon={TrendingUp}
              title="Bu aralıkta deneme yok"
              description="Deneme eklediğinde net değişimin burada çizilecek."
            />
          ) : (
            <NetTrendChart points={examTrend.map((point) => point.net)} />
          )}

          {examTrend.length > 0 && (
            <ul className="flex flex-col gap-1.5">
              {examTrend.slice(-4).map((point) => (
                <li key={point.id} className="flex items-center justify-between gap-2 text-[13px]">
                  <span className="min-w-0 truncate text-muted-foreground">{point.title}</span>
                  <span className="shrink-0 font-bold tabular-nums text-foreground">{formatNet(point.net)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Derslere göre toplam süre — yatay ilerleme çubukları. */}
        <Card className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-[15px] font-bold text-foreground">Derslere göre çalışma</h2>
            <span className="text-xs text-muted-foreground">{RANGE_LABELS[range]}</span>
          </div>

          {subjectTotals.length === 0 ? (
            <EmptyState
              bare
              icon={ClipboardList}
              title="Derse bağlı çalışma kaydı yok"
              description="Oturum başlatırken ders seçersen dağılımı burada görebilirsin."
            />
          ) : (
            <ul className="flex flex-col gap-2.5">
              {subjectTotals.slice(0, 8).map((entry) => {
                const width = maxSubjectMinutes > 0 ? Math.round((entry.minutes / maxSubjectMinutes) * 100) : 0;
                return (
                  <li key={entry.subjectId} className="flex flex-col gap-1">
                    <div className="flex items-baseline justify-between gap-2 text-[13px]">
                      <span className="min-w-0 truncate font-medium text-foreground">{entry.name}</span>
                      <span className="shrink-0 font-semibold tabular-nums text-muted-foreground">
                        {formatMinutes(entry.minutes)}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${Math.max(4, width)}%`, backgroundColor: entry.color }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">
        {startKey
          ? `Hesaplama aralığı: ${startKey} – ${todayKey}`
          : `Hesaplama aralığı: tüm kayıtlar (bugün ${todayKey})`}
      </p>
    </div>
  );
}

/** Harici kütüphane olmadan, tek renkli basit net trendi. */
function NetTrendChart({ points }: { points: number[] }) {
  const width = 300;
  const height = 110;
  const padding = 10;
  const maxNet = Math.max(...points, 1);
  const minNet = Math.min(...points, 0);
  const span = maxNet - minNet || 1;

  const coords = points.map((net, index) => {
    const x =
      points.length === 1
        ? width / 2
        : padding + (index / (points.length - 1)) * (width - padding * 2);
    const y = height - padding - ((net - minNet) / span) * (height - padding * 2);
    return { x, y };
  });

  const path = coords.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-28 w-full"
      preserveAspectRatio="none"
      role="img"
      aria-label="Deneme net değişimi"
    >
      {coords.length > 1 && (
        <polyline
          points={path}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
          vectorEffect="non-scaling-stroke"
        />
      )}
      {coords.map((point, index) => (
        <circle key={index} cx={point.x} cy={point.y} r={3.5} className="fill-primary" />
      ))}
    </svg>
  );
}
