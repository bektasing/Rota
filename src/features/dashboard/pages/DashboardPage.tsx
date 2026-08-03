import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Circle,
  ClipboardList,
  Flame,
  Plus,
  RefreshCw,
  Sparkles,
  Timer as TimerIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

import { buttonClass } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { MetricCard } from "@/components/ui/MetricCard";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { REVIEW_STAGE_LABELS } from "@/constants/review";
import { ROUTES } from "@/constants/routes";
import { useUserProfile } from "@/hooks/useUserProfile";
import type { ExamResult } from "@/models/ExamResult";
import type { ReviewItem } from "@/models/ReviewItem";
import type { StudySession } from "@/models/StudySession";
import type { StudyTask } from "@/models/StudyTask";
import { examResultRepository } from "@/repositories/examResultRepository";
import { reviewItemRepository } from "@/repositories/reviewItemRepository";
import { studySessionRepository } from "@/repositories/studySessionRepository";
import { studyTaskRepository } from "@/repositories/studyTaskRepository";
import { completeReviewItem } from "@/services/reviewService";
import { getDailyMessage } from "@/utils/dailyMessage";
import { cx } from "@/utils/cx";
import { daysUntilExam, formatFriendlyDate, getGreeting, toDateKey } from "@/utils/date";
import { formatNet } from "@/utils/exam";
import { sumSessionMinutes } from "@/utils/timer";

const VISIBLE_TASK_COUNT = 4;
const VISIBLE_REVIEW_COUNT = 3;
const EXAM_SUMMARY_DATE_FORMATTER = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long" });

export function DashboardPage() {
  const { profile, loading } = useUserProfile();
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [lastExam, setLastExam] = useState<ExamResult | null>(null);

  async function reloadTasks() {
    const todaysTasks = await studyTaskRepository.getByDate(toDateKey(new Date()));
    setTasks(todaysTasks);
  }

  async function reloadSessions() {
    const todaysSessions = await studySessionRepository.getByDate(toDateKey(new Date()));
    setSessions(todaysSessions);
  }

  async function reloadReviews() {
    const all = await reviewItemRepository.getAll();
    setReviews(all.filter((r) => r.status === "pending"));
  }

  async function reloadLastExam() {
    const all = await examResultRepository.getAll();
    const sorted = all.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
    setLastExam(sorted[0] ?? null);
  }

  useEffect(() => {
    reloadTasks().finally(() => setTasksLoading(false));
    reloadSessions();
    reloadReviews();
    reloadLastExam();
  }, []);

  async function completeReview(item: ReviewItem) {
    await completeReviewItem(item);
    await reloadReviews();
  }

  async function toggleComplete(task: StudyTask) {
    const now = new Date().toISOString();
    await studyTaskRepository.put({
      ...task,
      completed: !task.completed,
      completedAt: !task.completed ? now : null,
      updatedAt: now,
    });
    await reloadTasks();
  }

  if (loading || !profile) {
    return <p className="text-sm text-muted-foreground">Yükleniyor…</p>;
  }

  const today = new Date();
  const remainingDays = daysUntilExam(profile.examDate, today);
  const dailyTarget = profile.dailyStudyTargetMinutes;
  const studiedMinutesToday = sumSessionMinutes(sessions);
  const progressPercent = dailyTarget > 0 ? Math.min(100, Math.round((studiedMinutesToday / dailyTarget) * 100)) : 0;
  const completedCount = tasks.filter((t) => t.completed).length;
  const visibleTasks = tasks.slice(0, VISIBLE_TASK_COUNT);

  const todayKey = toDateKey(today);
  const todayReviews = reviews.filter((r) => r.scheduledDate === todayKey);
  const overdueReviews = reviews.filter((r) => r.scheduledDate < todayKey);
  const visibleReviews = [...todayReviews, ...overdueReviews].slice(0, VISIBLE_REVIEW_COUNT);

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      {/* Karşılama alanı — günün bağlamını tek bakışta veren geniş hero. */}
      <Card variant="brand" padding="lg" className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-primary-foreground/10 blur-2xl"
          aria-hidden
        />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-8">
          <div className="min-w-0">
            <p className="text-[13px] font-medium capitalize text-primary-foreground/75">
              {formatFriendlyDate(today)}
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-primary-foreground md:text-4xl">
              {getGreeting(today)}, {profile.name}
            </h1>
            <p className="mt-2 flex items-start gap-2 text-sm text-primary-foreground/85 md:max-w-xl">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>{getDailyMessage(today)}</span>
            </p>

            {remainingDays !== null && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3.5 py-1.5 text-sm font-semibold text-primary-foreground">
                <Flame className="h-4 w-4" aria-hidden />
                YKS'ye {remainingDays} gün kaldı
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 md:flex-col md:items-end md:gap-2">
            <ProgressRing
              percent={progressPercent}
              size={124}
              thickness={11}
              trackClassName="text-primary-foreground"
              indicatorClassName="text-primary-foreground"
            >
              <span className="text-3xl font-black leading-none tabular-nums text-primary-foreground">
                {studiedMinutesToday}
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-primary-foreground/75">
                / {dailyTarget} dk
              </span>
            </ProgressRing>
            <div className="md:text-right">
              <p className="text-sm font-semibold text-primary-foreground">Günlük hedefin</p>
              <p className="text-xs text-primary-foreground/75">%{progressPercent} tamamlandı</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Bento alanı — kartların ağırlığı içeriğin önemine göre değişir. */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card variant="raised" padding="none" className="flex flex-col md:col-span-2 xl:col-span-2">
          <div className="flex items-center justify-between gap-2 px-4 pt-4 md:px-5 md:pt-5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <ClipboardList className="h-4 w-4" aria-hidden />
              </span>
              <h2 className="text-[15px] font-bold text-foreground">Bugünün görevleri</h2>
              {tasks.length > 0 && (
                <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs font-bold tabular-nums text-muted-foreground">
                  {completedCount}/{tasks.length}
                </span>
              )}
            </div>
            <Link to={ROUTES.planner} className="text-[13px] font-semibold text-primary hover:underline">
              Tümünü gör
            </Link>
          </div>

          {tasksLoading ? (
            <p className="px-5 py-6 text-sm text-muted-foreground">Görevler yükleniyor…</p>
          ) : tasks.length === 0 ? (
            <EmptyState
              bare
              icon={ClipboardList}
              title="Bugün için henüz görev yok"
              description="Planlayıcıdan görev ekleyince bugünün listesi burada görünecek."
            />
          ) : (
            <ul className="mt-2 flex flex-col px-2 pb-2">
              {visibleTasks.map((task) => (
                <li key={task.id}>
                  <button
                    type="button"
                    onClick={() => toggleComplete(task)}
                    className="press flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-surface-muted"
                    aria-label={task.completed ? "Tamamlanmayı geri al" : "Görevi tamamla"}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-success" aria-hidden />
                    ) : (
                      <Circle className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
                    )}
                    <span
                      className={cx(
                        "min-w-0 flex-1 truncate text-sm font-medium",
                        task.completed ? "text-muted-foreground/70" : "text-foreground",
                      )}
                    >
                      {task.title}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <MetricCard
          label="Bugünkü çalışma"
          value={studiedMinutesToday}
          unit="dk"
          icon={TimerIcon}
          tone="accent"
          hint={`Günlük hedef ${dailyTarget} dk`}
          footer={
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-muted">
              <div
                className="bg-brand-gradient h-full rounded-full transition-[width] duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          }
        />

        <Card padding="none" className="flex flex-col">
          <div className="flex items-center justify-between gap-2 px-4 pt-4">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <RefreshCw className="h-4 w-4" aria-hidden />
              </span>
              <h2 className="text-[15px] font-bold text-foreground">Tekrarlar</h2>
            </div>
            <Link to={ROUTES.moreReviews} className="text-[13px] font-semibold text-primary hover:underline">
              Tümü
            </Link>
          </div>

          <div className="flex gap-2 px-4 pt-3">
            <div className="flex-1 rounded-xl bg-surface-muted px-3 py-2">
              <p className="text-lg font-bold tabular-nums text-foreground">{todayReviews.length}</p>
              <p className="text-[11px] font-medium text-muted-foreground">Bugün</p>
            </div>
            <div
              className={cx(
                "flex-1 rounded-xl px-3 py-2",
                overdueReviews.length > 0 ? "bg-warning-soft" : "bg-surface-muted",
              )}
            >
              <p
                className={cx(
                  "text-lg font-bold tabular-nums",
                  overdueReviews.length > 0 ? "text-warning" : "text-foreground",
                )}
              >
                {overdueReviews.length}
              </p>
              <p className="text-[11px] font-medium text-muted-foreground">Gecikmiş</p>
            </div>
          </div>

          {visibleReviews.length === 0 ? (
            <p className="px-4 py-4 text-[13px] text-muted-foreground">Bekleyen tekrarın yok.</p>
          ) : (
            <ul className="flex flex-col px-2 py-2">
              {visibleReviews.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => completeReview(item)}
                    className="press flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left hover:bg-surface-muted"
                    aria-label="Tekrarı tamamla"
                  >
                    <Circle className="h-[18px] w-[18px] shrink-0 text-muted-foreground" aria-hidden />
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground">
                      {item.title}
                    </span>
                    <span className="shrink-0 rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                      {REVIEW_STAGE_LABELS[item.stage]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[13px] font-medium text-muted-foreground">Son deneme</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-success-soft text-success">
              <ClipboardList className="h-4 w-4" aria-hidden />
            </span>
          </div>
          {lastExam ? (
            <>
              <div>
                <p className="truncate text-sm font-semibold text-foreground">{lastExam.title}</p>
                <p className="text-xs text-muted-foreground">
                  {EXAM_SUMMARY_DATE_FORMATTER.format(new Date(`${lastExam.date}T00:00:00`))}
                </p>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold tabular-nums leading-none text-foreground">
                  {formatNet(lastExam.totalNet)}
                </span>
                <span className="text-sm font-medium text-muted-foreground">net</span>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col justify-center">
              <p className="text-[13px] text-muted-foreground">
                Henüz deneme eklenmedi. İlk denemeni kaydettiğinde özeti burada göreceksin.
              </p>
              <Link
                to={ROUTES.moreExams}
                className="mt-2 text-[13px] font-semibold text-primary hover:underline"
              >
                Deneme ekle
              </Link>
            </div>
          )}
        </Card>

        <Card variant="muted" className="flex flex-col gap-2.5">
          <span className="text-[13px] font-medium text-muted-foreground">Hızlı başlangıç</span>
          <Link to={ROUTES.timer} className={buttonClass("primary", "lg", "w-full")}>
            <TimerIcon className="h-5 w-5" aria-hidden />
            Çalışmaya başla
          </Link>
          <Link to={ROUTES.planner} className={buttonClass("secondary", "lg", "w-full")}>
            <Plus className="h-5 w-5 text-primary" aria-hidden />
            Hızlı görev ekle
          </Link>
        </Card>
      </div>
    </div>
  );
}
