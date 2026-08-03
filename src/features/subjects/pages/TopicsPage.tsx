import { useEffect, useState } from "react";
import { ArrowLeft, Library, Plus, Trash2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { INPUT_CLASS } from "@/components/ui/formStyles";
import { TOPIC_STATUS_OPTIONS } from "@/constants/topicStatus";
import { ROUTES } from "@/constants/routes";
import type { Subject } from "@/models/Subject";
import type { Topic, TopicStatus } from "@/models/Topic";
import { subjectRepository } from "@/repositories/subjectRepository";
import { topicRepository } from "@/repositories/topicRepository";
import { cx } from "@/utils/cx";
import { generateId } from "@/utils/id";

const STATUS_BADGE_CLASS: Record<TopicStatus, string> = {
  not_started: "border-border bg-surface-muted text-muted-foreground",
  in_progress: "border-primary/40 bg-primary-soft text-primary",
  completed: "border-success/40 bg-success-soft text-success",
  review_needed: "border-warning/40 bg-warning-soft text-warning",
};

export function TopicsPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTopicName, setNewTopicName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  async function reload() {
    if (!subjectId) return;
    const [found, subjectTopics] = await Promise.all([
      subjectRepository.getById(subjectId),
      topicRepository.getBySubjectId(subjectId),
    ]);
    setSubject(found ?? null);
    setTopics(subjectTopics.sort((a, b) => a.order - b.order));
  }

  useEffect(() => {
    reload().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId]);

  async function addTopic() {
    const trimmed = newTopicName.trim();
    if (trimmed.length === 0 || !subjectId) return;
    const now = new Date().toISOString();
    const maxOrder = topics.reduce((max, t) => Math.max(max, t.order), -1);
    await topicRepository.add({
      id: generateId(),
      subjectId,
      name: trimmed,
      status: "not_started",
      difficulty: "medium",
      priority: "medium",
      masteryScore: 0,
      totalStudyMinutes: 0,
      totalQuestions: 0,
      correctCount: 0,
      incorrectCount: 0,
      blankCount: 0,
      lastStudiedAt: null,
      nextReviewAt: null,
      notes: "",
      order: maxOrder + 1,
      createdAt: now,
      updatedAt: now,
    });
    setNewTopicName("");
    await reload();
  }

  function startEdit(topic: Topic) {
    setEditingId(topic.id);
    setEditingName(topic.name);
  }

  async function saveEdit(topic: Topic) {
    const trimmed = editingName.trim();
    if (trimmed.length === 0) return;
    await topicRepository.put({ ...topic, name: trimmed, updatedAt: new Date().toISOString() });
    setEditingId(null);
    await reload();
  }

  async function changeStatus(topic: Topic, status: TopicStatus) {
    await topicRepository.put({ ...topic, status, updatedAt: new Date().toISOString() });
    await reload();
  }

  async function deleteTopic(topic: Topic) {
    if (!window.confirm(`"${topic.name}" konusunu silmek istediğine emin misin?`)) return;
    await topicRepository.remove(topic.id);
    await reload();
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Yükleniyor…</p>;
  }

  if (!subject) {
    return (
      <div className="max-w-2xl">
        <EmptyState icon={Library} title="Ders bulunamadı" description="Bu ders artık mevcut değil." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Link
        to={ROUTES.moreSubjects}
        className="inline-flex w-fit items-center gap-1.5 text-[13px] font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Dersler
      </Link>

      <div className="flex flex-wrap items-center gap-2.5">
        <span className="h-8 w-1.5 rounded-full" style={{ backgroundColor: subject.color }} aria-hidden />
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{subject.name}</h1>
        {subject.examType !== "OZEL" && (
          <span className="rounded-full bg-surface-muted px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
            {subject.examType}
          </span>
        )}
        <span className="text-[13px] text-muted-foreground">{topics.length} konu</span>
      </div>

      <Card padding="sm" className="flex max-w-xl items-center gap-2">
        <input
          className={INPUT_CLASS}
          placeholder="Yeni konu adı"
          value={newTopicName}
          onChange={(e) => setNewTopicName(e.target.value)}
        />
        <button
          type="button"
          onClick={addTopic}
          disabled={newTopicName.trim().length === 0}
          className="press bg-brand-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Konu ekle"
        >
          <Plus className="h-4 w-4" aria-hidden />
        </button>
      </Card>

      {topics.length === 0 ? (
        <EmptyState
          icon={Library}
          title="Henüz konu eklenmedi"
          description="Bu ders için konularını yukarıdan ekleyebilirsin."
        />
      ) : (
        <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
          {topics.map((topic) => (
            <Card key={topic.id} padding="sm" className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                {editingId === topic.id ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      className={INPUT_CLASS}
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      autoFocus
                    />
                    <Button size="sm" onClick={() => saveEdit(topic)}>
                      Kaydet
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      Vazgeç
                    </Button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => startEdit(topic)}
                      className="min-w-0 flex-1 truncate text-left text-sm font-semibold text-foreground hover:text-primary"
                    >
                      {topic.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteTopic(topic)}
                      className="press flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-danger-soft hover:text-danger"
                      aria-label="Konuyu sil"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {TOPIC_STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => changeStatus(topic, option.value)}
                    className={cx(
                      "press rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                      topic.status === option.value
                        ? STATUS_BADGE_CLASS[option.value]
                        : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
