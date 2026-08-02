import type { TopicStatus } from "@/models/Topic";

export const TOPIC_STATUS_OPTIONS: { value: TopicStatus; label: string }[] = [
  { value: "not_started", label: "Başlanmadı" },
  { value: "in_progress", label: "Çalışılıyor" },
  { value: "completed", label: "Tamamlandı" },
  { value: "review_needed", label: "Tekrar gerekli" },
];

export const TOPIC_STATUS_LABELS: Record<TopicStatus, string> = Object.fromEntries(
  TOPIC_STATUS_OPTIONS.map((option) => [option.value, option.label]),
) as Record<TopicStatus, string>;
