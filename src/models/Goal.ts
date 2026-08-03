export type GoalType =
  | "study_minutes"
  | "question_count"
  | "task_count"
  | "exam_count"
  | "net_target"
  | "topic_completion"
  | "custom";

export type GoalUnit = "dakika" | "soru" | "görev" | "deneme" | "net" | "konu" | "adet";

export type GoalStatus = "active" | "completed" | "paused";

export interface Goal {
  id: string;
  title: string;
  description: string;
  type: GoalType;
  targetValue: number;
  currentValue: number;
  unit: GoalUnit;
  /** ISO tarih (yyyy-mm-dd) */
  startDate: string;
  /** ISO tarih (yyyy-mm-dd) */
  endDate: string;
  subjectId: string | null;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}
