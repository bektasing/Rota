import { ACTIVE_TIMER_STORAGE_KEY } from "@/constants/timer";
import type { StudySession, StudySessionMode } from "@/models/StudySession";

export type ActiveTimerStatus = "running" | "paused";

export interface ActiveTimerState {
  mode: StudySessionMode;
  /** ISO zaman damgası; oturum ilk başlatıldığında sabitlenir, duraklat/devam et değiştirmez. */
  startedAt: string;
  /** Süreli çalışma modunda hedef süre (dakika); serbest sayaçta isteğe bağlı bilgi amaçlı hedef. */
  targetMinutes: number | null;
  /** Şimdiye kadarki tüm duraklama aralıklarının toplam süresi (ms). */
  accumulatedPausedMs: number;
  /** Şu anki duraklamanın başladığı zaman damgası; duraklatılmamışsa null. */
  pausedSinceAt: string | null;
  status: ActiveTimerStatus;
  taskId: string | null;
  subjectId: string | null;
  topicId: string | null;
  note: string;
}

/**
 * localStorage'daki aktif sayaç kaydının kullanılabilir olduğunu doğrular.
 * Bozuk bir kayıt (elle düzenleme, yarım yazma) NaN süreli bir oturumun
 * kaydedilmesine yol açabileceği için kabul edilmez.
 */
function isValidTimerState(value: unknown): value is ActiveTimerState {
  if (typeof value !== "object" || value === null) return false;
  const state = value as Partial<ActiveTimerState>;

  return (
    (state.mode === "stopwatch" || state.mode === "countdown") &&
    (state.status === "running" || state.status === "paused") &&
    typeof state.startedAt === "string" &&
    !Number.isNaN(new Date(state.startedAt).getTime()) &&
    typeof state.accumulatedPausedMs === "number" &&
    Number.isFinite(state.accumulatedPausedMs) &&
    (state.pausedSinceAt === null ||
      (typeof state.pausedSinceAt === "string" && !Number.isNaN(new Date(state.pausedSinceAt).getTime())))
  );
}

export function loadActiveTimer(): ActiveTimerState | null {
  try {
    const raw = localStorage.getItem(ACTIVE_TIMER_STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isValidTimerState(parsed)) {
      clearActiveTimer();
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function saveActiveTimer(state: ActiveTimerState): void {
  localStorage.setItem(ACTIVE_TIMER_STORAGE_KEY, JSON.stringify(state));
}

export function clearActiveTimer(): void {
  localStorage.removeItem(ACTIVE_TIMER_STORAGE_KEY);
}

/** Zaman damgalarından gerçek çalışılan süreyi (ms) hesaplar; sekme arka planda kalsa da kaymaz. */
export function computeElapsedMs(state: ActiveTimerState, now: number = Date.now()): number {
  const startedMs = new Date(state.startedAt).getTime();
  let pausedMs = state.accumulatedPausedMs;

  if (state.status === "paused" && state.pausedSinceAt) {
    pausedMs += now - new Date(state.pausedSinceAt).getTime();
  }

  return Math.max(0, now - startedMs - pausedMs);
}

export function formatDuration(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = clamped % 60;

  const pad = (n: number) => String(n).padStart(2, "0");

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

/** Bir grup oturumun toplam süresini en yakın dakikaya yuvarlayarak döner. */
export function sumSessionMinutes(sessions: StudySession[]): number {
  const totalSeconds = sessions.reduce((sum, s) => sum + s.actualMinutes * 60 + s.actualSeconds, 0);
  return Math.round(totalSeconds / 60);
}
