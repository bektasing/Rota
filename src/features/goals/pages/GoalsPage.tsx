import { useEffect, useState } from "react";
import { CheckCircle2, MoreVertical, Pause, Pencil, Play, Plus, RotateCcw, Target, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { INPUT_CLASS } from "@/components/ui/formStyles";
import { PageHeader } from "@/components/ui/PageHeader";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { GOAL_STATUS_LABELS, GOAL_TYPE_LABELS } from "@/constants/goals";
import { GoalFormPanel } from "@/features/goals/components/GoalFormPanel";
import { useSubjects } from "@/hooks/useSubjects";
import type { Goal, GoalStatus } from "@/models/Goal";
import { goalRepository } from "@/repositories/goalRepository";
import { cx } from "@/utils/cx";
import { fromDateKey } from "@/utils/date";
import { computePercent, formatAmount } from "@/utils/progress";

type StatusFilter = "all" | GoalStatus;

const RANGE_DATE_FORMATTER = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" });

const STATUS_CHIP_CLASS: Record<GoalStatus, string> = {
  active: "bg-primary-soft text-primary",
  completed: "bg-success-soft text-success",
  paused: "bg-surface-muted text-muted-foreground",
};

function formatRange(startDate: string, endDate: string): string {
  return `${RANGE_DATE_FORMATTER.format(fromDateKey(startDate))} – ${RANGE_DATE_FORMATTER.format(fromDateKey(endDate))}`;
}

export function GoalsPage() {
  const { subjects } = useSubjects();
  const activeSubjects = subjects.filter((s) => s.active);
  const subjectsById = new Map(subjects.map((s) => [s.id, s]));

  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [progressEditId, setProgressEditId] = useState<string | null>(null);
  const [progressInput, setProgressInput] = useState("");

  async function reload() {
    const all = await goalRepository.getAll();
    setGoals(all.sort((a, b) => a.endDate.localeCompare(b.endDate) || b.createdAt.localeCompare(a.createdAt)));
  }

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  const activeCount = goals.filter((g) => g.status === "active").length;
  const completedCount = goals.filter((g) => g.status === "completed").length;
  const pausedCount = goals.filter((g) => g.status === "paused").length;

  const filteredGoals = goals.filter((goal) => statusFilter === "all" || goal.status === statusFilter);

  function openCreate() {
    setEditingGoal(null);
    setFormOpen(true);
  }

  function openEdit(goal: Goal) {
    setEditingGoal(goal);
    setFormOpen(true);
    setOpenMenuId(null);
  }

  async function handleSave(goal: Goal, isNew: boolean) {
    if (isNew) {
      await goalRepository.add(goal);
    } else {
      await goalRepository.put(goal);
    }
    setFormOpen(false);
    setEditingGoal(null);
    await reload();
  }

  async function deleteGoal(goal: Goal) {
    setOpenMenuId(null);
    if (!window.confirm(`"${goal.title}" hedefini silmek istediğine emin misin?`)) return;
    await goalRepository.remove(goal.id);
    await reload();
  }

  async function toggleCompleted(goal: Goal) {
    setOpenMenuId(null);
    const now = new Date().toISOString();
    const completing = goal.status !== "completed";
    await goalRepository.put({
      ...goal,
      status: completing ? "completed" : "active",
      completedAt: completing ? now : null,
      updatedAt: now,
    });
    await reload();
  }

  async function togglePaused(goal: Goal) {
    setOpenMenuId(null);
    const now = new Date().toISOString();
    await goalRepository.put({
      ...goal,
      status: goal.status === "paused" ? "active" : "paused",
      updatedAt: now,
    });
    await reload();
  }

  function startProgressEdit(goal: Goal) {
    setOpenMenuId(null);
    setProgressEditId(goal.id);
    setProgressInput(String(goal.currentValue));
  }

  async function saveProgress(goal: Goal) {
    const value = Number(progressInput);
    if (!Number.isFinite(value) || value < 0) return;
    await goalRepository.put({ ...goal, currentValue: value, updatedAt: new Date().toISOString() });
    setProgressEditId(null);
    await reload();
  }

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <PageHeader
        title="Hedefler"
        description="Hedeflerini kendi takibinle güncelleyebilirsin."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" aria-hidden />
            Hedef ekle
          </Button>
        }
      />

      <Card padding="sm">
        <SegmentedControl
          ariaLabel="Hedef durumu filtresi"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "all", label: "Tümü", badge: goals.length },
            { value: "active", label: "Aktif", badge: activeCount },
            { value: "completed", label: "Tamamlanan", badge: completedCount },
            { value: "paused", label: "Duraklatılan", badge: pausedCount },
          ]}
        />
      </Card>

      {loading ? (
        <p className="text-sm text-muted-foreground">Yükleniyor…</p>
      ) : filteredGoals.length === 0 ? (
        <EmptyState
          icon={Target}
          title={goals.length === 0 ? "Henüz hedef eklemedin" : "Bu filtrede hedef yok"}
          description="Çalışma süresi, soru sayısı veya net gibi bir hedef ekleyip ilerlemeni takip edebilirsin."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredGoals.map((goal) => {
            const percent = computePercent(goal.currentValue, goal.targetValue);
            const subject = goal.subjectId ? subjectsById.get(goal.subjectId) : undefined;
            const completed = goal.status === "completed";

            return (
              <Card
                key={goal.id}
                className={cx("flex flex-col gap-3", goal.status !== "active" && "bg-surface-subtle")}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p
                      className={cx(
                        "truncate text-sm font-bold",
                        completed ? "text-muted-foreground" : "text-foreground",
                      )}
                    >
                      {goal.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRange(goal.startDate, goal.endDate)}
                      {subject && ` · ${subject.name}`}
                    </p>
                  </div>

                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setOpenMenuId((id) => (id === goal.id ? null : goal.id))}
                      className="press flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                      aria-label="Hedef seçenekleri"
                    >
                      <MoreVertical className="h-4 w-4" aria-hidden />
                    </button>
                    {openMenuId === goal.id && (
                      <div className="absolute right-0 top-10 z-20 w-52 overflow-hidden rounded-xl border border-border bg-surface shadow-lifted">
                        <button
                          type="button"
                          onClick={() => startProgressEdit(goal)}
                          className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-foreground hover:bg-surface-muted"
                        >
                          <Target className="h-4 w-4" aria-hidden />
                          İlerlemeyi güncelle
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleCompleted(goal)}
                          className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-foreground hover:bg-surface-muted"
                        >
                          {completed ? (
                            <RotateCcw className="h-4 w-4" aria-hidden />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" aria-hidden />
                          )}
                          {completed ? "Tamamlamayı geri al" : "Tamamlandı işaretle"}
                        </button>
                        {!completed && (
                          <button
                            type="button"
                            onClick={() => togglePaused(goal)}
                            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-foreground hover:bg-surface-muted"
                          >
                            {goal.status === "paused" ? (
                              <Play className="h-4 w-4" aria-hidden />
                            ) : (
                              <Pause className="h-4 w-4" aria-hidden />
                            )}
                            {goal.status === "paused" ? "Devam ettir" : "Duraklat"}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openEdit(goal)}
                          className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-foreground hover:bg-surface-muted"
                        >
                          <Pencil className="h-4 w-4" aria-hidden />
                          Düzenle
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteGoal(goal)}
                          className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-danger hover:bg-danger-soft"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                          Sil
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={cx("rounded-full px-2.5 py-1 text-[11px] font-bold", STATUS_CHIP_CLASS[goal.status])}>
                    {GOAL_STATUS_LABELS[goal.status]}
                  </span>
                  <span className="rounded-full bg-surface-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                    {GOAL_TYPE_LABELS[goal.type]}
                  </span>
                </div>

                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      <span className="text-xl font-bold tabular-nums">{formatAmount(goal.currentValue)}</span>
                      <span className="text-muted-foreground"> / {formatAmount(goal.targetValue)} {goal.unit}</span>
                    </p>
                    <span className="text-[13px] font-bold tabular-nums text-primary">%{percent}</span>
                  </div>
                  <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-surface-muted">
                    <div
                      className={cx(
                        "h-full rounded-full transition-[width] duration-500",
                        completed ? "bg-success" : "bg-brand-gradient",
                      )}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {progressEditId === goal.id && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      autoFocus
                      aria-label="Yeni ilerleme değeri"
                      className={INPUT_CLASS}
                      value={progressInput}
                      onChange={(e) => setProgressInput(e.target.value)}
                    />
                    <Button size="sm" onClick={() => saveProgress(goal)}>
                      Kaydet
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setProgressEditId(null)}>
                      Vazgeç
                    </Button>
                  </div>
                )}

                {goal.description && <p className="text-xs text-muted-foreground">{goal.description}</p>}
              </Card>
            );
          })}
        </div>
      )}

      {formOpen && (
        <GoalFormPanel
          subjects={activeSubjects}
          editingGoal={editingGoal}
          onClose={() => {
            setFormOpen(false);
            setEditingGoal(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
