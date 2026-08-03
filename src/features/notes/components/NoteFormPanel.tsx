import { useEffect, useState } from "react";

import { FormSheet } from "@/components/ui/FormSheet";
import { FIELD_CLASS, INPUT_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import type { StudyNote } from "@/models/StudyNote";
import type { Subject } from "@/models/Subject";
import type { Topic } from "@/models/Topic";
import { topicRepository } from "@/repositories/topicRepository";
import { generateId } from "@/utils/id";

interface NoteFormPanelProps {
  subjects: Subject[];
  editingNote: StudyNote | null;
  onClose: () => void;
  onSave: (note: StudyNote, isNew: boolean) => Promise<void>;
}

export function NoteFormPanel({ subjects, editingNote, onClose, onSave }: NoteFormPanelProps) {
  const [title, setTitle] = useState(editingNote?.title ?? "");
  const [content, setContent] = useState(editingNote?.content ?? "");
  const [subjectId, setSubjectId] = useState(editingNote?.subjectId ?? "");
  const [topicId, setTopicId] = useState(editingNote?.topicId ?? "");
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
      setError("Nota bir başlık yaz.");
      return;
    }

    setSaving(true);
    const now = new Date().toISOString();

    const note: StudyNote = editingNote
      ? {
          ...editingNote,
          title: trimmedTitle,
          content: content.trim(),
          subjectId: subjectId || null,
          topicId: topicId || null,
          updatedAt: now,
        }
      : {
          id: generateId(),
          title: trimmedTitle,
          content: content.trim(),
          subjectId: subjectId || null,
          topicId: topicId || null,
          pinned: false,
          createdAt: now,
          updatedAt: now,
        };

    await onSave(note, !editingNote);
    setSaving(false);
  }

  return (
    <FormSheet
      title={editingNote ? "Notu düzenle" : "Yeni not"}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitting={saving}
      error={error}
    >
      <div className={FIELD_CLASS}>
        <label htmlFor="note-title" className={LABEL_CLASS}>
          Başlık
        </label>
        <input
          id="note-title"
          className={INPUT_CLASS}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Örn. Türev formülleri"
        />
      </div>

      <div className={FIELD_CLASS}>
        <label htmlFor="note-content" className={LABEL_CLASS}>
          İçerik
        </label>
        <textarea
          id="note-content"
          rows={8}
          className={INPUT_CLASS}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Notunu buraya yazabilirsin."
        />
      </div>

      {subjects.length > 0 && (
        <div className={FIELD_CLASS}>
          <label htmlFor="note-subject" className={LABEL_CLASS}>
            Ders (isteğe bağlı)
          </label>
          <select
            id="note-subject"
            className={INPUT_CLASS}
            value={subjectId}
            onChange={(e) => {
              setSubjectId(e.target.value);
              setTopicId("");
            }}
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

      {topics.length > 0 && (
        <div className={FIELD_CLASS}>
          <label htmlFor="note-topic" className={LABEL_CLASS}>
            Konu (isteğe bağlı)
          </label>
          <select
            id="note-topic"
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
    </FormSheet>
  );
}
