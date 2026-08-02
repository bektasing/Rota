export type StudySessionMode = "stopwatch" | "countdown";

export interface StudySession {
  id: string;
  taskId: string | null;
  subjectId: string | null;
  topicId: string | null;
  mode: StudySessionMode;
  plannedMinutes: number | null;
  actualMinutes: number;
  actualSeconds: number;
  actualQuestions: number | null;
  startedAt: string;
  endedAt: string;
  /** Yerel takvim günü (yyyy-mm-dd); günlük toplamları hızlı sorgulamak için. */
  date: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}
