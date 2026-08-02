export type TaskType =
  | "topic_study"
  | "question_solving"
  | "topic_review"
  | "branch_exam"
  | "general_exam"
  | "mistake_analysis"
  | "video_lesson"
  | "note_taking"
  | "free_study"
  | "personal_task";

export type TaskPriority = "low" | "medium" | "high";

export interface StudyTask {
  id: string;
  title: string;
  subjectId: string | null;
  topicId: string | null;
  taskType: TaskType;
  /** ISO tarih (yyyy-mm-dd) */
  date: string;
  /** HH:mm */
  startTime: string | null;
  estimatedMinutes: number | null;
  questionTarget: number | null;
  priority: TaskPriority;
  notes: string;
  completed: boolean;
  completedAt: string | null;
  actualMinutes: number | null;
  actualQuestions: number | null;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}
