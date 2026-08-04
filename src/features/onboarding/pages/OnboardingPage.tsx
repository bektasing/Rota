import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { INPUT_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
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
      restDay: form.restDay,
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
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-5 p-4">
      <div className="text-center">
        <div className="bg-brand-gradient mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl text-base font-black text-primary-foreground shadow-brand">
          R
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Rota'ya hoş geldin, Nisa</h1>
        <p className="mt-1 text-sm text-muted-foreground">Birkaç kısa soru yeterli</p>
        <div className="mt-3 flex items-center justify-center gap-1.5" aria-hidden>
          {[1, 2].map((n) => (
            <span
              key={n}
              className={cx("h-1.5 rounded-full transition-all", step === n ? "w-8 bg-primary" : "w-4 bg-border")}
            />
          ))}
        </div>
      </div>

      <Card variant="raised" padding="lg" className="flex flex-col gap-4">
        {step === 1 && (
          <>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="dailyTarget" className={LABEL_CLASS}>
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
              <label htmlFor="studyDays" className={LABEL_CLASS}>
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
              <label htmlFor="restDay" className={LABEL_CLASS}>
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
              <span className={LABEL_CLASS}>TYT seviyen</span>
              <div className="flex gap-2">
                {LEVEL_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, tytLevel: option.value }))}
                    className={cx(
                      "press min-h-11 flex-1 rounded-xl border px-3 text-sm font-semibold",
                      form.tytLevel === option.value
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className={LABEL_CLASS}>AYT seviyen</span>
              <div className="flex gap-2">
                {LEVEL_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, aytLevel: option.value }))}
                    className={cx(
                      "press min-h-11 flex-1 rounded-xl border px-3 text-sm font-semibold",
                      form.aytLevel === option.value
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
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
                  <span className={LABEL_CLASS}>
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
                          "press min-h-9 rounded-full border px-3 text-xs font-semibold",
                          form.strongSubjectIds.includes(subject.id)
                            ? "border-success/40 bg-success-soft text-success"
                            : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
                        )}
                      >
                        {subject.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className={LABEL_CLASS}>
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
                          "press min-h-9 rounded-full border px-3 text-xs font-semibold",
                          form.weakSubjectIds.includes(subject.id)
                            ? "border-danger/40 bg-danger-soft text-danger"
                            : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
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
            <Button variant="ghost" onClick={() => setStep(1)}>
              Geri
            </Button>
          ) : (
            <span />
          )}

          {step === 1 && (
            <Button disabled={!targetValid} onClick={() => setStep(2)}>
              İleri
            </Button>
          )}

          {step === 2 && (
            <Button disabled={saving} onClick={handleComplete}>
              {saving ? "Kaydediliyor…" : "Kurulumu Tamamla"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
