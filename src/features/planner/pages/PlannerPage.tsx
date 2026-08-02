import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Copy,
  MoreVertical,
  Pencil,
  Plus,
  SkipForward,
  Trash2,
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { TASK_PRIORITY_LABELS, TASK_TYPE_LABELS, priorityWeight } from "@/constants/taskTypes";
import { TaskFormPanel } from "@/features/planner/components/TaskFormPanel";
import type { Subject } from "@/models/Subject";
import type { StudyTask } from "@/models/StudyTask";
import { studyTaskRepository } from "@/repositories/studyTaskRepository";
import { ensureDefaultSubjectsSeeded } from "@/services/bootstrapService";
import { cx } from "@/utils/cx";
import { addDays, formatFriendlyDate, formatShortDayLabel, fromDateKey, startOfWeek, toDateKey } from "@/utils/date";
import { generateId } from "@/utils/id";

type ViewMode = "day" | "week";

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

  const subjectsById = new Map(subjects.map((s) => [s.id, s]));

  useEffect(() => {
    ensureDefaultSubjectsSeeded().then(setSubjects);
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

  function openCreate() {
    setEditingTask(null);
    setFormOpen(true);
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

  const isToday = toDateKey(selectedDate) === toDateKey(new Date());

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Planlayıcı</h1>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Görev ekle
        </button>
      </div>

      <div className="flex gap-2 rounded-full bg-surface-muted p-1">
        {(["day", "week"] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setView(mode)}
            className={cx(
              "flex-1 rounded-full py-2 text-sm font-medium transition-colors",
              view === mode ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground",
            )}
          >
            {mode === "day" ? "Günlük" : "Haftalık"}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() =>
            setSelectedDate((d) => addDays(d, view === "day" ? -1 : -7))
          }
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-muted"
          aria-label="Önceki"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-sm font-medium capitalize text-foreground">
            {view === "day"
              ? formatFriendlyDate(selectedDate)
              : `${formatFriendlyDate(startOfWeek(selectedDate))} haftası`}
          </span>
          {!isToday && (
            <button
              type="button"
              onClick={() => setSelectedDate(new Date())}
              className="text-xs font-medium text-primary"
            >
              Bugüne dön
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() =>
            setSelectedDate((d) => addDays(d, view === "day" ? 1 : 7))
          }
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-muted"
          aria-label="Sonraki"
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      </div>

      {loading ? (
        <p className="p-4 text-center text-sm text-muted-foreground">Yükleniyor…</p>
      ) : view === "day" ? (
        dayTasks.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Bu gün için henüz görev yok"
            description="Yukarıdaki 'Görev ekle' butonuyla bugüne bir görev ekleyebilirsin."
          />
        ) : (
          <Card className="divide-y divide-border p-0">
            {dayTasks.map((task) => {
              const subject = task.subjectId ? subjectsById.get(task.subjectId) : undefined;
              return (
                <div key={task.id} className="flex items-start gap-3 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleComplete(task)}
                    className="mt-0.5 shrink-0 text-primary"
                    aria-label={task.completed ? "Tamamlanmayı geri al" : "Görevi tamamla"}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="h-6 w-6" aria-hidden />
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground" aria-hidden />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={cx(
                        "text-sm font-medium text-foreground",
                        task.completed && "text-muted-foreground line-through",
                      )}
                    >
                      {task.title}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                      {subject && (
                        <span className="inline-flex items-center gap-1">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: subject.color }}
                            aria-hidden
                          />
                          {subject.name}
                        </span>
                      )}
                      <span>{TASK_TYPE_LABELS[task.taskType]}</span>
                      {task.startTime && <span>{task.startTime}</span>}
                      {task.estimatedMinutes != null && <span>{task.estimatedMinutes} dk</span>}
                      <span>{TASK_PRIORITY_LABELS[task.priority]}</span>
                    </div>
                  </div>

                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setOpenMenuId((id) => (id === task.id ? null : task.id))}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-muted"
                      aria-label="Görev seçenekleri"
                    >
                      <MoreVertical className="h-4 w-4" aria-hidden />
                    </button>

                    {openMenuId === task.id && (
                      <div className="absolute right-0 top-10 z-10 w-44 overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
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
                          className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-danger hover:bg-danger/10"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                          Sil
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </Card>
        )
      ) : (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(selectedDate), i)).map((day) => {
            const key = toDateKey(day);
            const tasks = weekTasks[key] ?? [];
            const completedCount = tasks.filter((t) => t.completed).length;
            const dayIsToday = key === toDateKey(new Date());

            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setSelectedDate(day);
                  setView("day");
                }}
                className={cx(
                  "flex items-center justify-between rounded-2xl border bg-surface px-4 py-3 text-left shadow-sm shadow-black/[0.03] transition-colors hover:bg-surface-muted",
                  dayIsToday ? "border-primary" : "border-border",
                )}
              >
                <div>
                  <p className="text-sm font-semibold capitalize text-foreground">
                    {formatShortDayLabel(day)} · {day.getDate()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tasks.length === 0
                      ? "Görev yok"
                      : `${tasks.length} görev, ${completedCount} tamamlandı`}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
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
    </div>
  );
}
