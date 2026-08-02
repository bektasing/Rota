import { useEffect, useState } from "react";
import { ChevronRight, Pencil, Plus } from "lucide-react";
import { Link } from "react-router-dom";

import { Card } from "@/components/ui/Card";
import { ROUTES } from "@/constants/routes";
import type { ExamType, Subject } from "@/models/Subject";
import { subjectRepository } from "@/repositories/subjectRepository";
import { ensureDefaultSubjectsSeeded } from "@/services/bootstrapService";
import { cx } from "@/utils/cx";
import { generateId } from "@/utils/id";

const GROUPS: { examType: ExamType; title: string }[] = [
  { examType: "TYT", title: "TYT" },
  { examType: "AYT", title: "AYT Sayısal" },
  { examType: "OZEL", title: "Özel dersler" },
];

const INPUT_CLASS =
  "w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";

function subjectLabel(subject: Subject): string {
  if (subject.examType === "OZEL") return subject.name;
  return `${subject.name} (${subject.examType})`;
}

export function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [newSubjectName, setNewSubjectName] = useState("");

  async function reload() {
    const all = await subjectRepository.getAll();
    setSubjects(all.sort((a, b) => a.order - b.order));
  }

  useEffect(() => {
    ensureDefaultSubjectsSeeded()
      .then(reload)
      .finally(() => setLoading(false));
  }, []);

  async function toggleActive(subject: Subject) {
    await subjectRepository.put({ ...subject, active: !subject.active, updatedAt: new Date().toISOString() });
    await reload();
  }

  function startEdit(subject: Subject) {
    setEditingId(subject.id);
    setEditingName(subject.name);
  }

  async function saveEdit(subject: Subject) {
    const trimmed = editingName.trim();
    if (trimmed.length === 0) return;
    await subjectRepository.put({ ...subject, name: trimmed, updatedAt: new Date().toISOString() });
    setEditingId(null);
    await reload();
  }

  async function addCustomSubject() {
    const trimmed = newSubjectName.trim();
    if (trimmed.length === 0) return;
    const now = new Date().toISOString();
    const maxOrder = subjects.reduce((max, s) => Math.max(max, s.order), -1);
    await subjectRepository.add({
      id: generateId(),
      name: trimmed,
      examType: "OZEL",
      color: "#9569C7",
      icon: "BookOpen",
      active: true,
      order: maxOrder + 1,
      createdAt: now,
      updatedAt: now,
    });
    setNewSubjectName("");
    await reload();
  }

  if (loading) {
    return <div className="p-4 text-sm text-muted-foreground md:p-6">Yükleniyor…</div>;
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5 p-4 md:p-6">
      <h1 className="text-xl font-semibold text-foreground">Dersler ve Konular</h1>

      {GROUPS.map((group) => {
        const groupSubjects = subjects.filter((s) => s.examType === group.examType);
        if (groupSubjects.length === 0 && group.examType !== "OZEL") return null;

        return (
          <div key={group.examType} className="flex flex-col gap-2">
            <h2 className="px-1 text-sm font-semibold text-muted-foreground">{group.title}</h2>
            <Card className="divide-y divide-border p-0">
              {groupSubjects.length === 0 && (
                <p className="px-4 py-3 text-sm text-muted-foreground">Henüz özel ders eklenmedi.</p>
              )}
              {groupSubjects.map((subject) => (
                <div
                  key={subject.id}
                  className={cx(
                    "flex items-center gap-3 px-4 py-3",
                    !subject.active && "opacity-50",
                  )}
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: subject.color }}
                    aria-hidden
                  />

                  {editingId === subject.id ? (
                    <div className="flex flex-1 items-center gap-2">
                      <input
                        className={INPUT_CLASS}
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => saveEdit(subject)}
                        className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                      >
                        Kaydet
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground"
                      >
                        Vazgeç
                      </button>
                    </div>
                  ) : (
                    <>
                      <Link
                        to={`${ROUTES.moreSubjects}/${subject.id}`}
                        className="flex flex-1 items-center gap-2 text-sm font-medium text-foreground"
                      >
                        {subjectLabel(subject)}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
                      </Link>
                      <button
                        type="button"
                        onClick={() => startEdit(subject)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                        aria-label="Ders adını düzenle"
                      >
                        <Pencil className="h-4 w-4" aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleActive(subject)}
                        className={cx(
                          "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                          subject.active
                            ? "border-success text-success"
                            : "border-border text-muted-foreground",
                        )}
                      >
                        {subject.active ? "Aktif" : "Pasif"}
                      </button>
                    </>
                  )}
                </div>
              ))}

              {group.examType === "OZEL" && (
                <div className="flex items-center gap-2 px-4 py-3">
                  <input
                    className={INPUT_CLASS}
                    placeholder="Yeni özel ders adı"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={addCustomSubject}
                    disabled={newSubjectName.trim().length === 0}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Özel ders ekle"
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              )}
            </Card>
          </div>
        );
      })}
    </div>
  );
}
