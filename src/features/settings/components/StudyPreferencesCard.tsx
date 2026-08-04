import { useMemo, useState } from "react";
import { Check, Target } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { INPUT_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { WEEK_DAYS } from "@/constants/weekDays";
import { useSubjects } from "@/hooks/useSubjects";
import type { StudyLevel, UserProfile, WeekDay } from "@/models/UserProfile";
import { userProfileRepository } from "@/repositories/userProfileRepository";
import { cx } from "@/utils/cx";

const PRESET_MINUTES = [60, 120, 180, 240, 300];
const MIN_MINUTES = 15;
const MAX_MINUTES = 720;

const LEVEL_OPTIONS: { value: StudyLevel; label: string }[] = [
  { value: "baslangic", label: "Başlangıç" },
  { value: "orta", label: "Orta" },
  { value: "iyi", label: "İyi" },
];

function formatHours(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} dk`;
  if (rest === 0) return `${hours} saat`;
  return `${hours} saat ${rest} dk`;
}

/** TYT ve AYT'deki aynı adlı dersleri ayırt eder. */
function subjectLabel(name: string, examType: string): string {
  return examType === "OZEL" ? name : `${name} (${examType})`;
}

interface StudyPreferencesCardProps {
  profile: UserProfile;
  onSaved: (profile: UserProfile) => void;
}

/**
 * Nisa'nın adı ve sınav tarihi sabittir; burada yalnızca çalışma tercihleri düzenlenir.
 * Kayıt her zaman mevcut profilin üzerine yazılır, diğer alanlar korunur.
 */
export function StudyPreferencesCard({ profile, onSaved }: StudyPreferencesCardProps) {
  const { subjects } = useSubjects();
  const [targetInput, setTargetInput] = useState(String(profile.dailyStudyTargetMinutes));
  const [studyDays, setStudyDays] = useState<WeekDay[]>(profile.weeklyStudyDays ?? []);
  const [restDay, setRestDay] = useState<WeekDay | "">(profile.restDay ?? "");
  const [tytLevel, setTytLevel] = useState<StudyLevel>(profile.tytLevel ?? "orta");
  const [aytLevel, setAytLevel] = useState<StudyLevel>(profile.aytLevel ?? "orta");
  const [strongIds, setStrongIds] = useState<string[]>(profile.strongSubjectIds ?? []);
  const [weakIds, setWeakIds] = useState<string[]>(profile.weakSubjectIds ?? []);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const activeSubjects = useMemo(() => subjects.filter((subject) => subject.active), [subjects]);
  const currentTarget = Number(targetInput);

  function markDirty() {
    setError(null);
    setSaved(false);
  }

  function toggleStudyDay(day: WeekDay) {
    markDirty();
    const willBeActive = !studyDays.includes(day);
    setStudyDays(willBeActive ? [...studyDays, day] : studyDays.filter((d) => d !== day));
    // Çalışma günü olarak seçilen gün artık dinlenme günü olamaz.
    if (willBeActive && restDay === day) {
      setRestDay("");
    }
  }

  function changeRestDay(value: WeekDay | "") {
    markDirty();
    setRestDay(value);
    if (value) {
      setStudyDays((days) => days.filter((day) => day !== value));
    }
  }

  /** Aynı ders hem güçlü hem zayıf olamaz; birine eklenince diğerinden çıkar. */
  function toggleStrong(subjectId: string) {
    markDirty();
    setStrongIds((ids) => (ids.includes(subjectId) ? ids.filter((id) => id !== subjectId) : [...ids, subjectId]));
    setWeakIds((ids) => ids.filter((id) => id !== subjectId));
  }

  function toggleWeak(subjectId: string) {
    markDirty();
    setWeakIds((ids) => (ids.includes(subjectId) ? ids.filter((id) => id !== subjectId) : [...ids, subjectId]));
    setStrongIds((ids) => ids.filter((id) => id !== subjectId));
  }

  async function handleSave() {
    const trimmed = targetInput.trim();
    const value = Number(trimmed);

    if (trimmed.length === 0 || !Number.isFinite(value) || !Number.isInteger(value)) {
      setError("Lütfen günlük hedefi dakika olarak tam bir sayı gir.");
      return;
    }
    if (value < MIN_MINUTES || value > MAX_MINUTES) {
      setError(`Günlük hedef ${MIN_MINUTES} ile ${MAX_MINUTES} dakika arasında olmalı.`);
      return;
    }
    if (studyDays.length === 0) {
      setError("En az bir çalışma günü seçmelisin.");
      return;
    }

    setSaving(true);
    setError(null);

    // Ad, sınav tarihi ve diğer profil alanları olduğu gibi korunur.
    const orderedDays = WEEK_DAYS.map((day) => day.value).filter((day) => studyDays.includes(day));
    const updated = await userProfileRepository.saveProfile({
      ...profile,
      dailyStudyTargetMinutes: value,
      weeklyStudyDays: orderedDays,
      restDay: restDay === "" ? null : restDay,
      tytLevel,
      aytLevel,
      strongSubjectIds: strongIds,
      weakSubjectIds: weakIds,
      updatedAt: new Date().toISOString(),
    });

    setSaving(false);
    setSaved(true);
    onSaved(updated);
  }

  return (
    <Card variant="raised" padding="lg" className="flex flex-col gap-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Target className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h2 className="text-base font-bold text-foreground">Çalışma tercihleri</h2>
          <p className="text-[13px] text-muted-foreground">
            Ana sayfadaki ilerleme ve plan önerileri bu tercihlere göre çalışır.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <span className={LABEL_CLASS}>Günlük çalışma hedefi</span>
        <div className="flex flex-wrap gap-2">
          {PRESET_MINUTES.map((minutes) => {
            const active = currentTarget === minutes;
            return (
              <button
                key={minutes}
                type="button"
                onClick={() => {
                  setTargetInput(String(minutes));
                  markDirty();
                }}
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
          <label htmlFor="daily-target" className="text-xs font-medium text-muted-foreground">
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
              markDirty();
            }}
          />
          <p className="text-xs text-muted-foreground">
            En az {MIN_MINUTES}, en fazla {MAX_MINUTES} dakika.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <span className={LABEL_CLASS}>Haftalık çalışma günleri</span>
        <div className="flex flex-wrap gap-2">
          {WEEK_DAYS.map((day) => {
            const active = studyDays.includes(day.value);
            return (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleStudyDay(day.value)}
                aria-pressed={active}
                className={cx(
                  "press min-h-10 rounded-full border px-3.5 text-[13px] font-semibold",
                  active
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground",
                )}
              >
                {day.label}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">Haftada {studyDays.length} gün seçili.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="rest-day" className={LABEL_CLASS}>
          Dinlenme günü
        </label>
        <select
          id="rest-day"
          className={cx(INPUT_CLASS, "max-w-60")}
          value={restDay}
          onChange={(e) => changeRestDay(e.target.value as WeekDay | "")}
        >
          <option value="">Belirtilmedi</option>
          {WEEK_DAYS.map((day) => (
            <option key={day.value} value={day.value}>
              {day.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">Dinlenme günü çalışma günlerinden otomatik çıkarılır.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {(
          [
            { label: "TYT seviyen", value: tytLevel, set: setTytLevel },
            { label: "AYT seviyen", value: aytLevel, set: setAytLevel },
          ] as const
        ).map((field) => (
          <div key={field.label} className="flex flex-col gap-1.5">
            <span className={LABEL_CLASS}>{field.label}</span>
            <div className="flex gap-2">
              {LEVEL_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    field.set(option.value);
                    markDirty();
                  }}
                  aria-pressed={field.value === option.value}
                  className={cx(
                    "press min-h-10 flex-1 rounded-xl border px-3 text-[13px] font-semibold",
                    field.value === option.value
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {activeSubjects.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className={LABEL_CLASS}>Güçlü olduğun dersler</span>
            <div className="flex flex-wrap gap-2">
              {activeSubjects.map((subject) => (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => toggleStrong(subject.id)}
                  aria-pressed={strongIds.includes(subject.id)}
                  className={cx(
                    "press min-h-9 rounded-full border px-3 text-xs font-semibold",
                    strongIds.includes(subject.id)
                      ? "border-success/40 bg-success-soft text-success"
                      : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
                  )}
                >
                  {subjectLabel(subject.name, subject.examType)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className={LABEL_CLASS}>Zayıf olduğun dersler</span>
            <div className="flex flex-wrap gap-2">
              {activeSubjects.map((subject) => (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => toggleWeak(subject.id)}
                  aria-pressed={weakIds.includes(subject.id)}
                  className={cx(
                    "press min-h-9 rounded-full border px-3 text-xs font-semibold",
                    weakIds.includes(subject.id)
                      ? "border-danger/40 bg-danger-soft text-danger"
                      : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
                  )}
                >
                  {subjectLabel(subject.name, subject.examType)}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Bir ders aynı anda hem güçlü hem zayıf seçilemez.
            </p>
          </div>
        </div>
      )}

      {error && <p className="text-[13px] font-medium text-danger">{error}</p>}

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Kaydediliyor…" : "Kaydet"}
        </Button>
        {saved && (
          <span className="flex items-center gap-1.5 text-[13px] font-semibold text-success">
            <Check className="h-4 w-4" aria-hidden />
            Tercihlerin kaydedildi.
          </span>
        )}
      </div>
    </Card>
  );
}
