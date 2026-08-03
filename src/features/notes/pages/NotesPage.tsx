import { useEffect, useState } from "react";
import { MoreVertical, Pencil, Pin, PinOff, Plus, Search, StickyNote, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { INPUT_CLASS } from "@/components/ui/formStyles";
import { PageHeader } from "@/components/ui/PageHeader";
import { NoteFormPanel } from "@/features/notes/components/NoteFormPanel";
import { useSubjects } from "@/hooks/useSubjects";
import type { StudyNote } from "@/models/StudyNote";
import { studyNoteRepository } from "@/repositories/studyNoteRepository";
import { cx } from "@/utils/cx";

const UPDATED_DATE_FORMATTER = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long" });
const PREVIEW_LENGTH = 180;

function previewOf(content: string): string {
  const single = content.replace(/\s+/g, " ").trim();
  return single.length > PREVIEW_LENGTH ? `${single.slice(0, PREVIEW_LENGTH)}…` : single;
}

export function NotesPage() {
  const { subjects } = useSubjects();
  const activeSubjects = subjects.filter((s) => s.active);
  const subjectsById = new Map(subjects.map((s) => [s.id, s]));

  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<StudyNote | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  async function reload() {
    const all = await studyNoteRepository.getAll();
    // Sabitlenmiş notlar önce, ardından en son güncellenenler.
    setNotes(
      all.sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return b.updatedAt.localeCompare(a.updatedAt);
      }),
    );
  }

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  const query = search.trim().toLocaleLowerCase("tr-TR");
  const filteredNotes = notes.filter((note) => {
    if (subjectFilter && note.subjectId !== subjectFilter) return false;
    if (query.length === 0) return true;
    return (
      note.title.toLocaleLowerCase("tr-TR").includes(query) ||
      note.content.toLocaleLowerCase("tr-TR").includes(query)
    );
  });

  function openCreate() {
    setEditingNote(null);
    setFormOpen(true);
  }

  function openEdit(note: StudyNote) {
    setEditingNote(note);
    setFormOpen(true);
    setOpenMenuId(null);
  }

  async function handleSave(note: StudyNote, isNew: boolean) {
    if (isNew) {
      await studyNoteRepository.add(note);
    } else {
      await studyNoteRepository.put(note);
    }
    setFormOpen(false);
    setEditingNote(null);
    await reload();
  }

  async function togglePinned(note: StudyNote) {
    setOpenMenuId(null);
    await studyNoteRepository.put({ ...note, pinned: !note.pinned, updatedAt: new Date().toISOString() });
    await reload();
  }

  async function deleteNote(note: StudyNote) {
    setOpenMenuId(null);
    if (!window.confirm(`"${note.title}" notunu silmek istediğine emin misin?`)) return;
    await studyNoteRepository.remove(note.id);
    await reload();
  }

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <PageHeader
        title="Notlar"
        description="Formüllerini ve kısa hatırlatmalarını burada tut."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" aria-hidden />
            Not ekle
          </Button>
        }
      />

      <Card padding="sm" className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-48 flex-1 sm:max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            aria-label="Notlarda ara"
            placeholder="Başlık veya içerikte ara"
            className={cx(INPUT_CLASS, "pl-9")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {activeSubjects.length > 0 && (
          <select
            aria-label="Ders filtresi"
            className={cx(INPUT_CLASS, "w-auto min-w-44 flex-1 sm:max-w-64")}
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
          >
            <option value="">Tüm dersler</option>
            {activeSubjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.examType === "OZEL" ? subject.name : `${subject.name} (${subject.examType})`}
              </option>
            ))}
          </select>
        )}
      </Card>

      {loading ? (
        <p className="text-sm text-muted-foreground">Yükleniyor…</p>
      ) : filteredNotes.length === 0 ? (
        <EmptyState
          icon={StickyNote}
          title={notes.length === 0 ? "Henüz not eklemedin" : "Aramana uyan not yok"}
          description="Kısa notlarını ekleyip önemli olanları listenin başına sabitleyebilirsin."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredNotes.map((note) => {
            const subject = note.subjectId ? subjectsById.get(note.subjectId) : undefined;

            return (
              <Card
                key={note.id}
                variant={note.pinned ? "raised" : "plain"}
                className={cx("flex flex-col gap-2.5", note.pinned && "border-primary/30")}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                      {note.pinned && <Pin className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />}
                      <span className="truncate">{note.title}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {UPDATED_DATE_FORMATTER.format(new Date(note.updatedAt))}
                      {subject && ` · ${subject.name}`}
                    </p>
                  </div>

                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setOpenMenuId((id) => (id === note.id ? null : note.id))}
                      className="press flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                      aria-label="Not seçenekleri"
                    >
                      <MoreVertical className="h-4 w-4" aria-hidden />
                    </button>
                    {openMenuId === note.id && (
                      <div className="absolute right-0 top-10 z-20 w-48 overflow-hidden rounded-xl border border-border bg-surface shadow-lifted">
                        <button
                          type="button"
                          onClick={() => togglePinned(note)}
                          className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-foreground hover:bg-surface-muted"
                        >
                          {note.pinned ? (
                            <PinOff className="h-4 w-4" aria-hidden />
                          ) : (
                            <Pin className="h-4 w-4" aria-hidden />
                          )}
                          {note.pinned ? "Sabitlemeyi kaldır" : "Sabitle"}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(note)}
                          className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-foreground hover:bg-surface-muted"
                        >
                          <Pencil className="h-4 w-4" aria-hidden />
                          Düzenle
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteNote(note)}
                          className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-danger hover:bg-danger-soft"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                          Sil
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {note.content ? (
                  <p className="whitespace-pre-wrap break-words text-[13px] leading-relaxed text-muted-foreground">
                    {previewOf(note.content)}
                  </p>
                ) : (
                  <p className="text-[13px] italic text-muted-foreground">İçerik eklenmemiş.</p>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {formOpen && (
        <NoteFormPanel
          subjects={activeSubjects}
          editingNote={editingNote}
          onClose={() => {
            setFormOpen(false);
            setEditingNote(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
