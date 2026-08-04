import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Copy,
  MoreVertical,
  Pencil,
  Sparkles,
  SkipForward,
  Trash2,
  Zap,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { QuickChoiceChip } from "@/components/ui/QuickChoiceChip";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { QUICK_TEMPLATES, type QuickTemplate } from "@/constants/quickPlan";
import { TASK_PRIORITY_LABELS, TASK_TYPE_LABELS, priorityWeight } from "@/constants/taskTypes";
import { QuickPlanPanel } from "@/features/planner/components/QuickPlanPanel";
import { TaskFormPanel } from "@/features/planner/components/TaskFormPanel";
import type { Subject } from "@/models/Subject";
import type { StudyTask, TaskPriority } from "@/models/StudyTask";
import { studyTaskRepository } from "@/repositories/studyTaskRepository";
import { ensureDefaultSubjectsSeeded } from "@/services/bootstrapService";
import { cx } from "@/utils/cx";
import { addDays, formatFriendlyDate, formatShortDayLabel, fromDateKey, startOfWeek, toDateKey } from "@/utils/date";
import { generateId } from "@/utils/id";
import { parseQuickPlanDeepLink, type QuickPlanDeepLink } from "@/utils/quickPlan";

type ViewMode = "day" | "week";

const PRIORITY_CLASS: Record<TaskPriority, string> = {
  high: "bg-danger-soft text-danger",
  medium: "bg-primary-soft text-primary",
  low: "bg-surface-muted text-muted-foreground",
};

function sortTasks(tasks: StudyTask[]): StudyTask[] {
  return [...tasks].sort((a, b) => {
    if (a.startTime && b.startTime) {
      if (a.startTime !== b.startTime) return a.startTime.localeCompare(b.startTime);
    } else if (a.startTime && !b.startTime) {
      return -1;
    } else if (!a.startTime && b.startTime) {
      return 1;
    }

    const priorityDiff = priorityWeight(a.priority) - priorityWeight(b.priority);
    if (priorityDiff !== 0) return priorityDiff;

    return a.createdAt.localeCompare(b.createdAt);
  });
}

export function PlannerPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [view, setView] = useState<ViewMode>("day");
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [dayTasks, setDayTasks] = useState<StudyTask[]>([]);
  const [weekTasks, setWeekTasks] = useState<Record<string, StudyTask[]>>({});
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<StudyTask | null>(null);
  const [quickPlanOpen, setQuickPlanOpen] = useState(false);
  const [quickPlanDeepLink, setQuickPlanDeepLink] = useState<QuickPlanDeepLink | null>(null);
  const [quickPlanTemplate, setQuickPlanTemplate] = useState<QuickTemplate | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const successTimeoutRef = useRef<number | null>(null);

  const subjectsById = new Map(subjects.map((s) => [s.id, s]));
  const deepLinkHandledRef = useRef(false);

  useEffect(() => {
    ensureDefaultSubjectsSeeded().then(setSubjects);
  }, []);

  // Konu kartındaki "Planla" aksiyonundan gelen tek seferlik derin bağlantı: paneli
  // otomatik açar ve sorgu parametrelerini temizler ki yenilemede tekrar açılmasın.
  // Dersler henüz yüklenmeden panel açılırsa ders/konu ön-seçimi kaybolacağı için,
  // dersler state'e ulaşana kadar bekler.
  useEffect(() => {
    if (deepLinkHandledRef.current || subjects.length === 0) return;
    deepLinkHandledRef.current = true;

    const deepLink = parseQuickPlanDeepLink(searchParams);
    if (deepLink) {
      setQuickPlanTemplate(null);
      setQuickPlanDeepLink(deepLink);
      setQuickPlanOpen(true);
      setSearchParams(new URLSearchParams(), { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjects]);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) window.clearTimeout(successTimeoutRef.current);
    };
  }, []);

  async function reloadDay() {
    const tasks = await studyTaskRepository.getByDate(toDateKey(selectedDate));
    setDayTasks(sortTasks(tasks));
  }

  async function reloadWeek() {
    const start = startOfWeek(selectedDate);
    const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
    const entries = await Promise.all(
      days.map(async (day) => {
        const key = toDateKey(day);
        const tasks = await studyTaskRepository.getByDate(key);
        return [key, sortTasks(tasks)] as const;
      }),
    );
    setWeekTasks(Object.fromEntries(entries));
  }

  useEffect(() => {
    setLoading(true);
    Promise.all([reloadDay(), reloadWeek()]).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  async function reloadAll() {
    await Promise.all([reloadDay(), reloadWeek()]);
  }

  function flashSuccess(message: string) {
    setSuccessMessage(message);
    if (successTimeoutRef.current) window.clearTimeout(successTimeoutRef.current);
    successTimeoutRef.current = window.setTimeout(() => setSuccessMessage(null), 3200);
  }

  async function toggleComplete(task: StudyTask) {
    const now = new Date().toISOString();
    await studyTaskRepository.put({
      ...task,
      completed: !task.completed,
      completedAt: !task.completed ? now : null,
      updatedAt: now,
    });
    await reloadAll();
  }

  async function postponeToTomorrow(task: StudyTask) {
    const nextDate = toDateKey(addDays(fromDateKey(task.date), 1));
    await studyTaskRepository.put({ ...task, date: nextDate, updatedAt: new Date().toISOString() });
    setOpenMenuId(null);
    await reloadAll();
  }

  async function duplicateTask(task: StudyTask) {
    const now = new Date().toISOString();
    await studyTaskRepository.add({
      ...task,
      id: generateId(),
      completed: false,
      completedAt: null,
      actualMinutes: null,
      actualQuestions: null,
      createdAt: now,
      updatedAt: now,
    });
    setOpenMenuId(null);
    await reloadAll();
  }

  async function deleteTask(task: StudyTask) {
    setOpenMenuId(null);
    if (!window.confirm(`"${task.title}" görevini silmek istediğine emin misin?`)) return;
    await studyTaskRepository.remove(task.id);
    await reloadAll();
  }

  function openEdit(task: StudyTask) {
    setEditingTask(task);
    setFormOpen(true);
    setOpenMenuId(null);
  }

  function openDetailedCreate() {
    setEditingTask(null);
    setFormOpen(true);
  }

  function openQuickPlan(template: QuickTemplate | null = null) {
    setQuickPlanDeepLink(null);
    setQuickPlanTemplate(template);
    setQuickPlanOpen(true);
  }

  async function handleSave(task: StudyTask) {
    if (editingTask) {
      await studyTaskRepository.put(task);
    } else {
      await studyTaskRepository.add(task);
    }
    setFormOpen(false);
    setEditingTask(null);
    await reloadAll();
  }

  async function handleQuickSave(task: StudyTask) {
    await studyTaskRepository.add(task);
    setQuickPlanOpen(false);
    setQuickPlanDeepLink(null);
    setQuickPlanTemplate(null);
    await reloadAll();
    flashSuccess("Harika, bugünkü planına bir çalışma daha eklendi.");
  }

  const isToday = toDateKey(selectedDate) === toDateKey(new Date());
  const completedToday = dayTasks.filter((t) => t.completed).length;
  const plannedMinutesToday = dayTasks.reduce((sum, t) => sum + (t.estimatedMinutes ?? 0), 0);
  const plannedQuestionsToday = dayTasks.reduce((sum, t) => sum + (t.questionTarget ?? 0), 0);

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <PageHeader
        title="Planlayıcı"
        description="Gününü küçük, uygulanabilir görevlere böl."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={openDetailedCreate}>
              <Pencil className="h-4 w-4" aria-hidden />
              Ayrıntılı
            </Button>
            <Button onClick={() => openQuickPlan()}>
              <Zap className="h-4 w-4" aria-hidden />
              Hızlı Planla
            </Button>
          </div>
        }
      />

      {successMessage && (
        <Card variant="brand" padding="sm" className="animate-rise flex items-center gap-2.5">
          <Sparkles className="h-4 w-4 shrink-0 text-primary-foreground" aria-hidden />
          <p className="text-[13px] font-semibold text-primary-foreground">{successMessage}</p>
        </Card>
      )}

      <Card padding="sm" className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[13px] font-semibold text-foreground">Hızlı şablonlar</p>
          <p className="text-xs text-muted-foreground">Küçük adımlar da ilerlemedir.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_TEMPLATES.map((template) => (
            <QuickChoiceChip key={template.label} onClick={() => openQuickPlan(template)}>
              {template.label}
            </QuickChoiceChip>
          ))}
        </div>
      </Card>

      <Card padding="sm" className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl
          className="max-w-56"
          ariaLabel="Görünüm"
          value={view}
          onChange={setView}
          options={[
            { value: "day", label: "Günlük" },
            { value: "week", label: "Haftalık" },
          ]}
        />

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSelectedDate((d) => addDays(d, view === "day" ? -1 : -7))}
            className="press flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-muted hover:text-foreground"
            aria-label="Önceki"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>

          <span className="min-w-40 text-center text-sm font-semibold capitalize text-foreground">
            {view === "day"
              ? formatFriendlyDate(selectedDate)
              : `${formatFriendlyDate(startOfWeek(selectedDate))} haftası`}
          </span>

          <button
            type="button"
            onClick={() => setSelectedDate((d) => addDays(d, view === "day" ? 1 : 7))}
            className="press flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-muted hover:text-foreground"
            aria-label="Sonraki"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>

          {!isToday && (
            <Button variant="soft" size="sm" className="ml-1" onClick={() => setSelectedDate(new Date())}>
              Bugüne dön
            </Button>
          )}
        </div>
      </Card>

      {loading ? (
        <p className="text-sm text-muted-foreground">Yükleniyor…</p>
      ) : view === "day" ? (
        dayTasks.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Bu gün için henüz görev yok"
            description="Yukarıdaki 'Hızlı Planla' butonuyla bu güne birkaç dokunuşla görev ekleyebilirsin."
          />
        ) : (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-4 gap-2">
              <div className="rounded-xl bg-surface-muted px-3 py-2">
                <p className="text-lg font-bold tabular-nums text-foreground">{dayTasks.length}</p>
                <p className="text-[11px] font-medium text-muted-foreground">Görev</p>
              </div>
              <div className="rounded-xl bg-success-soft px-3 py-2">
                <p className="text-lg font-bold tabular-nums text-success">{completedToday}</p>
                <p className="text-[11px] font-medium text-muted-foreground">Tamamlandı</p>
              </div>
              <div className="rounded-xl bg-primary-soft px-3 py-2">
                <p className="text-lg font-bold tabular-nums text-primary">{plannedMinutesToday}</p>
                <p className="text-[11px] font-medium text-muted-foreground">Dakika</p>
              </div>
              <div className="rounded-xl bg-accent-soft px-3 py-2">
                <p className="text-lg font-bold tabular-nums text-accent">{plannedQuestionsToday}</p>
                <p className="text-[11px] font-medium text-muted-foreground">Soru</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {dayTasks.map((task) => {
                const subject = task.subjectId ? subjectsById.get(task.subjectId) : undefined;
                return (
                  <Card
                    key={task.id}
                    padding="sm"
                    className={cx("flex items-start gap-3", task.completed && "bg-surface-subtle")}
                  >
                    <button
                      type="button"
                      onClick={() => toggleComplete(task)}
                      className="press mt-0.5 shrink-0"
                      aria-label={task.completed ? "Tamamlanmayı geri al" : "Görevi tamamla"}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="h-6 w-6 text-success" aria-hidden />
                      ) : (
                        <Circle className="h-6 w-6 text-muted-foreground hover:text-primary" aria-hidden />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <p
                        className={cx(
                          "text-sm font-semibold",
                          task.completed ? "text-muted-foreground/70" : "text-foreground",
                        )}
                      >
                        {task.title}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {subject && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-2.5 py-1 text-[11px] font-semibold text-foreground">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: subject.color }}
                              aria-hidden
                            />
                            {subject.name}
                            {subject.examType !== "OZEL" && (
                              <span className="text-muted-foreground">· {subject.examType}</span>
                            )}
                          </span>
                        )}
                        <span className="rounded-full bg-surface-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                          {TASK_TYPE_LABELS[task.taskType]}
                        </span>
                        <span
                          className={cx(
                            "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                            PRIORITY_CLASS[task.priority],
                          )}
                        >
                          {TASK_PRIORITY_LABELS[task.priority]}
                        </span>
                      </div>

                      <p className="mt-1.5 text-xs text-muted-foreground">
                        <span>{task.startTime ?? "Gün içinde"}</span>
                        {task.estimatedMinutes != null && <span> · {task.estimatedMinutes} dk</span>}
                        {task.questionTarget != null && <span> · {task.questionTarget} soru</span>}
                      </p>
                    </div>

                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() => setOpenMenuId((id) => (id === task.id ? null : task.id))}
                        className="press flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                        aria-label="Görev seçenekleri"
                      >
                        <MoreVertical className="h-4 w-4" aria-hidden />
                      </button>

                      {openMenuId === task.id && (
                        <div className="absolute right-0 top-10 z-20 w-44 overflow-hidden rounded-xl border border-border bg-surface shadow-lifted">
                          <button
                            type="button"
                            onClick={() => openEdit(task)}
                            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-foreground hover:bg-surface-muted"
                          >
                            <Pencil className="h-4 w-4" aria-hidden />
                            Düzenle
                          </button>
                          <button
                            type="button"
                            onClick={() => postponeToTomorrow(task)}
                            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-foreground hover:bg-surface-muted"
                          >
                            <SkipForward className="h-4 w-4" aria-hidden />
                            Yarına ertele
                          </button>
                          <button
                            type="button"
                            onClick={() => duplicateTask(task)}
                            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-foreground hover:bg-surface-muted"
                          >
                            <Copy className="h-4 w-4" aria-hidden />
                            Kopyala
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteTask(task)}
                            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-danger hover:bg-danger-soft"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden />
                            Sil
                          </button>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(selectedDate), i)).map((day) => {
            const key = toDateKey(day);
            const tasks = weekTasks[key] ?? [];
            const completedCount = tasks.filter((t) => t.completed).length;
            const dayIsToday = key === toDateKey(new Date());
            const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setSelectedDate(day);
                  setView("day");
                }}
                className={cx(
                  "press flex flex-col gap-2.5 rounded-card border bg-surface p-4 text-left shadow-soft hover:border-border-strong hover:shadow-card",
                  dayIsToday ? "border-primary" : "border-border",
                )}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-bold capitalize text-foreground">{formatShortDayLabel(day)}</span>
                  <span
                    className={cx(
                      "text-xl font-black tabular-nums",
                      dayIsToday ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {day.getDate()}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground">
                  {tasks.length === 0 ? "Görev yok" : `${tasks.length} görev · ${completedCount} tamamlandı`}
                </p>

                <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className={cx("h-full rounded-full", progress > 0 ? "bg-success" : "")}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {formOpen && (
        <TaskFormPanel
          subjects={subjects}
          defaultDate={toDateKey(selectedDate)}
          editingTask={editingTask}
          onClose={() => {
            setFormOpen(false);
            setEditingTask(null);
          }}
          onSave={handleSave}
        />
      )}

      {quickPlanOpen && (
        <QuickPlanPanel
          subjects={subjects}
          defaultDate={toDateKey(selectedDate)}
          deepLink={quickPlanDeepLink}
          initialTemplate={quickPlanTemplate}
          onClose={() => {
            setQuickPlanOpen(false);
            setQuickPlanDeepLink(null);
            setQuickPlanTemplate(null);
          }}
          onSave={handleQuickSave}
        />
      )}
    </div>
  );
}
