import { useEffect, useState } from "react";

import { FormSheet } from "@/components/ui/FormSheet";
import { FIELD_CLASS, INPUT_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { MISTAKE_REASON_OPTIONS } from "@/constants/mistakeReasons";
import type { ExamResult } from "@/models/ExamResult";
import type { MistakeReason, MistakeRecord } from "@/models/MistakeRecord";
import type { Subject } from "@/models/Subject";
import type { Topic } from "@/models/Topic";
import { topicRepository } from "@/repositories/topicRepository";
import { generateId } from "@/utils/id";

const EXAM_OPTION_FORMATTER = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" });

interface MistakeFormPanelProps {
  subjects: Subject[];
  exams: ExamResult[];
  editingMistake: MistakeRecord | null;
  defaultExamId: string | null;
  onClose: () => void;
  onSave: (mistake: MistakeRecord, isNew: boolean) => Promise<void>;
}

export function MistakeFormPanel({
  subjects,
  exams,
  editingMistake,
  defaultExamId,
  onClose,
  onSave,
}: MistakeFormPanelProps) {
  const [title, setTitle] = useState(editingMistake?.title ?? "");
  const [examId, setExamId] = useState(editingMistake?.examId ?? defaultExamId ?? "");
  const [subjectId, setSubjectId] = useState(editingMistake?.subjectId ?? "");
  const [topicId, setTopicId] = useState(editingMistake?.topicId ?? "");
  const [reason, setReason] = useState<MistakeReason>(editingMistake?.reason ?? "bilgi_eksikligi");
  const [questionSource, setQuestionSource] = useState(editingMistake?.questionSource ?? "");
  const [solutionNote, setSolutionNote] = useState(editingMistake?.solutionNote ?? "");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!subjectId) {
      setTopics([]);
      return;
    }
    let cancelled = false;
    topicRepository.getBySubjectId(subjectId).then((found) => {
      if (!cancelled) setTopics(found);
    });
    return () => {
      cancelled = true;
    };
  }, [subjectId]);

  async function handleSubmit() {
    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0) {
      setError("Yanlış için bir başlık yaz.");
      return;
    }
    if (!subjectId) {
      setError("Bir ders seç.");
      return;
    }

    setSaving(true);
    const now = new Date().toISOString();

    const mistake: MistakeRecord = editingMistake
      ? {
          ...editingMistake,
          title: trimmedTitle,
          examId: examId || null,
          subjectId,
          topicId: topicId || null,
          questionSource: questionSource.trim(),
          reason,
          solutionNote: solutionNote.trim(),
          updatedAt: now,
        }
      : {
          id: generateId(),
          examId: examId || null,
          subjectId,
          topicId: topicId || null,
          title: trimmedTitle,
          questionSource: questionSource.trim(),
          reason,
          solutionNote: solutionNote.trim(),
          status: "open",
          createdAt: now,
          updatedAt: now,
          resolvedAt: null,
        };

    await onSave(mistake, !editingMistake);
    setSaving(false);
  }

  return (
    <FormSheet
      title={editingMistake ? "Yanlışı düzenle" : "Yeni yanlış"}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitting={saving}
      error={error}
    >
      <div className={FIELD_CLASS}>
        <label htmlFor="mistake-title" className={LABEL_CLASS}>
          Başlık
        </label>
        <input
          id="mistake-title"
          className={INPUT_CLASS}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Örn. Türev - zincir kuralı sorusu"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="mistake-subject" className={LABEL_CLASS}>
          Ders
        </label>
        <select
          id="mistake-subject"
          className={INPUT_CLASS}
          value={subjectId}
          onChange={(e) => {
            setSubjectId(e.target.value);
            setTopicId("");
          }}
        >
          <option value="">Ders seç</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.examType === "OZEL" ? subject.name : `${subject.name} (${subject.examType})`}
            </option>
          ))}
        </select>
      </div>

      {topics.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="mistake-topic" className={LABEL_CLASS}>
            Konu (isteğe bağlı)
          </label>
          <select
            id="mistake-topic"
            className={INPUT_CLASS}
            value={topicId}
            onChange={(e) => setTopicId(e.target.value)}
          >
            <option value="">Konu seçme</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {exams.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="mistake-exam" className={LABEL_CLASS}>
            Deneme (isteğe bağlı)
          </label>
          <select
            id="mistake-exam"
            className={INPUT_CLASS}
            value={examId}
            onChange={(e) => setExamId(e.target.value)}
          >
            <option value="">Denemeye bağlama</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.title} · {EXAM_OPTION_FORMATTER.format(new Date(exam.date))}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="mistake-reason" className={LABEL_CLASS}>
          Yanlış nedeni
        </label>
        <select
          id="mistake-reason"
          className={INPUT_CLASS}
          value={reason}
          onChange={(e) => setReason(e.target.value as MistakeReason)}
        >
          {MISTAKE_REASON_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="mistake-source" className={LABEL_CLASS}>
          Soru kaynağı (isteğe bağlı)
        </label>
        <input
          id="mistake-source"
          className={INPUT_CLASS}
          value={questionSource}
          onChange={(e) => setQuestionSource(e.target.value)}
          placeholder="Örn. Sayısal Soru Bankası s.42"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="mistake-solution" className={LABEL_CLASS}>
          Çözüm notu (isteğe bağlı)
        </label>
        <textarea
          id="mistake-solution"
          rows={2}
          className={INPUT_CLASS}
          value={solutionNote}
          onChange={(e) => setSolutionNote(e.target.value)}
        />
      </div>
    </FormSheet>
  );
}
