import type { ResourceStatus, ResourceType } from "@/models/StudyResource";

export const RESOURCE_TYPE_OPTIONS: { value: ResourceType; label: string }[] = [
  { value: "question_bank", label: "Soru bankası" },
  { value: "topic_book", label: "Konu anlatım kitabı" },
  { value: "exam_book", label: "Deneme kitabı" },
  { value: "video_series", label: "Video serisi" },
  { value: "website", label: "Web sitesi" },
  { value: "pdf", label: "PDF" },
  { value: "lecture_notes", label: "Ders notu" },
  { value: "other", label: "Diğer" },
];

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = RESOURCE_TYPE_OPTIONS.reduce(
  (acc, option) => ({ ...acc, [option.value]: option.label }),
  {} as Record<ResourceType, string>,
);

export const RESOURCE_STATUS_OPTIONS: { value: ResourceStatus; label: string }[] = [
  { value: "planned", label: "Kullanılacak" },
  { value: "in_progress", label: "Devam ediyor" },
  { value: "completed", label: "Tamamlandı" },
  { value: "dropped", label: "Bırakıldı" },
];

export const RESOURCE_STATUS_LABELS: Record<ResourceStatus, string> = {
  planned: "Kullanılacak",
  in_progress: "Devam ediyor",
  completed: "Tamamlandı",
  dropped: "Bırakıldı",
};
