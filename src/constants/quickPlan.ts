import type { TaskType } from "@/models/StudyTask";
import type { QuickDayOption } from "@/utils/quickPlan";

export interface QuickWorkTypeOption {
  value: TaskType;
  label: string;
}

/** Hızlı Planla'da gösterilen, dokunmatik-öncelikli çalışma türü seçenekleri. */
export const QUICK_WORK_TYPE_OPTIONS: QuickWorkTypeOption[] = [
  { value: "topic_study", label: "Konu çalış" },
  { value: "question_solving", label: "Soru çöz" },
  { value: "topic_review", label: "Tekrar yap" },
  { value: "branch_exam", label: "Branş denemesi" },
  { value: "general_exam", label: "Genel deneme" },
  { value: "mistake_analysis", label: "Yanlış analizi" },
];

export const QUICK_DAY_OPTIONS: { value: QuickDayOption; label: string }[] = [
  { value: "today", label: "Bugün" },
  { value: "tomorrow", label: "Yarın" },
  { value: "weekend", label: "Hafta sonu" },
  { value: "custom", label: "Tarih seç" },
];

export const QUICK_DURATION_PRESETS = [30, 45, 60, 90] as const;
export const QUICK_QUESTION_PRESETS = [20, 40, 60, 100] as const;

export interface QuickTemplate {
  label: string;
  workType: TaskType;
  minutes?: number;
  questionTarget?: number;
}

/** Plan ekranının üstünde gösterilen hazır şablonlar; kaydetmeden yalnızca formu doldurur. */
export const QUICK_TEMPLATES: QuickTemplate[] = [
  { label: "45 dk konu çalış", workType: "topic_study", minutes: 45 },
  { label: "40 soru çöz", workType: "question_solving", questionTarget: 40 },
  { label: "30 dk tekrar yap", workType: "topic_review", minutes: 30 },
  { label: "Branş denemesi çöz", workType: "branch_exam", minutes: 60 },
];
