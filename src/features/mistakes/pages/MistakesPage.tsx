import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, MoreVertical, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { INPUT_CLASS } from "@/components/ui/formStyles";
import { PageHeader } from "@/components/ui/PageHeader";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { MISTAKE_REASON_LABELS } from "@/constants/mistakeReasons";
import { MistakeFormPanel } from "@/features/mistakes/components/MistakeFormPanel";
import { useSubjects } from "@/hooks/useSubjects";
import type { ExamResult } from "@/models/ExamResult";
import type { MistakeRecord, MistakeStatus } from "@/models/MistakeRecord";
import type { Topic } from "@/models/Topic";
import { examResultRepository } from "@/repositories/examResultRepository";
import { mistakeRecordRepository } from "@/repositories/mistakeRecordRepository";
import { topicRepository } from "@/repositories/topicRepository";
import { createFirstReviewForMistake, deletePendingReviewsForMistake } from "@/services/reviewService";
import { cx } from "@/utils/cx";

type StatusFilter = "all" | MistakeStatus;

const CREATED_DATE_FORMATTER = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long" });

interface LocationState {
  prefillExamId?: string;
}

export function MistakesPage() {
  const { subjects } = useSubjects();
  const activeSubjects = subjects.filter((s) => s.active);
  const location = useLocation();
  const navigate = useNavigate();

  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);
  const [exams, setExams] = useState<ExamResult[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingMistake, setEditingMistake] = useState<MistakeRecord | null>(null);
  const [defaultExamId, setDefaultExamId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  async function reload() {
    const [allMistakes, allExams, allTopics] = await Promise.all([
      mistakeRecordRepository.getAll(),
      examResultRepository.getAll(),
      topicRepository.getAll(),
    ]);
    setMistakes(allMistakes.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    setExams(allExams.sort((a, b) => b.date.localeCompare(a.date)));
    setTopics(allTopics);
  }

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const state = location.state as LocationState | null;
    if (state?.prefillExamId) {
      setDefaultExamId(state.prefillExamId);
      setEditingMistake(null);
      setFormOpen(true);
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const subjectsById = new Map(subjects.map((s) => [s.id, s]));
  const topicsById = new Map(topics.map((t) => [t.id, t]));
  const examsById = new Map(exams.map((e) => [e.id, e]));

  const openCount = mistakes.filter((m) => m.status === "open").length;
  const resolvedCount = mistakes.length - openCount;

  const filteredMistakes = mistakes.filter((mistake) => {
    if (statusFilter !== "all" && mistake.status !== statusFilter) return false;
    if (subjectFilter && mistake.subjectId !== subjectFilter) return false;
    return true;
  });

  function openCreate() {
    setEditingMistake(null);
    setDefaultExamId(null);
    setFormOpen(true);
  }

  function openEdit(mistake: MistakeRecord) {
    setEditingMistake(mistake);
    setDefaultExamId(null);
    setFormOpen(true);
    setOpenMenuId(null);
  }

  async function handleSave(mistake: MistakeRecord, isNew: boolean) {
    if (isNew) {
      await mistakeRecordRepository.add(mistake);
      await createFirstReviewForMistake(mistake);
    } else {
      await mistakeRecordRepository.put(mistake);
    }
    setFormOpen(false);
    setEditingMistake(null);
    setDefaultExamId(null);
    await reload();
  }

  async function deleteMistake(mistake: MistakeRecord) {
    setOpenMenuId(null);
    if (!window.confirm(`"${mistake.title}" yanlışını silmek istediğine emin misin?`)) return;
    await deletePendingReviewsForMistake(mistake.id);
    await mistakeRecordRepository.remove(mistake.id);
    await reload();
  }

  async function toggleStatus(mistake: MistakeRecord) {
    setOpenMenuId(null);
    const now = new Date().toISOString();
    const resolved = mistake.status === "open";
    await mistakeRecordRepository.put({
      ...mistake,
      status: resolved ? "resolved" : "open",
      resolvedAt: resolved ? now : null,
      updatedAt: now,
    });
    await reload();
  }

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <PageHeader
        title="Yanlışlar"
        description="Her yanlış için ilk tekrar otomatik oluşturulur."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" aria-hidden />
            Yanlış ekle
          </Button>
        }
      />

      <Card padding="sm" className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          className="max-w-sm"
          ariaLabel="Durum filtresi"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "all", label: "Tümü", badge: mistakes.length },
            { value: "open", label: "Açık", badge: openCount },
            { value: "resolved", label: "Çözüldü", badge: resolvedCount },
          ]}
        />

        {activeSubjects.length > 0 && (
          <select
            aria-label="Ders filtresi"
            className={cx(INPUT_CLASS, "w-auto min-w-44 flex-1 sm:max-w-64")}
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
          >
            <option value="">Tüm dersler</option>
            {activeSubjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.examType === "OZEL" ? subject.name : `${subject.name} (${subject.examType})`}
              </option>
            ))}
          </select>
        )}
      </Card>

      {loading ? (
        <p className="text-sm text-muted-foreground">Yükleniyor…</p>
      ) : filteredMistakes.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="Kayıt bulunamadı"
          description="Yaptığın yanlışları ekleyip tekrar listesine otomatik dahil edebilirsin."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredMistakes.map((mistake) => {
            const subject = subjectsById.get(mistake.subjectId);
            const topic = mistake.topicId ? topicsById.get(mistake.topicId) : undefined;
            const exam = mistake.examId ? examsById.get(mistake.examId) : undefined;
            const resolved = mistake.status === "resolved";

            return (
              <Card key={mistake.id} className={cx("flex flex-col gap-3", resolved && "bg-surface-subtle")}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p
                      className={cx(
                        "truncate text-sm font-bold",
                        resolved ? "text-muted-foreground" : "text-foreground",
                      )}
                    >
                      {mistake.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {subject?.name ?? "Ders silinmiş"}
                      {topic && ` · ${topic.name}`}
                    </p>
                  </div>

                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setOpenMenuId((id) => (id === mistake.id ? null : mistake.id))}
                      className="press flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                      aria-label="Yanlış seçenekleri"
                    >
                      <MoreVertical className="h-4 w-4" aria-hidden />
                    </button>
                    {openMenuId === mistake.id && (
                      <div className="absolute right-0 top-10 z-20 w-48 overflow-hidden rounded-xl border border-border bg-surface shadow-lifted">
                        <button
                          type="button"
                          onClick={() => toggleStatus(mistake)}
                          className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-foreground hover:bg-surface-muted"
                        >
                          {resolved ? (
                            <RotateCcw className="h-4 w-4" aria-hidden />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" aria-hidden />
                          )}
                          {resolved ? "Tekrar açık yap" : "Çözüldü işaretle"}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(mistake)}
                          className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-foreground hover:bg-surface-muted"
                        >
                          <Pencil className="h-4 w-4" aria-hidden />
                          Düzenle
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteMistake(mistake)}
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
                  <span
                    className={cx(
                      "rounded-full px-2.5 py-1 text-[11px] font-bold",
                      resolved ? "bg-success-soft text-success" : "bg-warning-soft text-warning",
                    )}
                  >
                    {resolved ? "Çözüldü" : "Açık"}
                  </span>
                  <span className="rounded-full bg-surface-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                    {MISTAKE_REASON_LABELS[mistake.reason]}
                  </span>
                  {exam && (
                    <span className="max-w-40 truncate rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-semibold text-primary">
                      {exam.title}
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  {CREATED_DATE_FORMATTER.format(new Date(mistake.createdAt))}
                </p>
              </Card>
            );
          })}
        </div>
      )}

      {formOpen && (
        <MistakeFormPanel
          subjects={activeSubjects}
          exams={exams}
          editingMistake={editingMistake}
          defaultExamId={defaultExamId}
          onClose={() => {
            setFormOpen(false);
            setEditingMistake(null);
            setDefaultExamId(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
