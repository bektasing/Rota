import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { Card } from "@/components/ui/Card";
import { WEEK_DAYS } from "@/constants/weekDays";
import { FIXED_EXAM_DATE, FIXED_USER_NAME } from "@/constants/profile";
import { ROUTES } from "@/constants/routes";
import { useUserProfile } from "@/hooks/useUserProfile";
import type { StudyLevel, UserProfile, WeekDay } from "@/models/UserProfile";
import type { Subject } from "@/models/Subject";
import { userProfileRepository } from "@/repositories/userProfileRepository";
import { ensureDefaultSubjectsSeeded } from "@/services/bootstrapService";
import { cx } from "@/utils/cx";
import { generateId } from "@/utils/id";

const INPUT_CLASS =
  "w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";

const LEVEL_OPTIONS: { value: StudyLevel; label: string }[] = [
  { value: "baslangic", label: "Başlangıç" },
  { value: "orta", label: "Orta" },
  { value: "iyi", label: "İyi" },
];

interface FormState {
  dailyStudyTargetMinutes: number;
  studyDaysPerWeek: number;
  restDay: WeekDay;
  tytLevel: StudyLevel;
  aytLevel: StudyLevel;
  strongSubjectIds: string[];
  weakSubjectIds: string[];
}

const INITIAL_FORM: FormState = {
  dailyStudyTargetMinutes: 180,
  studyDaysPerWeek: 5,
  restDay: "sunday",
  tytLevel: "orta",
  aytLevel: "orta",
  strongSubjectIds: [],
  weakSubjectIds: [],
};

function computeWeeklyStudyDays(studyDaysPerWeek: number, restDay: WeekDay): WeekDay[] {
  const ordered = WEEK_DAYS.map((d) => d.value).filter((day) => day !== restDay);
  return ordered.slice(0, Math.min(studyDaysPerWeek, ordered.length));
}

function toggleId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((existing) => existing !== id) : [...ids, id];
}

export function OnboardingPage() {
  const navigate = useNavigate();
  const { profile, loading } = useUserProfile();
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    ensureDefaultSubjectsSeeded().then(setSubjects);
  }, []);

  if (!loading && profile?.onboardingCompleted) {
    return <Navigate to={ROUTES.home} replace />;
  }

  const targetValid = form.dailyStudyTargetMinutes > 0;

  async function handleComplete() {
    setSaving(true);
    const now = new Date().toISOString();
    const newProfile: UserProfile = {
      id: generateId(),
      name: FIXED_USER_NAME,
      examDate: FIXED_EXAM_DATE,
      dailyStudyTargetMinutes: form.dailyStudyTargetMinutes,
      weeklyStudyDays: computeWeeklyStudyDays(form.studyDaysPerWeek, form.restDay),
      preferredStudyHours: [],
      targetRanking: null,
      tytLevel: form.tytLevel,
      aytLevel: form.aytLevel,
      strongSubjectIds: form.strongSubjectIds,
      weakSubjectIds: form.weakSubjectIds,
      onboardingCompleted: true,
      createdAt: now,
      updatedAt: now,
    };

    await userProfileRepository.saveProfile(newProfile);
    navigate(ROUTES.home, { replace: true });
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 p-4">
      <div className="text-center">
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
          R
        </div>
        <h1 className="text-lg font-semibold text-foreground">Rota'ya hoş geldin, Nisa</h1>
        <p className="text-sm text-muted-foreground">Adım {step}/2 — birkaç kısa soru yeterli</p>
      </div>

      <Card className="flex flex-col gap-4">
        {step === 1 && (
          <>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="dailyTarget" className="text-sm font-medium text-foreground">
                Günlük çalışma hedefin (dakika)
              </label>
              <input
                id="dailyTarget"
                type="number"
                min={1}
                className={INPUT_CLASS}
                value={form.dailyStudyTargetMinutes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dailyStudyTargetMinutes: Number(e.target.value) }))
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="studyDays" className="text-sm font-medium text-foreground">
                Haftada kaç gün çalışmak istiyorsun?
              </label>
              <select
                id="studyDays"
                className={INPUT_CLASS}
                value={form.studyDaysPerWeek}
                onChange={(e) => setForm((f) => ({ ...f, studyDaysPerWeek: Number(e.target.value) }))}
              >
                {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                  <option key={n} value={n}>
                    {n} gün
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="restDay" className="text-sm font-medium text-foreground">
                Dinlenme günün
              </label>
              <select
                id="restDay"
                className={INPUT_CLASS}
                value={form.restDay}
                onChange={(e) => setForm((f) => ({ ...f, restDay: e.target.value as WeekDay }))}
              >
                {WEEK_DAYS.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-foreground">TYT seviyen</span>
              <div className="flex gap-2">
                {LEVEL_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, tytLevel: option.value }))}
                    className={cx(
                      "flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                      form.tytLevel === option.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-surface-muted",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-foreground">AYT seviyen</span>
              <div className="flex gap-2">
                {LEVEL_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, aytLevel: option.value }))}
                    className={cx(
                      "flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                      form.aytLevel === option.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-surface-muted",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {subjects.length > 0 && (
              <>
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-foreground">
                    Güçlü olduğun dersler (isteğe bağlı)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {subjects.map((subject) => (
                      <button
                        key={subject.id}
                        type="button"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            strongSubjectIds: toggleId(f.strongSubjectIds, subject.id),
                          }))
                        }
                        className={cx(
                          "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                          form.strongSubjectIds.includes(subject.id)
                            ? "border-success bg-success/10 text-success"
                            : "border-border text-muted-foreground hover:bg-surface-muted",
                        )}
                      >
                        {subject.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-foreground">
                    Zayıf olduğun dersler (isteğe bağlı)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {subjects.map((subject) => (
                      <button
                        key={subject.id}
                        type="button"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            weakSubjectIds: toggleId(f.weakSubjectIds, subject.id),
                          }))
                        }
                        className={cx(
                          "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                          form.weakSubjectIds.includes(subject.id)
                            ? "border-danger bg-danger/10 text-danger"
                            : "border-border text-muted-foreground hover:bg-surface-muted",
                        )}
                      >
                        {subject.name}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        <div className="flex items-center justify-between gap-3 pt-2">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Geri
            </button>
          ) : (
            <span />
          )}

          {step === 1 && (
            <button
              type="button"
              disabled={!targetValid}
              onClick={() => setStep(2)}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              İleri
            </button>
          )}

          {step === 2 && (
            <button
              type="button"
              disabled={saving}
              onClick={handleComplete}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Kaydediliyor…" : "Kurulumu Tamamla"}
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}
