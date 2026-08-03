import { useEffect, useState } from "react";

import { FormSheet } from "@/components/ui/FormSheet";
import { FIELD_CLASS, INPUT_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import type { ExamResult, ExamResultType, ExamSection } from "@/models/ExamResult";
import type { Subject } from "@/models/Subject";
import { computeNet, formatNet } from "@/utils/exam";
import { generateId } from "@/utils/id";
import { toDateKey } from "@/utils/date";
import { cx } from "@/utils/cx";

const NUMBER_INPUT_CLASS =
  "w-full min-h-10 rounded-lg border border-border bg-surface px-2 text-center text-sm font-semibold text-foreground transition-colors focus:border-primary focus:outline-none";

interface SectionInput {
  correct: string;
  wrong: string;
  blank: string;
}

const EMPTY_SECTION: SectionInput = { correct: "", wrong: "", blank: "" };

interface ExamFormPanelProps {
  subjects: Subject[];
  editingExam: ExamResult | null;
  onClose: () => void;
  onSave: (exam: ExamResult) => Promise<void>;
}

function buildInitialInputs(editingExam: ExamResult | null): Record<string, SectionInput> {
  if (!editingExam) return {};
  const entries: Record<string, SectionInput> = {};
  for (const section of editingExam.sections) {
    const key = section.subjectId ?? section.subjectName;
    entries[key] = {
      correct: String(section.correct),
      wrong: String(section.wrong),
      blank: String(section.blank),
    };
  }
  return entries;
}

export function ExamFormPanel({ subjects, editingExam, onClose, onSave }: ExamFormPanelProps) {
  const [title, setTitle] = useState(editingExam?.title ?? "");
  const [examType, setExamType] = useState<ExamResultType>(editingExam?.examType ?? "TYT");
  const [branchSubjectId, setBranchSubjectId] = useState(
    editingExam?.examType === "BRANS" ? (editingExam.subjectId ?? "") : "",
  );
  const [date, setDate] = useState(editingExam?.date ?? toDateKey(new Date()));
  const [durationMinutes, setDurationMinutes] = useState(
    editingExam?.durationMinutes != null ? String(editingExam.durationMinutes) : "",
  );
  const [note, setNote] = useState(editingExam?.note ?? "");
  const [sectionInputs, setSectionInputs] = useState<Record<string, SectionInput>>(() =>
    buildInitialInputs(editingExam),
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (examType !== "BRANS") setBranchSubjectId("");
  }, [examType]);

  const relevantSubjects =
    examType === "BRANS"
      ? branchSubjectId
        ? subjects.filter((s) => s.id === branchSubjectId)
        : []
      : subjects.filter((s) => s.examType === examType);

  function updateSection(key: string, field: keyof SectionInput, value: string) {
    setSectionInputs((prev) => ({
      ...prev,
      [key]: { ...(prev[key] ?? EMPTY_SECTION), [field]: value },
    }));
  }

  function sectionNet(key: string): number {
    const input = sectionInputs[key] ?? EMPTY_SECTION;
    return computeNet(Number(input.correct) || 0, Number(input.wrong) || 0);
  }

  async function handleSubmit() {
    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0) {
      setError("Deneme için bir ad yaz.");
      return;
    }
    if (!date) {
      setError("Bir tarih seç.");
      return;
    }
    if (examType === "BRANS" && !branchSubjectId) {
      setError("Branş denemesi için bir ders seç.");
      return;
    }
    if (relevantSubjects.length === 0) {
      setError("En az bir ders için sonuç girilmeli.");
      return;
    }

    const sections: ExamSection[] = relevantSubjects.map((subject) => {
      const input = sectionInputs[subject.id] ?? EMPTY_SECTION;
      const correct = Math.max(0, Number(input.correct) || 0);
      const wrong = Math.max(0, Number(input.wrong) || 0);
      const blank = Math.max(0, Number(input.blank) || 0);
      return {
        subjectId: subject.id,
        subjectName: subject.name,
        correct,
        wrong,
        blank,
        net: computeNet(correct, wrong),
      };
    });

    const totalCorrect = sections.reduce((sum, s) => sum + s.correct, 0);
    const totalWrong = sections.reduce((sum, s) => sum + s.wrong, 0);
    const totalBlank = sections.reduce((sum, s) => sum + s.blank, 0);
    const totalNet = computeNet(totalCorrect, totalWrong);

    setSaving(true);
    const now = new Date().toISOString();
    const durationValue = durationMinutes.trim().length > 0 ? Number(durationMinutes) : null;

    const exam: ExamResult = editingExam
      ? {
          ...editingExam,
          title: trimmedTitle,
          examType,
          subjectId: examType === "BRANS" ? branchSubjectId : null,
          date,
          durationMinutes: durationValue,
          sections,
          totalCorrect,
          totalWrong,
          totalBlank,
          totalNet,
          note: note.trim(),
          updatedAt: now,
        }
      : {
          id: generateId(),
          title: trimmedTitle,
          examType,
          subjectId: examType === "BRANS" ? branchSubjectId : null,
          date,
          durationMinutes: durationValue,
          sections,
          totalCorrect,
          totalWrong,
          totalBlank,
          totalNet,
          note: note.trim(),
          createdAt: now,
          updatedAt: now,
        };

    await onSave(exam);
    setSaving(false);
  }

  return (
    <FormSheet
      title={editingExam ? "Denemeyi düzenle" : "Yeni deneme"}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitting={saving}
      error={error}
    >
      <div className={FIELD_CLASS}>
        <span className={LABEL_CLASS}>Deneme türü</span>
        <div className="flex gap-2">
          {(
            [
              { value: "TYT" as const, label: "TYT" },
              { value: "AYT" as const, label: "AYT" },
              { value: "BRANS" as const, label: "Branş" },
            ]
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setExamType(option.value)}
              className={cx(
                "press min-h-11 flex-1 rounded-xl border px-3 text-sm font-semibold",
                examType === option.value
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="exam-title" className={LABEL_CLASS}>
          Deneme adı
        </label>
        <input
          id="exam-title"
          className={INPUT_CLASS}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Örn. 3D Yayınları TYT Deneme 4"
        />
      </div>

      {examType === "BRANS" && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="exam-branch-subject" className={LABEL_CLASS}>
            Ders
          </label>
          <select
            id="exam-branch-subject"
            className={INPUT_CLASS}
            value={branchSubjectId}
            onChange={(e) => setBranchSubjectId(e.target.value)}
          >
            <option value="">Ders seç</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.examType === "OZEL" ? subject.name : `${subject.name} (${subject.examType})`}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="exam-date" className={LABEL_CLASS}>
            Tarih
          </label>
          <input
            id="exam-date"
            type="date"
            className={INPUT_CLASS}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="exam-duration" className={LABEL_CLASS}>
            Süre, isteğe bağlı (dk)
          </label>
          <input
            id="exam-duration"
            type="number"
            min={1}
            className={INPUT_CLASS}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
          />
        </div>
      </div>

      {relevantSubjects.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className={LABEL_CLASS}>Ders sonuçları</span>
          <div className="flex flex-col gap-2">
            {relevantSubjects.map((subject) => (
              <div key={subject.id} className="rounded-xl border border-border bg-surface-subtle p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">{subject.name}</span>
                  <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-bold text-primary">
                    Net {formatNet(sectionNet(subject.id))}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-center text-xs text-muted-foreground">Doğru</span>
                    <input
                      type="number"
                      min={0}
                      className={NUMBER_INPUT_CLASS}
                      value={sectionInputs[subject.id]?.correct ?? ""}
                      onChange={(e) => updateSection(subject.id, "correct", e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-center text-xs text-muted-foreground">Yanlış</span>
                    <input
                      type="number"
                      min={0}
                      className={NUMBER_INPUT_CLASS}
                      value={sectionInputs[subject.id]?.wrong ?? ""}
                      onChange={(e) => updateSection(subject.id, "wrong", e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-center text-xs text-muted-foreground">Boş</span>
                    <input
                      type="number"
                      min={0}
                      className={NUMBER_INPUT_CLASS}
                      value={sectionInputs[subject.id]?.blank ?? ""}
                      onChange={(e) => updateSection(subject.id, "blank", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="exam-note" className={LABEL_CLASS}>
          Genel not (isteğe bağlı)
        </label>
        <textarea
          id="exam-note"
          rows={2}
          className={INPUT_CLASS}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
    </FormSheet>
  );
}
