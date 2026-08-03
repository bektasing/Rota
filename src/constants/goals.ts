import type { GoalStatus, GoalType, GoalUnit } from "@/models/Goal";

export const GOAL_TYPE_OPTIONS: { value: GoalType; label: string; defaultUnit: GoalUnit }[] = [
  { value: "study_minutes", label: "Çalışma süresi", defaultUnit: "dakika" },
  { value: "question_count", label: "Soru sayısı", defaultUnit: "soru" },
  { value: "task_count", label: "Görev sayısı", defaultUnit: "görev" },
  { value: "exam_count", label: "Deneme sayısı", defaultUnit: "deneme" },
  { value: "net_target", label: "Net hedefi", defaultUnit: "net" },
  { value: "topic_completion", label: "Konu tamamlama", defaultUnit: "konu" },
  { value: "custom", label: "Özel hedef", defaultUnit: "adet" },
];

export const GOAL_TYPE_LABELS: Record<GoalType, string> = GOAL_TYPE_OPTIONS.reduce(
  (acc, option) => ({ ...acc, [option.value]: option.label }),
  {} as Record<GoalType, string>,
);

export const GOAL_UNIT_OPTIONS: GoalUnit[] = ["dakika", "soru", "görev", "deneme", "net", "konu", "adet"];

export const GOAL_STATUS_OPTIONS: { value: GoalStatus; label: string }[] = [
  { value: "active", label: "Aktif" },
  { value: "completed", label: "Tamamlandı" },
  { value: "paused", label: "Duraklatıldı" },
];

export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  active: "Aktif",
  completed: "Tamamlandı",
  paused: "Duraklatıldı",
};

export function defaultUnitForType(type: GoalType): GoalUnit {
  return GOAL_TYPE_OPTIONS.find((option) => option.value === type)?.defaultUnit ?? "adet";
}
