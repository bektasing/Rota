import { useEffect, useState } from "react";
import { ChevronRight, Pencil, Plus } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { INPUT_CLASS } from "@/components/ui/formStyles";
import { PageHeader } from "@/components/ui/PageHeader";
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
    return <p className="text-sm text-muted-foreground">Yükleniyor…</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Dersler ve Konular" description="Derslerini düzenle, konularını tek tek takip et." />

      {GROUPS.map((group) => {
        const groupSubjects = subjects.filter((s) => s.examType === group.examType);
        if (groupSubjects.length === 0 && group.examType !== "OZEL") return null;

        return (
          <section key={group.examType} className="flex flex-col gap-2.5">
            <h2 className="text-sm font-bold text-muted-foreground">{group.title}</h2>

            <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
              {groupSubjects.length === 0 && (
                <p className="text-[13px] text-muted-foreground">Henüz özel ders eklenmedi.</p>
              )}

              {groupSubjects.map((subject) => (
                <Card
                  key={subject.id}
                  padding="sm"
                  className={cx("flex items-center gap-2.5", !subject.active && "opacity-60")}
                >
                  <span
                    className="h-8 w-1.5 shrink-0 rounded-full"
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
                      <Button size="sm" onClick={() => saveEdit(subject)}>
                        Kaydet
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        Vazgeç
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Link
                        to={`${ROUTES.moreSubjects}/${subject.id}`}
                        className="flex min-w-0 flex-1 items-center gap-1 text-sm font-semibold text-foreground hover:text-primary"
                      >
                        <span className="truncate">{subject.name}</span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                      </Link>
                      <button
                        type="button"
                        onClick={() => startEdit(subject)}
                        className="press flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                        aria-label="Ders adını düzenle"
                      >
                        <Pencil className="h-4 w-4" aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleActive(subject)}
                        className={cx(
                          "press shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-bold",
                          subject.active
                            ? "border-success/40 bg-success-soft text-success"
                            : "border-border text-muted-foreground",
                        )}
                      >
                        {subject.active ? "Aktif" : "Pasif"}
                      </button>
                    </>
                  )}
                </Card>
              ))}

              {group.examType === "OZEL" && (
                <Card variant="muted" padding="sm" className="flex items-center gap-2">
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
                    className="press bg-brand-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Özel ders ekle"
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                  </button>
                </Card>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
