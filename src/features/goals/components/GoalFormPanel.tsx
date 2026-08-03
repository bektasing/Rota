import { useState } from "react";

import { FormSheet } from "@/components/ui/FormSheet";
import { FIELD_CLASS, INPUT_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { defaultUnitForType, GOAL_TYPE_OPTIONS, GOAL_UNIT_OPTIONS } from "@/constants/goals";
import type { Goal, GoalType, GoalUnit } from "@/models/Goal";
import type { Subject } from "@/models/Subject";
import { addDays, toDateKey } from "@/utils/date";
import { generateId } from "@/utils/id";

interface GoalFormPanelProps {
  subjects: Subject[];
  editingGoal: Goal | null;
  onClose: () => void;
  onSave: (goal: Goal, isNew: boolean) => Promise<void>;
}

export function GoalFormPanel({ subjects, editingGoal, onClose, onSave }: GoalFormPanelProps) {
  const today = new Date();

  const [title, setTitle] = useState(editingGoal?.title ?? "");
  const [type, setType] = useState<GoalType>(editingGoal?.type ?? "study_minutes");
  const [unit, setUnit] = useState<GoalUnit>(editingGoal?.unit ?? "dakika");
  const [targetValue, setTargetValue] = useState(editingGoal ? String(editingGoal.targetValue) : "");
  const [currentValue, setCurrentValue] = useState(editingGoal ? String(editingGoal.currentValue) : "0");
  const [startDate, setStartDate] = useState(editingGoal?.startDate ?? toDateKey(today));
  const [endDate, setEndDate] = useState(editingGoal?.endDate ?? toDateKey(addDays(today, 7)));
  const [subjectId, setSubjectId] = useState(editingGoal?.subjectId ?? "");
  const [description, setDescription] = useState(editingGoal?.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function changeType(nextType: GoalType) {
    setType(nextType);
    // Kullanıcı birimi elle değiştirebilir; tür değişince mantıklı bir varsayılan öneriyoruz.
    setUnit(defaultUnitForType(nextType));
  }

  async function handleSubmit() {
    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0) {
      setError("Hedefe bir başlık yaz.");
      return;
    }

    const target = Number(targetValue);
    if (!Number.isFinite(target) || target <= 0) {
      setError("Hedef değeri sıfırdan büyük bir sayı olmalı.");
      return;
    }

    const current = currentValue.trim().length === 0 ? 0 : Number(currentValue);
    if (!Number.isFinite(current) || current < 0) {
      setError("Mevcut ilerleme negatif olamaz.");
      return;
    }

    if (endDate < startDate) {
      setError("Bitiş tarihi başlangıçtan önce olamaz.");
      return;
    }

    setSaving(true);
    const now = new Date().toISOString();

    const goal: Goal = editingGoal
      ? {
          ...editingGoal,
          title: trimmedTitle,
          description: description.trim(),
          type,
          targetValue: target,
          currentValue: current,
          unit,
          startDate,
          endDate,
          subjectId: subjectId || null,
          updatedAt: now,
        }
      : {
          id: generateId(),
          title: trimmedTitle,
          description: description.trim(),
          type,
          targetValue: target,
          currentValue: current,
          unit,
          startDate,
          endDate,
          subjectId: subjectId || null,
          status: "active",
          createdAt: now,
          updatedAt: now,
          completedAt: null,
        };

    await onSave(goal, !editingGoal);
    setSaving(false);
  }

  return (
    <FormSheet
      title={editingGoal ? "Hedefi düzenle" : "Yeni hedef"}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitting={saving}
      error={error}
    >
      <div className={FIELD_CLASS}>
        <label htmlFor="goal-title" className={LABEL_CLASS}>
          Başlık
        </label>
        <input
          id="goal-title"
          className={INPUT_CLASS}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Örn. Bu hafta 900 dakika çalış"
        />
      </div>

      <div className={FIELD_CLASS}>
        <label htmlFor="goal-type" className={LABEL_CLASS}>
          Hedef türü
        </label>
        <select
          id="goal-type"
          className={INPUT_CLASS}
          value={type}
          onChange={(e) => changeType(e.target.value as GoalType)}
        >
          {GOAL_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={FIELD_CLASS}>
          <label htmlFor="goal-target" className={LABEL_CLASS}>
            Hedef değeri
          </label>
          <input
            id="goal-target"
            type="number"
            min={1}
            className={INPUT_CLASS}
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            placeholder="Örn. 900"
          />
        </div>
        <div className={FIELD_CLASS}>
          <label htmlFor="goal-unit" className={LABEL_CLASS}>
            Birim
          </label>
          <select
            id="goal-unit"
            className={INPUT_CLASS}
            value={unit}
            onChange={(e) => setUnit(e.target.value as GoalUnit)}
          >
            {GOAL_UNIT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={FIELD_CLASS}>
        <label htmlFor="goal-current" className={LABEL_CLASS}>
          Mevcut ilerleme
        </label>
        <input
          id="goal-current"
          type="number"
          min={0}
          className={INPUT_CLASS}
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={FIELD_CLASS}>
          <label htmlFor="goal-start" className={LABEL_CLASS}>
            Başlangıç
          </label>
          <input
            id="goal-start"
            type="date"
            className={INPUT_CLASS}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className={FIELD_CLASS}>
          <label htmlFor="goal-end" className={LABEL_CLASS}>
            Bitiş
          </label>
          <input
            id="goal-end"
            type="date"
            className={INPUT_CLASS}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {subjects.length > 0 && (
        <div className={FIELD_CLASS}>
          <label htmlFor="goal-subject" className={LABEL_CLASS}>
            Ders (isteğe bağlı)
          </label>
          <select
            id="goal-subject"
            className={INPUT_CLASS}
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
          >
            <option value="">Derse bağlama</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.examType === "OZEL" ? subject.name : `${subject.name} (${subject.examType})`}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className={FIELD_CLASS}>
        <label htmlFor="goal-description" className={LABEL_CLASS}>
          Açıklama (isteğe bağlı)
        </label>
        <textarea
          id="goal-description"
          rows={2}
          className={INPUT_CLASS}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
    </FormSheet>
  );
}
