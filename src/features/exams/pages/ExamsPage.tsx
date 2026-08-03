import { useEffect, useState } from "react";
import { ClipboardList, MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { EXAM_TYPE_LABELS } from "@/constants/examTypes";
import { ROUTES } from "@/constants/routes";
import { ExamFormPanel } from "@/features/exams/components/ExamFormPanel";
import type { ExamResult } from "@/models/ExamResult";
import { examResultRepository } from "@/repositories/examResultRepository";
import { mistakeRecordRepository } from "@/repositories/mistakeRecordRepository";
import { useSubjects } from "@/hooks/useSubjects";
import { formatNet } from "@/utils/exam";
import { fromDateKey } from "@/utils/date";

const EXAM_DATE_FORMATTER = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" });

export function ExamsPage() {
  const { subjects } = useSubjects();
  const activeSubjects = subjects.filter((s) => s.active);
  const navigate = useNavigate();

  const [exams, setExams] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamResult | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  async function reload() {
    const all = await examResultRepository.getAll();
    setExams(all.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)));
  }

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  function openCreate() {
    setEditingExam(null);
    setFormOpen(true);
  }

  function openEdit(exam: ExamResult) {
    setEditingExam(exam);
    setFormOpen(true);
    setOpenMenuId(null);
  }

  async function handleSave(exam: ExamResult) {
    if (editingExam) {
      await examResultRepository.put(exam);
    } else {
      await examResultRepository.add(exam);
    }
    setFormOpen(false);
    setEditingExam(null);
    await reload();
  }

  async function deleteExam(exam: ExamResult) {
    setOpenMenuId(null);
    if (!window.confirm(`"${exam.title}" denemesini silmek istediğine emin misin?`)) return;

    const linkedMistakes = await mistakeRecordRepository.getByExamId(exam.id);
    const now = new Date().toISOString();
    await Promise.all(
      linkedMistakes.map((mistake) => mistakeRecordRepository.put({ ...mistake, examId: null, updatedAt: now })),
    );

    await examResultRepository.remove(exam.id);
    await reload();
  }

  function addMistakeForExam(exam: ExamResult) {
    setOpenMenuId(null);
    navigate(ROUTES.moreMistakes, { state: { prefillExamId: exam.id } });
  }

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <PageHeader
        title="Denemeler"
        description="Deneme sonuçlarını kaydet, netlerin otomatik hesaplansın."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" aria-hidden />
            Deneme ekle
          </Button>
        }
      />

      {loading ? (
        <p className="text-sm text-muted-foreground">Yükleniyor…</p>
      ) : exams.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Henüz deneme yok"
          description="Yukarıdaki 'Deneme ekle' butonuyla ilk deneme sonucunu kaydedebilirsin."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {exams.map((exam) => (
            <Card key={exam.id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-foreground">{exam.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {EXAM_TYPE_LABELS[exam.examType]} · {EXAM_DATE_FORMATTER.format(fromDateKey(exam.date))}
                  </p>
                </div>

                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setOpenMenuId((id) => (id === exam.id ? null : exam.id))}
                    className="press flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                    aria-label="Deneme seçenekleri"
                  >
                    <MoreVertical className="h-4 w-4" aria-hidden />
                  </button>
                  {openMenuId === exam.id && (
                    <div className="absolute right-0 top-10 z-20 w-48 overflow-hidden rounded-xl border border-border bg-surface shadow-lifted">
                      <button
                        type="button"
                        onClick={() => addMistakeForExam(exam)}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-foreground hover:bg-surface-muted"
                      >
                        <Plus className="h-4 w-4" aria-hidden />
                        Yanlış ekle
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(exam)}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-foreground hover:bg-surface-muted"
                      >
                        <Pencil className="h-4 w-4" aria-hidden />
                        Düzenle
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteExam(exam)}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-danger hover:bg-danger-soft"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                        Sil
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold tabular-nums leading-none text-foreground">
                  {formatNet(exam.totalNet)}
                </span>
                <span className="text-sm font-medium text-muted-foreground">net</span>
              </div>

              <div className="flex gap-2">
                <span className="flex-1 rounded-lg bg-success-soft px-2.5 py-1.5 text-center text-xs font-semibold text-success">
                  {exam.totalCorrect} doğru
                </span>
                <span className="flex-1 rounded-lg bg-danger-soft px-2.5 py-1.5 text-center text-xs font-semibold text-danger">
                  {exam.totalWrong} yanlış
                </span>
                <span className="flex-1 rounded-lg bg-surface-muted px-2.5 py-1.5 text-center text-xs font-semibold text-muted-foreground">
                  {exam.totalBlank} boş
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {formOpen && (
        <ExamFormPanel
          subjects={activeSubjects}
          editingExam={editingExam}
          onClose={() => {
            setFormOpen(false);
            setEditingExam(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
