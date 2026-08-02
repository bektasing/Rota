import { useEffect, useState } from "react";
import { Pause, Play, Square, Timer as TimerIcon, X } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { DEFAULT_COUNTDOWN_MINUTES } from "@/constants/timer";
import { useSubjects } from "@/hooks/useSubjects";
import type { StudySession, StudySessionMode } from "@/models/StudySession";
import type { StudyTask } from "@/models/StudyTask";
import type { Topic } from "@/models/Topic";
import { studySessionRepository } from "@/repositories/studySessionRepository";
import { studyTaskRepository } from "@/repositories/studyTaskRepository";
import { topicRepository } from "@/repositories/topicRepository";
import { cx } from "@/utils/cx";
import { toDateKey } from "@/utils/date";
import { generateId } from "@/utils/id";
import {
  clearActiveTimer,
  computeElapsedMs,
  formatDuration,
  loadActiveTimer,
  saveActiveTimer,
  sumSessionMinutes,
  type ActiveTimerState,
} from "@/utils/timer";

const INPUT_CLASS =
  "w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";
const LABEL_CLASS = "text-sm font-medium text-foreground";
const BIG_BUTTON_CLASS =
  "flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl text-base font-semibold transition-opacity hover:opacity-90 active:scale-95";

interface SetupForm {
  mode: StudySessionMode;
  minutes: string;
  taskId: string;
  subjectId: string;
  topicId: string;
  note: string;
}

const INITIAL_SETUP_FORM: SetupForm = {
  mode: "stopwatch",
  minutes: String(DEFAULT_COUNTDOWN_MINUTES),
  taskId: "",
  subjectId: "",
  topicId: "",
  note: "",
};

interface PendingFinish {
  endedAt: string;
  elapsedMs: number;
}

export function TimerPage() {
  const { subjects } = useSubjects();
  const activeSubjects = subjects.filter((s) => s.active);

  const [activeTimer, setActiveTimer] = useState<ActiveTimerState | null>(() => loadActiveTimer());
  const [setupForm, setSetupForm] = useState<SetupForm>(INITIAL_SETUP_FORM);
  const [todayTasks, setTodayTasks] = useState<StudyTask[]>([]);
  const [setupTopics, setSetupTopics] = useState<Topic[]>([]);
  const [linkedSubjectName, setLinkedSubjectName] = useState<string | null>(null);
  const [linkedTopicName, setLinkedTopicName] = useState<string | null>(null);
  const [linkedTaskTitle, setLinkedTaskTitle] = useState<string | null>(null);
  const [todaySessions, setTodaySessions] = useState<StudySession[]>([]);
  const [, setTick] = useState(0);
  const [pendingFinish, setPendingFinish] = useState<PendingFinish | null>(null);
  const [finishQuestions, setFinishQuestions] = useState("");
  const [finishNote, setFinishNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function reloadTodaySessions() {
    const sessions = await studySessionRepository.getByDate(toDateKey(new Date()));
    setTodaySessions(sessions.sort((a, b) => b.endedAt.localeCompare(a.endedAt)));
  }

  useEffect(() => {
    studyTaskRepository.getByDate(toDateKey(new Date())).then((tasks) => {
      setTodayTasks(tasks.filter((t) => !t.completed));
    });
    reloadTodaySessions();
  }, []);

  // Aktif sayaç varsa bağlı ders/konu/görev adlarını görüntülemek için ayrıca yükle.
  useEffect(() => {
    if (!activeTimer) {
      setLinkedSubjectName(null);
      setLinkedTopicName(null);
      setLinkedTaskTitle(null);
      return;
    }
    if (activeTimer.subjectId) {
      const found = subjects.find((s) => s.id === activeTimer.subjectId);
      setLinkedSubjectName(found?.name ?? null);
    } else {
      setLinkedSubjectName(null);
    }
    if (activeTimer.topicId) {
      topicRepository.getById(activeTimer.topicId).then((t) => setLinkedTopicName(t?.name ?? null));
    } else {
      setLinkedTopicName(null);
    }
    if (activeTimer.taskId) {
      studyTaskRepository.getById(activeTimer.taskId).then((t) => setLinkedTaskTitle(t?.title ?? null));
    } else {
      setLinkedTaskTitle(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTimer?.subjectId, activeTimer?.topicId, activeTimer?.taskId, subjects]);

  useEffect(() => {
    if (!setupForm.subjectId) {
      setSetupTopics([]);
      return;
    }
    let cancelled = false;
    topicRepository.getBySubjectId(setupForm.subjectId).then((found) => {
      if (!cancelled) setSetupTopics(found);
    });
    return () => {
      cancelled = true;
    };
  }, [setupForm.subjectId]);

  useEffect(() => {
    if (!activeTimer || activeTimer.status !== "running" || pendingFinish) return;
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [activeTimer, pendingFinish]);

  function selectTask(taskId: string) {
    const task = todayTasks.find((t) => t.id === taskId);
    setSetupForm((f) => ({
      ...f,
      taskId,
      subjectId: task?.subjectId ?? f.subjectId,
      topicId: task?.topicId ?? f.topicId,
    }));
  }

  function startTimer() {
    const now = new Date().toISOString();
    const minutesValue = setupForm.minutes.trim().length > 0 ? Number(setupForm.minutes) : null;
    const targetMinutes =
      setupForm.mode === "countdown"
        ? minutesValue && minutesValue > 0
          ? minutesValue
          : DEFAULT_COUNTDOWN_MINUTES
        : minutesValue && minutesValue > 0
          ? minutesValue
          : null;

    const next: ActiveTimerState = {
      mode: setupForm.mode,
      startedAt: now,
      targetMinutes,
      accumulatedPausedMs: 0,
      pausedSinceAt: null,
      status: "running",
      taskId: setupForm.taskId || null,
      subjectId: setupForm.subjectId || null,
      topicId: setupForm.topicId || null,
      note: setupForm.note.trim(),
    };

    saveActiveTimer(next);
    setActiveTimer(next);
  }

  function pauseTimer() {
    if (!activeTimer) return;
    const next: ActiveTimerState = { ...activeTimer, status: "paused", pausedSinceAt: new Date().toISOString() };
    saveActiveTimer(next);
    setActiveTimer(next);
  }

  function resumeTimer() {
    if (!activeTimer || !activeTimer.pausedSinceAt) return;
    const now = Date.now();
    const pausedSince = new Date(activeTimer.pausedSinceAt).getTime();
    const next: ActiveTimerState = {
      ...activeTimer,
      status: "running",
      pausedSinceAt: null,
      accumulatedPausedMs: activeTimer.accumulatedPausedMs + Math.max(0, now - pausedSince),
    };
    saveActiveTimer(next);
    setActiveTimer(next);
  }

  function cancelTimer() {
    if (!window.confirm("Oturumu iptal etmek istediğine emin misin? Süre kaydedilmeyecek.")) return;
    clearActiveTimer();
    setActiveTimer(null);
    setSetupForm(INITIAL_SETUP_FORM);
  }

  function openFinish() {
    if (!activeTimer) return;
    setPendingFinish({ endedAt: new Date().toISOString(), elapsedMs: computeElapsedMs(activeTimer) });
    setFinishQuestions("");
    setFinishNote(activeTimer.note);
  }

  async function confirmFinish() {
    if (!activeTimer || !pendingFinish) return;
    setSaving(true);

    const totalSeconds = Math.floor(pendingFinish.elapsedMs / 1000);
    const actualMinutes = Math.floor(totalSeconds / 60);
    const actualSeconds = totalSeconds % 60;
    const now = new Date().toISOString();
    const actualQuestions = finishQuestions.trim().length > 0 ? Number(finishQuestions) : null;

    const session: StudySession = {
      id: generateId(),
      taskId: activeTimer.taskId,
      subjectId: activeTimer.subjectId,
      topicId: activeTimer.topicId,
      mode: activeTimer.mode,
      plannedMinutes: activeTimer.targetMinutes,
      actualMinutes,
      actualSeconds,
      actualQuestions,
      startedAt: activeTimer.startedAt,
      endedAt: pendingFinish.endedAt,
      date: toDateKey(new Date(pendingFinish.endedAt)),
      note: finishNote.trim(),
      createdAt: now,
      updatedAt: now,
    };

    await studySessionRepository.add(session);

    if (session.taskId) {
      const task = await studyTaskRepository.getById(session.taskId);
      if (task) {
        await studyTaskRepository.put({
          ...task,
          actualMinutes: (task.actualMinutes ?? 0) + actualMinutes,
          actualQuestions:
            actualQuestions != null ? (task.actualQuestions ?? 0) + actualQuestions : task.actualQuestions,
          updatedAt: now,
        });
      }
    }

    clearActiveTimer();
    setActiveTimer(null);
    setPendingFinish(null);
    setSetupForm(INITIAL_SETUP_FORM);
    setSaving(false);
    await reloadTodaySessions();
  }

  const todayTotalMinutes = sumSessionMinutes(todaySessions);

  const elapsedMs = activeTimer ? computeElapsedMs(activeTimer) : 0;
  const elapsedSeconds = Math.floor(elapsedMs / 1000);
  const targetSeconds = (activeTimer?.targetMinutes ?? 0) * 60;
  const remainingSeconds = activeTimer?.mode === "countdown" ? Math.max(0, targetSeconds - elapsedSeconds) : null;
  const countdownDone = activeTimer?.mode === "countdown" && targetSeconds > 0 && elapsedSeconds >= targetSeconds;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4 md:p-6">
      <h1 className="text-xl font-semibold text-foreground">Çalış</h1>

      {activeTimer ? (
        <Card className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TimerIcon className="h-4 w-4" aria-hidden />
            {activeTimer.mode === "countdown" ? "Süreli çalışma" : "Serbest sayaç"}
            {activeTimer.status === "paused" && " · Duraklatıldı"}
          </div>

          <div className="text-6xl font-bold tabular-nums text-foreground">
            {formatDuration(activeTimer.mode === "countdown" ? (remainingSeconds ?? 0) : elapsedSeconds)}
          </div>

          {activeTimer.mode === "countdown" && countdownDone && (
            <p className="rounded-full bg-success/10 px-3 py-1 text-sm font-medium text-success">
              Süre tamamlandı — devam edebilir veya bitirebilirsin
            </p>
          )}
          {activeTimer.mode === "countdown" && countdownDone && (
            <p className="text-xs text-muted-foreground">Toplam geçen süre: {formatDuration(elapsedSeconds)}</p>
          )}
          {activeTimer.mode === "stopwatch" && activeTimer.targetMinutes != null && (
            <p className="text-xs text-muted-foreground">Hedef: {activeTimer.targetMinutes} dk</p>
          )}

          {(linkedSubjectName || linkedTopicName || linkedTaskTitle) && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-muted-foreground">
              {linkedTaskTitle && (
                <span className="rounded-full border border-border px-2.5 py-1">{linkedTaskTitle}</span>
              )}
              {linkedSubjectName && (
                <span className="rounded-full border border-border px-2.5 py-1">{linkedSubjectName}</span>
              )}
              {linkedTopicName && (
                <span className="rounded-full border border-border px-2.5 py-1">{linkedTopicName}</span>
              )}
            </div>
          )}

          <div className="flex w-full gap-3 pt-2">
            {activeTimer.status === "running" ? (
              <button
                type="button"
                onClick={pauseTimer}
                className={cx(BIG_BUTTON_CLASS, "border border-border bg-surface text-foreground")}
              >
                <Pause className="h-5 w-5" aria-hidden />
                Duraklat
              </button>
            ) : (
              <button
                type="button"
                onClick={resumeTimer}
                className={cx(BIG_BUTTON_CLASS, "border border-border bg-surface text-foreground")}
              >
                <Play className="h-5 w-5" aria-hidden />
                Devam et
              </button>
            )}
            <button
              type="button"
              onClick={openFinish}
              className={cx(BIG_BUTTON_CLASS, "bg-primary text-primary-foreground")}
            >
              <Square className="h-5 w-5" aria-hidden />
              Bitir
            </button>
          </div>
          <button type="button" onClick={cancelTimer} className="text-sm font-medium text-danger">
            Oturumu iptal et
          </button>
        </Card>
      ) : (
        <Card className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <span className={LABEL_CLASS}>Çalışma modu</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSetupForm((f) => ({ ...f, mode: "stopwatch" }))}
                className={cx(
                  "flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
                  setupForm.mode === "stopwatch"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-surface-muted",
                )}
              >
                Serbest sayaç
              </button>
              <button
                type="button"
                onClick={() => setSetupForm((f) => ({ ...f, mode: "countdown" }))}
                className={cx(
                  "flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
                  setupForm.mode === "countdown"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-surface-muted",
                )}
              >
                Süreli çalışma
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="timer-minutes" className={LABEL_CLASS}>
              {setupForm.mode === "countdown" ? "Süre (dk)" : "Hedef süre, isteğe bağlı (dk)"}
            </label>
            <input
              id="timer-minutes"
              type="number"
              min={1}
              className={INPUT_CLASS}
              value={setupForm.minutes}
              onChange={(e) => setSetupForm((f) => ({ ...f, minutes: e.target.value }))}
            />
          </div>

          {todayTasks.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="timer-task" className={LABEL_CLASS}>
                İlgili görev (isteğe bağlı)
              </label>
              <select
                id="timer-task"
                className={INPUT_CLASS}
                value={setupForm.taskId}
                onChange={(e) => selectTask(e.target.value)}
              >
                <option value="">Görev seçme</option>
                {todayTasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="timer-subject" className={LABEL_CLASS}>
              Ders (isteğe bağlı)
            </label>
            <select
              id="timer-subject"
              className={INPUT_CLASS}
              value={setupForm.subjectId}
              onChange={(e) => setSetupForm((f) => ({ ...f, subjectId: e.target.value, topicId: "" }))}
            >
              <option value="">Ders seçme</option>
              {activeSubjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.examType === "OZEL" ? subject.name : `${subject.name} (${subject.examType})`}
                </option>
              ))}
            </select>
          </div>

          {setupTopics.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="timer-topic" className={LABEL_CLASS}>
                Konu (isteğe bağlı)
              </label>
              <select
                id="timer-topic"
                className={INPUT_CLASS}
                value={setupForm.topicId}
                onChange={(e) => setSetupForm((f) => ({ ...f, topicId: e.target.value }))}
              >
                <option value="">Konu seçme</option>
                {setupTopics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="timer-note" className={LABEL_CLASS}>
              Oturum notu (isteğe bağlı)
            </label>
            <textarea
              id="timer-note"
              rows={2}
              className={INPUT_CLASS}
              value={setupForm.note}
              onChange={(e) => setSetupForm((f) => ({ ...f, note: e.target.value }))}
            />
          </div>

          <button
            type="button"
            onClick={startTimer}
            className={cx(BIG_BUTTON_CLASS, "bg-primary text-primary-foreground")}
          >
            <Play className="h-5 w-5" aria-hidden />
            Başlat
          </button>
        </Card>
      )}

      <Card className="flex flex-col gap-3 p-0">
        <div className="flex items-center justify-between px-4 pt-4">
          <h2 className="text-sm font-semibold text-foreground">Bugünkü çalışma</h2>
          <span className="text-sm font-medium text-primary">{todayTotalMinutes} dk</span>
        </div>

        {todaySessions.length === 0 ? (
          <div className="px-4 pb-4">
            <EmptyState
              icon={TimerIcon}
              title="Bugün henüz oturum yok"
              description="Bir sayaç başlatıp bitirdiğinde oturumların burada listelenecek."
            />
          </div>
        ) : (
          <div className="divide-y divide-border pb-2">
            {todaySessions.map((session) => {
              const subject = subjects.find((s) => s.id === session.subjectId);
              return (
                <div key={session.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {subject ? subject.name : "Serbest çalışma"}
                    </p>
                    {session.note && <p className="text-xs text-muted-foreground">{session.note}</p>}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDuration(session.actualMinutes * 60 + session.actualSeconds)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {pendingFinish && activeTimer && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 md:items-center"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex max-h-[90dvh] w-full max-w-md flex-col overflow-y-auto rounded-t-3xl bg-surface p-4 md:rounded-3xl md:p-6">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Oturumu tamamla</h2>
              <button
                type="button"
                onClick={() => setPendingFinish(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-muted"
                aria-label="Kapat"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="rounded-xl bg-surface-muted px-3 py-2.5 text-sm text-foreground">
                Toplam süre: <span className="font-semibold">{formatDuration(pendingFinish.elapsedMs / 1000)}</span>
              </div>

              {(linkedSubjectName || linkedTopicName || linkedTaskTitle) && (
                <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                  {linkedTaskTitle && (
                    <span className="rounded-full border border-border px-2.5 py-1">{linkedTaskTitle}</span>
                  )}
                  {linkedSubjectName && (
                    <span className="rounded-full border border-border px-2.5 py-1">{linkedSubjectName}</span>
                  )}
                  {linkedTopicName && (
                    <span className="rounded-full border border-border px-2.5 py-1">{linkedTopicName}</span>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label htmlFor="finish-questions" className={LABEL_CLASS}>
                  Çözülen soru sayısı (isteğe bağlı)
                </label>
                <input
                  id="finish-questions"
                  type="number"
                  min={0}
                  className={INPUT_CLASS}
                  value={finishQuestions}
                  onChange={(e) => setFinishQuestions(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="finish-note" className={LABEL_CLASS}>
                  Kısa not (isteğe bağlı)
                </label>
                <textarea
                  id="finish-note"
                  rows={2}
                  className={INPUT_CLASS}
                  value={finishNote}
                  onChange={(e) => setFinishNote(e.target.value)}
                />
              </div>

              <div className="mt-1 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPendingFinish(null)}
                  className="rounded-full px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={confirmFinish}
                  className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Kaydediliyor…" : "Onayla ve kaydet"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
