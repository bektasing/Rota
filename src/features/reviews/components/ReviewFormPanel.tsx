import { useEffect, useState } from "react";

import { FormSheet } from "@/components/ui/FormSheet";
import { FIELD_CLASS, INPUT_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import type { Subject } from "@/models/Subject";
import type { ReviewItem } from "@/models/ReviewItem";
import type { Topic } from "@/models/Topic";
import { topicRepository } from "@/repositories/topicRepository";
import { toDateKey } from "@/utils/date";
import { generateId } from "@/utils/id";

interface ReviewFormPanelProps {
  subjects: Subject[];
  onClose: () => void;
  onSave: (item: ReviewItem) => Promise<void>;
}

export function ReviewFormPanel({ subjects, onClose, onSave }: ReviewFormPanelProps) {
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [date, setDate] = useState(toDateKey(new Date()));
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
      setError("Tekrar için bir başlık yaz.");
      return;
    }
    if (!subjectId) {
      setError("Bir ders seç.");
      return;
    }
    if (!date) {
      setError("Bir tarih seç.");
      return;
    }

    setSaving(true);
    const now = new Date().toISOString();
    const item: ReviewItem = {
      id: generateId(),
      mistakeId: null,
      subjectId,
      topicId: topicId || null,
      title: trimmedTitle,
      scheduledDate: date,
      stage: "day1",
      status: "pending",
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    await onSave(item);
    setSaving(false);
  }

  return (
    <FormSheet
      title="Yeni tekrar"
      description="Manuel eklenen tekrarlar tek seferliktir."
      onClose={onClose}
      onSubmit={handleSubmit}
      submitting={saving}
      error={error}
    >
      <div className={FIELD_CLASS}>
        <label htmlFor="review-title" className={LABEL_CLASS}>
          Başlık
        </label>
        <input
          id="review-title"
          className={INPUT_CLASS}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Örn. Paragraf soruları tekrarı"
        />
      </div>

      <div className={FIELD_CLASS}>
        <label htmlFor="review-subject" className={LABEL_CLASS}>
          Ders
        </label>
        <select
          id="review-subject"
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
        <div className={FIELD_CLASS}>
          <label htmlFor="review-topic" className={LABEL_CLASS}>
            Konu (isteğe bağlı)
          </label>
          <select
            id="review-topic"
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
        <label htmlFor="review-date" className={LABEL_CLASS}>
          Tarih
        </label>
        <input
          id="review-date"
          type="date"
          className={INPUT_CLASS}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
    </FormSheet>
  );
}
