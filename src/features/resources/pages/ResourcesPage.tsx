import { useEffect, useState } from "react";
import { BookMarked, MoreVertical, Pencil, Plus, Star, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { INPUT_CLASS } from "@/components/ui/formStyles";
import { PageHeader } from "@/components/ui/PageHeader";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { RESOURCE_STATUS_LABELS, RESOURCE_STATUS_OPTIONS, RESOURCE_TYPE_LABELS } from "@/constants/resources";
import { ResourceFormPanel } from "@/features/resources/components/ResourceFormPanel";
import { useSubjects } from "@/hooks/useSubjects";
import type { ResourceStatus, StudyResource } from "@/models/StudyResource";
import { studyResourceRepository } from "@/repositories/studyResourceRepository";
import { cx } from "@/utils/cx";
import { computePercent, formatAmount } from "@/utils/progress";

type StatusFilter = "all" | ResourceStatus;

const STATUS_CHIP_CLASS: Record<ResourceStatus, string> = {
  planned: "bg-surface-muted text-muted-foreground",
  in_progress: "bg-primary-soft text-primary",
  completed: "bg-success-soft text-success",
  dropped: "bg-surface-muted text-muted-foreground",
};

export function ResourcesPage() {
  const { subjects } = useSubjects();
  const activeSubjects = subjects.filter((s) => s.active);
  const subjectsById = new Map(subjects.map((s) => [s.id, s]));

  const [resources, setResources] = useState<StudyResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<StudyResource | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [progressEditId, setProgressEditId] = useState<string | null>(null);
  const [progressInput, setProgressInput] = useState("");

  async function reload() {
    const all = await studyResourceRepository.getAll();
    setResources(all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
  }

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  const filteredResources = resources.filter((resource) => {
    if (statusFilter !== "all" && resource.status !== statusFilter) return false;
    if (subjectFilter && resource.subjectId !== subjectFilter) return false;
    return true;
  });

  function openCreate() {
    setEditingResource(null);
    setFormOpen(true);
  }

  function openEdit(resource: StudyResource) {
    setEditingResource(resource);
    setFormOpen(true);
    setOpenMenuId(null);
  }

  async function handleSave(resource: StudyResource, isNew: boolean) {
    if (isNew) {
      await studyResourceRepository.add(resource);
    } else {
      await studyResourceRepository.put(resource);
    }
    setFormOpen(false);
    setEditingResource(null);
    await reload();
  }

  async function deleteResource(resource: StudyResource) {
    setOpenMenuId(null);
    if (!window.confirm(`"${resource.title}" kaynağını silmek istediğine emin misin?`)) return;
    await studyResourceRepository.remove(resource.id);
    await reload();
  }

  async function changeStatus(resource: StudyResource, status: ResourceStatus) {
    setOpenMenuId(null);
    await studyResourceRepository.put({ ...resource, status, updatedAt: new Date().toISOString() });
    await reload();
  }

  function startProgressEdit(resource: StudyResource) {
    setProgressEditId(resource.id);
    setProgressInput(String(resource.completedUnits));
  }

  async function saveProgress(resource: StudyResource) {
    const value = Number(progressInput);
    if (!Number.isFinite(value) || value < 0) return;
    await studyResourceRepository.put({
      ...resource,
      completedUnits: value,
      updatedAt: new Date().toISOString(),
    });
    setProgressEditId(null);
    await reload();
  }

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <PageHeader
        title="Kaynaklar"
        description="Kitap, soru bankası ve video serilerinde nerede kaldığını takip et."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" aria-hidden />
            Kaynak ekle
          </Button>
        }
      />

      <Card padding="sm" className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          className="max-w-md"
          ariaLabel="Kaynak durumu filtresi"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "all", label: "Tümü", badge: resources.length },
            ...RESOURCE_STATUS_OPTIONS.map((option) => ({
              value: option.value as StatusFilter,
              label: option.label,
              badge: resources.filter((r) => r.status === option.value).length,
            })),
          ]}
        />

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
      ) : filteredResources.length === 0 ? (
        <EmptyState
          icon={BookMarked}
          title={resources.length === 0 ? "Henüz kaynak eklemedin" : "Bu filtrede kaynak yok"}
          description="Kullandığın kitapları ve video serilerini ekleyip ilerlemeni buradan güncelleyebilirsin."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredResources.map((resource) => {
            const subject = resource.subjectId ? subjectsById.get(resource.subjectId) : undefined;
            const hasTotal = resource.totalUnits != null && resource.totalUnits > 0;
            const percent = hasTotal ? computePercent(resource.completedUnits, resource.totalUnits) : 0;

            return (
              <Card
                key={resource.id}
                className={cx(
                  "flex flex-col gap-3",
                  (resource.status === "completed" || resource.status === "dropped") && "bg-surface-subtle",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">{resource.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {RESOURCE_TYPE_LABELS[resource.type]}
                      {resource.publisherOrSource && ` · ${resource.publisherOrSource}`}
                      {subject && ` · ${subject.name}`}
                    </p>
                  </div>

                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setOpenMenuId((id) => (id === resource.id ? null : resource.id))}
                      className="press flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                      aria-label="Kaynak seçenekleri"
                    >
                      <MoreVertical className="h-4 w-4" aria-hidden />
                    </button>
                    {openMenuId === resource.id && (
                      <div className="absolute right-0 top-10 z-20 w-52 overflow-hidden rounded-xl border border-border bg-surface shadow-lifted">
                        {RESOURCE_STATUS_OPTIONS.filter((option) => option.value !== resource.status).map(
                          (option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => changeStatus(resource, option.value)}
                              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-foreground hover:bg-surface-muted"
                            >
                              {option.label} yap
                            </button>
                          ),
                        )}
                        <button
                          type="button"
                          onClick={() => openEdit(resource)}
                          className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-foreground hover:bg-surface-muted"
                        >
                          <Pencil className="h-4 w-4" aria-hidden />
                          Düzenle
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteResource(resource)}
                          className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-danger hover:bg-danger-soft"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                          Sil
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={cx(
                      "rounded-full px-2.5 py-1 text-[11px] font-bold",
                      STATUS_CHIP_CLASS[resource.status],
                    )}
                  >
                    {RESOURCE_STATUS_LABELS[resource.status]}
                  </span>
                  {resource.rating != null && (
                    <span className="flex items-center gap-1 rounded-full bg-warning-soft px-2.5 py-1 text-[11px] font-bold text-warning">
                      <Star className="h-3 w-3 fill-current" aria-hidden />
                      {resource.rating}/5
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      <span className="text-xl font-bold tabular-nums">
                        {formatAmount(resource.completedUnits)}
                      </span>
                      {hasTotal ? (
                        <span className="text-muted-foreground"> / {formatAmount(resource.totalUnits ?? 0)}</span>
                      ) : (
                        <span className="text-muted-foreground"> tamamlandı</span>
                      )}
                    </p>
                    {hasTotal && (
                      <span className="text-[13px] font-bold tabular-nums text-primary">%{percent}</span>
                    )}
                  </div>
                  {hasTotal && (
                    <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-surface-muted">
                      <div
                        className="bg-brand-gradient h-full rounded-full transition-[width] duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  )}
                </div>

                {progressEditId === resource.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      autoFocus
                      aria-label="Tamamlanan miktar"
                      className={INPUT_CLASS}
                      value={progressInput}
                      onChange={(e) => setProgressInput(e.target.value)}
                    />
                    <Button size="sm" onClick={() => saveProgress(resource)}>
                      Kaydet
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setProgressEditId(null)}>
                      Vazgeç
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="soft" onClick={() => startProgressEdit(resource)}>
                    İlerlemeyi güncelle
                  </Button>
                )}

                {resource.note && <p className="text-xs text-muted-foreground">{resource.note}</p>}
              </Card>
            );
          })}
        </div>
      )}

      {formOpen && (
        <ResourceFormPanel
          subjects={activeSubjects}
          editingResource={editingResource}
          onClose={() => {
            setFormOpen(false);
            setEditingResource(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
