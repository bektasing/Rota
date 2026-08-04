import { useEffect, useRef, useState } from "react";

import { FormSheet } from "@/components/ui/FormSheet";
import { FIELD_CLASS, INPUT_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { QuickChoiceChip } from "@/components/ui/QuickChoiceChip";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import {
  QUICK_DAY_OPTIONS,
  QUICK_DURATION_PRESETS,
  QUICK_QUESTION_PRESETS,
  QUICK_WORK_TYPE_OPTIONS,
  type QuickTemplate,
} from "@/constants/quickPlan";
import { getQuickPlanMemory, setQuickPlanMemory } from "@/features/planner/quickPlanMemory";
import type { ExamType, Subject } from "@/models/Subject";
import type { StudyTask, TaskType } from "@/models/StudyTask";
import type { Topic } from "@/models/Topic";
import { topicRepository } from "@/repositories/topicRepository";
import { ensureTopicCatalogSeeded } from "@/services/topicCatalogService";
import { generateId } from "@/utils/id";
import { buildAutoTitle, resolveQuickDayKey, type QuickDayOption, type QuickPlanDeepLink } from "@/utils/quickPlan";

const EXAM_TYPE_TAB_OPTIONS: { value: ExamType; label: string }[] = [
  { value: "TYT", label: "TYT" },
  { value: "AYT", label: "AYT" },
  { value: "OZEL", label: "Özel" },
];

interface QuickPlanPanelProps {
  subjects: Subject[];
  /** Planlayıcıda o an görüntülenen gün; "Tarih seç" alanının başlangıç değeri olarak kullanılır. */
  defaultDate: string;
  deepLink: QuickPlanDeepLink | null;
  initialTemplate: QuickTemplate | null;
  onClose: () => void;
  onSave: (task: StudyTask) => Promise<void>;
}

type PresetOrCustom = number | "custom";

function resolveNumericValue(preset: PresetOrCustom, customText: string): number | null {
  if (preset === "custom") {
    const parsed = Number(customText);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }
  return preset;
}

export function QuickPlanPanel({
  subjects,
  defaultDate,
  deepLink,
  initialTemplate,
  onClose,
  onSave,
}: QuickPlanPanelProps) {
  const memory = getQuickPlanMemory();
  const deepLinkSubject = deepLink?.subjectId ? subjects.find((s) => s.id === deepLink.subjectId) : undefined;

  const [examType, setExamType] = useState<ExamType>(deepLinkSubject?.examType ?? deepLink?.examType ?? memory.examType);
  const [subjectId, setSubjectId] = useState<string>(
    deepLinkSubject?.id ?? (subjects.some((s) => s.id === memory.subjectId && s.active) ? (memory.subjectId ?? "") : ""),
  );
  const [topicId, setTopicId] = useState<string>(deepLink?.topicId ?? "");
  const [topics, setTopics] = useState<Topic[]>([]);

  const [workType, setWorkType] = useState<TaskType>(initialTemplate?.workType ?? "topic_study");
  const [dayOption, setDayOption] = useState<QuickDayOption>("today");
  const [customDate, setCustomDate] = useState(defaultDate);

  const [durationPreset, setDurationPreset] = useState<PresetOrCustom>(initialTemplate?.minutes ?? 45);
  const [durationCustomText, setDurationCustomText] = useState("");
  const [questionPreset, setQuestionPreset] = useState<PresetOrCustom>(initialTemplate?.questionTarget ?? 40);
  const [questionCustomText, setQuestionCustomText] = useState("");

  const [title, setTitle] = useState("");
  const [titleTouched, setTitleTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Bir önceki dersi tutar; StrictMode'un efektleri iki kez çalıştırması "ilk render mi"
  // gibi bir boolean bayrakla güvenilir ayırt edilemediği için, gerçek değişimi anlamak
  // amacıyla önceki değerle karşılaştırma yapılır (bkz. aşağıdaki efekt).
  const prevSubjectIdRef = useRef(subjectId);

  const availableSubjects = subjects.filter((s) => s.active && s.examType === examType);
  const resolvedDuration = resolveNumericValue(durationPreset, durationCustomText);
  const resolvedQuestionTarget = resolveNumericValue(questionPreset, questionCustomText);

  // Konu listesi seçili derse göre yüklenir. Kullanıcı dersi elle değiştirdiğinde konu
  // seçimi sıfırlanır (ilk/deep-link yüklemesinde dokunulmaz); deep-link'ten gelen
  // geçersiz/silinmiş bir topicId varsa (ders/konu artık yoksa) uygulama çökmeden
  // sessizce boş seçime döner.
  useEffect(() => {
    const subjectChanged = prevSubjectIdRef.current !== subjectId;
    prevSubjectIdRef.current = subjectId;

    if (subjectChanged) {
      setTopicId("");
    }

    if (!subjectId) {
      setTopics([]);
      return;
    }

    let cancelled = false;
    ensureTopicCatalogSeeded()
      .then(() => topicRepository.getBySubjectId(subjectId))
      .then((found) => {
        if (cancelled) return;
        const sorted = found.sort((a, b) => a.order - b.order);
        setTopics(sorted);
        setTopicId((current) => (current && !sorted.some((t) => t.id === current) ? "" : current));
      });
    return () => {
      cancelled = true;
    };
  }, [subjectId]);

  useEffect(() => {
    if (titleTouched) return;
    const subject = subjects.find((s) => s.id === subjectId);
    if (!subject) {
      setTitle("");
      return;
    }
    const topic = topics.find((t) => t.id === topicId);
    setTitle(
      buildAutoTitle({
        examType: subject.examType,
        subjectName: subject.name,
        topicName: topic ? topic.name : null,
        workType,
        questionTarget: resolvedQuestionTarget,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId, topicId, workType, resolvedQuestionTarget, titleTouched]);

  function handleExamTypeChange(next: ExamType) {
    setExamType(next);
    setSubjectId((current) => {
      const stillValid = subjects.some((s) => s.id === current && s.active && s.examType === next);
      return stillValid ? current : "";
    });
  }

  async function handleSubmit() {
    setError(null);

    if (!subjectId) {
      setError("Bir ders seç.");
      return;
    }

    const dateKey = dayOption === "custom" ? customDate : resolveQuickDayKey(dayOption, customDate);
    if (!dateKey) {
      setError("Bir tarih seç.");
      return;
    }

    let estimatedMinutes: number | null = null;
    let questionTargetValue: number | null = null;

    if (workType === "question_solving") {
      questionTargetValue = resolvedQuestionTarget;
      if (!questionTargetValue) {
        setError("Bir soru hedefi seç.");
        return;
      }
    } else {
      estimatedMinutes = resolvedDuration;
      if (!estimatedMinutes) {
        setError("Bir süre seç.");
        return;
      }
    }

    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0) {
      setError("Görev için bir başlık yaz.");
      return;
    }

    setSaving(true);
    const now = new Date().toISOString();
    const task: StudyTask = {
      id: generateId(),
      title: trimmedTitle,
      subjectId,
      topicId: topicId || null,
      taskType: workType,
      date: dateKey,
      startTime: null,
      estimatedMinutes,
      questionTarget: questionTargetValue,
      priority: "medium",
      notes: "",
      completed: false,
      completedAt: null,
      actualMinutes: null,
      actualQuestions: null,
      isPinned: false,
      createdAt: now,
      updatedAt: now,
    };

    setQuickPlanMemory({ examType, subjectId });
    await onSave(task);
    setSaving(false);
  }

  return (
    <FormSheet
      title="Hızlı Planla"
      description="Bugünün planını birlikte hazırlayalım."
      onClose={onClose}
      onSubmit={handleSubmit}
      submitting={saving}
      error={error}
    >
      <div className={FIELD_CLASS}>
        <span className={LABEL_CLASS}>Sınav türü</span>
        <SegmentedControl ariaLabel="Sınav türü" value={examType} onChange={handleExamTypeChange} options={EXAM_TYPE_TAB_OPTIONS} />
      </div>

      <div className={FIELD_CLASS}>
        <label htmlFor="quick-subject" className={LABEL_CLASS}>
          Ders
        </label>
        <select
          id="quick-subject"
          className={INPUT_CLASS}
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
        >
          <option value="">Ders seç</option>
          {availableSubjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
        {availableSubjects.length === 0 && (
          <p className="text-xs text-muted-foreground">Bu türde aktif ders bulunamadı.</p>
        )}
      </div>

      {subjectId && topics.length > 0 && (
        <div className={FIELD_CLASS}>
          <label htmlFor="quick-topic" className={LABEL_CLASS}>
            Konu (isteğe bağlı)
          </label>
          <select
            id="quick-topic"
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

      <div className={FIELD_CLASS}>
        <span className={LABEL_CLASS}>Çalışma türü</span>
        <div className="flex flex-wrap gap-2">
          {QUICK_WORK_TYPE_OPTIONS.map((option) => (
            <QuickChoiceChip key={option.value} active={workType === option.value} onClick={() => setWorkType(option.value)}>
              {option.label}
            </QuickChoiceChip>
          ))}
        </div>
      </div>

      <div className={FIELD_CLASS}>
        <span className={LABEL_CLASS}>Gün</span>
        <div className="flex flex-wrap gap-2">
          {QUICK_DAY_OPTIONS.map((option) => (
            <QuickChoiceChip key={option.value} active={dayOption === option.value} onClick={() => setDayOption(option.value)}>
              {option.label}
            </QuickChoiceChip>
          ))}
        </div>
        {dayOption === "custom" && (
          <input
            type="date"
            className={INPUT_CLASS}
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
          />
        )}
      </div>

      {workType === "question_solving" ? (
        <div className={FIELD_CLASS}>
          <span className={LABEL_CLASS}>Soru hedefi</span>
          <div className="flex flex-wrap gap-2">
            {QUICK_QUESTION_PRESETS.map((value) => (
              <QuickChoiceChip key={value} active={questionPreset === value} onClick={() => setQuestionPreset(value)}>
                {value} soru
              </QuickChoiceChip>
            ))}
            <QuickChoiceChip active={questionPreset === "custom"} onClick={() => setQuestionPreset("custom")}>
              Özel
            </QuickChoiceChip>
          </div>
          {questionPreset === "custom" && (
            <input
              type="number"
              min={1}
              className={INPUT_CLASS}
              placeholder="Soru sayısı"
              value={questionCustomText}
              onChange={(e) => setQuestionCustomText(e.target.value)}
            />
          )}
        </div>
      ) : (
        <div className={FIELD_CLASS}>
          <span className={LABEL_CLASS}>Süre</span>
          <div className="flex flex-wrap gap-2">
            {QUICK_DURATION_PRESETS.map((value) => (
              <QuickChoiceChip key={value} active={durationPreset === value} onClick={() => setDurationPreset(value)}>
                {value} dk
              </QuickChoiceChip>
            ))}
            <QuickChoiceChip active={durationPreset === "custom"} onClick={() => setDurationPreset("custom")}>
              Özel
            </QuickChoiceChip>
          </div>
          {durationPreset === "custom" && (
            <input
              type="number"
              min={1}
              className={INPUT_CLASS}
              placeholder="Dakika"
              value={durationCustomText}
              onChange={(e) => setDurationCustomText(e.target.value)}
            />
          )}
        </div>
      )}

      <div className={FIELD_CLASS}>
        <label htmlFor="quick-title" className={LABEL_CLASS}>
          Başlık
        </label>
        <input
          id="quick-title"
          className={INPUT_CLASS}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setTitleTouched(true);
          }}
        />
      </div>
    </FormSheet>
  );
}
