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

export function loadActiveTimer(): ActiveTimerState | null {
  try {
    const raw = localStorage.getItem(ACTIVE_TIMER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ActiveTimerState;
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
