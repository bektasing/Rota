import { useEffect, useState } from "react";
import { CalendarClock, Moon, Sun, User } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { FIXED_EXAM_DATE, FIXED_USER_NAME } from "@/constants/profile";
import { BackupCard } from "@/features/settings/components/BackupCard";
import { DangerZoneCard } from "@/features/settings/components/DangerZoneCard";
import { StudyPreferencesCard } from "@/features/settings/components/StudyPreferencesCard";
import { useTheme } from "@/hooks/useTheme";
import type { UserProfile } from "@/models/UserProfile";
import { userProfileRepository } from "@/repositories/userProfileRepository";
import { cx } from "@/utils/cx";
import { daysUntilExam, fromDateKey } from "@/utils/date";

const EXAM_DATE_FORMATTER = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userProfileRepository
      .getProfile()
      .then((found) => {
        if (found) setProfile(found);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Yükleniyor…</p>;
  }

  const remainingDays = daysUntilExam(FIXED_EXAM_DATE, new Date());

  return (
    <div className="flex max-w-3xl flex-col gap-4 md:gap-5">
      <PageHeader
        title="Ayarlar"
        description="Çalışma tercihlerini, görünümü ve verilerini buradan yönetebilirsin."
      />

      {profile && <StudyPreferencesCard profile={profile} onSaved={setProfile} />}

      <Card padding="lg" className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
            <Sun className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 className="text-base font-bold text-foreground">Görünüm</h2>
            <p className="text-[13px] text-muted-foreground">Açık ve koyu tema arasında geçiş yap.</p>
          </div>
        </div>

        <div className="flex w-full max-w-xs gap-1 rounded-full border border-border bg-surface-muted p-1">
          {(
            [
              { value: "light" as const, label: "Açık", icon: Sun },
              { value: "dark" as const, label: "Koyu", icon: Moon },
            ]
          ).map((option) => {
            const active = theme === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setTheme(option.value)}
                aria-pressed={active}
                className={cx(
                  "press flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-full text-sm font-semibold",
                  active ? "bg-surface text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <option.icon className="h-4 w-4" aria-hidden />
                {option.label}
              </button>
            );
          })}
        </div>
      </Card>

      <BackupCard />

      <Card variant="muted" padding="lg" className="flex flex-col gap-3">
        <h2 className="text-base font-bold text-foreground">Profil</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3.5 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <User className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Kullanıcı</p>
              <p className="text-sm font-semibold text-foreground">{FIXED_USER_NAME}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3.5 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <CalendarClock className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">YKS tarihi</p>
              <p className="text-sm font-semibold text-foreground">
                {EXAM_DATE_FORMATTER.format(fromDateKey(FIXED_EXAM_DATE))}
                {remainingDays !== null && (
                  <span className="ml-1.5 text-xs font-medium text-muted-foreground">({remainingDays} gün)</span>
                )}
              </p>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Rota yalnızca senin için hazırlandı; ad ve sınav tarihi sabittir ve değiştirilemez.
        </p>
      </Card>

      <DangerZoneCard />
    </div>
  );
}
