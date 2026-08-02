import { useEffect, useState } from "react";
import { CalendarClock, CheckCircle2, Circle, ClipboardList, Heart, Play, Plus } from "lucide-react";
import { Link } from "react-router-dom";

import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ROUTES } from "@/constants/routes";
import { useUserProfile } from "@/hooks/useUserProfile";
import type { StudySession } from "@/models/StudySession";
import type { StudyTask } from "@/models/StudyTask";
import { studySessionRepository } from "@/repositories/studySessionRepository";
import { studyTaskRepository } from "@/repositories/studyTaskRepository";
import { getDailyMessage } from "@/utils/dailyMessage";
import { cx } from "@/utils/cx";
import { daysUntilExam, formatFriendlyDate, getGreeting, toDateKey } from "@/utils/date";
import { sumSessionMinutes } from "@/utils/timer";

const VISIBLE_TASK_COUNT = 4;

export function DashboardPage() {
  const { profile, loading } = useUserProfile();
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [sessions, setSessions] = useState<StudySession[]>([]);

  async function reloadTasks() {
    const todaysTasks = await studyTaskRepository.getByDate(toDateKey(new Date()));
    setTasks(todaysTasks);
  }

  async function reloadSessions() {
    const todaysSessions = await studySessionRepository.getByDate(toDateKey(new Date()));
    setSessions(todaysSessions);
  }

  useEffect(() => {
    reloadTasks().finally(() => setTasksLoading(false));
    reloadSessions();
  }, []);

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
    return (
      <div className="p-4 text-sm text-muted-foreground md:p-6">Yükleniyor…</div>
    );
  }

  const today = new Date();
  const remainingDays = daysUntilExam(profile.examDate, today);
  const dailyTarget = profile.dailyStudyTargetMinutes;
  const studiedMinutesToday = sumSessionMinutes(sessions);
  const progressPercent = dailyTarget > 0 ? Math.min(100, Math.round((studiedMinutesToday / dailyTarget) * 100)) : 0;
  const completedCount = tasks.filter((t) => t.completed).length;
  const visibleTasks = tasks.slice(0, VISIBLE_TASK_COUNT);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4 md:p-6">
      <Card className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CalendarClock className="h-6 w-6" aria-hidden />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            {getGreeting(today)}, {profile.name}
          </h1>
          <p className="text-sm capitalize text-muted-foreground">{formatFriendlyDate(today)}</p>
        </div>
      </Card>

      {remainingDays !== null && (
        <Card className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">YKS'ye kalan gün</span>
          <span className="text-2xl font-bold text-primary">{remainingDays}</span>
        </Card>
      )}

      <Card className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Bugünkü hedefin</span>
          <span className="text-sm text-muted-foreground">
            {studiedMinutesToday} / {dailyTarget} dk
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Link
          to={ROUTES.planner}
          className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
        >
          <Plus className="h-4 w-4 text-primary" aria-hidden />
          Hızlı görev ekle
        </Link>
        <Link
          to={ROUTES.timer}
          className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Play className="h-4 w-4" aria-hidden />
          Çalışmaya başla
        </Link>
      </div>

      {tasksLoading ? (
        <p className="p-2 text-sm text-muted-foreground">Görevler yükleniyor…</p>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Bugün için henüz görev yok"
          description="Planlayıcıdan görev ekleyince bugünün listesi burada görünecek."
        />
      ) : (
        <Card className="flex flex-col gap-3 p-0">
          <div className="flex items-center justify-between px-4 pt-4">
            <h2 className="text-sm font-semibold text-foreground">
              Bugünün görevleri ({completedCount}/{tasks.length})
            </h2>
            <Link to={ROUTES.planner} className="text-xs font-medium text-primary">
              Tümünü gör
            </Link>
          </div>
          <div className="divide-y divide-border">
            {visibleTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 px-4 py-3">
                <button
                  type="button"
                  onClick={() => toggleComplete(task)}
                  className="shrink-0 text-primary"
                  aria-label={task.completed ? "Tamamlanmayı geri al" : "Görevi tamamla"}
                >
                  {task.completed ? (
                    <CheckCircle2 className="h-5 w-5" aria-hidden />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" aria-hidden />
                  )}
                </button>
                <span
                  className={cx(
                    "flex-1 text-sm text-foreground",
                    task.completed && "text-muted-foreground line-through",
                  )}
                >
                  {task.title}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent-foreground">
          <Heart className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Günün mesajı</h2>
          <p className="text-sm text-muted-foreground">{getDailyMessage(today)}</p>
        </div>
      </Card>
    </div>
  );
}
