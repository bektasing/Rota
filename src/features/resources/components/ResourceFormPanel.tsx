import { useState } from "react";
import { Star } from "lucide-react";

import { FormSheet } from "@/components/ui/FormSheet";
import { FIELD_CLASS, INPUT_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { RESOURCE_STATUS_OPTIONS, RESOURCE_TYPE_OPTIONS } from "@/constants/resources";
import type { ResourceStatus, ResourceType, StudyResource } from "@/models/StudyResource";
import type { Subject } from "@/models/Subject";
import { cx } from "@/utils/cx";
import { generateId } from "@/utils/id";

interface ResourceFormPanelProps {
  subjects: Subject[];
  editingResource: StudyResource | null;
  onClose: () => void;
  onSave: (resource: StudyResource, isNew: boolean) => Promise<void>;
}

export function ResourceFormPanel({ subjects, editingResource, onClose, onSave }: ResourceFormPanelProps) {
  const [title, setTitle] = useState(editingResource?.title ?? "");
  const [type, setType] = useState<ResourceType>(editingResource?.type ?? "question_bank");
  const [subjectId, setSubjectId] = useState(editingResource?.subjectId ?? "");
  const [publisherOrSource, setPublisherOrSource] = useState(editingResource?.publisherOrSource ?? "");
  const [totalUnits, setTotalUnits] = useState(
    editingResource?.totalUnits != null ? String(editingResource.totalUnits) : "",
  );
  const [completedUnits, setCompletedUnits] = useState(String(editingResource?.completedUnits ?? 0));
  const [status, setStatus] = useState<ResourceStatus>(editingResource?.status ?? "planned");
  const [rating, setRating] = useState<number | null>(editingResource?.rating ?? null);
  const [note, setNote] = useState(editingResource?.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0) {
      setError("Kaynağa bir ad yaz.");
      return;
    }

    const total = totalUnits.trim().length === 0 ? null : Number(totalUnits);
    if (total !== null && (!Number.isFinite(total) || total <= 0)) {
      setError("Toplam miktar sıfırdan büyük olmalı ya da boş bırakılmalı.");
      return;
    }

    const completed = completedUnits.trim().length === 0 ? 0 : Number(completedUnits);
    if (!Number.isFinite(completed) || completed < 0) {
      setError("Tamamlanan miktar negatif olamaz.");
      return;
    }

    setSaving(true);
    const now = new Date().toISOString();

    const resource: StudyResource = editingResource
      ? {
          ...editingResource,
          title: trimmedTitle,
          type,
          subjectId: subjectId || null,
          publisherOrSource: publisherOrSource.trim(),
          totalUnits: total,
          completedUnits: completed,
          status,
          rating,
          note: note.trim(),
          updatedAt: now,
        }
      : {
          id: generateId(),
          title: trimmedTitle,
          type,
          subjectId: subjectId || null,
          publisherOrSource: publisherOrSource.trim(),
          totalUnits: total,
          completedUnits: completed,
          status,
          rating,
          note: note.trim(),
          createdAt: now,
          updatedAt: now,
        };

    await onSave(resource, !editingResource);
    setSaving(false);
  }

  return (
    <FormSheet
      title={editingResource ? "Kaynağı düzenle" : "Yeni kaynak"}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitting={saving}
      error={error}
    >
      <div className={FIELD_CLASS}>
        <label htmlFor="resource-title" className={LABEL_CLASS}>
          Kaynak adı
        </label>
        <input
          id="resource-title"
          className={INPUT_CLASS}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Örn. TYT Matematik Soru Bankası"
        />
      </div>

      <div className={FIELD_CLASS}>
        <label htmlFor="resource-type" className={LABEL_CLASS}>
          Tür
        </label>
        <select
          id="resource-type"
          className={INPUT_CLASS}
          value={type}
          onChange={(e) => setType(e.target.value as ResourceType)}
        >
          {RESOURCE_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {subjects.length > 0 && (
        <div className={FIELD_CLASS}>
          <label htmlFor="resource-subject" className={LABEL_CLASS}>
            Ders (isteğe bağlı)
          </label>
          <select
            id="resource-subject"
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
        <label htmlFor="resource-publisher" className={LABEL_CLASS}>
          Yayın veya kaynak (isteğe bağlı)
        </label>
        <input
          id="resource-publisher"
          className={INPUT_CLASS}
          value={publisherOrSource}
          onChange={(e) => setPublisherOrSource(e.target.value)}
          placeholder="Örn. Palme"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={FIELD_CLASS}>
          <label htmlFor="resource-total" className={LABEL_CLASS}>
            Toplam (isteğe bağlı)
          </label>
          <input
            id="resource-total"
            type="number"
            min={1}
            className={INPUT_CLASS}
            value={totalUnits}
            onChange={(e) => setTotalUnits(e.target.value)}
            placeholder="Test/video/sayfa"
          />
        </div>
        <div className={FIELD_CLASS}>
          <label htmlFor="resource-completed" className={LABEL_CLASS}>
            Tamamlanan
          </label>
          <input
            id="resource-completed"
            type="number"
            min={0}
            className={INPUT_CLASS}
            value={completedUnits}
            onChange={(e) => setCompletedUnits(e.target.value)}
          />
        </div>
      </div>

      <div className={FIELD_CLASS}>
        <label htmlFor="resource-status" className={LABEL_CLASS}>
          Durum
        </label>
        <select
          id="resource-status"
          className={INPUT_CLASS}
          value={status}
          onChange={(e) => setStatus(e.target.value as ResourceStatus)}
        >
          {RESOURCE_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className={FIELD_CLASS}>
        <span className={LABEL_CLASS}>Puan (isteğe bağlı)</span>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(rating === value ? null : value)}
              className="press flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-muted"
              aria-label={`${value} puan`}
              aria-pressed={rating != null && value <= rating}
            >
              <Star
                className={cx(
                  "h-5 w-5",
                  rating != null && value <= rating ? "fill-warning text-warning" : "text-muted-foreground",
                )}
                aria-hidden
              />
            </button>
          ))}
          {rating != null && (
            <button
              type="button"
              onClick={() => setRating(null)}
              className="press ml-1 text-[13px] font-semibold text-muted-foreground hover:text-foreground"
            >
              Temizle
            </button>
          )}
        </div>
      </div>

      <div className={FIELD_CLASS}>
        <label htmlFor="resource-note" className={LABEL_CLASS}>
          Not (isteğe bağlı)
        </label>
        <textarea
          id="resource-note"
          rows={2}
          className={INPUT_CLASS}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
    </FormSheet>
  );
}
