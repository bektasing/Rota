import type { TaskPriority, TaskType } from "@/models/StudyTask";

export const TASK_TYPE_OPTIONS: { value: TaskType; label: string }[] = [
  { value: "topic_study", label: "Konu çalışması" },
  { value: "question_solving", label: "Soru çözümü" },
  { value: "topic_review", label: "Konu tekrarı" },
  { value: "branch_exam", label: "Branş denemesi" },
  { value: "general_exam", label: "Genel deneme" },
  { value: "mistake_analysis", label: "Yanlış analizi" },
  { value: "video_lesson", label: "Video dersi" },
  { value: "note_taking", label: "Not çıkarma" },
  { value: "free_study", label: "Serbest çalışma" },
  { value: "personal_task", label: "Kişisel görev" },
];

export const TASK_TYPE_LABELS: Record<TaskType, string> = Object.fromEntries(
  TASK_TYPE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<TaskType, string>;

export const TASK_PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Düşük" },
  { value: "medium", label: "Normal" },
  { value: "high", label: "Yüksek" },
];

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = Object.fromEntries(
  TASK_PRIORITY_OPTIONS.map((option) => [option.value, option.label]),
) as Record<TaskPriority, string>;

const PRIORITY_WEIGHT: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };

export function priorityWeight(priority: TaskPriority): number {
  return PRIORITY_WEIGHT[priority];
}
