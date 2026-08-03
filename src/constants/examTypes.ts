import type { ExamResultType } from "@/models/ExamResult";

export const EXAM_TYPE_OPTIONS: { value: ExamResultType; label: string }[] = [
  { value: "TYT", label: "TYT genel denemesi" },
  { value: "AYT", label: "AYT sayısal genel denemesi" },
  { value: "BRANS", label: "Branş denemesi" },
];

export const EXAM_TYPE_LABELS: Record<ExamResultType, string> = Object.fromEntries(
  EXAM_TYPE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<ExamResultType, string>;
