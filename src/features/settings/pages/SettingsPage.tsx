import { useEffect, useState } from "react";
import { CalendarClock, Check, Moon, Sun, Target, User } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { INPUT_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { PageHeader } from "@/components/ui/PageHeader";
import { FIXED_EXAM_DATE, FIXED_USER_NAME } from "@/constants/profile";
import { useTheme } from "@/hooks/useTheme";
import type { UserProfile } from "@/models/UserProfile";
import { userProfileRepository } from "@/repositories/userProfileRepository";
import { cx } from "@/utils/cx";
import { daysUntilExam, fromDateKey } from "@/utils/date";

const PRESET_MINUTES = [60, 120, 180, 240, 300];
const MIN_MINUTES = 15;
const MAX_MINUTES = 720;

const EXAM_DATE_FORMATTER = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatHours(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} dk`;
  if (rest === 0) return `${hours} saat`;
  return `${hours} saat ${rest} dk`;
}

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [targetInput, setTargetInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    userProfileRepository
      .getProfile()
      .then((found) => {
        if (found) {
          setProfile(found);
          setTargetInput(String(found.dailyStudyTargetMinutes));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Kaydedildi geri bildirimi kısa süre sonra kendiliğinden kaybolsun.
  useEffect(() => {
    if (!saved) return;
    const timeout = setTimeout(() => setSaved(false), 2500);
    return () => clearTimeout(timeout);
  }, [saved]);

  function selectPreset(minutes: number) {
    setTargetInput(String(minutes));
    setError(null);
    setSaved(false);
  }

  async function handleSave() {
    if (!profile) return;

    const trimmed = targetInput.trim();
    const value = Number(trimmed);

    if (trimmed.length === 0 || !Number.isFinite(value) || !Number.isInteger(value)) {
      setError("Lütfen dakika olarak tam bir sayı gir.");
      return;
    }
    if (value < MIN_MINUTES || value > MAX_MINUTES) {
      setError(`Günlük hedef ${MIN_MINUTES} ile ${MAX_MINUTES} dakika arasında olmalı.`);
      return;
    }

    setSaving(true);
    setError(null);
    // Diğer profil tercihleri olduğu gibi korunur, yalnızca hedef güncellenir.
    const updated = await userProfileRepository.saveProfile({
      ...profile,
      dailyStudyTargetMinutes: value,
      updatedAt: new Date().toISOString(),
    });
    setProfile(updated);
    setTargetInput(String(updated.dailyStudyTargetMinutes));
    setSaving(false);
    setSaved(true);
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Yükleniyor…</p>;
  }

  const currentValue = Number(targetInput);
  const remainingDays = daysUntilExam(FIXED_EXAM_DATE, new Date());

  return (
    <div className="flex max-w-3xl flex-col gap-4 md:gap-5">
      <PageHeader title="Ayarlar" description="Günlük hedefini ve görünüm tercihini buradan değiştirebilirsin." />

      <Card variant="raised" padding="lg" className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <Target className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 className="text-base font-bold text-foreground">Günlük çalışma hedefi</h2>
            <p className="text-[13px] text-muted-foreground">
              Ana sayfadaki ilerleme bu hedefe göre hesaplanır.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESET_MINUTES.map((minutes) => {
            const active = currentValue === minutes;
            return (
              <button
                key={minutes}
                type="button"
                onClick={() => selectPreset(minutes)}
                aria-pressed={active}
                className={cx(
                  "press flex min-h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold",
                  active
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground",
                )}
              >
                {minutes} dk
                <span className="text-[11px] font-medium opacity-70">({formatHours(minutes)})</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="daily-target" className={LABEL_CLASS}>
            Özel değer (dakika)
          </label>
          <input
            id="daily-target"
            type="number"
            inputMode="numeric"
            min={MIN_MINUTES}
            max={MAX_MINUTES}
            step={1}
            className={cx(INPUT_CLASS, "max-w-48")}
            value={targetInput}
            onChange={(e) => {
              setTargetInput(e.target.value);
              setError(null);
              setSaved(false);
            }}
          />
          <p className="text-xs text-muted-foreground">
            En az {MIN_MINUTES}, en fazla {MAX_MINUTES} dakika.
          </p>
        </div>

        {error && <p className="text-[13px] font-medium text-danger">{error}</p>}

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </Button>
          {saved && (
            <span className="flex items-center gap-1.5 text-[13px] font-semibold text-success">
              <Check className="h-4 w-4" aria-hidden />
              Günlük hedefin güncellendi.
            </span>
          )}
        </div>
      </Card>

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
          Rota yalnızca senin için hazırlandı; ad ve sınav tarihi sabittir.
        </p>
      </Card>
    </div>
  );
}
