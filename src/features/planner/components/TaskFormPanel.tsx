import { useEffect, useState } from "react";

import { FormSheet } from "@/components/ui/FormSheet";
import { FIELD_CLASS, INPUT_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { TASK_PRIORITY_OPTIONS, TASK_TYPE_OPTIONS } from "@/constants/taskTypes";
import type { Subject } from "@/models/Subject";
import type { StudyTask, TaskPriority, TaskType } from "@/models/StudyTask";
import type { Topic } from "@/models/Topic";
import { topicRepository } from "@/repositories/topicRepository";
import { cx } from "@/utils/cx";
import { generateId } from "@/utils/id";

interface TaskFormPanelProps {
  subjects: Subject[];
  defaultDate: string;
  editingTask: StudyTask | null;
  onClose: () => void;
  onSave: (task: StudyTask) => Promise<void>;
}

interface FormState {
  title: string;
  subjectId: string;
  topicId: string;
  taskType: TaskType;
  date: string;
  startTime: string;
  estimatedMinutes: string;
  questionTarget: string;
  priority: TaskPriority;
  notes: string;
}

function buildInitialForm(defaultDate: string, editingTask: StudyTask | null): FormState {
  if (editingTask) {
    return {
      title: editingTask.title,
      subjectId: editingTask.subjectId ?? "",
      topicId: editingTask.topicId ?? "",
      taskType: editingTask.taskType,
      date: editingTask.date,
      startTime: editingTask.startTime ?? "",
      estimatedMinutes: editingTask.estimatedMinutes != null ? String(editingTask.estimatedMinutes) : "",
      questionTarget: editingTask.questionTarget != null ? String(editingTask.questionTarget) : "",
      priority: editingTask.priority,
      notes: editingTask.notes,
    };
  }

  return {
    title: "",
    subjectId: "",
    topicId: "",
    taskType: "topic_study",
    date: defaultDate,
    startTime: "",
    estimatedMinutes: "45",
    questionTarget: "",
    priority: "medium",
    notes: "",
  };
}

export function TaskFormPanel({ subjects, defaultDate, editingTask, onClose, onSave }: TaskFormPanelProps) {
  const [form, setForm] = useState<FormState>(() => buildInitialForm(defaultDate, editingTask));
  const [topics, setTopics] = useState<Topic[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!form.subjectId) {
      setTopics([]);
      return;
    }
    let cancelled = false;
    topicRepository.getBySubjectId(form.subjectId).then((found) => {
      if (!cancelled) setTopics(found);
    });
    return () => {
      cancelled = true;
    };
  }, [form.subjectId]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit() {
    const title = form.title.trim();
    const estimatedMinutes = Number(form.estimatedMinutes);

    if (title.length === 0) {
      setError("Görev için bir başlık yaz.");
      return;
    }
    if (!form.subjectId) {
      setError("Bir ders seç.");
      return;
    }
    if (!form.date) {
      setError("Bir tarih seç.");
      return;
    }
    if (!Number.isFinite(estimatedMinutes) || estimatedMinutes <= 0) {
      setError("Tahmini süreyi dakika cinsinden gir.");
      return;
    }

    setSaving(true);
    const now = new Date().toISOString();
    const questionTarget = form.questionTarget.trim().length > 0 ? Number(form.questionTarget) : null;

    const task: StudyTask = editingTask
      ? {
          ...editingTask,
          title,
          subjectId: form.subjectId,
          topicId: form.topicId || null,
          taskType: form.taskType,
          date: form.date,
          startTime: form.startTime || null,
          estimatedMinutes,
          questionTarget,
          priority: form.priority,
          notes: form.notes.trim(),
          updatedAt: now,
        }
      : {
          id: generateId(),
          title,
          subjectId: form.subjectId,
          topicId: form.topicId || null,
          taskType: form.taskType,
          date: form.date,
          startTime: form.startTime || null,
          estimatedMinutes,
          questionTarget,
          priority: form.priority,
          notes: form.notes.trim(),
          completed: false,
          completedAt: null,
          actualMinutes: null,
          actualQuestions: null,
          isPinned: false,
          createdAt: now,
          updatedAt: now,
        };

    await onSave(task);
    setSaving(false);
  }

  return (
    <FormSheet
      title={editingTask ? "Görevi düzenle" : "Yeni görev"}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitting={saving}
      error={error}
    >
      <div className={FIELD_CLASS}>
        <label htmlFor="task-title" className={LABEL_CLASS}>
          Başlık
        </label>
        <input
          id="task-title"
          className={INPUT_CLASS}
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="Örn. Türev soru çözümü"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="task-subject" className={LABEL_CLASS}>
          Ders
        </label>
        <select
          id="task-subject"
          className={INPUT_CLASS}
          value={form.subjectId}
          onChange={(e) => update("subjectId", e.target.value)}
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
          <label htmlFor="task-topic" className={LABEL_CLASS}>
            Konu (isteğe bağlı)
          </label>
          <select
            id="task-topic"
            className={INPUT_CLASS}
            value={form.topicId}
            onChange={(e) => update("topicId", e.target.value)}
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

      <div className="flex flex-col gap-1.5">
        <label htmlFor="task-type" className={LABEL_CLASS}>
          Görev türü
        </label>
        <select
          id="task-type"
          className={INPUT_CLASS}
          value={form.taskType}
          onChange={(e) => update("taskType", e.target.value as TaskType)}
        >
          {TASK_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="task-date" className={LABEL_CLASS}>
            Tarih
          </label>
          <input
            id="task-date"
            type="date"
            className={INPUT_CLASS}
            value={form.date}
            onChange={(e) => update("date", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="task-time" className={LABEL_CLASS}>
            Saat (isteğe bağlı)
          </label>
          <input
            id="task-time"
            type="time"
            className={INPUT_CLASS}
            value={form.startTime}
            onChange={(e) => update("startTime", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="task-minutes" className={LABEL_CLASS}>
            Tahmini süre (dk)
          </label>
          <input
            id="task-minutes"
            type="number"
            min={1}
            className={INPUT_CLASS}
            value={form.estimatedMinutes}
            onChange={(e) => update("estimatedMinutes", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="task-questions" className={LABEL_CLASS}>
            Soru hedefi (isteğe bağlı)
          </label>
          <input
            id="task-questions"
            type="number"
            min={0}
            className={INPUT_CLASS}
            value={form.questionTarget}
            onChange={(e) => update("questionTarget", e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className={LABEL_CLASS}>Öncelik</span>
        <div className="flex gap-2">
          {TASK_PRIORITY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => update("priority", option.value)}
              className={cx(
                "press min-h-11 flex-1 rounded-xl border px-3 text-sm font-semibold",
                form.priority === option.value
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
        <label htmlFor="task-notes" className={LABEL_CLASS}>
          Not (isteğe bağlı)
        </label>
        <textarea
          id="task-notes"
          className={INPUT_CLASS}
          rows={2}
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
        />
      </div>
    </FormSheet>
  );
}
