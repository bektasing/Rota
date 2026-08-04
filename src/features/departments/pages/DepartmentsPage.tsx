import { useEffect, useMemo, useState } from "react";
import { Compass, Heart, Search } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { INPUT_CLASS } from "@/components/ui/formStyles";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  DEPARTMENTS,
  DEPARTMENT_CATEGORY_LABELS,
  DEPARTMENT_CATEGORY_OPTIONS,
  DEPARTMENT_TAG_LABELS,
  type Department,
  type DepartmentCategory,
} from "@/constants/departments";
import { DepartmentDetailPanel } from "@/features/departments/components/DepartmentDetailPanel";
import type { UserProfile } from "@/models/UserProfile";
import { userProfileRepository } from "@/repositories/userProfileRepository";
import { cx } from "@/utils/cx";

/** Katalogda gerçekten kullanılan etiketler, sabit sırayla. */
const AVAILABLE_TAGS = Object.keys(DEPARTMENT_TAG_LABELS).filter((tag) =>
  DEPARTMENTS.some((department) => department.tags.includes(tag)),
);

function normalize(value: string): string {
  return value.toLocaleLowerCase("tr-TR");
}

export function DepartmentsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<DepartmentCategory | "all">("all");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [selected, setSelected] = useState<Department | null>(null);

  useEffect(() => {
    let cancelled = false;

    userProfileRepository.getProfile().then((found) => {
      if (cancelled || !found) return;
      setProfile(found);
      setFavoriteIds(found.favoriteDepartmentIds ?? []);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  /** Favoriler kalıcı kullanıcı verisidir; profile geriye uyumlu alanda yazılır. */
  async function toggleFavorite(departmentId: string) {
    const next = favoriteIds.includes(departmentId)
      ? favoriteIds.filter((id) => id !== departmentId)
      : [...favoriteIds, departmentId];

    setFavoriteIds(next);

    if (!profile) return;
    const updated = await userProfileRepository.saveProfile({
      ...profile,
      favoriteDepartmentIds: next,
      updatedAt: new Date().toISOString(),
    });
    setProfile(updated);
  }

  const visible = useMemo(() => {
    const normalizedQuery = normalize(query.trim());

    return DEPARTMENTS.filter((department) => {
      if (category !== "all" && department.category !== category) return false;
      if (activeTag && !department.tags.includes(activeTag)) return false;
      if (onlyFavorites && !favoriteIds.includes(department.id)) return false;
      if (normalizedQuery.length === 0) return true;

      return (
        normalize(department.name).includes(normalizedQuery) ||
        normalize(department.description).includes(normalizedQuery)
      );
    });
  }, [query, category, activeTag, onlyFavorites, favoriteIds]);

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <PageHeader
        title="Bölüm Keşfi"
        description="Sayısal bölümleri tanı, ilgini çekenleri favorilere ekle. Burada puan, sıralama veya iş garantisi bilgisi yer almaz."
      />

      <Card padding="md" className="flex flex-col gap-3">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            className={cx(INPUT_CLASS, "pl-9")}
            placeholder="Bölüm ara"
            aria-label="Bölüm ara"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            className={cx(INPUT_CLASS, "max-w-60")}
            aria-label="Kategori filtresi"
            value={category}
            onChange={(e) => setCategory(e.target.value as DepartmentCategory | "all")}
          >
            <option value="all">Tüm kategoriler</option>
            {DEPARTMENT_CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setOnlyFavorites((value) => !value)}
            aria-pressed={onlyFavorites}
            className={cx(
              "press flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-semibold",
              onlyFavorites
                ? "border-primary bg-primary-soft text-primary"
                : "border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground",
            )}
          >
            <Heart className={cx("h-4 w-4", onlyFavorites && "fill-current")} aria-hidden />
            Favoriler
            {favoriteIds.length > 0 && <span className="tabular-nums">({favoriteIds.length})</span>}
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {AVAILABLE_TAGS.map((tag) => {
            const active = activeTag === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTag(active ? null : tag)}
                aria-pressed={active}
                className={cx(
                  "press min-h-8 rounded-full border px-3 text-xs font-semibold",
                  active
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
                )}
              >
                {DEPARTMENT_TAG_LABELS[tag]}
              </button>
            );
          })}
        </div>
      </Card>

      {visible.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="Bu filtrelerle bölüm bulunamadı"
          description={
            onlyFavorites && favoriteIds.length === 0
              ? "Henüz favori bölümün yok. Bir bölümü açıp favorilere ekleyebilirsin."
              : "Aramanı veya filtreleri değiştirerek tekrar deneyebilirsin."
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((department) => {
            const favorite = favoriteIds.includes(department.id);
            return (
              <Card key={department.id} padding="md" className="flex flex-col gap-2.5">
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelected(department)}
                    className="press min-w-0 text-left"
                  >
                    <h2 className="text-sm font-bold text-foreground">{department.name}</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {DEPARTMENT_CATEGORY_LABELS[department.category]} · {department.durationYears} yıl
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => void toggleFavorite(department.id)}
                    aria-pressed={favorite}
                    aria-label={
                      favorite
                        ? `${department.name} bölümünü favorilerden çıkar`
                        : `${department.name} bölümünü favorilere ekle`
                    }
                    className={cx(
                      "press flex h-9 w-9 shrink-0 items-center justify-center rounded-full border",
                      favorite
                        ? "border-primary/40 bg-primary-soft text-primary"
                        : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
                    )}
                  >
                    <Heart className={cx("h-4 w-4", favorite && "fill-current")} aria-hidden />
                  </button>
                </div>

                <p className="line-clamp-3 text-[13px] leading-relaxed text-muted-foreground">
                  {department.description}
                </p>

                <div className="mt-auto flex flex-wrap gap-1.5">
                  {department.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground"
                    >
                      {DEPARTMENT_TAG_LABELS[tag] ?? tag}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setSelected(department)}
                  className="press self-start text-[13px] font-semibold text-primary"
                >
                  Detayları gör
                </button>
              </Card>
            );
          })}
        </div>
      )}

      {selected && (
        <DepartmentDetailPanel
          department={selected}
          favorite={favoriteIds.includes(selected.id)}
          onToggleFavorite={() => void toggleFavorite(selected.id)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
